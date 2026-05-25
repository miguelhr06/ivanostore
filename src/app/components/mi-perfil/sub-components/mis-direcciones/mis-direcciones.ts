import { Component, OnInit, Input, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase';
import { UBIGEO_PERU } from '../../../../constans/ubigeo';

@Component({
  selector: 'app-mis-direcciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mis-direcciones.html',
  styleUrls: ['./mis-direcciones.css']
})
export class MisDireccionesComponent implements OnInit, OnChanges {
  @Input() usuario: any; 
  
  direcciones: any[] = [];
  mostrarModalDir: boolean = false;
  direccionForm: FormGroup;
  loading: boolean = false;

  // --- VARIABLES PARA EL TOAST NOTIFICACIÓN PREMIUM ---
  mostrarToast: boolean = false;
  mensajeToast: string = '';

  departamentos: string[] = [];
  provincias: string[] = [];
  distritos: string[] = [];

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {
    this.direccionForm = this.fb.group({
      etiqueta: ['CASA', Validators.required],
      direccion: ['', Validators.required],
      referencia: [''],
      departamento: ['', Validators.required],
      provincia: ['', Validators.required],
      distrito: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.departamentos = UBIGEO_PERU.map(d => d.departamento);
  }

  // Detecta cuando el usuario llega desde el componente padre
  async ngOnChanges(changes: SimpleChanges) {
    if (changes['usuario'] && this.usuario) {
      console.log("Usuario detectado:", this.usuario.email);
      await this.cargarDirecciones();
    }
  }

  async cargarDirecciones() {
    if (!this.usuario?.email) return;

    try {
      const { data, error } = await this.supabase.client
        .from('direcciones')
        .select('*')
        .eq('usuario_email', this.usuario.email.trim().toLowerCase())
        .order('es_principal', { ascending: false });

      if (error) throw error;
      this.direcciones = data || [];
    } catch (err) {
      console.error("Error al cargar direcciones:", err);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async guardarDireccion() {
    if (this.direccionForm.invalid) return;
    this.loading = true;

    // REFUERZO: Si el @Input() falló o está lento, intentamos obtener el email
    let email = this.usuario?.email;
    
    if (!email) {
      const { data: { session } } = await this.supabase.client.auth.getSession();
      email = session?.user?.email || localStorage.getItem('userEmail');
    }

    if (!email) {
      this.lanzarToastPremium("Sesión no encontrada. Por favor, recarga la página.");
      this.loading = false;
      return;
    }

    const vals = this.direccionForm.getRawValue();

    try {
      const { data, error } = await this.supabase.client
        .from('direcciones')
        .insert([{
          usuario_email: email.trim().toLowerCase(),
          direccion: vals.direccion,
          departamento: vals.departamento,
          provincia: vals.provincia,
          distrito: vals.distrito,
          referencia: vals.referencia || '',
          etiqueta: vals.etiqueta || 'CASA'
        }])
        .select();

      if (error) throw error;

      if (data) {
        this.direcciones.push(data[0]);
        this.lanzarToastPremium("¡Dirección guardada exitosamente!");
        this.cerrarModal();
      }
    } catch (err: any) {
      this.lanzarToastPremium("Error de DB: " + err.message);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // --- FUNCIÓN INTERNA PARA EL TOAST FLOTANTE ---
  lanzarToastPremium(mensaje: string) {
    this.mensajeToast = mensaje;
    this.mostrarToast = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.mostrarToast = false;
      this.cdr.detectChanges();
    }, 3200);
  }

  // --- LÓGICA DE UBIGEO ---
  onDepartamentoChange() {
    const depNombre = this.direccionForm.get('departamento')?.value;
    const depEncontrado = UBIGEO_PERU.find(d => d.departamento === depNombre);
    this.direccionForm.patchValue({ provincia: '', distrito: '' });
    this.provincias = depEncontrado ? depEncontrado.provincias.map(p => p.nombre) : [];
    this.distritos = [];
  }

  onProvinciaChange() {
    const depNombre = this.direccionForm.get('departamento')?.value;
    const provNombre = this.direccionForm.get('provincia')?.value;
    const depEncontrado = UBIGEO_PERU.find(d => d.departamento === depNombre);
    const provEncontrada = depEncontrado?.provincias.find(p => p.nombre === provNombre);
    this.direccionForm.patchValue({ distrito: '' });
    this.distritos = provEncontrada ? provEncontrada.distritos : [];
  }

  abrirModal() { 
    this.mostrarModalDir = true; 
    this.cdr.detectChanges();
  }
  
  cerrarModal() { 
    this.mostrarModalDir = false; 
    this.direccionForm.reset({ etiqueta: 'CASA' });
    this.cdr.detectChanges();
  }

  async eliminarDireccion(id: number) {
    if (!confirm('¿Seguro que quieres eliminar esta dirección?')) return;
    
    try {
      const { error } = await this.supabase.client
        .from('direcciones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      this.direcciones = this.direcciones.filter(d => d.id !== id);
      this.lanzarToastPremium("Dirección removida correctamente.");
    } catch (err) {
      console.error("Error al eliminar:", err);
    } finally {
      this.cdr.detectChanges();
    }
  }
}