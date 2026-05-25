import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService } from '../../services/carrito'; 
import { AuthService } from '../../services/auth'; 
import { DataService } from '../../services/data'; // <--- IMPORTANTE: Asegúrate de tenerlo
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: false
})
export class Navbar implements OnInit {
  cantidadItems: number = 0;
  isLogged: boolean = !!localStorage.getItem('isLogged'); 

  // --- NUEVAS VARIABLES PARA EL BUSCADOR ---
  searchTerm$ = new Subject<string>();
  resultados: any[] = [];
  mostrarResultados = false;

  constructor(
    private carritoSvc: CarritoService,
    public authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dataService: DataService // <--- Inyectamos tu DataService
  ) {
    this.authService.isLogged$.subscribe(s => console.log("🔍 ESTADO REAL EN NAVBAR:", s));

    // --- LÓGICA DEL BUSCADOR PREDICTIVO ---
    this.searchTerm$.pipe(
      debounceTime(300), // Espera 300ms para no saturar Supabase
      distinctUntilChanged(), // Solo busca si el texto cambió
      switchMap(term => {
        if (term.length < 2) {
          this.mostrarResultados = false;
          return [[]]; // Retorna array vacío si es muy corto
        }
        return this.dataService.buscarProductos(term); // Llamada a Supabase
      })
    ).subscribe(data => {
      this.resultados = data;
      this.mostrarResultados = true;
      this.cdr.detectChanges(); // Forzamos el renderizado de los resultados
    });
  }

  ngOnInit() {
    // Escucha del carrito
    this.carritoSvc.carrito$.subscribe(productos => {
      this.cantidadItems = productos.length;
      this.cdr.detectChanges();
    });

    // Suscripción de sesión
    this.authService.isLogged$.subscribe(status => {
      this.isLogged = status;
      console.log('NAVBAR -> Estado de sesión:', this.isLogged);
      
      if (status) localStorage.setItem('isLogged', 'true');
      else localStorage.removeItem('isLogged');

      this.cdr.detectChanges(); 
    });
  }

  // --- NUEVOS MÉTODOS DEL BUSCADOR ---
  onSearch(event: any) {
    const term = event.target.value;
    this.searchTerm$.next(term);
  }

  

  async cerrarSesion() {
    try {
      await this.authService.logout();
      this.isLogged = false;
      localStorage.removeItem('isLogged');
      this.cdr.detectChanges();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  toggleCarrito() {
    this.carritoSvc.toggleCarrito();
  }


mostrarBuscador: boolean = false;

abrirBuscador() {
  this.mostrarBuscador = true;
  // Bloqueamos el scroll de la página de atrás
  document.body.style.overflow = 'hidden';
}

cerrarBuscador() {
  this.mostrarBuscador = false;
  document.body.style.overflow = 'auto';
  this.resultados = [];
}


}