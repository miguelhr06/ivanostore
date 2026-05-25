import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { SupabaseService } from '../../services/supabase';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { take, filter } from 'rxjs/operators';

import { MisDatosComponent } from './sub-components/mis-datos/mis-datos';
import { MisDireccionesComponent } from './sub-components/mis-direcciones/mis-direcciones';
import { MisComprasComponent } from './sub-components/mis-compras/mis-compras';
import { MisBeneficiosComponent } from './sub-components/mis-beneficios/mis-beneficios';
import { MisFavoritosComponent } from './sub-components/mis-favoritos/mis-favoritos';
import { MisMensajesComponent } from './sub-components/mis-mensajes/mis-mensajes';
@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.html',
  styleUrls: ['./mi-perfil.css'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MisDatosComponent, 
    MisDireccionesComponent, 
    MisComprasComponent,
    MisBeneficiosComponent,
    MisFavoritosComponent,
    MisMensajesComponent,
  ]
})
export class MiPerfilComponent implements OnInit {
  seccionActual: string = 'datos';
  usuario: any = null;
  loading: boolean = true;
  isDarkMode: boolean = false;

  constructor(
    private authService: AuthService,
    private supabase: SupabaseService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.checkTheme();
    await this.obtenerUsuarioBase();
    
    // 1. LECTURA INMEDIATA: Detecta la sección al cargar el componente
    this.actualizarSeccionSegunUrl(this.router.url);

    // 2. LECTURA CONTINUA: Escucha cambios de ruta futuros
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.actualizarSeccionSegunUrl(event.urlAfterRedirects);
      });
  }

  // Función unificada para actualizar la vista
  private actualizarSeccionSegunUrl(url: string) {
    if (url.includes('favoritos')) this.seccionActual = 'favoritos';
    else if (url.includes('compras')) this.seccionActual = 'compras';
    else if (url.includes('direcciones')) this.seccionActual = 'direcciones';
    else if (url.includes('beneficios')) this.seccionActual = 'beneficios';
    else if (url.includes('ajustes')) this.seccionActual = 'ajustes';
    else if (url.includes('mensajes')) this.seccionActual = 'mensajes';

    else this.seccionActual = 'datos'; // Por defecto, si es la raíz o datos
    
    this.cdr.detectChanges(); // Asegura que el @switch se refresque
  }

  async obtenerUsuarioBase() {
    this.loading = true;
    this.authService.userEmail$.pipe(take(1)).subscribe(async (email) => {
      const emailLimpio = email || localStorage.getItem('userEmail');
      if (!emailLimpio) {
        this.loading = false;
        this.router.navigate(['/login']);
        return;
      }
      try {
        const { data, error } = await this.supabase.client
          .from('usuarios')
          .select('*')
          .eq('email', emailLimpio.trim().toLowerCase());
        if (error) throw error;
        if (data && data.length > 0) {
          this.usuario = data[0];
          this.authService.setLoggedIn(true, this.usuario.email);
        } else {
          this.router.navigate(['/login']);
        }
      } catch (err) {
        this.router.navigate(['/login']);
      } finally {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  checkTheme() {
    if (localStorage.getItem('theme') === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  async cerrarSesion() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}