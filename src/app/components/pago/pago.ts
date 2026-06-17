import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

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

    private supabaseSvc: SupabaseService

  ) {}



  ngOnInit(): void {

    this.totalFinal = this.carritoSvc.totalParaPagar;

    // Validación de seguridad

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

    // 1. Obtener datos desde tu servicio

    const datos = this.carritoSvc.datosCheckout;

    const productos = this.carritoSvc.obtenerProductosActuales();



    // 2. Construir el objeto cabecera completo

    // Asegúrate de que las propiedades (datos.dni, datos.departamento, etc.)

    // coincidan con los nombres que tienen en tu formulario de checkout.

    console.log("DEBUG FINAL - ¿Qué contiene datos.dni?:", datos.dni);

    const pedidoCabecera = {

  // Campos de texto (String)

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

  estado: 'pendiente_boleta',



  // Campos numéricos (Number)

  // Aseguramos que siempre sea un número, si falla, enviamos 0

  total_pagado: Number(this.totalFinal) || 0

};



    // 3. Guardar en Supabase

    await this.supabaseSvc.guardarPedidoCompleto(pedidoCabecera, productos);

   

    // 4. Limpiar y avisar al usuario

    this.carritoSvc.vaciarCarrito();

   

    // Aquí puedes usar tu librería de alertas (Swal, por ejemplo)

    Swal.fire({

      icon: 'success',

      title: '¡Pedido realizado!',

      text: 'Tu pedido ha sido registrado correctamente.',

      confirmButtonText: 'Aceptar'

    });



    // 5. Redireccionar

    this.router.navigate(['/']);



  } catch (error) {

    console.error("Error detallado al registrar:", error);

   

    Swal.fire({

      icon: 'error',

      title: 'Oops...',

      text: 'Hubo un problema al procesar tu pedido. Por favor intenta de nuevo.',

      confirmButtonText: 'Entendido'

    });

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

    // Aquí puedes llamar a la misma lógica de guardarPedido si quieres automatizar

    const mensaje = `Hola IvanoStore, mi nombre es ${this.carritoSvc.datosCheckout.nombre}. Confirmando pago manual por S/ ${this.totalFinal}.`;

    window.open(`https://wa.me/51910527690?text=${encodeURIComponent(mensaje)}`, '_blank');

  }

}