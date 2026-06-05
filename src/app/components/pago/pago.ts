import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private carritoSvc: CarritoService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.totalFinal = this.carritoSvc.totalParaPagar;
    if (this.totalFinal <= 0) { this.router.navigate(['/checkout']); return; }
  }

  // En procesarPedido(), ajusta esta parte:
// En src/app/components/pago/pago.ts
procesarPedido() {
  if (!this.aceptaTerminos) {
    Swal.fire('¡Atención!', 'Acepta los términos primero.', 'warning');
    return;
  }

  const win = window as any;
  if (win.Culqi) {
    // 1. Configura la llave pública de pruebas que mostraste en tu imagen
    win.Culqi.publicKey = 'pk_test_V9QG8cow9raGIsIB'; 
    
    // 2. Configura los ajustes básicos
    win.Culqi.settings({
      title: 'IvanoStore',
      currency: 'PEN',
      amount: Math.round(this.totalFinal * 100)
    });

    // 3. Opciones sin referencias a imágenes inexistentes
    win.Culqi.options({
      modal: true
    });

    // 4. Abrir el modal
    win.Culqi.open();
  } else {
    Swal.fire('Error', 'La pasarela de pago no ha cargado. Recarga la página.', 'error');
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