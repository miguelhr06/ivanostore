import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../../services/supabase';
import { CarritoService } from '../../../services/carrito'; 
import { ActivatedRoute, Router } from '@angular/router'; 
import { Location } from '@angular/common'; // <-- IMPORTACIÓN NECESARIA

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
  selector: 'app-caballero',
  templateUrl: './caballero.html',
  styleUrls: ['./caballero.css'],
  standalone: false
})
export class CaballeroComponent implements OnInit {
  // Variables principales de datos
  productos: ProductoIvano[] = [];       
  productosFiltrados: ProductoIvano[] = []; 
  
  // Estado de la UI
  loading: boolean = true;
  modalAbierto: boolean = false;
  productoSeleccionado: ProductoIvano | null = null;
  fotoGaleriaActual: string = '';
  
  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 25;

  // Filtros (Manejados automáticamente por la URL)
  moduloSeleccionado: string = 'todo'; // 'calzado' o 'accesorios'
  categoriasSeleccionadas: string[] = []; 
  subsSeleccionadas: string[] = [];
  
  // Diccionario para tallas
  tallaSeleccionada: { [key: number]: string } = {};

  public readonly BUCKET_BASE_URL = 'http://127.0.0.1:54321/storage/v1/object/public/productos/';

  constructor(
    private supabaseService: SupabaseService, 
    private carritoSvc: CarritoService, 
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute, 
    private router: Router,
    private location: Location // <-- INYECCIÓN NECESARIA
  ) {}

