import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router'; 
import { CarritoService } from '../../services/carrito';
import { UBIGEO_PERU } from '../../constans/ubigeo'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {
  
  formData = {
    dni: '',
    nombre: '',
    celular: '',
    direccion: '',
    referencia: '',
    metodoPago: 'Yape',
    agenciaShalom: ''
  };

  // --- NUEVAS VARIABLES DE NEGOCIO ---
  tipoEnvio: 'delivery' | 'recojo' = 'delivery'; 
  codigoCupon: string = '';
  cuponAplicado: any = null;
  isValidatingCupon: boolean = false;

  items: any[] = [];
  subtotal: number = 0;
  envio: number = 0;
  loadingDni: boolean = false;
  noRecuerdaDni: boolean = false;
  errores: any = {};

  departamentos = UBIGEO_PERU;
  provincias: any[] = [];
  distritos: string[] = [];
  ubicacionSeleccionada = {
    departamento: '',
    provincia: '',
    distrito: ''
  };

  constructor(
    private http: HttpClient, 
    private carritoSvc: CarritoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carritoSvc.carrito$.subscribe(res => {
      this.items = res;
      this.subtotal = res.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    });
  }

  // --- LÓGICA DE ENVÍO Y RECOJO ---
  cambiarTipoEnvio(tipo: 'delivery' | 'recojo') {
    this.tipoEnvio = tipo;
    if (tipo === 'recojo') {
      this.envio = 0;
    } else {
      // Recalcula el envío basado en la ubicación previa si vuelve a delivery
      this.onProvinciaChange();
    }
    this.carritoSvc.actualizarEnvio(this.envio);
  }

  // --- VALIDACIÓN DE CUPÓN SERIAL (XXXX-XXXX-XXXX-XXXX) ---
  async aplicarCupon() {
    const code = this.codigoCupon.trim().toUpperCase();
    const regex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

    if (!regex.test(code)) {
      Swal.fire({
        title: 'FORMATO INVÁLIDO',
        text: 'Usa el formato: XXXX-XXXX-XXXX-XXXX',
        icon: 'error',
        customClass: { popup: 'ivanostore-popup', confirmButton: 'ivanostore-btn' }
      });
      return;
    }

    this.isValidatingCupon = true;

    // Simulación de búsqueda (Aquí conectarás tu SupabaseService)
    setTimeout(() => {
      // Ejemplo con uno de los códigos que insertamos en la tabla
      const cuponesDummy = [
        { cod: 'H3K9-J2L5-N8P1-W6X4', desc: 20 },
        { cod: 'TR8W-Q2P5-N9M1-Z4V7', desc: 40 }
      ];

      const encontrado = cuponesDummy.find(c => c.cod === code);

      if (encontrado) {
        this.cuponAplicado = { codigo: encontrado.cod, descuento: encontrado.desc };
        Swal.fire({
          title: '¡CUPÓN APLICADO!',
          text: `Se ha aplicado un descuento de S/ ${encontrado.desc}.00`,
          icon: 'success',
          customClass: { popup: 'ivanostore-popup', confirmButton: 'ivanostore-btn' }
        });
      } else {
        Swal.fire({
          title: 'ERROR',
          text: 'Cupón no encontrado o ya fue utilizado.',
          icon: 'error',
          customClass: { popup: 'ivanostore-popup', confirmButton: 'ivanostore-btn' }
        });
      }
      this.isValidatingCupon = false;
    }, 1000);
  }

  // --- CÁLCULO TOTAL FINAL DINÁMICO ---
  get totalFinal(): number {
    const descuento = this.cuponAplicado ? this.cuponAplicado.descuento : 0;
    const total = this.subtotal + this.envio - descuento;
    return total > 0 ? total : 0;
  }

  // --- VALIDACIÓN CENTRALIZADA (ACTUALIZADA PARA RECOJO) ---
  validarFormulario(): boolean {
    const camposBasicos = this.formData.nombre && this.formData.celular;
    
    if (this.tipoEnvio === 'recojo') {
      if (!camposBasicos) {
        this.mostrarAlertaFaltante();
        return false;
      }
    } else {
      // Si es delivery, exige todo lo de siempre
      if (!camposBasicos || !this.ubicacionSeleccionada.distrito || !this.formData.direccion) {
        this.mostrarAlertaFaltante();
        return false;
      }
    }
    return true;
  }

  mostrarAlertaFaltante() {
    Swal.fire({
      title: '¡UN MOMENTO!',
      text: 'Completa tus datos para procesar tu pedido.',
      icon: 'warning',
      confirmButtonText: 'ENTENDIDO',
      customClass: {
        container: 'ivanostore-swal-container',
        popup: 'ivanostore-popup',
        title: 'ivanostore-title',
        confirmButton: 'ivanostore-btn'
      }
    });
  }

  // --- LÓGICA DE UBIGEO EN CASCADA ---
  onDepartamentoChange() {
    const depFound = this.departamentos.find(d => d.departamento === this.ubicacionSeleccionada.departamento);
    this.provincias = depFound ? depFound.provincias : [];
    this.distritos = [];
    this.ubicacionSeleccionada.provincia = '';
    this.ubicacionSeleccionada.distrito = '';
    this.envio = 0; 
    this.carritoSvc.actualizarEnvio(this.envio);
  }

  onProvinciaChange() {
    const provFound = this.provincias.find(p => p.nombre === this.ubicacionSeleccionada.provincia);
    this.distritos = provFound ? provFound.distritos : [];
    this.ubicacionSeleccionada.distrito = '';

    if (this.ubicacionSeleccionada.departamento === 'LIMA' && this.ubicacionSeleccionada.provincia === 'LIMA') {
      this.envio = 15; 
    } else if (this.ubicacionSeleccionada.departamento !== '' && this.tipoEnvio === 'delivery') {
      this.envio = 20; 
    } else {
      this.envio = 0;
    }
    this.carritoSvc.actualizarEnvio(this.envio);
  }

  toggleDniManual() {
    this.formData.dni = '';
    this.formData.nombre = '';
    this.loadingDni = false;
    this.errores = {}; 
  }

  onDniChange(valor: string) {
    this.formData.dni = valor;
    if (this.formData.dni.length === 8 && !this.noRecuerdaDni) {
      this.buscarDni();
      delete this.errores['dni'];
    } else {
      this.formData.nombre = '';
      if (this.formData.dni.length > 0 && this.formData.dni.length < 8) {
        this.errores['dni'] = `Faltan ${8 - this.formData.dni.length} dígitos.`;
      }
    }
  }

  buscarDni() {
    this.loadingDni = true;
    const token = '7901106858e4b31560e08b9584db4e993e282ed01df0eed0201d35c62ba251d5'; 
    const url = `https://apiperu.dev/api/dni/${this.formData.dni}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });

    this.http.get(url, { headers }).subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          const d = res.data;
          this.formData.nombre = `${d.nombres} ${d.apellido_paterno} ${d.apellido_materno}`.toUpperCase();
          delete this.errores['nombre'];
        } else {
          this.formData.nombre = '';
          this.errores['nombre'] = 'DNI no encontrado.';
        }
        this.loadingDni = false;
      },
      error: (err) => {
        console.error("Error API DNI:", err);
        this.loadingDni = false;
      }
    });
  }

  cambiarEnvio(event: any) {
    const costo = Number(event.target.value);
    this.envio = costo;
    this.carritoSvc.actualizarEnvio(costo);
  }

  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  finalizarPedido() {
    if (!this.validarFormulario()) return;

    const listaProductos = this.items.map((item, index) => {
      const nombre = (item.nombre_zapatilla || 'Producto').toUpperCase();
      const mod = item.modelo || '---';
      const talla = item.tallaElegida || 'U';
      const cant = item.cantidad || 1;
      const totalItem = (item.precio || 0) * cant;

      return `${index + 1}. ${nombre} (x${cant})%0A` +
             `   - Talla: ${talla}%0A` +
             `   - Subtotal: S/ ${totalItem.toFixed(2)}`;
    }).join('%0A%0A');

    const dniCliente = this.noRecuerdaDni ? 'No proporcionado' : (this.formData.dni || 'No indicado');
    const entregaStr = this.tipoEnvio === 'recojo' ? 'RECOJO EN TIENDA (Mall Plaza Santa Anita)' : 'DELIVERY A DOMICILIO';

    const mensaje = 
      `*NUEVO PEDIDO - IVANOSTORE*%0A%0A` +
      `*CLIENTE:* ${this.formData.nombre}%0A` +
      `*DNI:* ${dniCliente}%0A` +
      `*CELULAR:* ${this.formData.celular}%0A%0A` +
      `*TIPO ENTREGA:* ${entregaStr}%0A` +
      (this.tipoEnvio === 'delivery' ? `*DIRECCIÓN:* ${this.formData.direccion}%0A` : '') +
      `*PRODUCTOS:*%0A${listaProductos}%0A%0A` +
      (this.cuponAplicado ? `*CUPÓN APLICADO:* ${this.cuponAplicado.codigo} (-S/ ${this.cuponAplicado.descuento})%0A` : '') +
      `*TOTAL FINAL: S/ ${this.totalFinal.toFixed(2)}*`;

    const miNumero = "51910527690"; 
    window.open(`https://wa.me/${miNumero}?text=${mensaje}`, '_blank');
  }

  // En checkout.ts, dentro de irAPagar()
irAPagar() {
  if (this.validarFormulario()) {
    this.carritoSvc.actualizarTotal(this.totalFinal); // <--- GUARDA EL MONTO AQUÍ
    this.router.navigate(['/pago']); 
  }
}

  pagarOnline() {
    if (!this.validarFormulario()) return;
    this.router.navigate(['/pago']);
  }
}