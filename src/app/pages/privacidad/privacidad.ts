import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacidad',
  templateUrl: './privacidad.html',
  styleUrls: ['./privacidad.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PrivacidadComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }
}