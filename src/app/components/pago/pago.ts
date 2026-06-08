import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { CarritoService } from '../../services/carrito';

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
    private cdr: ChangeDetectorRef
  ) {}


// En tu pago.ts, agrega esta variable fuera de la clase o como propiedad:
private CulqiScriptCargado = false;

// En tu método de pago
procesarPedido() {
  const win = window as any;
  if (win.Culqi) {
    win.Culqi.settings({
      title: 'IvanoStore',
      currency: 'PEN',
      amount: Math.round(this.totalFinal * 100)
    });
    win.Culqi.open(); // Ahora sí, aquí debería funcionar sin errores si el script cargó
  }
}

// Fuera de la clase o en ngOnInit, escucha al Checkout
ngOnInit() {
  window.addEventListener("message", (event) => {
    if (event.origin === "https://checkout.culqi.com") {
      const { eventType, data } = event.data;
      if (eventType === "token_created") {
        console.log("Token recibido:", data.id);
        // AQUÍ ENVIAS EL TOKEN A TU BACKEND PARA FINALIZAR EL PAGO
      }
    }
  });
}

  toggleTerminos() {
    this.aceptaTerminos = !this.aceptaTerminos;
    this.cdr.detectChanges();
  }

  seleccionarMetodo(metodo: string) { 
    this.metodoSeleccionado = metodo; 
  }

  confirmarTransferenciaManual() {
    Swal.fire({
      title: '¡Pedido Recibido!',
      text: 'Envía tu comprobante por WhatsApp.',
      icon: 'success',
      confirmButtonText: 'Ir a WhatsApp'
    }).then(() => {
      window.open(`https://wa.me/51910527690?text=Hola IvanoStore, envío mi comprobante por S/ ${this.totalFinal}`, '_blank');
    });
  }
}