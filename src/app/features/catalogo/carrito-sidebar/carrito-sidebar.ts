import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CarritoService } from '../../../services/carrito'; 
import { Router } from '@angular/router';
import Swal from 'sweetalert2'; // Importación Senior
@Component({
  selector: 'app-carrito-sidebar',
  templateUrl: './carrito-sidebar.html',
  styleUrls: ['./carrito-sidebar.css'],
  standalone: false 
})
export class CarritoSidebarComponent implements OnInit, OnDestroy {
  visible: boolean = false;
  items: any[] = [];
  
  // Guardamos las suscripciones para limpiarlas
  private subscripciones: Subscription = new Subscription();

  constructor(
    private carritoSvc: CarritoService,
    private cdr: ChangeDetectorRef,
    private router: Router // Para forzar el refresco visual si falla
    
  ) {}

  envio: number = 0;

ngOnInit(): void {
  // 1. Escuchar cambios en los productos
  this.subscripciones.add(
    this.carritoSvc.carrito$.subscribe(productos => {
      this.items = productos;
      this.cdr.detectChanges();
    })
  );

  // 2. Escuchar visibilidad del sidebar
  this.subscripciones.add(
    this.carritoSvc.mostrarCarrito$.subscribe(estado => {
      this.visible = estado;
      this.cdr.detectChanges();
    })
  );

  // 3. Escuchar el costo de envío (Metido en el gestor de subscripciones)
  this.subscripciones.add(
    this.carritoSvc.costoEnvio$.subscribe(monto => {
      this.envio = monto;
      this.cdr.detectChanges();
    })
  );
}

  calcularTotalConEnvio(): number {
  return this.calcularTotal() + this.envio;
}

  ngOnDestroy(): void {
    // Limpiamos la memoria al cerrar el componente
    this.subscripciones.unsubscribe();
  }

  cerrar() {
    this.carritoSvc.toggleCarrito();
  }

  eliminar(index: number) {
    this.carritoSvc.eliminarProducto(index);
  }

  calcularTotal(): number {
  return this.items.reduce((acc, item) => acc + ((item.precio || 0) * (item.cantidad || 1)), 0);
}

  enviarPedido() {
    if (this.items.length === 0) return;
    
    let mensaje = "¡Hola Ivano Store! 🛒 Deseo realizar el siguiente pedido:\n\n";
    
    this.items.forEach((item, index) => {
      mensaje += `${index + 1}. ${item.nombre_zapatilla}\n`;
      mensaje += `   - Modelo: ${item.modelo} (${item.sigla})\n`;
      mensaje += `   - Talla: ${item.tallaElegida || 'No seleccionada'}\n`;
      mensaje += `   - Precio: S/ ${item.precio}\n\n`;
    });
    
    mensaje += `*Total a pagar: S/ ${this.calcularTotal().toFixed(2)}*`;
    
    const url = `https://wa.me/51910527690?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  irAlCheckout() {
  this.visible = false; // Cerramos el carrito
  this.router.navigate(['/checkout']); // Aquí es donde el usuario llenará sus datos
}

vaciarCarritoCompleto() {
  // Cambiamos '.carrito-sidebar-container' por '.cart-container'
  const containerSidebar = document.querySelector('.cart-container') as HTMLElement;

  Swal.fire({
    title: '¿Quieres vaciar el carrito?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e62117',
    cancelButtonColor: '#a5a5a5',
    confirmButtonText: 'Sí',
    cancelButtonText: 'No',
    reverseButtons: true,
    target: containerSidebar || 'body', // Ahora sí lo va a encontrar
    customClass: {
      container: 'swal-overlay-fix',
      popup: 'swal-popup-fix'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.carritoSvc.vaciarCarrito();
    }
  });
}


}