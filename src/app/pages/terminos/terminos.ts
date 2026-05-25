import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para las directivas de Angular

@Component({
  selector: 'app-terminos',
  templateUrl: './terminos.html', // <--- Asegúrate que el archivo se llame terminos.html
  styleUrls: ['./terminos.css'],   // <--- Asegúrate que el archivo se llame terminos.css
  standalone: true,
  imports: [CommonModule]
})
export class TerminosComponent implements OnInit {
  constructor() { }
  ngOnInit(): void {
    window.scrollTo(0, 0);
  }
}