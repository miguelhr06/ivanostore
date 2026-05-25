import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  public client: SupabaseClient;

  constructor() {
    this.client = createClient(
      'http://127.0.0.1:54321', 
      'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH', 
      {
        auth: {
          persistSession: true,
          storageKey: 'ivano-store-auth',
          autoRefreshToken: true,
          // Cambiamos a false para evitar que Supabase intente manejar 
          // la URL al mismo tiempo que el Router de Angular
          detectSessionInUrl: false, 
          lockType: 'custom',
          getLock: async () => () => {} // Parche síncrono inyectado directo dentro de tus opciones originales
        } as any
      }
    );

    // Manejo limpio del refresco de sesión original
    window.addEventListener('beforeunload', () => {
      this.client.auth.stopAutoRefresh();
    });
  }

  async getUsuarioPorEmail(email: string) {
    if (!email) return { data: null, error: 'Email no proporcionado' };
    
    return await this.client
      .from('usuarios')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle(); // Usamos maybeSingle para evitar errores si no existe
  }

  // ==========================================================================
  // LOGICA PERSISTENTE DE FAVORITOS (IVANO STORE - INTEGRACION COMPLETA)
  // ==========================================================================

  // FUNCIÓN INTERNA PARA CONSEGUIR EL UUID DE TU TABLA 'USUARIOS' USANDO TU FLUJO DE CORREO REAL
  private async obtenerMiUserIdReal(): Promise<string | null> {
    try {
      const emailLocal = localStorage.getItem('userEmail');
      if (!emailLocal) return null;

      const { data, error } = await this.getUsuarioPorEmail(emailLocal);
      if (data && data.id) {
        return data.id; // Retorna el UUID que mapea con el campo 'user_id' de tu tabla favoritos
      }
    } catch (e) {
      console.error("Error obteniendo UUID del usuario logueado:", e);
    }
    return null;
  }

  // 1. FUNCIÓN AUTOMÁTICA PARA MARCAR QUÉ PRODUCTOS SON FAVORITOS AL CARGAR
  async mapearFavoritosDeProductos(productos: any[]): Promise<any[]> {
    try {
      const userId = await this.obtenerMiUserIdReal();
      if (!userId) return productos; // Si no hay usuario en Firebase/Storage, corazones grises

      // Consultamos tu tabla real 'favoritos' usando el user_id (UUID)
      const { data: dataFavs, error } = await this.client
        .from('favoritos')
        .select('producto_id')
        .eq('user_id', userId);

      if (error || !dataFavs) return productos;

      // Mapeamos los IDs como string para evitar fallos de tipos con la grilla
      const favoritosIds = dataFavs.map((f: any) => String(f.producto_id).trim());

      // Cruzamos las listas automáticamente en memoria para renderizar en caliente
      return productos.map(p => ({
        ...p,
        esFavorito: favoritosIds.includes(String(p.id).trim())
      }));
    } catch (err) {
      console.error("Error automático de favoritos:", err);
      return productos;
    }
  }

  // 2. FUNCIÓN AUTOMÁTICA PARA EL CLICK DEL CORAZÓN (INSERT / DELETE CON TU TABLA REAL)
  async alternarFavoritoGlobal(item: any, event: Event): Promise<boolean> {
    if (event) event.stopPropagation(); // Evita que abra modales por detrás en accesorios

    try {
      const userId = await this.obtenerMiUserIdReal();

      if (!userId) {
        alert("Inicia sesión para guardar tus favoritos.");
        return item.esFavorito; // Retorna su estado actual si no está logueado
      }

      const idProductoStr = String(item.id).trim();

      if (item.esFavorito) {
        // Hacemos el DELETE usando las columnas reales de tus capturas (user_id y producto_id)
        const { error } = await this.client
          .from('favoritos')
          .delete()
          .eq('user_id', userId)
          .eq('producto_id', idProductoStr);
        
        if (error) throw error;
        return false; // Retorna nuevo estado (desmarcado)
      } else {
        // Hacemos el INSERT calzado con tu base de datos
        const { error } = await this.client
          .from('favoritos')
          .insert([
            {
              user_id: userId,
              producto_id: idProductoStr
            }
          ]);
        
        if (error) throw error;
        return true; // Retorna nuevo estado (marcado)
      }
    } catch (err) {
      console.error("Error al alternar favorito en base de datos:", err);
      return item.esFavorito; // Mantiene el estado previo si algo falla
    }
  }
}