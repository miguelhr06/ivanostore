import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-devoluciones',
  templateUrl: './devoluciones.html',
  styleUrls: ['./devoluciones.css']
})
export class DevolucionesComponent implements OnInit {

  // Centralizamos el contacto para que si Ivano cambia de número, solo edites aquí
  public whatsappContacto: string = "51959554211"; 
  public mensajePredeterminado: string = "Hola Ivano Store, deseo gestionar un cambio o consulta sobre mi envío.";

  constructor() { }

  ngOnInit(): void {
    // Aquí podrías añadir lógica para scroll automático al inicio al cargar la página
    window.scrollTo(0, 0);
  }

  // Método para disparar el chat de servicio al cliente
  irAAsistencia() {
    const url = `https://wa.me/${this.whatsappContacto}?text=${encodeURIComponent(this.mensajePredeterminado)}`;
    window.open(url, '_blank');
  }

}