import { Component, ChangeDetectorRef, NgZone } from '@angular/core'; // Añadido NgZone
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data'; 
import emailjs from '@emailjs/browser';
import * as bcrypt from 'bcryptjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './recuperar.html',
  styleUrls: ['./recuperar.css']
})
export class RecuperarComponent {
  paso: number = 1;
  email: string = '';
  codigoOTP: string = '';
  codigoRealGenerado: string = '';
  
  nuevaPassword: string = '';
  confirmarPassword: string = '';
  verPass: boolean = false;
  loading: boolean = false;

  constructor(
    private dataService: DataService, 
    private router: Router,
    private cdr: ChangeDetectorRef, // Mantenemos el detector
    private zone: NgZone // Inyectamos la zona para el cambio automático
  ) {}

  // PASO 1: Enviar correo con EmailJS
  async enviarCodigoRecuperacion() {
    if (!this.email) return;
    
    this.loading = true;

    try {
      const usuario = await this.dataService.obtenerUsuarioPorEmail(this.email);
      
      if (usuario) {
        this.codigoRealGenerado = Math.floor(100000 + Math.random() * 900000).toString();
        
        emailjs.send('service_c5zcc5e', 'template_ze0vg7f', {
          to_name: usuario.nombre,
          to_email: this.email,
          message: this.codigoRealGenerado
        }, 'pkSyhsgbE88eKkhPC');

        Swal.fire({
          title: '¡Código Enviado!',
          text: 'Revisa tu bandeja de entrada o spam.',
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#000',
          allowOutsideClick: false 
        }).then((result) => {
          if (result.isConfirmed) {
            // USAMOS NgZone para forzar a Angular a tomar el control del renderizado
            this.zone.run(() => {
              this.loading = false;
              this.paso = 2; 
              this.cdr.detectChanges(); // Refuerzo final
              console.log("Cambiando al paso 2 automáticamente.");
            });
          }
        });

      } else {
        this.loading = false;
        this.cdr.detectChanges();
        Swal.fire({
          title: 'Correo no registrado',
          text: 'Este email no pertenece a ningún usuario de IVANO.',
          icon: 'warning',
          confirmButtonColor: '#000'
        });
      }
    } catch (error) {
      this.loading = false;
      this.cdr.detectChanges();
      console.error("Error crítico:", error);
      Swal.fire('Error', 'Hubo un fallo en la conexión con el servidor.', 'error');
    }
  }

  // PASO 2: Validar el código ingresado (OTP)
  validarCodigo() {
    if (this.codigoOTP === this.codigoRealGenerado) {
      this.paso = 3;
      this.cdr.detectChanges(); // Asegura el cambio visual al paso 3
    } else {
      Swal.fire('Error', 'El código ingresado es incorrecto.', 'error');
    }
  }

  // PASO 3: Actualizar contraseña en Supabase
  async cambiarPassword() {
    if (this.nuevaPassword !== this.confirmarPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    if (this.nuevaPassword.length < 8) {
      Swal.fire('Seguridad', 'La clave debe tener al menos 8 caracteres.', 'warning');
      return;
    }

    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(this.nuevaPassword, salt);

      await this.dataService.actualizarPassword(this.email, hash);
      
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Tu contraseña ha sido actualizada correctamente.',
        icon: 'success',
        confirmButtonColor: '#000'
      });
      
      this.router.navigate(['/login']);
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la nueva contraseña.', 'error');
    }
  }

  // Métodos de apoyo
  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  togglePass() { this.verPass = !this.verPass; }
  
  cerrar() { this.router.navigate(['/login']); }
}