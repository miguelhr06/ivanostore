import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { SupabaseService } from '../../services/supabase';
import { NgZone } from '@angular/core';
import {HttpHeaders } from '@angular/common/http';
@Component({
  selector: 'app-libro-reclamaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './libro-reclamaciones.html',
  styleUrls: ['./libro-reclamaciones.css']
})
export class LibroReclamacionesComponent {
  
  formData = {
    dni: '',
    nombre: '',
    celular: '',
    correo: '',
    direccion: '',
    producto: '',
    detalle: ''
  };

  selectedFiles: File[] = [];
  loading: boolean = false;
  loadingDni: boolean = false;
  noRecuerdaDni: boolean = false;
  
  errores: any = {};

  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService,
    private zone: NgZone
  ) {}

  toggleDniManual() {
    this.formData.dni = '';
    this.formData.nombre = '';
    this.loadingDni = false;
    this.errores = {}; 
  }

  // --- NUEVA FUNCIÓN DE VALIDACIÓN PROACTIVA (BLUR) ---
  validarCampo(campo: string) {
    switch (campo) {
      case 'dni':
        if (!this.noRecuerdaDni) {
          const dni = this.formData.dni || '';
          if (dni.length === 0) {
            this.errores['dni'] = 'El DNI es obligatorio.';
          } else if (dni.length < 8) {
            this.errores['dni'] = `Faltan ${8 - dni.length} dígitos.`;
          } else {
            delete this.errores['dni'];
          }
        }
        break;

      case 'nombre':
        if (!this.formData.nombre || this.formData.nombre.trim().length < 3) {
          this.errores['nombre'] = 'El nombre es obligatorio.';
        } else {
          delete this.errores['nombre'];
        }
        break;

      case 'celular':
        const cel = this.formData.celular || '';
        if (cel.length === 0) {
          this.errores['celular'] = 'El celular es obligatorio.';
        } else if (cel.length < 9) {
          this.errores['celular'] = `Faltan ${9 - cel.length} dígitos.`;
        } else {
          delete this.errores['celular'];
        }
        break;

      case 'correo':
        // Regex corregido: \.[a-zA-Z]{2,3}$ evita extensiones de 4 o más letras como .comm
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
        if (!this.formData.correo) {
          this.errores['correo'] = 'El correo es obligatorio.';
        } else if (!emailPattern.test(this.formData.correo)) {
          this.errores['correo'] = 'Correo inválido (ejemplo@gmail.com).';
        } else {
          delete this.errores['correo'];
        }
        break;

      case 'direccion':
        if (!this.formData.direccion) this.errores['direccion'] = 'Ingrese su dirección.';
        else delete this.errores['direccion'];
        break;

      case 'producto':
        if (!this.formData.producto) this.errores['producto'] = 'Especifique el modelo.';
        else delete this.errores['producto'];
        break;

      case 'detalle':
        if (!this.formData.detalle) this.errores['detalle'] = 'Escriba el detalle del reclamo.';
        else delete this.errores['detalle'];
        break;
    }
  }

 buscarDni() {
  if (this.formData.dni.length === 8 && !this.noRecuerdaDni) {
    this.loadingDni = true;
    
    // Tu Token real de ApiPeruDev
    const token = '7901106858e4b31560e08b9584db4e993e282ed01df0eed0201d35c62ba251d5'; 
    const url = `https://apiperu.dev/api/dni/${this.formData.dni}`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });

    this.http.get(url, { headers }).subscribe({
      next: (res: any) => {
        console.log("Respuesta recibida:", res);
        if (res && res.success && res.data) {
          const d = res.data;
          // Concatenamos nombres y apellidos que vienen de la API
          this.formData.nombre = `${d.nombres} ${d.apellido_paterno} ${d.apellido_materno}`;
          
          if (this.errores) {
            delete this.errores['dni'];
            delete this.errores['nombre'];
          }
        }
        this.loadingDni = false;
      },
      error: (err) => {
        console.error("Error en la petición:", err);
        this.loadingDni = false;
        
        if (err.status === 403) {
          alert("Acceso denegado (403). Borra el origen en el panel de ApiPeruDev y déjalo VACÍO.");
        } else {
          alert("Hubo un problema al conectar con el servidor de DNI.");
        }
      }
    });
  }
}
  onFilesSelected(event: any) {
    const incomingFiles = Array.from(event.target.files as FileList);
    let duplicatesFound = false;

    const validFiles = incomingFiles.filter(file => {
      const isDuplicate = this.selectedFiles.some(existing => existing.name === file.name);
      if (isDuplicate) duplicatesFound = true;
      return !isDuplicate;
    });

    if (duplicatesFound) {
      Swal.fire({
        icon: 'warning', title: 'Imagen repetida', text: 'Esa imagen ya está en la lista.',
        confirmButtonColor: '#ccff00', background: '#000', color: '#fff'
      });
    }

    if (this.selectedFiles.length + validFiles.length > 4) {
      Swal.fire({
        icon: 'error', title: 'Límite excedido', text: 'Máximo 4 fotos.',
        confirmButtonColor: '#ccff00', background: '#000', color: '#fff'
      });
      return;
    }

    this.selectedFiles = [...this.selectedFiles, ...validFiles];
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  soloLetras(event: any) {
    const pattern = /[a-zA-ZáéíóúÁÉÍÓÚñÑ ]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  async enviarReclamo() {
    // Validar todos los campos antes de proceder
    const campos = ['dni', 'nombre', 'celular', 'correo', 'direccion', 'producto', 'detalle'];
    campos.forEach(c => this.validarCampo(c));

    if (Object.keys(this.errores).length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario Incompleto',
        text: 'Por favor, corrija los campos marcados en rojo.',
        confirmButtonColor: '#ccff00', background: '#000', color: '#fff'
      });
      return;
    }

    if (this.loading) return;
    this.loading = true;
    const urlsImagenes: string[] = [];

    try {
      for (const file of this.selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await this.supabaseService.client
          .storage.from('evidencias').upload(fileName, file);

        if (uploadError) throw new Error("Error en el Storage: " + uploadError.message);

        const { data: urlData } = this.supabaseService.client
          .storage.from('evidencias').getPublicUrl(fileName);
        
        urlsImagenes.push(urlData.publicUrl);
      }

      const { error: insertError } = await this.supabaseService.client
        .from('reclamaciones')
        .insert([{
          nombre_completo: this.formData.nombre,
          dni_ce: this.noRecuerdaDni ? 'MANUAL' : this.formData.dni,
          celular: this.formData.celular,
          correo_electronico: this.formData.correo,
          direccion: this.formData.direccion,
          descripcion_producto_servicio: this.formData.producto,
          detalle_reclamo_queja: this.formData.detalle,
          imagen1: urlsImagenes[0] || null,
          imagen2: urlsImagenes[1] || null,
          imagen3: urlsImagenes[2] || null,
          imagen4: urlsImagenes[3] || null,
        }]);

      if (insertError) throw new Error("Error en Tabla: " + insertError.message);

      await Swal.fire({
        icon: 'success', title: '¡Listo!', text: 'Reclamo e imágenes guardados.',
        confirmButtonColor: '#ccff00', background: '#000', color: '#fff'
      });

      window.location.reload();

    } catch (err: any) {
      this.mostrarAlerta('Hubo un problema', err.message || 'Error desconocido');
    } finally {
      this.loading = false;
    }
  }

  mostrarAlerta(titulo: string, texto: string) {
    Swal.fire({
      icon: 'error', title: titulo, text: texto,
      confirmButtonColor: '#ccff00', background: '#000', color: '#fff'
    });
  }
}