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
  selector: 'app-ninos',
  templateUrl: './ninos.html',
  styleUrls: ['./ninos.css'],
  standalone: false
})
export class NinosComponent implements OnInit {
  productos: ProductoIvano[] = [];
  productosFiltrados: ProductoIvano[] = [];
  loading: boolean = true;
  modalAbierto: boolean = false;
  productoSeleccionado: ProductoIvano | null = null;
  fotoGaleriaActual: string = '';
  
  paginaActual: number = 1;
  itemsPorPagina: number = 25;

  // Filtros sincronizados con la URL
  filtroGeneroUrl: string = 'todos'; // nino, nina, unisex, todos
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
   * GENERACIÓN DE SLUG DINÁMICO PARA COMPARTIR LINKS
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
    let rutaBase = `${tamanoLower}/${item.modelo}/${item.sigla}/${nombreArchivo}`;
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
        .eq('tamano', 'PEQUENO') 
        .or('genero.eq.NINO,genero.eq.NINA,genero.eq.NIÑO,genero.eq.NIÑA,genero.eq.UNISEX_NINO');

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

        let listaOrdenada = Object.values(agrupados).sort((a: any, b: any) => a.precio - b.precio)
          .map((p: any) => {
            p.tallas_disponibles.sort((t1: any, t2: any) => parseInt(t1) - parseInt(t2));
            return p;
          });

        this.productos = await this.supabaseService.mapearFavoritosDeProductos(listaOrdenada);

        // ==========================================================
        // 🔥 ESCUCHADOR REACTIVO DE RUTAS CON BARRAS PARA NIÑOS
        // ==========================================================
        this.route.params.subscribe(params => {
          const filtroUrl = params['filtro']?.toUpperCase(); // NINO, NINA, UNISEX
          const modeloUrl = params['modelo'];
          const slugUrl = params['slug'];

          if (filtroUrl && ['NINO', 'NINA', 'UNISEX'].includes(filtroUrl)) {
            this.filtroGeneroUrl = filtroUrl.toLowerCase();
            this.subsSeleccionadas = [filtroUrl];
          } else {
            this.filtroGeneroUrl = 'todos';
            this.subsSeleccionadas = [];
          }

          this.aplicarFiltrosMultiples();

          // Control de apertura del modal por URL directo
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
      console.error("Error en Catálogo Niños:", err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // Métodos de navegación fluida
  navegarAFiltro(filtro: string) {
    if (filtro === 'todos') {
      this.router.navigate(['/ninos']);
    } else {
      this.router.navigate(['/ninos', filtro.toLowerCase()]);
    }
  }

  abrirDetalles(item: ProductoIvano) {
    const slug = this.generarSlug(item.nombre_zapatilla);
    const dbGen = (item.genero || '').trim().toUpperCase();
    
    let filtroRuta = 'todos';
    if (dbGen.includes('UNISEX')) filtroRuta = 'unisex';
    else if (dbGen === 'NINO' || dbGen === 'NIÑO') filtroRuta = 'nino';
    else if (dbGen === 'NINA' || dbGen === 'NIÑA') filtroRuta = 'nina';

    this.router.navigate(['/ninos', filtroRuta, item.modelo, slug]);
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
    return this.productosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
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
    if (this.subsSeleccionadas.length === 0) {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productos.filter(p => {
        const dbGen = (p.genero || '').trim().toUpperCase();
        return this.subsSeleccionadas.some(s => {
          if (s === 'UNISEX') return dbGen.includes('UNISEX');
          if (s === 'NINO') return dbGen === 'NINO' || dbGen === 'NIÑO';
          if (s === 'NINA') return dbGen === 'NINA' || dbGen === 'NIÑA';
          return false;
        });
      });
    }
    this.paginaActual = 1;
    this.cdr.detectChanges();
  }

  toggleFiltro(tipo: string, valor: string): void {
    this.navegarAFiltro(valor);
  }

  estaActivo(tipo: string, valor: string): boolean {
    return this.filtroGeneroUrl === valor.toLowerCase();
  }

  seleccionarTalla(productoId: number, talla: string) {
    this.tallaSeleccionada[productoId] = (this.tallaSeleccionada[productoId] === talla) ? '' : talla;
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
      alert('Por favor, selecciona una talla.');
      return;
    }
    this.carritoSvc.agregarAlCarrito(producto, talla);
    this.cerrarModal();
  }
}