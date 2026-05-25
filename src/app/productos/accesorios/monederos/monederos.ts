import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../../services/supabase';

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
  tallas_disponibles: string[];
  esFavorito?: boolean; // <-- CORRECCIÓN: Agregado para que compile y tipifique perfecto
}

@Component({
  selector: 'app-monederos',
  templateUrl: './monederos.html',
  styleUrls: ['./monederos.css'],
  standalone: false
})
export class MonederosComponent implements OnInit {
  productos: ProductoIvano[] = [];
  loading: boolean = true;
  modalAbierto: boolean = false;
  productoSeleccionado: ProductoIvano | null = null;
  fotoGaleriaActual: string = '';

  public readonly BUCKET_BASE_URL = 'http://127.0.0.1:54321/storage/v1/object/public/productos/';

  constructor(private supabaseService: SupabaseService, private cdr: ChangeDetectorRef) {}

  public construirRutaImagen(item: any, nombreArchivo: string | undefined): string {
    if (!nombreArchivo) return '';
    
    const carpetaBase = 'ACCESORIO/MONEDEROS/';
    const mod = item.modelo ? `${item.modelo}/` : '';
    const sig = item.sigla ? `${item.sigla}/` : '';
    
    return `${this.BUCKET_BASE_URL}${carpetaBase}${mod}${sig}${nombreArchivo}`;
  }

  async ngOnInit() {
    try {
      const { data, error } = await this.supabaseService.client
        .from('modelos')
        .select(`*, variantes_stock (talla, stock)`)
        .eq('categoria', 'MONEDEROS');

      if (error) throw error;

      if (data) {
        const mapeoInicial = data.map((m: any) => ({
          ...m,
          imagen_principal_render: this.construirRutaImagen(m, m.imagen_url),
          tallas_disponibles: m.variantes_stock.filter((v: any) => v.stock > 0).map((v: any) => v.talla)
        }));

        this.productos = await this.supabaseService.mapearFavoritosDeProductos(mapeoInicial);
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async toggleFavorito(item: any, event: Event) {
    item.esFavorito = await this.supabaseService.alternarFavoritoGlobal(item, event);
    this.cdr.detectChanges();
  }

  cambiarFoto(item: ProductoIvano, hover: boolean) {
    item.imagen_principal_render = hover && item.imagen_url_2 
      ? this.construirRutaImagen(item, item.imagen_url_2) 
      : this.construirRutaImagen(item, item.imagen_url);
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
}