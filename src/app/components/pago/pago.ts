import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importado para navegación
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { CarritoService } from '../../services/carrito'; // Importado tu servicio

// Declaramos Culqi para que TypeScript no lance error
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
  totalFinal: number = 0; // Ahora se actualizará dinámicamente

  cuentasBancarias = [
    { banco: 'Interbank', nro: '2003004191992', cci: '00320000300419199236', titular: 'CORPORACION IVANO S.A.C.' },
    { banco: 'BCP', nro: '1919409597032', cci: '00219100940959703256', titular: 'CORPORACION IVANO S.A.C.' },
    { banco: 'BBVA', nro: '001103600100059833', cci: '011 360 000100059833 52', titular: 'CORPORACION IVANO S.A.C.' }
  ];

  constructor(
    private carritoSvc: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Tomamos el valor real del servicio
    this.totalFinal = this.carritoSvc.totalParaPagar;
    
    // Si no hay monto, volvemos al checkout para evitar errores
    if (this.totalFinal <= 0) {
       this.router.navigate(['/checkout']);
       return;
    }
    
    this.inicializarCulqi();
  }

  inicializarCulqi() {
    const env = environment as any;
    Culqi.publicKey = env.culqiPK || 'pk_test_ed899b8069502758'; 
    
    Culqi.settings({
      title: 'IvanoStore',
      currency: 'PEN',
      amount: Math.round(this.totalFinal * 100) // Se asegura el formato centavos
    });

    Culqi.options({
        style: {
            logo: 'https://tu-sitio.com/assets/logo.png',
            maincolor: '#000000',
            buttontext: 'Pagar',
            maintext: 'IvanoStore',
            desctext: 'Calzado Premium'
        }
    });
  }

  @HostListener('window:message', ['$event'])
  onMessage(event: any) {
    if (Culqi.token) { 
      const token = Culqi.token.id;
      this.enviarPagoAlBackend(token);
    } else if (Culqi.order) {
      const order = Culqi.order;
      if (this.metodoSeleccionado === 'billeteras') {
          this.mostrarQRBilletera(order);
      } else {
          this.mostrarExitoPagoEfectivo(order);
      }
    } else if (Culqi.error) {
      Swal.fire('Error', Culqi.error.user_message || Culqi.error.merchant_message, 'error');
    }
  }

  seleccionarMetodo(metodo: string) {
    this.metodoSeleccionado = metodo;
  }

  copiarTexto(texto: string) {
    navigator.clipboard.writeText(texto);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Copiado',
      showConfirmButton: false,
      timer: 1000
    });
  }

  procesarPedido() {
    if (!this.aceptaTerminos) {
      Swal.fire('¡Atención!', 'Acepta los términos primero.', 'warning');
      return;
    }

    const filtro = {
      tarjeta: this.metodoSeleccionado === 'culqi',
      yape: this.metodoSeleccionado === 'billeteras',
      billetera: this.metodoSeleccionado === 'billeteras',
      pagoefectivo: this.metodoSeleccionado === 'pagoefectivo'
    };

    Culqi.settings({
      title: 'IvanoStore',
      currency: 'PEN',
      amount: Math.round(this.totalFinal * 100)
    });

    Culqi.options({
      paymentMethods: filtro
    });

    if (this.metodoSeleccionado === 'culqi') {
      this.capturarDatosTarjetaYTokenizar();
    } else if (this.metodoSeleccionado !== 'transferencia') {
      Culqi.open();
    } else {
      this.confirmarTransferenciaManual();
    }
  }

  capturarDatosTarjetaYTokenizar() {
    Swal.fire({
      title: 'Validando datos...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false
    });

    const exp = (document.getElementById('card-expiry') as HTMLInputElement).value.split('/');
    
    Culqi.createToken({
      number: (document.getElementById('card-number') as HTMLInputElement).value.replace(/\s+/g, ''),
      cvc: (document.getElementById('card-cvv') as HTMLInputElement).value,
      exp_month: exp[0],
      exp_year: exp[1],
      email: (document.getElementById('card-email') as HTMLInputElement).value
    });
  }

  mostrarQRBilletera(order: any) {
    const infoArea = document.getElementById('billeteras-info');
    const qrArea = document.getElementById('qr-dinamico-container');
    if(infoArea) infoArea.style.display = 'none';
    if(qrArea) qrArea.style.display = 'block';

    Swal.fire({
        title: '¡QR Generado!',
        text: 'Escanea el código con tu app de Yape o Plin',
        icon: 'info',
        timer: 3000
    });
  }

  confirmarTransferenciaManual() {
    Swal.fire({
      title: '¡Pedido Recibido!',
      text: 'Por favor, envía el comprobante de tu transferencia por WhatsApp.',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Ir a WhatsApp',
      confirmButtonColor: '#25D366'
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(`https://wa.me/51910527690?text=Hola IvanoStore, envío mi comprobante de pago por el monto de S/ ${this.totalFinal}`, '_blank');
      }
    });
  }

  enviarPagoAlBackend(token: string) {
    Swal.fire({
      title: 'Procesando pago...',
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false
    });

    setTimeout(() => {
      Swal.close();
      Swal.fire({
          title: '¡Compra Exitosa!',
          text: 'Tu pedido en IVANO STORE ha sido procesado.',
          icon: 'success',
          confirmButtonText: 'Genial'
      });
    }, 2000);
  }

  mostrarExitoPagoEfectivo(order: any) {
    Swal.fire({
      title: 'Código CIP Generado',
      html: `Paga en tu app bancaria con el código: <b>${order}</b>`,
      icon: 'info'
    });
  }
}