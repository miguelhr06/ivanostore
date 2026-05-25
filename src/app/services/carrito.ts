import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  // Manejamos todo con el Subject para que sea reactivo (Tu lógica base)
  private carritoSubject = new BehaviorSubject<any[]>([]);
  carrito$ = this.carritoSubject.asObservable();

  private mostrarCarrito = new BehaviorSubject<boolean>(false);
  mostrarCarrito$ = this.mostrarCarrito.asObservable();

  
  constructor() {
    // AL INICIAR EL SERVICIO: Recuperamos los datos del disco
    const datosGuardados = localStorage.getItem('carrito_ivano');
    if (datosGuardados) {
      try {
        this.carritoSubject.next(JSON.parse(datosGuardados));
      } catch (error) {
        console.error("Error al parsear el carrito del LocalStorage", error);
      }
    }
  }

  // Función privada para centralizar el guardado ( DRY Principle )
  private actualizarPersistencia(productos: any[]) {
    localStorage.setItem('carrito_ivano', JSON.stringify(productos));
  }

  // 1. Modificamos el agregar para que detecte duplicados (Tu lógica intacta + persistencia)
  agregarAlCarrito(producto: any, talla: string) {
    const actuales = [...this.carritoSubject.value];
    
    // Buscamos si ya existe un item con el mismo nombre/id Y la misma talla
    const itemExistente = actuales.find(p => 
      p.nombre_zapatilla === producto.nombre_zapatilla && p.tallaElegida === talla
    );

    if (itemExistente) {
      // Si existe, solo aumentamos su cantidad
      itemExistente.cantidad = (itemExistente.cantidad || 1) + 1;
      console.log(`Aumentada cantidad de ${producto.nombre_zapatilla} a: ${itemExistente.cantidad}`);
    } else {
      // Si es nuevo, lo agregamos con cantidad inicial 1
      const nuevoItem = { 
        ...producto, 
        tallaElegida: talla, 
        cantidad: 1 
      };
      actuales.push(nuevoItem);
      console.log('Producto nuevo añadido:', nuevoItem.nombre_zapatilla);
    }

    this.carritoSubject.next(actuales);
    this.actualizarPersistencia(actuales); // <-- Guardamos en LocalStorage
    this.abrirCarrito();
  }

  eliminarProducto(index: number) {
    const actuales = [...this.carritoSubject.value]; // Copia de seguridad
    actuales.splice(index, 1);
    this.carritoSubject.next(actuales); // Emitimos la nueva lista actualizada
    this.actualizarPersistencia(actuales); // <-- Actualizamos el disco
  }

  // Esta función es la que el Navbar llama para abrir/cerrar
  toggleCarrito() {
    this.mostrarCarrito.next(!this.mostrarCarrito.value);
  }

  abrirCarrito() {
    this.mostrarCarrito.next(true);
  }

  // Mantenemos tu lógica de WhatsApp intacta
  generarMensajeWhatsApp(): string {
    const productos = this.carritoSubject.value;
    if (productos.length === 0) return '';

    let mensaje = "¡Hola Ivano Store! 🛒 Quiero realizar el siguiente pedido:\n\n";
    
    productos.forEach((p, i) => {
      const subtotal = (p.precio || 0) * (p.cantidad || 1);
      mensaje += `${i + 1}. ${p.nombre_zapatilla} (x${p.cantidad || 1})\n`;
      mensaje += `   - Modelo: ${p.modelo} - Talla: ${p.tallaElegida}\n`;
      mensaje += `   - Subtotal: S/ ${subtotal}\n\n`;
    });

    const total = productos.reduce((acc, p) => acc + ((p.precio || 0) * (p.cantidad || 1)), 0);
    mensaje += `*Total estimado: S/ ${total}* \n¿Tienen disponibilidad?`;
    
    return encodeURIComponent(mensaje);
  }

  // En carrito.ts
private costoEnvio = new BehaviorSubject<number>(0);
costoEnvio$ = this.costoEnvio.asObservable();

actualizarEnvio(monto: number) {
  this.costoEnvio.next(monto);
}

// 2. Función para limpiar todo el carrito de golpe
  vaciarCarrito() {
  // Emitimos un array vacío al Subject
  this.carritoSubject.next([]);
  
  // Limpiamos el localStorage con tu método de persistencia
  this.actualizarPersistencia([]);
  
  console.log('Carrito Ivano vaciado con éxito');
}
public totalParaPagar: number = 0;

actualizarTotal(nuevoTotal: number) {
  this.totalParaPagar = nuevoTotal;
}
}