import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // IMPORTACIÓN NECESARIA
import Swal from 'sweetalert2';
import { CarritoService } from '../../services/carrito';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago.html',
  styleUrls: ['./pago.css']
})
export class PagoComponent implements OnInit {
  metodoSeleccionado: string = 'Culqi';
  aceptaTerminos: boolean = false;
  totalFinal: number = 0;

  cuentasBancarias = [
    { banco: 'Interbank', nro: '2003004191992', cci: '00320000300419199236', titular: 'CORPORACION IVANO S.A.C.' },
    { banco: 'BCP', nro: '1919409597032', cci: '00219100940959703256', titular: 'CORPORACION IVANO S.A.C.' },
    { banco: 'BBVA', nro: '001103600100059833', cci: '011 360 000100059833 52', titular: 'CORPORACION IVANO S.A.C.' }
  ];

  constructor(
    private carritoSvc: CarritoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private supabaseSvc: SupabaseService,
    private http: HttpClient // INYECCIÓN AGREGADA
  ) {}

  ngOnInit(): void {
    this.totalFinal = this.carritoSvc.totalParaPagar;
    if (this.totalFinal <= 0) {
        this.router.navigate(['/checkout']);
        return;
    }

    window.addEventListener('culqi-pago-exitoso', (event: any) => {
      this.ngZone.run(() => {
        this.finalizarCompra(event.detail);
      });
    });
  }

  async procesarPedido() {
    if (!this.aceptaTerminos) {
      Swal.fire('¡Atención!', 'Acepta los términos primero.', 'warning');
      return;
    }

    const win = window as any;
    if (win.Culqi) {
      win.Culqi.publicKey = 'pk_test_V9QG8cow9raGIsIB';
      win.Culqi.settings({
        title: "IvanoStore",
        currency: "PEN",
        amount: Math.round(this.totalFinal * 100)
      });
      win.Culqi.open();
    } else {
      Swal.fire('Error', 'La pasarela no pudo cargar. Recarga la página.', 'error');
    }
  }

  async finalizarCompra(data: any) {
    try {
      // 1. Llamada a tu API de Vercel para procesar el cargo real
      const cargoResponse: any = await this.http.post('/api/pagar', {
        token: data.token,
        amount: Math.round(this.totalFinal * 100),
        email: data.email
      }).toPromise();

      // 2. Si el cargo fue exitoso, guardamos en Supabase
      if (cargoResponse && cargoResponse.id) {
        const datos = this.carritoSvc.datosCheckout;
        const productos = this.carritoSvc.obtenerProductosActuales();

        const pedidoCabecera = {
          nombre_cliente: datos.nombre || '',
          dni_cliente: datos.dni || '',
          email_cliente: data.email || '',
          telefono_cliente: datos.telefono || '',
          tipo_entrega: datos.tipo || '',
          direccion_envio: datos.direccion || '',
          departamento: datos.departamento || '',
          provincia: datos.provincia || '',
          distrito: datos.distrito || '',
          referencia: datos.referencia || '',
          token_culqi: data.token || '',
          id_transaccion_culqi: cargoResponse.id, // ID recibido de Culqi
          estado: 'pagado',
          total_pagado: Number(this.totalFinal) || 0
        };

        await this.supabaseSvc.guardarPedidoCompleto(pedidoCabecera, productos);
        this.carritoSvc.vaciarCarrito();

        Swal.fire('¡Pedido realizado!', 'Tu pago ha sido registrado correctamente.', 'success');
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      Swal.fire('Oops...', 'Hubo un problema al procesar el pago.', 'error');
    }
  }

  toggleTerminos() {
    this.aceptaTerminos = !this.aceptaTerminos;
    this.cdr.detectChanges();
  }

  seleccionarMetodo(metodo: string) {
    this.metodoSeleccionado = metodo;
  }

  confirmarTransferenciaManual() {
    const mensaje = `Hola IvanoStore, mi nombre es ${this.carritoSvc.datosCheckout.nombre}. Confirmando pago manual por S/ ${this.totalFinal}.`;
    window.open(`https://wa.me/51910527690?text=${encodeURIComponent(mensaje)}`, '_blank');
  }
}