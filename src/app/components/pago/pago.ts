import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { CarritoService } from '../../services/carrito';

declare var Culqi: any;

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago.html',
  styleUrls: ['./pago.css']
})
export class PagoComponent implements OnInit {
  metodoSeleccionado: string = 'culqi';
  aceptaTerminos: boolean = false;
  totalFinal: number = 0;

  cuentasBancarias = [
    { banco: 'Interbank', nro: '2003004191992', cci: '00320000300419199236', titular: 'CORPORACION IVANO S.A.C.' },
    { banco: 'BCP', nro: '1919409597032', cci: '00219100940959703256', titular: 'CORPORACION IVANO S.A.C.' },
    { banco: 'BBVA', nro: '001103600100059833', cci: '011 360 000100059833 52', titular: 'CORPORACION IVANO S.A.C.' }
  ];

  constructor(private carritoSvc: CarritoService, private router: Router) {}

  ngOnInit(): void {
    this.totalFinal = this.carritoSvc.totalParaPagar;
    if (this.totalFinal <= 0) { this.router.navigate(['/checkout']); return; }

    this.inicializarCulqi();
  }

  inicializarCulqi() {
    const win = window as any;
    if (win.Culqi) {
      // Selector automático: usa la llave live si detecta que es producción
      const esProduccion = environment.production || false; 
      win.Culqi.publicKey = esProduccion ? environment.culqiPKLive : environment.culqiPK;
      
      win.Culqi.settings({
        title: 'IvanoStore',
        currency: 'PEN',
        amount: Math.round(this.totalFinal * 100)
      });

      win.Culqi.options({
        lang: 'auto',
        modal: true,
        installments: true
      });

      // Escuchar el evento de respuesta de Culqi
      document.addEventListener('culqi', (event: any) => {
        if (event.detail && event.detail.data) {
          const token = event.detail.data;
          this.procesarPagoEnServidor(token); // Aquí llamarás a tu backend
        }
      });
    }
  }

  procesarPagoEnServidor(token: any) {
    console.log('Token recibido, listo para enviar al servidor:', token);
    // Aquí es donde enviarás este token a tu función de Vercel
    // usando la SK_LIVE configurada en tus variables de entorno del servidor.
  }

  procesarPedido() {
    if (!this.aceptaTerminos) {
      Swal.fire('¡Atención!', 'Acepta los términos primero.', 'warning');
      return;
    }

    if (this.metodoSeleccionado === 'transferencia') {
      this.confirmarTransferenciaManual();
    } else {
      const win = window as any;
      if (win.Culqi) {
        win.Culqi.open(); // Abrir formulario
      }
    }
  }

  seleccionarMetodo(metodo: string) { this.metodoSeleccionado = metodo; }

  copiarTexto(texto: string) {
    navigator.clipboard.writeText(texto);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Copiado', showConfirmButton: false, timer: 1000 });
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