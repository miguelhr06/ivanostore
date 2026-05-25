import { Component, Input, OnInit, OnChanges, SimpleChanges, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase';
import { AuthService } from '../../../../services/auth';
import { environment } from '../../../../../environments/environment'; // Importamos tu environment
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'; // Importante para el flujo de SMS
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-datos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './mis-datos.html',
  styleUrls: ['./mis-datos.css']
})
export class MisDatosComponent implements OnInit, OnChanges {
  @Input() usuario: any; 
  datosForm: FormGroup;
  loading: boolean = false;
  isEditing: boolean = false; 
  
  paso: number = 1;
  campoEnEdicion: 'email' | 'celular' | null = null;
  codigoOTP: string = '';
  codigoRealGenerado: string = '';
  recaptchaVerifier: any = null;
  nuevoValorTemporal: string = '';

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.datosForm = this.fb.group({
      nombre: [{ value: '', disabled: true }],
      dni: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      celular: [{ value: '', disabled: true }, [
        Validators.required, 
        Validators.pattern('^[0-9]{9}$'),
        Validators.minLength(9),
        Validators.maxLength(9)
      ]]
    });
  }

  ngOnInit() {
    // PARCHE MAESTRO: Inicializamos Firebase con tu config de environment
    if (!firebase.apps.length) {
      firebase.initializeApp(environment.firebase);
    }
    this.cargarDatosUsuario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && this.usuario && !this.isEditing) {
      this.rellenarFormulario();
    }
  }

  // ... (Tus funciones cargarDatosUsuario y rellenarFormulario se mantienen igual)
  cargarDatosUsuario() {
    this.authService.userPhone$.subscribe((phone) => {
      if (phone && this.usuario && !this.isEditing) {
        this.usuario.celular = phone;
        this.rellenarFormulario();
        this.cdr.detectChanges();
      }
    });
    this.authService.userEmail$.subscribe(async (email) => {
      if (email && !this.isEditing) {
        const { data } = await this.supabase.getUsuarioPorEmail(email);
        if (data) {
          this.usuario = data;
          this.rellenarFormulario();
        }
      }
    });
  }

  rellenarFormulario() {
    if (this.usuario) {
      const celularLimpio = this.usuario.celular ? this.usuario.celular.replace(/\s+/g, '') : '';
      this.datosForm.patchValue({
        nombre: this.usuario.nombre,
        dni: this.usuario.dni,
        email: this.usuario.email,
        celular: celularLimpio 
      });
      this.cdr.detectChanges();
    }
  }

  async iniciarProceso(campo: 'email' | 'celular') {
    this.campoEnEdicion = campo;
    this.loading = true;
    this.isEditing = true;

    try {
      if (campo === 'email') {
        // Para cambiar email, mandamos SMS al celular actual
        await this.ejecutarFlujoSMS();
      } else {
        // Para cambiar celular, mandamos código al email actual
        await this.ejecutarFlujoEmail();
      }
    } catch (error: any) {
      console.error("Error en inicio:", error);
      Swal.fire('Error', 'No se pudo enviar el código de verificación.', 'error');
      this.loading = false;
      this.isEditing = false;
    }
  }

  private async ejecutarFlujoSMS() {
    // Aseguramos que el ID coincida con tu botón en el HTML
    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('btn-cambiar-email', {
        size: 'invisible'
      });
    }

    // Limpiamos el número y agregamos el prefijo de Perú
    const celularLimpio = this.usuario.celular.replace(/\s+/g, '');
    const numeroDestino = celularLimpio.startsWith('+51') ? celularLimpio : '+51' + celularLimpio;

    // Llamamos al servicio de Auth que ya tienes
    await this.authService.enviarSms(numeroDestino, this.recaptchaVerifier);
    this.cambiarAPaso2(`Código enviado al celular ${this.usuario.celular}`);
  }

  private async ejecutarFlujoEmail() {
    this.codigoRealGenerado = Math.floor(100000 + Math.random() * 900000).toString();
    await emailjs.send('service_c5zcc5e', 'template_ze0vg7f', {
      to_name: this.usuario.nombre,
      to_email: this.usuario.email,
      message: this.codigoRealGenerado
    }, 'pkSyhsgbE88eKkhPC');
    this.cambiarAPaso2(`Código enviado al correo ${this.usuario.email}`);
  }

  private cambiarAPaso2(mensaje: string) {
    Swal.fire({ title: '¡Verificación en camino!', text: mensaje, icon: 'info', confirmButtonColor: '#000' })
    .then(() => {
      this.ngZone.run(() => {
        this.paso = 2;
        this.loading = false;
        this.cdr.detectChanges();
      });
    });
  }

  async verificarCodigo() {
    if (!this.codigoOTP || this.codigoOTP.length < 6) return;
    this.loading = true;

    try {
      if (this.campoEnEdicion === 'email') {
        // Aquí entrará tu código de prueba 261427 porque Firebase lo reconoce
        await this.authService.verificarCodigoSms(this.codigoOTP);
      } else {
        if (this.codigoOTP !== this.codigoRealGenerado) throw new Error("Incorrecto");
      }

      this.ngZone.run(() => {
        this.paso = 3;
        this.nuevoValorTemporal = ''; 
        this.loading = false;
        this.cdr.detectChanges();
      });

    } catch (error) {
      Swal.fire('Código inválido', 'El código ingresado no coincide.', 'error');
      this.loading = false;
    }
  }

  // Tu función guardarCambio con todas las restricciones de 9 dígitos y "Unique" que hicimos
  async guardarCambio() {
    if (this.campoEnEdicion === 'celular') {
      const celularLimpio = this.nuevoValorTemporal.replace(/\s+/g, '');
      const esValido = /^[0-9]{9}$/.test(celularLimpio);

      if (!esValido) {
        Swal.fire({ title: 'Formato incorrecto', text: '9 dígitos exactos, papi.', icon: 'warning' });
        return;
      }
      this.nuevoValorTemporal = celularLimpio.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    }

    if (!this.nuevoValorTemporal || !this.usuario?.dni) return;

    const campo = this.campoEnEdicion!;
    const valorParaDB = this.nuevoValorTemporal.trim();
    const dniString = String(this.usuario.dni).trim();
    
    this.loading = true;

    try {
      const { data, error } = await this.supabase.client
        .from('usuarios')
        .update({ [campo]: valorParaDB })
        .eq('dni', dniString)
        .select();

      if (error) throw error;

      this.authService.setLoggedIn(
        true, 
        campo === 'email' ? valorParaDB : (localStorage.getItem('userEmail') || ''),
        campo === 'celular' ? valorParaDB : (this.usuario.celular || '')
      );

      await Swal.fire({ title: '¡Listo!', text: 'Correo actualizado con éxito.', icon: 'success' });
      
      this.isEditing = false;
      this.paso = 1;
      await this.authService.refrescarDatosUsuario();
      this.rellenarFormulario();

    } catch (err: any) {
      if (err.code === '23505') {
        Swal.fire('Error', 'Este dato ya está en uso por otro usuario.', 'error');
      } else {
        Swal.fire('Error', err.message, 'error');
      }
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  cancelarEdicion() {
    this.paso = 1;
    this.isEditing = false;
    this.campoEnEdicion = null;
    this.codigoOTP = '';
    this.nuevoValorTemporal = '';
    this.rellenarFormulario();
  }

  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) event.preventDefault();
  }
}