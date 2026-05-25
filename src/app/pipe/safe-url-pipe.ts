import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true // Si usas Angular 14+ asegúrate de que esto esté aquí
})
export class SafeUrlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    // Esta línea limpia la URL para que Angular confíe en el origen (Google Drive)
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}