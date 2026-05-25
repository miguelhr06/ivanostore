import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preguntas-frecuentes',
  templateUrl: './preguntas-frecuentes.html',
  styleUrls: ['./preguntas-frecuentes.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PreguntasFrecuentesComponent {
  // 0 para que la primera empiece desplegada, -1 para que todas cerradas
  activeIndex: number = 0;

  toggle(index: number) {
    this.activeIndex = this.activeIndex === index ? -1 : index;
  }
}