import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-beneficios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-beneficios.html',
  styleUrls: ['./mis-beneficios.css']
})
export class MisBeneficiosComponent {
  @Input() usuario: any;

  // Estos podrían venir de una tabla en Supabase después, por ahora los mantenemos aquí
  cuponesDisponibles = [
    { codigo: 'IVANO-PROMO-40', descuento: 40, condicion: 'Compras > S/ 150' },
    { codigo: 'IVANO-BIENVENIDA', descuento: 20, condicion: 'Compras > S/ 100 ' }
  ];

  copiarCupon(codigo: string) {
    navigator.clipboard.writeText(codigo);
    alert('Cupón copiado: ' + codigo);
  }
}