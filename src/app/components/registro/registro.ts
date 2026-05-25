import { Component, OnInit, NgZone } from '@angular/core'; 
import { Router, RouterLink } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { AuthService } from '../../services/auth'; 
import firebase from 'firebase/compat/app'; 
import 'firebase/compat/auth'; 
import Swal from 'sweetalert2'; 
import { DataService } from '../../services/data'; 
import emailjs from '@emailjs/browser'; 
import { environment } from '../../../environments/environment'; 
import * as bcrypt from 'bcryptjs'; // Librería para el hash

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent implements OnInit {
  paso: number = 1; 
  codigoOTP: string = ''; 
  codigoRealGenerado: string = ''; 
  
  verPassword: boolean = false; 
  verConfirmarPassword: boolean = false; 
  confirmarPassword: string = ''; 
  metodoElegido: string = ''; 

  // Control para la API de DNI
  loadingDni: boolean = false;

  usuario = {
    nombre: '',
    dni: '',
    email: '',
    celular: '',
    password: ''
  }; 

  recaptchaVerifier!: firebase.auth.RecaptchaVerifier; 

  constructor(
    private router: Router, 
    private auth: AuthService, 
    private dataService: DataService, 
    private zone: NgZone 
  ) {}

  ngOnInit(): void {}

  // --- RESTRICCIONES SOLICITADAS POR MIGUEL ---
  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode !== 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  buscarDni() {
    // Si el DNI tiene exactamente 8 dígitos, disparamos la búsqueda
    if (this.usuario.dni.length === 8) {
      this.loadingDni = true;
      this.dataService.consultarDni(this.usuario.dni).subscribe({
        next: (res: any) => {
          if (res && res.success && res.data) {
            const d = res.data;
            this.usuario.nombre = `${d.nombres} ${d.apellido_paterno} ${d.apellido_materno}`;
          }
          this.loadingDni = false;
        },
        error: (err) => {
          console.error("Error API:", err);
          this.loadingDni = false;
        }
      });
    } 
    // SI EL DNI SE BORRA O ES MENOR A 8, LIMPIAMOS EL NOMBRE
    else {
      this.usuario.nombre = '';
    }
  }

  siguientePaso(n: number) {
    if (this.paso === 1) {
      const { nombre, dni, email, celular, password } = this.usuario;
      if (!nombre || !dni || !email || !celular || !password || !this.confirmarPassword) {
        this.lanzarAlerta('Campos incompletos', 'Miguel, todos los campos son obligatorios.', 'warning');
        return;
      }
      if (!/^[0-9]{8}$/.test(dni)) {
        this.lanzarAlerta('DNI inválido', 'El DNI debe tener 8 dígitos exactos.', 'error');
        return;
      }
      const celLimpio = celular.replace(/\s/g, '');
      if (!/^[0-9]{9}$/.test(celLimpio)) {
        this.lanzarAlerta('Celular inválido', 'El número debe tener 9 dígitos exactos.', 'error');
        return;
      }
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        this.lanzarAlerta('Email inválido', 'Ingresa un correo real.', 'error');
        return;
      }
      if (password.length < 8) {
        this.lanzarAlerta('Seguridad baja', 'La contraseña debe tener al menos 8 caracteres.', 'error');
        return;
      }
      if (password !== this.confirmarPassword) {
        this.lanzarAlerta('Contraseñas distintas', 'Las contraseñas no coinciden. Revisa bien, mi pez.', 'error');
        return;
      }
    }
    this.paso = n; 
  }

  private lanzarAlerta(titulo: string, texto: string, icono: any) {
    Swal.fire({
      icon: icono,
      title: titulo,
      text: texto,
      confirmButtonColor: '#000',
      target: 'body' 
    });
  }

  async enviarCodigo(metodo: string) {
    this.metodoElegido = metodo;
    const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
    
    this.zone.run(() => { this.paso = 3; });

    if (metodo === 'email') {
      this.codigoRealGenerado = codigoGenerado;
      try {
        await emailjs.send('service_c5zcc5e', 'template_1kcurjs', {
          to_name: this.usuario.nombre,
          to_email: this.usuario.email,
          message: codigoGenerado 
        }, 'pkSyhsgbE88eKkhPC');

        this.lanzarAlerta('¡Enviado!', 'Revisa tu Gmail, el código ya salió.', 'success');
      } catch (error) {
        this.zone.run(() => { this.paso = 2; });
        this.lanzarAlerta('Error', 'No pudimos enviar el correo.', 'error');
      }
      
    } else {
      try {
        if (!firebase.apps.length) firebase.initializeApp(environment.firebase);
        const container = document.getElementById('recaptcha-container');
        if (container) container.innerHTML = ''; 
        this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { 'size': 'invisible' });
        const numeroLimpio = '+51' + this.usuario.celular.replace(/\s/g, '');
        const confirmationResult = await this.auth.enviarSms(numeroLimpio, this.recaptchaVerifier);
        (window as any).confirmationResult = confirmationResult;
        this.lanzarAlerta('¡SMS Enviado!', 'Usa el código de prueba de tu consola Firebase.', 'success');
      } catch (e) {
        console.error("Fallo SMS:", e);
        if (this.recaptchaVerifier) this.recaptchaVerifier.clear();
        this.zone.run(() => { this.paso = 2; });
        this.lanzarAlerta('Error', 'Fallo al enviar SMS.', 'error');
      }
    }
  }

  async finalizarRegistro() {
    if (this.metodoElegido === 'email') {
      if (this.codigoOTP !== this.codigoRealGenerado) {
        this.lanzarAlerta('Error', 'El código de correo no coincide.', 'error');
        return;
      }
    } else {
      try {
        await this.auth.verificarCodigoSms(this.codigoOTP);
      } catch (error) {
        this.lanzarAlerta('Error', 'Código SMS incorrecto o expirado.', 'error');
        return;
      }
    }

    try {
      const salt = bcrypt.genSaltSync(10);
      const passwordHasheada = bcrypt.hashSync(this.usuario.password, salt);

      const datosParaDB = {
        nombre: this.usuario.nombre,
        dni: this.usuario.dni,
        email: this.usuario.email,
        celular: this.usuario.celular,
        password: passwordHasheada, 
        rol: 'cliente',
        puntos_ivano: 0,
        firebase_uid: 'USER_' + Math.random().toString(36).substring(7)
      }; 

      await this.dataService.insertarUsuario(datosParaDB); 

      await Swal.fire({
        icon: 'success',
        title: '¡Registro Exitoso!',
        text: `Bienvenido a IVANO Store, ${this.usuario.nombre}.`,
        timer: 2000,
        showConfirmButton: false,
        target: 'body'
      });

      this.router.navigate(['/login']); 

    } catch (error) {
      console.error('Error al registrar:', error);
      this.lanzarAlerta('Error', 'No se pudo guardar en la base de datos.', 'error');
    }
  }

  cerrar() { this.router.navigate(['/login']); } 

  async reenviarCodigo() {
    if (this.metodoElegido) {
      await this.enviarCodigo(this.metodoElegido);
    }
  }

  formatearCelular(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 9) valor = valor.substring(0, 9);
    let formateado = '';
    for (let i = 0; i < valor.length; i++) {
      if (i > 0 && i % 3 === 0) formateado += ' ';
      formateado += valor[i];
    }
    this.usuario.celular = formateado; 
    event.target.value = formateado; 
  }
}