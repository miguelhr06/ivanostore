import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // 1. Importa Router aquí
import { SupabaseService } from '../../../../services/supabase';

@Component({
  selector: 'app-mis-favoritos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-favoritos.html',
  styleUrls: ['./mis-favoritos.css']
})
export class MisFavoritosComponent implements OnInit, OnChanges {
  @Input() usuario: any;
  
  favoritos: any[] = []; 
  loading: boolean = false;
  public readonly BUCKET_BASE_URL = 'http://127.0.0.1:54321/storage/v1/object/public/productos/';

  // 2. IMPORTANTE: Agregamos private router: Router aquí
  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef,
    private router: Router 
  ) {}

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

  async ngOnInit() {
    if (this.usuario) {
      await this.cargarFavoritos();
    }
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['usuario'] && this.usuario) {
      await this.cargarFavoritos();
    }
  }

  // MÉTODO PARA VER PRODUCTO DESDE FAVORITOS CON "ESTADO" DE RETORNO
 verProducto(item: any) {
  const slugProd = this.generarSlug(item.nombre_zapatilla);
  const slugCat = this.generarSlug(item.categoria);
  
  let ruta: string[] = [];
  const tamano = item.tamano?.toLowerCase();
  
  // Lógica para detectar niños/pequeños
  const esNino = tamano === 'pequeno' || tamano === 'ninos' || tamano === 'nino';
  const esAccesorio = tamano === 'accesorio';

  if (esAccesorio) {
    ruta = ['/ACCESORIO', slugCat, item.modelo, slugProd];
  } else if (esNino) {
    // RUTA PARA NIÑOS
    ruta = ['/ninos', 'pequeno', item.modelo, slugProd];
  } else if (item.genero?.toLowerCase() === 'dama') {
    ruta = ['/dama', 'grande', item.modelo, slugProd];
  } else {
    ruta = ['/caballero', 'grande', item.modelo, slugProd];
  }

  this.router.navigate(ruta, { 
    state: { retorno: '/mi-perfil/favoritos' } 
  });
}

  public construirRutaImagen(item: any, nombreArchivo: string | undefined | null): string {
    if (!nombreArchivo || nombreArchivo.trim() === '') return '';
    
    let rutaBase = '';
    const tamanoModulo = item.tamano ? item.tamano.toLowerCase() : '';

    if (tamanoModulo === 'accesorio') {
      let carpetaCategoria = item.categoria;
      if (carpetaCategoria === 'NECESER') carpetaCategoria = 'NECESERS';
      rutaBase = `ACCESORIO/${carpetaCategoria}/${item.modelo}/${item.sigla}/${nombreArchivo}`;
    } else {
      let carpetaTamano = 'grande'; 
      if (tamanoModulo === 'grande' || tamanoModulo === 'caballero' || tamanoModulo === 'hombre') {
        carpetaTamano = 'grande';
      } else if (tamanoModulo === 'mediano' || tamanoModulo === 'dama' || tamanoModulo === 'mujer') {
        carpetaTamano = 'mediano';
      } else if (tamanoModulo === 'pequeno' || tamanoModulo === 'ninos' || tamanoModulo === 'nino' || tamanoModulo === 'niño') {
        carpetaTamano = 'pequeno';
      }
      rutaBase = `${carpetaTamano}/${item.modelo}/${item.sigla}/${nombreArchivo}`;
    }
    return `${this.BUCKET_BASE_URL}${rutaBase}`;
  }

  async cargarFavoritos() {
    let userId = this.usuario?.id;
    if (!userId) {
      const emailLocal = localStorage.getItem('userEmail');
      if (emailLocal) {
        const { data } = await this.supabase.getUsuarioPorEmail(emailLocal);
        if (data) userId = data.id;
      }
    }
    if (!userId) return;

    this.loading = true;
    try {
      const { data, error } = await this.supabase.client
        .from('favoritos')
        .select(`id, producto_id, modelos (*)`)
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        this.favoritos = data
          .map((f: any) => {
            const prod = f.modelos;
            if (!prod) return null;
            return {
              ...prod,
              id_favorito_tabla: f.id, 
              imagen_principal_render: this.construirRutaImagen(prod, prod.imagen_url)
            };
          })
          .filter(p => p !== null);
      } else {
        this.favoritos = [];
      }
    } catch (err) {
      console.error("Error al cargar favoritos:", err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async removerFavorito(productoId: number) {
    let userId = this.usuario?.id;
    if (!userId) {
      const emailLocal = localStorage.getItem('userEmail');
      if (emailLocal) {
        const { data } = await this.supabase.getUsuarioPorEmail(emailLocal);
        if (data) userId = data.id;
      }
    }
    if (!userId) return;

    try {
      const { error } = await this.supabase.client
        .from('favoritos')
        .delete()
        .eq('user_id', userId)
        .eq('producto_id', productoId);

      if (error) throw error;
      this.favoritos = this.favoritos.filter(p => p.id !== productoId);
    } catch (err) {
      console.error("Error al remover favorito:", err);
    } finally {
      this.cdr.detectChanges();
    }
  }
}