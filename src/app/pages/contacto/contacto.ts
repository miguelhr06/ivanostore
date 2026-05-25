import { Component, ViewChild, ElementRef } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contacto',
  standalone: false,
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class Contacto {
  // Referenciamos los inputs del HTML
  @ViewChild('txtNombre') nombreInput!: ElementRef;
  @ViewChild('txtEmail') emailInput!: ElementRef;
  @ViewChild('txtConsulta') consultaInput!: ElementRef;
  @ViewChild('txtMensaje') mensajeInput!: ElementRef;

  private supabase: SupabaseClient;

 constructor() {
  // Ponemos las credenciales directamente aquí para saltarnos el error del archivo vacío
  const url = 'http://127.0.0.1:54321';
  const key = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
  

  console.log('Iniciando Supabase con llaves directas...');
  this.supabase = createClient(url, key);
}
 async enviarFormulario() {
    const nombre = this.nombreInput?.nativeElement.value;
    const email = this.emailInput?.nativeElement.value;
    const consulta = this.consultaInput?.nativeElement.value;
    const mensaje = this.mensajeInput?.nativeElement.value;

    if (!nombre || !email || !mensaje) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, llena todos los datos del formulario.',
            background: '#000',
            color: '#fff',
            confirmButtonColor: '#d4ff31'
        });
        return;
    }

    // --- AQUÍ EMPIEZA LO PRO ---
    Swal.fire({
        title: 'Enviando solicitud...',
        text: 'Estamos conectando con la nube de Ivano',
        allowOutsideClick: false,
        background: '#000',
        color: '#fff',
        didOpen: () => {
            Swal.showLoading(); // Muestra el círculo de carga
        }
    });

    const { error } = await this.supabase
        .from('contactos')
        .insert([{ nombre, email, asunto: consulta, mensaje }]);

    if (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'Hubo un problema al guardar los datos.',
            background: '#000',
            color: '#fff',
            confirmButtonColor: '#ff3131'
        });
    } else {
        // ÉXITO TOTAL
        Swal.fire({
            icon: 'success',
            title: '¡Solicitud Recibida!',
            text: '¡Su consulta para Ivano Store ha sido registrada!.',
            background: '#000',
            color: '#fff',
            confirmButtonColor: '#d4ff31',
            timer: 2500,
            showConfirmButton: false // Se cierra solo, muy elegante
        });
        this.limpiarCampos();
    }
}

  // Función para resetear el formulario
  limpiarCampos() {
    this.nombreInput.nativeElement.value = '';
    this.emailInput.nativeElement.value = '';
    this.mensajeInput.nativeElement.value = '';
    this.consultaInput.nativeElement.selectedIndex = 0; // Regresa al primer option
  }
}