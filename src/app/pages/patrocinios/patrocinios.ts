import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importa esto
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-patrocinios',
  templateUrl: './patrocinios.html',
  styleUrls: ['./patrocinios.css'],
  standalone: false
})
export class Patrocinios implements OnInit {
  lista: any[] = [];

  // 2. Inyéctalo en el constructor
  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef 
  ) {}

  async ngOnInit() {
    const { data, error } = await this.supabaseService.client
      .from('patrocinios')
      .select('*');

    if (data) {
      this.lista = data;
      console.log("DATOS ENCONTRADOS:", this.lista);
      
      // 3. LA LLAVE MAESTRA: Forzamos el refresco de la pantalla
      this.cdr.detectChanges(); 
    }
  }
}