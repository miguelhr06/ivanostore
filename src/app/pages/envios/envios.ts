import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-envios',
  templateUrl: './envios.html',
  styleUrls: ['./envios.css'],
  standalone: true,
  imports: [CommonModule]
})
export class EnviosComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Para que al entrar a la página siempre cargue desde arriba
    window.scrollTo(0, 0);
  }

}