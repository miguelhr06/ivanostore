import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../services/supabase';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-compras.html',
  styleUrls: ['./mis-compras.css']
})
export class MisComprasComponent implements OnInit, OnChanges {
  @Input() usuario: any; // Recibimos al usuario del padre
  compras: any[] = [];
  loading: boolean = true;

  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.usuario) {
      this.cargarHistorial();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && this.usuario) {
      this.cargarHistorial();
    }
  }

  async cargarHistorial() {
    try {
      this.loading = true;
      // Filtramos por el email del usuario actual
      const { data, error } = await this.supabase.client
        .from('historial_compras')
        .select(`*, modelos (*)`)
        .eq('usuario_email', this.usuario.email) 
        .order('fecha_compra', { ascending: false });

      if (data) {
        this.compras = data.map(item => {
          const producto = item.modelos;
          if (!producto) return item;

          // Tu lógica de reconstrucción de URL de imagen
          const partes = producto.imagen_url?.split('-') || [];
          const sigla = partes.length > 1 ? partes[1] : '';
          
          let path = producto.tamano === 'ACCESORIO' 
            ? `ACCESORIO/${producto.categoria}/${producto.modelo}/${sigla}/${producto.imagen_url}`
            : `${producto.tamano?.toLowerCase()}/${producto.modelo}/${sigla}/${producto.imagen_url}`;

          const { data: urlData } = this.supabase.client.storage.from('productos').getPublicUrl(path);

          return {
            ...item,
            imagen_url: urlData?.publicUrl,
            nombre_mostrar: producto.nombre_zapatilla || producto.modelo
          };
        });
      }
    } catch (e) {
      console.error('Error cargando historial:', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}