import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase'; // Verifica que la ruta sea correcta
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DireccionesService {

  constructor(private supabaseService: SupabaseService) { }

  createDireccion(direccion: any): Observable<any> {
    // Usamos .client directamente como indica tu error de VS Code
    const client = this.supabaseService.client;
    
    return from(
      client
        .from('direcciones')
        .insert([direccion])
        .select()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data ? response.data[0] : null;
      })
    );
  }

  getDireccionesPorEmail(email: string): Observable<any[]> {
    const client = this.supabaseService.client;
    return from(
      client
        .from('direcciones')
        .select('*')
        .eq('usuario_email', email)
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      })
    );
  }
}