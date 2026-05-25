import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ivano-store');
  
  // Aquí ya no van los modelos, ni el video, ni las dinámicas.
}
