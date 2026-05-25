import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../services/supabase';

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
  tallas_disponibles: number[];
}

@Component({
  selector: 'app-pequeno',
  templateUrl: './pequeno.html',
  styleUrls: ['./pequeno.css'],
  standalone: false
})
export class PequenoComponent implements OnInit {
  productos: ProductoIvano[] = [];
  loading: boolean = true;
  
  modalAbierto: boolean = false;
  productoSeleccionado: ProductoIvano | null = null;
  fotoGaleriaActual: string = '';

  // AGREGADO: Para controlar el cuadrito rojo de selección
  tallaSeleccionada: { [key: number]: string } = {};

  public readonly BUCKET_BASE_URL = 'http://127.0.0.1:54321/storage/v1/object/public/productos/';

  constructor(private supabaseService: SupabaseService, private cdr: ChangeDetectorRef) {}

  public construirRutaImagen(item: any, nombreArchivo: string | undefined): string {
    if (!nombreArchivo) return '';
    const tam = item.tamano ? `${item.tamano.toLowerCase()}/` : 'pequeno/'; 
    const mod = item.modelo ? `${item.modelo}/` : '';
    const sig = item.sigla ? `${item.sigla}/` : '';
    return `${this.BUCKET_BASE_URL}${tam}${mod}${sig}${nombreArchivo}`;
  }

  async ngOnInit() {
  try {
    const { data, error } = await this.supabaseService.client
      .from('modelos')
      .select(`*, variantes_stock (talla, stock)`)
      .eq('tamano', 'PEQUENO') 
      .gte('variantes_stock.talla', 27)
      .lte('variantes_stock.talla', 32)
      // 1. Ordenamos por precio (ascendente) y luego por modelo (alfabético)
      .order('precio', { ascending: true })
      .order('modelo', { ascending: true });

    if (error) throw error;

    if (data) {
      this.productos = data.map((m: any) => ({
        ...m,
        imagen_principal_render: this.construirRutaImagen(m, m.imagen_url),
        // 2. Ordenamos las tallas numéricamente dentro de cada tarjeta
        tallas_disponibles: m.variantes_stock
          .filter((v: any) => v.stock > 0)
          .map((v: any) => v.talla)
          .sort((a: number, b: number) => a - b)
      }));
    }
  } catch (err) {
    console.error("Error Ivano Store:", err);


  } finally {
    this.loading = false;
    this.cdr.detectChanges();
  }
}

  // AGREGADO: Lógica de selección para el cuadrito rojo
  seleccionarTalla(productoId: number, talla: any) {
    const tallaStr = talla.toString();
    if (this.tallaSeleccionada[productoId] === tallaStr) {
      delete this.tallaSeleccionada[productoId];
    } else {
      this.tallaSeleccionada[productoId] = tallaStr;
    }
  }

  // AGREGADO: Efecto Zoom para la foto principal del modal
  onMouseMove(e: MouseEvent) {
    const container = e.currentTarget as HTMLElement;
    const img = container.querySelector('img') as HTMLImageElement;
    const { left, top, width, height } = container.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = "scale(2)";
  }

  onMouseLeave(e: MouseEvent) {
    const container = e.currentTarget as HTMLElement;
    const img = container.querySelector('img') as HTMLImageElement;
    img.style.transform = "scale(1)";
  }

  cambiarFoto(item: ProductoIvano, hover: boolean) {
    if (hover && item.imagen_url_2) {
      item.imagen_principal_render = this.construirRutaImagen(item, item.imagen_url_2);
    } else {
      item.imagen_principal_render = this.construirRutaImagen(item, item.imagen_url);
    }
  }

  abrirDetalles(item: ProductoIvano) {
    this.productoSeleccionado = item;
    this.fotoGaleriaActual = this.construirRutaImagen(item, item.imagen_url);
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.productoSeleccionado = null;
  }

  seleccionarFotoMiniatura(nombreArchivo: string | undefined) {
    if (nombreArchivo && this.productoSeleccionado) {
      this.fotoGaleriaActual = this.construirRutaImagen(this.productoSeleccionado, nombreArchivo);
    }
  }

paginaActual: number = 1;
itemsPorPagina: number = 25;

// Compara tallas (string vs number) de forma segura para el HTML
compararTallas(tallaItem: any, tallaGuardada: any): boolean {
  return String(tallaItem) === String(tallaGuardada);
}

get productosPaginados() {
  const filtrados = this.productos.filter(item => {
    // Solo zapatillas (evita accesorios)
    const esZapatilla = item.tamano !== 'ACCESORIO';
    // Que tengan al menos una talla entre 39 y 43
    const tieneTallaPequeno = item.tallas_disponibles.some((t: any) => {
      const n = Number(t);
      return n >= 27 && n <= 32;
    });
    return esZapatilla && tieneTallaPequeno;
  });

  // Ordenar por precio: el más barato primero
  const ordenados = filtrados.sort((a, b) => a.precio - b.precio);

  // Recorte para paginación (Máximo 25 por vista)
  const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
  return ordenados.slice(inicio, inicio + this.itemsPorPagina);
}

get totalPaginas() {
  const filtrados = this.productos.filter(item => {
    const esZapatilla = item.tamano !== 'ACCESORIO';
    const tieneTallaPequeno = item.tallas_disponibles.some((t: any) => Number(t) >= 27 && Number(t) <= 32);
    return esZapatilla && tieneTallaPequeno;
  });
  return Math.ceil(filtrados.length / this.itemsPorPagina);
}

cambiarPagina(nuevaPagina: number) {
  if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
    this.paginaActual = nuevaPagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
}