import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../../services/supabase';
import { CarritoService } from '../../../services/carrito';
import { ActivatedRoute, Router } from '@angular/router'; 
import { Location } from '@angular/common'; // <--- IMPORTACIÓN AÑADIDA

interface ProductoIvano {
  id: number;
  nombre_zapatilla: string;
  descripcion: string;
  modelo: string;
  sigla: string;
  precio: number;
  color: string;
  genero: string;
  categoria: string;
  sub_categoria?: string | string[];
  tamano: string; 
  imagen_url: string;
  imagen_url_2?: string;
  imagen_url_3?: string;
  imagen_url_4?: string;
  imagen_url_5?: string;
  imagen_principal_render: string; 
  fotos_reales: string[]; 
  tallas_disponibles: string[];
  esFavorito?: boolean; 
}

@Component({
  selector: 'app-dama',
  templateUrl: './dama.html',
  styleUrls: ['./dama.css'], 
  standalone: false
})
export class DamaComponent implements OnInit {
  productos: ProductoIvano[] = [];       
  productosFiltrados: ProductoIvano[] = []; 
  
  loading: boolean = true;
  modalAbierto: boolean = false;
  productoSeleccionado: ProductoIvano | null = null;
  fotoGaleriaActual: string = '';
  
  paginaActual: number = 1;
  itemsPorPagina: number = 25;

  // Filtros unificados sincrónicos con la URL
  moduloSeleccionado: string = 'todo'; // 'calzado' o 'accesorios'
  categoriasSeleccionadas: string[] = []; 
  subsSeleccionadas: string[] = [];
  
  tallaSeleccionada: { [key: number]: string } = {};

  usuarioId: string | null = null;
  favoritosIds: Set<number> = new Set();

  public readonly BUCKET_BASE_URL = 'http://127.0.0.1:54321/storage/v1/object/public/productos/';

  constructor(
    private supabaseService: SupabaseService, 
    private carritoSvc: CarritoService, 
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location // <--- INYECCIÓN AÑADIDA
  ) {}

  /**
   * GENERACIÓN DE SLUG AUTOMÁTICO PARA LAS URLS
   */
  generarSlug(nombre: string): string {
    if (!nombre) return '';
    return nombre
      .toLowerCase()
      .trim()
      .normalize('NFD')                               
      .replace(/[\u0300-\u036f]/g, '')         
      .replace(/[^a-z0-9\s-]/g, '')            
      .replace(/\s+/g, '-');                  
  }

  public construirRutaImagen(item: any, nombreArchivo: string | undefined | null): string {
    if (!nombreArchivo || nombreArchivo.trim() === '') return '';
    const tamanoLower = item.tamano ? item.tamano.toLowerCase() : '';
    let rutaBase = '';

    if (tamanoLower === 'accesorio') {
      let carpetaCategoria = item.categoria;
      if (carpetaCategoria === 'NECESER') carpetaCategoria = 'NECESERS';
      rutaBase = `ACCESORIO/${carpetaCategoria}/${item.modelo}/${item.sigla}/${nombreArchivo}`;
    } else {
      rutaBase = `${tamanoLower}/${item.modelo}/${item.sigla}/${nombreArchivo}`;
    }
    return `${this.BUCKET_BASE_URL}${rutaBase}`;
  }

