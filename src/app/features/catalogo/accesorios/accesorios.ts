import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../../services/supabase';
import { CarritoService } from '../../../services/carrito';
import { ActivatedRoute, Router } from '@angular/router'; 
import { Location } from '@angular/common'; // <--- Única importación añadida

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
  selector: 'app-accesorios',
  templateUrl: './accesorios.html',
  styleUrls: ['./accesorios.css'],
  standalone: false
})
export class AccesoriosComponent implements OnInit {
  productos: ProductoIvano[] = [];       
  productosFiltrados: ProductoIvano[] = []; 
  
  loading: boolean = true;
  modalAbierto: boolean = false;
  productoSeleccionado: ProductoIvano | null = null;
  fotoGaleriaActual: string = '';
  
  paginaActual: number = 1;
  itemsPorPagina: number = 25;

  // Filtros sincronizados con la URL
  filtroCategoriaUrl: string = 'todos'; 
  categoriasSeleccionadas: string[] = []; 
  tallaSeleccionada: { [key: number]: string } = {};

  usuarioId: string | null = null;

  public readonly BUCKET_BASE_URL = 'http://127.0.0.1:54321/storage/v1/object/public/productos/';

  constructor(
    private supabaseService: SupabaseService, 
    private carritoSvc: CarritoService, 
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location // <--- Única inyección añadida
  ) {}

  /**
   * FUNCIÓN SENIOR: Genera slugs limpios para estructurar los enlaces dinámicos con barras
   */
  generarSlug(texto: string): string {
    if (!texto) return '';
    return texto
      .toLowerCase()
      .trim()
      .normalize('NFD')                               
      .replace(/[\u0300-\u036f]/g, '')         
      .replace(/[^a-z0-9\s-]/g, '')            
      .replace(/[\s_]+/g, '-'); // Convierte espacios y guiones bajos en guiones comunes
  }

  public construirRutaImagen(item: any, nombreArchivo: string | undefined | null): string {
    if (!nombreArchivo || nombreArchivo.trim() === '') return '';
    let carpetaCategoria = item.categoria;
    if (carpetaCategoria === 'NECESER') carpetaCategoria = 'NECESERS';
    const rutaBase = `ACCESORIO/${carpetaCategoria}/${item.modelo}/${item.sigla}/${nombreArchivo}`;
    return `${this.BUCKET_BASE_URL}${rutaBase}`;
  }

  async ngOnInit() {
    try {
      this.loading = true;
      
      // Intentar obtener sesión si existe tu método original de email
      await this.obtenerUsuarioId();

      const { data, error } = await this.supabaseService.client
        .from('modelos')
        .select(`*, variantes_stock (talla, stock)`)
        .eq('tamano', 'ACCESORIO');

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
              tallas_disponibles: item.tallas_limpias.length > 0 ? [...item.tallas_limpias] : ['U'],
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

        const listadoMapeado = Object.values(agrupados).sort((a: any, b: any) => a.precio - b.precio)
          .map((p: any) => {
            p.tallas_disponibles.sort(); 
            return p;
          });

        this.productos = await this.supabaseService.mapearFavoritosDeProductos(listadoMapeado);

        // ==========================================================
        // 🔥 ESCUCHADOR REACTIVO DE RUTAS PARA ACCESORIOS
        // ==========================================================
        this.route.params.subscribe(params => {
          const filtroUrl = params['filtro']; // slug de la categoria (ej: 'bolsos-pecho' o 'mochilas')
          const modeloUrl = params['modelo'];
          const slugUrl = params['slug'];

          if (filtroUrl && filtroUrl !== 'todos') {
            this.filtroCategoriaUrl = filtroUrl.toLowerCase();
            
            // Buscamos cuál categoría de la Base de Datos machea con el slug de la URL
            const encontrada = this.productos.find(p => this.generarSlug(p.categoria) === this.filtroCategoriaUrl);
            if (encontrada) {
              this.categoriasSeleccionadas = [encontrada.categoria.toUpperCase()];
            } else {
              // Fallback por si escriben cualquier cosa en la URL
              this.categoriasSeleccionadas = [filtroUrl.toUpperCase().replace('-', '_')];
            }
          } else {
            this.filtroCategoriaUrl = 'todos';
            this.categoriasSeleccionadas = [];
          }

          this.aplicarFiltros();

          // Control de apertura del modal vía URL profunda
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
      console.error("Error en Catálogo Accesorios:", err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // Despachadores de enrutamiento estricto
  navegarAFiltro(categoriaRaw: string) {
    if (categoriaRaw === 'todos') {
      this.router.navigate(['/accesorios']);
    } else {
      const slugCategoria = this.generarSlug(categoriaRaw);
      this.router.navigate(['/accesorios', slugCategoria]);
    }
  }

  abrirDetalles(item: ProductoIvano) {
    const slugProd = this.generarSlug(item.nombre_zapatilla);
    const slugCat = this.generarSlug(item.categoria);
    this.router.navigate(['/accesorios', slugCat, item.modelo, slugProd]);
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

  async obtenerUsuarioId() {
    const emailLocal = localStorage.getItem('userEmail');
    if (emailLocal) {
      const { data } = await this.supabaseService.getUsuarioPorEmail(emailLocal);
      if (data) this.usuarioId = data.id;
    }
  }

  async toggleFavorito(item: any, event: Event) {
    event.stopPropagation(); 
    const nuevoEstado = await this.supabaseService.alternarFavoritoGlobal(item, event);
    item.esFavorito = nuevoEstado;
    
    const index = this.productos.findIndex(p => p.id === item.id);
    if (index > -1) {
      this.productos[index].esFavorito = nuevoEstado;
    }
    this.cdr.detectChanges();
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

  aplicarFiltros(): void {
    if (this.categoriasSeleccionadas.length === 0) {
      this.productosFiltrados = [...this.productos];
    } else {
      this.productosFiltrados = this.productos.filter(p => 
        this.categoriasSeleccionadas.includes(p.categoria.toUpperCase())
      );
    }
    this.paginaActual = 1;
    this.cdr.detectChanges();
  }

  toggleFiltro(valor: string): void {
    this.navegarAFiltro(valor);
  }

  estaActivo(valor: string): boolean {
    if (valor === 'todos') return this.filtroCategoriaUrl === 'todos';
    return this.filtroCategoriaUrl === this.generarSlug(valor);
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
    if (!img) return;

    const x = e.offsetX;
    const y = e.offsetY;
    const xPercent = (x / container.offsetWidth) * 100;
    const yPercent = (y / container.offsetHeight) * 100;
    
    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    img.style.transform = "scale(2)"; 
  }

  onMouseLeave(e: MouseEvent) {
    const container = e.currentTarget as HTMLElement;
    const img = container.querySelector('img') as HTMLImageElement;
    if (img) {
      img.style.transform = "scale(1)";
      img.style.transformOrigin = "center center";
    }
  }

  agregarAlCarrito(producto: any) {
    const talla = this.tallaSeleccionada[producto.id];
    if (!talla) { 
      alert('Selecciona una talla'); 
      return; 
    }
    this.carritoSvc.agregarAlCarrito(producto, talla);
    this.tallaSeleccionada[producto.id] = ''; 
    this.cerrarModal();
    this.cdr.detectChanges();
  }
}