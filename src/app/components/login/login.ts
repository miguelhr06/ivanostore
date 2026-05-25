import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data';
import Swal from 'sweetalert2';
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  verPassword: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private dataService: DataService 
  ) {}

  async login() { 
    try {
      // 1. Buscamos al usuario en la tabla 'usuarios'
      const { data, error } = await this.dataService.supabase
        .from('usuarios')
        .select('*')
        .eq('email', this.email)
        .single();

      if (error || !data) {
        this.lanzarAlerta('Usuario no encontrado', 'Miguel, este correo no está registrado.', 'error');
        return;
      }

      // 2. Comparamos contraseña
      const esValida = bcrypt.compareSync(this.password, data.password);

      if (esValida) {
        // Le pasamos el true Y el email que el usuario escribió
        this.authService.setLoggedIn(true, this.email); 
        
        // --- AQUÍ ESTÁ EL CAMBIO PARA EL CHATBOT ---
        // Verificamos si hay una intención pendiente de hablar con un asesor
        if (localStorage.getItem('pendiente_asesor') === 'true') {
          // Si existe, borramos la marca y redirigimos al chat
          localStorage.removeItem('pendiente_asesor');
          this.router.navigate(['/mi-perfil/mensajes']);
        } else {
          // Si no, redirección normal
          this.router.navigate(['/inicio']);
        }
        // -------------------------------------------

      } else {
        this.lanzarAlerta('Contraseña Incorrecta', 'La clave no coincide.', 'warning');
      }

    } catch (error) {
      console.error('Error:', error);
      this.lanzarAlerta('Error de sistema', 'No pudimos conectar con la base de datos.', 'error');
    }
  }

  cerrarModal() {
    this.router.navigate([{ outlets: { modal: null } }]); 
    this.router.navigate(['/']);
  }

  recuperarClave() {
    this.router.navigate(['/recuperar']);
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }

  private lanzarAlerta(titulo: string, texto: string, icono: any) {
    Swal.fire({
      icon: icono,
      title: titulo,
      text: texto,
      confirmButtonColor: '#000',
      background: '#fff',
      color: '#000',
      confirmButtonText: 'Entendido',
      target: document.body,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: true,
      stopKeydownPropagation: true,
      customClass: {
        container: 'bloqueo-total-ivano'
      }
    });
  }
}