  async ngOnInit() {
    try {
      this.loading = true;
      
      await this.obtenerUsuarioId();
      if (this.usuarioId) {
        await this.cargarFavoritosUsuario();
      }
      
      const { data, error } = await this.supabaseService.client
        .from('modelos')
        .select(`*, variantes_stock (talla, stock)`)
        .or('genero.eq.MUJER,genero.eq.UNISEX');

      if (error) throw error;

      if (data) {
        const productosProcesados = data.map((m: any) => ({
          ...m,
          tallas_limpias: m.variantes_stock 
            ? m.variantes_stock.filter((v: any) => v.stock > 0).map((v: any) => v.talla)
            : []
        }));

        const agrupados: { [key: string]: any } = {};

        productosProcesados.forEach(item => {
          const llave = `${item.modelo}-${item.sigla}`;
          if (!agrupados[llave]) {
            agrupados[llave] = {
              ...item,
              tallas_disponibles: [...item.tallas_limpias],
              imagen_principal_render: this.construirRutaImagen(item, item.imagen_url),
              fotos_reales: [item.imagen_url, item.imagen_url_2, item.imagen_url_3, item.imagen_url_4, item.imagen_url_5]
                .filter(f => f && f.trim() !== '')
            };
          } else {
            agrupados[llave].tallas_disponibles = [
              ...new Set([...agrupados[llave].tallas_disponibles, ...item.tallas_limpias])
            ];
          }
        });

        let listaOrdenada = Object.values(agrupados).sort((a: any, b: any) => {
          if (a.precio !== b.precio) return a.precio - b.precio;
          if (b.tallas_disponibles.length !== a.tallas_disponibles.length) return b.tallas_disponibles.length - a.tallas_disponibles.length;
          return a.modelo.localeCompare(b.modelo);
        }).map((p: any) => {
          p.tallas_disponibles.sort((t1: any, t2: any) => {
            const n1 = parseInt(t1);
            const n2 = parseInt(t2);
            if (isNaN(n1) || isNaN(n2)) return t1.toString().localeCompare(t2.toString());
            return n1 - n2;
          });
          return p;
        });

        this.productos = await this.supabaseService.mapearFavoritosDeProductos(listaOrdenada);

        // ==========================================================
        // 🔥 ESCUCHADOR REACTIVO DE RUTAS ANIDADAS PARA DAMAS
        // ==========================================================
        this.route.params.subscribe(params => {
          const modulo = params['modulo']?.toLowerCase();
          const filtro = params['filtro']?.toLowerCase();
          const modeloUrl = params['modelo'];
          const slugUrl = params['slug'];

          // 1. Sincronizar Módulo Superior
          if (modulo === 'calzado' || modulo === 'accesorios') {
            this.moduloSeleccionado = modulo;
            this.categoriasSeleccionadas = [modulo];
          } else {
            this.moduloSeleccionado = 'todo';
            this.categoriasSeleccionadas = [];
          }

          // 2. Sincronizar Sub-filtro
          if (filtro) {
            this.subsSeleccionadas = [filtro];
          } else {
            this.subsSeleccionadas = [];
          }

          this.aplicarFiltrosMultiples();

          // 3. Control de apertura directa del modal mediante URL
          if (modeloUrl && slugUrl) {
            const prodDirecto = this.productos.find(p => 
              p.modelo === modeloUrl && this.generarSlug(p.nombre_zapatilla) === slugUrl
            );

            if (prodDirecto) {
              this.productoSeleccionado = prodDirecto;
              this.fotoGaleriaActual = this.construirRutaImagen(prodDirecto, prodDirecto.fotos_reales[0]);
              this.modalAbierto = true;
            }
          } else {
            this.modalAbierto = false;
            this.productoSeleccionado = null;
          }
          
          this.cdr.detectChanges();
        });
      }
    } catch (err) {
      console.error("Error en Catálogo Damas:", err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // Métodos de Enrutamiento Dinámico
  navegarAModulo(modulo: string) {
    if (modulo === 'todo') {
      this.router.navigate(['/dama']);
    } else {
      this.router.navigate(['/dama', modulo.toLowerCase()]);
    }
  }

  navegarAFiltro(filtro: string) {
    const mod = this.route.snapshot.params['modulo'] || 'calzado';
    this.router.navigate(['/dama', mod.toLowerCase(), filtro.toLowerCase()]);
  }

  abrirDetalles(item: ProductoIvano) {
    const slug = this.generarSlug(item.nombre_zapatilla);
    let mod = this.route.snapshot.params['modulo'] || (item.tamano?.toUpperCase() === 'ACCESORIO' ? 'accesorios' : 'calzado');
    let fil = this.route.snapshot.params['filtro'] || (item.tamano?.toUpperCase() === 'ACCESORIO' ? item.categoria?.toLowerCase() : item.tamano?.toLowerCase());

    this.router.navigate(['/dama', mod, fil, item.modelo, slug]);
  }

  // ✅ CIERRE AUTOMÁTICO CON LOCATION
  cerrarModal() {
  // 1. Intentamos obtener la ruta de retorno que guardamos en MisFavoritosComponent
  const retorno = window.history.state?.retorno;

  if (retorno) {
    // Si existe el estado de retorno (ej: '/mi-perfil/favoritos'), navegamos allí
    this.router.navigateByUrl(retorno);
  } else {
    // Si no hay retorno, usamos el comportamiento estándar de "ir atrás"
    this.location.back();
  }
}

  async obtenerUsuarioId() {
    const emailLocal = localStorage.getItem('userEmail');
    if (emailLocal) {
      const { data } = await this.supabaseService.getUsuarioPorEmail(emailLocal);
      if (data) this.usuarioId = data.id;
    }
  }

  async cargarFavoritosUsuario() {
    if (!this.usuarioId) return;
    try {
      const { data, error } = await this.supabaseService.client
        .from('favoritos')
        .select('producto_id')
        .eq('user_id', this.usuarioId);

      if (error) throw error;
      if (data) this.favoritosIds = new Set(data.map((f: any) => f.producto_id));
    } catch (err) {
      console.error("Error al recuperar mapeo de favoritos:", err);
    }
  }

  async cambiarEstadoFavorito(item: ProductoIvano, event: Event) {
    if (event) event.stopPropagation();
    const nuevoEstado = await this.supabaseService.alternarFavoritoGlobal(item, event);
    item.esFavorito = nuevoEstado;
    
    if (nuevoEstado) {
      this.favoritosIds.add(item.id);
    } else {
      this.favoritosIds.delete(item.id);
    }
    this.cdr.detectChanges();
  }

  esFavoritoCheck(productoId: number): boolean {
    return this.favoritosIds.has(productoId);
  }

  get productosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.productosFiltrados.slice(inicio, fin);
  }

  get totalPaginas() {
    return Math.ceil(this.productosFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  aplicarFiltrosMultiples(): void {
    const tieneFiltroGrande = this.subsSeleccionadas.some(s => s.toLowerCase().includes('grande'));
    const tieneFiltroMediano = this.subsSeleccionadas.some(s => s.toLowerCase().includes('mediano'));
    const tieneFiltroUnisex = this.subsSeleccionadas.some(s => s.toLowerCase().includes('unisex'));

    let resultadoBase = this.productos.filter(p => {
      const dbGen = (p.genero || '').trim().toUpperCase();
      const dbTam = (p.tamano || '').trim().toUpperCase();
      const dbCat = (p.categoria || '').trim().toLowerCase();
      
      const esMujer = (dbGen === 'MUJER');
      const esUnisex = (dbGen === 'UNISEX');
      const esAccesorio = (dbTam === 'ACCESORIO');

      if (!esMujer && !esUnisex) return false;
      
      if (tieneFiltroUnisex && !esAccesorio) {
        if (!esUnisex) return false;
      }

      const coincideBloque = this.categoriasSeleccionadas.length === 0 || 
        (this.categoriasSeleccionadas.includes('calzado') && !esAccesorio) ||
        (this.categoriasSeleccionadas.includes('accesorios') && esAccesorio);

      if (!coincideBloque) return false;

      if (this.subsSeleccionadas.length === 0) return true;

      return this.subsSeleccionadas.some(s => {
        const val = s.toLowerCase();

        if (!esAccesorio) {
          if (val.includes('grande')) {
            return (p.tallas_disponibles || []).some(t => {
              const n = parseInt(t);
              return n >= 39 && n <= 43;
            });
          }
          if (val.includes('mediano')) {
            return (p.tallas_disponibles || []).some(t => {
              const n = parseInt(t);
              return n >= 34 && n <= 38;
            });
          }
        }

        const rawSub = (p as any).sub_categoria;
        let etiquetas: string[] = [];
        if (Array.isArray(rawSub)) {
          etiquetas = rawSub.map((c: string) => c.toLowerCase());
        } else if (rawSub) {
          etiquetas = [String(rawSub).toLowerCase()];
        }

        return etiquetas.includes(val) || dbCat === val || (val.includes('unisex') && esUnisex);
      });
    });

    this.productosFiltrados = resultadoBase.map(p => {
      const productoClonado = { ...p };
      const dbTam = (p.tamano || '').trim().toUpperCase();

      if (productoClonado.tallas_disponibles) {
        productoClonado.tallas_disponibles = [...new Set(productoClonado.tallas_disponibles)];
      }

      if (dbTam !== 'ACCESORIO') {
        if (tieneFiltroGrande && !tieneFiltroMediano) {
          productoClonado.tallas_disponibles = (productoClonado.tallas_disponibles || []).filter(t => {
            const n = parseInt(t);
            return n >= 39 && n <= 43;
          });
        } 
        else if (tieneFiltroMediano && !tieneFiltroGrande) {
          productoClonado.tallas_disponibles = (productoClonado.tallas_disponibles || []).filter(t => {
            const n = parseInt(t);
            return n >= 34 && n <= 38;
          });
        }
      }
      return productoClonado;
    });

    this.paginaActual = 1;
    this.cdr.detectChanges();
  }

  toggleFiltro(tipo: 'cat' | 'sub', valor: string): void {
    if (valor === 'todos') {
      this.navegarAModulo('todo');
    } else if (tipo === 'cat') {
      this.navegarAModulo(valor);
    } else {
      this.navegarAFiltro(valor);
    }
  }

  estaActivo(tipo: 'cat' | 'sub', valor: string): boolean {
    if (valor === 'todos') {
      return this.moduloSeleccionado === 'todo';
    }
    return tipo === 'cat' 
      ? this.moduloSeleccionado === valor 
      : this.subsSeleccionadas.includes(valor);
  }

  seleccionarTalla(productoId: number, talla: string) {
    if (this.tallaSeleccionada[productoId] === talla) {
      delete this.tallaSeleccionada[productoId];
    } else {
      this.tallaSeleccionada[productoId] = talla;
    }
  }

  cambiarFoto(item: ProductoIvano, hover: boolean) {
    const foto = hover && item.fotos_reales.length > 1 ? item.fotos_reales[1] : item.fotos_reales[0];
    item.imagen_principal_render = this.construirRutaImagen(item, foto);
  }

  seleccionarFotoMiniatura(nombreArchivo: string) {
    if (this.productoSeleccionado) {
      this.fotoGaleriaActual = this.construirRutaImagen(this.productoSeleccionado, nombreArchivo);
    }
  }

  onMouseMove(e: MouseEvent) {
    const container = e.currentTarget as HTMLElement;
    const img = container.querySelector('img') as HTMLImageElement;
    if(!img) return;
    const x = e.offsetX / container.offsetWidth * 100;
    const y = e.offsetY / container.offsetHeight * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = "scale(2)";
  }

  onMouseLeave(e: MouseEvent) {
    const container = e.currentTarget as HTMLElement;
    const img = container.querySelector('img') as HTMLImageElement;
    if(!img) return;
    img.style.transform = "scale(1)";
    img.style.transformOrigin = "center center";
  }

  agregarAlCarrito(producto: any) {
    const talla = this.tallaSeleccionada[producto.id];
    if (!talla) {
      alert('Por favor, selecciona una talla antes de agregar al carrito.');
      return;
    }
    this.carritoSvc.agregarAlCarrito(producto, talla);
    this.cerrarModal();
  }
}