  /**
   * GENERACIÓN DE SLUG PARA LAS URLs CON BARRAS
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
      
      const { data, error } = await this.supabaseService.client
        .from('modelos')
        .select(`*, variantes_stock (talla, stock)`)
        .or('genero.eq.HOMBRE,genero.eq.UNISEX');

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
        // 🔥 EL CORAZÓN DEL SISTEMA: ESCUCHADOR ACTIVO DE LA URL
        // ==========================================================
        this.route.params.subscribe(params => {
          const modulo = params['modulo']?.toLowerCase(); // calzado / accesorios
          const filtro = params['filtro']?.toLowerCase(); // grande, mediano, maletines, etc.
          const modeloUrl = params['modelo'];
          const slugUrl = params['slug'];

          // 1. Sincronizar Pestaña Principal (Calzado / Accesorios)
          if (modulo === 'calzado' || modulo === 'accesorios') {
            this.moduloSeleccionado = modulo;
            this.categoriasSeleccionadas = [modulo === 'calzado' ? 'calzado' : 'accesorios'];
          } else {
            this.moduloSeleccionado = 'todo';
            this.categoriasSeleccionadas = [];
          }

          // 2. Sincronizar Sub-Filtros Dinámicos
          if (filtro) {
            this.subsSeleccionadas = [filtro];
          } else {
            this.subsSeleccionadas = [];
          }

          // Aplicamos el filtro en cascada sobre el arreglo
          this.aplicarFiltrosMultiples();

          // 3. Sincronizar Apertura del Modal de Producto
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
      console.error("Error en Catálogo:", err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // Métodos de navegación activados por clicks
  navegarAModulo(modulo: string) {
    if (modulo === 'todo') {
      this.router.navigate(['/caballero']);
    } else {
      this.router.navigate(['/caballero', modulo.toLowerCase()]);
    }
  }

  navegarAFiltro(filtro: string) {
    const mod = this.route.snapshot.params['modulo'] || 'calzado'; // Si no hay módulo, asumimos calzado por defecto
    this.router.navigate(['/caballero', mod.toLowerCase(), filtro.toLowerCase()]);
  }

  abrirDetalles(item: ProductoIvano) {
    const slug = this.generarSlug(item.nombre_zapatilla);
    
    // Detectamos el módulo actual para no perder la ruta limpia
    let mod = this.route.snapshot.params['modulo'] || (item.tamano?.toUpperCase() === 'ACCESORIO' ? 'accesorios' : 'calzado');
    let fil = this.route.snapshot.params['filtro'] || (item.tamano?.toUpperCase() === 'ACCESORIO' ? item.categoria?.toLowerCase() : item.tamano?.toLowerCase());

    this.router.navigate(['/caballero', mod, fil, item.modelo, slug]);
  }

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

  async alternarFavorito(item: ProductoIvano, event: Event) {
    if (event) event.stopPropagation();
    const nuevoEstado = await this.supabaseService.alternarFavoritoGlobal(item, event);
    item.esFavorito = nuevoEstado;
    this.cdr.detectChanges();
  }

  get productosPaginados() {
    const listaParaMostrar = this.productosFiltrados;
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return listaParaMostrar.slice(inicio, fin);
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
    const tieneFiltroGrande = this.subsSeleccionadas.includes('grande');
    const tieneFiltroMediano = this.subsSeleccionadas.includes('mediano');
    const tieneFiltroUnisex = this.subsSeleccionadas.includes('unisex');

    let resultadoBase = this.productos.filter(p => {
      const dbGen = (p.genero || '').trim().toUpperCase();
      const dbTam = (p.tamano || '').trim().toUpperCase();
      const dbCat = (p.categoria || '').trim().toLowerCase();
      
      const esHombre = (dbGen === 'HOMBRE');
      const esUnisex = (dbGen === 'UNISEX');
      const esAccesorio = (dbTam === 'ACCESORIO');

      if (!esHombre && !esUnisex) return false;
      if (esUnisex && !tieneFiltroUnisex && !esAccesorio) return false;

      const coincideCat = this.categoriasSeleccionadas.length === 0 || 
        (this.categoriasSeleccionadas.includes('calzado') && !esAccesorio) ||
        (this.categoriasSeleccionadas.includes('accesorios') && esAccesorio);

      if (!coincideCat) return false;

      if (this.subsSeleccionadas.length === 0) return true;

      return this.subsSeleccionadas.some(s => {
        const val = s.toLowerCase();

        if (!esAccesorio) {
          if (val === 'grande') {
            return p.tallas_disponibles.some(t => {
              const n = parseInt(t);
              return n >= 39 && n <= 43;
            });
          }
          if (val === 'mediano') {
            return p.tallas_disponibles.some(t => {
              const n = parseInt(t);
              return n >= 34 && n <= 38;
            });
          }
        }
        return dbCat === val || (val === 'unisex' && esUnisex);
      });
    });

    this.productosFiltrados = resultadoBase.map(p => {
      const productoClonado = { ...p };
      const dbTam = (p.tamano || '').trim().toUpperCase();

      if (dbTam !== 'ACCESORIO') {
        if (tieneFiltroGrande && !tieneFiltroMediano) {
          productoClonado.tallas_disponibles = p.tallas_disponibles.filter(t => {
            const n = parseInt(t);
            return n >= 39 && n <= 43;
          });
        } 
        else if (tieneFiltroMediano && !tieneFiltroGrande) {
          productoClonado.tallas_disponibles = p.tallas_disponibles.filter(t => {
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
    const x = e.offsetX / container.offsetWidth * 100;
    const y = e.offsetY / container.offsetHeight * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = "scale(2)";
  }

  onMouseLeave(e: MouseEvent) {
    const container = e.currentTarget as HTMLElement;
    const img = container.querySelector('img') as HTMLImageElement;
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

  pedirPorWhatsApp(producto: any) {
    const tallaValor = this.tallaSeleccionada[producto.id];
    if (!tallaValor) {
      alert('Por favor, selecciona una talla');
      return;
    }
    const mensaje = `Hola Ivano Store! Estoy interesado en el producto: ${producto.nombre_zapatilla} - Modelo: ${producto.modelo} (${producto.sigla}) - Talla: ${tallaValor}. ¿Tienen stock?`;
    const url = `https://wa.me/51910527690?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }
}