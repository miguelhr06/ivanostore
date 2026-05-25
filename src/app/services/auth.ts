import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  confirmationResult: firebase.auth.ConfirmationResult | null = null;
  
  // Iniciamos en null para saber que aún estamos "comprobando" la sesión
  private loggedIn = new BehaviorSubject<boolean>(localStorage.getItem('isLogged') === 'true');
  private emailUsuario = new BehaviorSubject<string>(localStorage.getItem('userEmail') || '');
  private celularUsuario = new BehaviorSubject<string>(localStorage.getItem('userPhone') || '');

  constructor(
    private afAuth: AngularFireAuth,
    private supabase: SupabaseService,
    private router: Router,
    private ngZone: NgZone  
  ) {
    this.afAuth.onAuthStateChanged((user) => {
      this.ngZone.run(async () => {
        if (user) {
          // Si Firebase dice que hay usuario, refrescamos con Supabase
          await this.refrescarDatosUsuario(user.email);
        } else {
          // Solo cerramos sesión si realmente no hay usuario en Firebase
          this.setLoggedIn(false);
        }
      });
    });
  }

  get isLogged$(): Observable<boolean> { return this.loggedIn.asObservable(); }
  get userEmail$(): Observable<string> { return this.emailUsuario.asObservable(); }
  get userPhone$(): Observable<string> { return this.celularUsuario.asObservable(); }

  setLoggedIn(value: boolean, email: string = '', celular: string = '') {
    if (value) {
      localStorage.setItem('isLogged', 'true');
      if (email) {
        const mail = email.trim().toLowerCase();
        localStorage.setItem('userEmail', mail);
        this.emailUsuario.next(mail);
      }
      if (celular) {
        localStorage.setItem('userPhone', celular.trim());
        this.celularUsuario.next(celular.trim());
      }
      this.loggedIn.next(true);
    } else {
      // Limpieza selectiva para no borrar el tema (dark mode) u otras configs
      localStorage.removeItem('isLogged');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('ivano-store-auth');
      
      this.loggedIn.next(false);
      this.emailUsuario.next('');
      this.celularUsuario.next('');
    }
  }

  async refrescarDatosUsuario(emailDesdeFirebase?: string | null) {
    const emailActual = emailDesdeFirebase || this.emailUsuario.value || localStorage.getItem('userEmail');
    if (!emailActual) return null;

    const { data, error } = await this.supabase.getUsuarioPorEmail(emailActual);
    
    if (data) {
      this.setLoggedIn(true, data.email, data.celular);
      return data;
    }
    
    if (error) console.error("Error al refrescar datos desde Supabase:", error);
    return null;
  }

  // --- Lógica de Autenticación (Manteniendo tu estructura original) ---

  enviarSms(numero: string, recaptchaVerifier: firebase.auth.RecaptchaVerifier) {
    return this.afAuth.signInWithPhoneNumber(numero, recaptchaVerifier)
      .then((result) => {
        this.confirmationResult = result;
        return result;
      })
      .catch((error) => { throw error; });
  }

  async verificarCodigoSms(codigo: string) {
    if (!this.confirmationResult) throw new Error("No hay verificación activa");
    const credential = await this.confirmationResult.confirm(codigo);
    if (credential.user) {
      await this.refrescarDatosUsuario(credential.user.email);
    }
    return credential.user;
  }

  registroConEmail(email: string, clave: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, clave).then(async (res) => {
      if (res.user) await this.refrescarDatosUsuario(email);
      return res;
    });
  }

  loginConEmail(email: string, clave: string) {
    return this.afAuth.signInWithEmailAndPassword(email, clave).then(async (res) => {
      if (res.user) await this.refrescarDatosUsuario(email);
      return res;
    });
  }

  recuperarClave(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  getUsuarioActual() {
    return this.afAuth.authState;
  }

  logout() {
    return this.afAuth.signOut().then(() => {
      this.setLoggedIn(false);
      this.router.navigate(['/']); 
    });
  }
}