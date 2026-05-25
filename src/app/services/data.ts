import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importación necesaria para la API de DNI
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public supabase: SupabaseClient;
  
  // Token de ApiPeruDev que usabas en la otra clase
  private tokenDni = '7901106858e4b31560e08b9584db4e993e282ed01df0eed0201d35c62ba251d5';

  constructor(private http: HttpClient) {
    // Configuración de Supabase local para IVANO Store
    this.supabase = createClient(
      'http://127.0.0.1:54321', 
      'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' 
    );
  }

  /**
   * Consulta los datos del DNI usando ApiPeruDev
   * @param dni Número de 8 dígitos
   */
  consultarDni(dni: string): Observable<any> {
    const url = `https://apiperu.dev/api/dni/${dni}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.tokenDni}`,
      'Accept': 'application/json'
    });
    return this.http.get(url, { headers });
  }

  async insertarUsuario(usuario: any) {
    const { data, error } = await this.supabase
      .from('usuarios')
      .insert([
        { 
          firebase_uid: usuario.firebase_uid, 
          nombre: usuario.nombre, 
          dni: usuario.dni,
          celular: usuario.celular,
          email: usuario.email,
          password: usuario.password, // Este ya llega hasheado desde el componente
          rol: 'cliente',
          puntos_ivano: 0 
        }
      ]);

    if (error) {
      console.error('Error detallado de Supabase:', error);
      throw error;
    }
    return data;
  }

  // --- NUEVOS MÉTODOS PARA RECUPERACIÓN ---

async obtenerUsuarioPorEmail(email: string) {
  const { data, error } = await this.supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single(); // Trae solo un usuario

  if (error) return null;
  return data;
}

async actualizarPassword(email: string, nuevaPasswordHasheada: string) {
  const { data, error } = await this.supabase
    .from('usuarios')
    .update({ password: nuevaPasswordHasheada })
    .eq('email', email);

  if (error) throw error;
  return data;
}

async buscarProductos(termino: string) {
  const t = termino.toLowerCase().trim();
  if (t.length < 2) return [];

  let query = this.supabase.from('modelos').select('*');

  const b = `%${t.replace(/(barato|economico|hombre|mujer|dama|caballero)/g, '').trim()}%`;
  query = query.or(`nombre_zapatilla.ilike.${b},modelo.ilike.${b},color.ilike.${b},categoria.ilike.${b},tamano.ilike.${b}`);

  const { data, error } = await query.limit(12);
  if (error) return [];

  return data.map(item => {
    const partes = item.imagen_url.split('-');
    const sigla = partes.length > 1 ? partes[1] : '';
    
    let fullPath = '';

    if (item.tamano === 'ACCESORIO') {
      // Los accesorios SI llevan la categoría en la ruta
      fullPath = `ACCESORIO/${item.categoria}/${item.modelo}/${sigla}/${item.imagen_url}`;
    } else {
      // Las zapatillas NO llevan la categoría, van directo: tamaño/modelo/sigla
      // Ejemplo: grande/F0008/E/F0008-E-1.jpg
      const tamanoFolder = item.tamano.toLowerCase();
      fullPath = `${tamanoFolder}/${item.modelo}/${sigla}/${item.imagen_url}`;
    }

    const { data: urlData } = this.supabase
      .storage
      .from('productos')
      .getPublicUrl(fullPath);

    return {
      ...item,
      imagen_url: urlData.publicUrl
    };
  });
}
  
}