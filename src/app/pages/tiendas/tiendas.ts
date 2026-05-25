import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../services/supabase';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-tiendas',
  templateUrl: './tiendas.html',
  styleUrls: ['./tiendas.css'],
  standalone: false
})
export class Tiendas implements OnInit {
  listaTiendas: any[] = [];
  tiendasFiltradas: any[] = [];
  mapaSeguro: SafeResourceUrl | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    const { data } = await this.supabaseService.client.from('tiendas').select('*');
    if (data) {
      this.listaTiendas = data;
      this.tiendasFiltradas = data;
      this.cdr.detectChanges();
    }
  }

  filtrarTiendas(event: any) {
  const busqueda = event.target.value.toLowerCase();
  this.tiendasFiltradas = this.listaTiendas.filter(tienda => 
    tienda.nombre.toLowerCase().includes(busqueda) || 
    tienda.direccion.toLowerCase().includes(busqueda) ||
    (tienda.referencia && tienda.referencia.toLowerCase().includes(busqueda)) // También busca en referencias
  );

  if (busqueda === "") {
    this.mapaSeguro = null;
  } else if (this.tiendasFiltradas.length === 1) {
    this.seleccionarTienda(this.tiendasFiltradas[0]);
  }
}

 // ... tus otros métodos (ngOnInit, filtrarTiendas) ...

// ... tus otros métodos ...

seleccionarTienda(tienda: any) {
  let urlFinal = '';

  // 1. Verificamos si el link de la DB es de los que Google RECHAZA (los cortos .goo.gl)
  if (tienda.google_maps_url && !tienda.google_maps_url.includes('goo.gl')) {
    // Si es un link largo y pro, lo usamos
    urlFinal = tienda.google_maps_url;
    if (!urlFinal.includes('output=embed')) {
      urlFinal += "&output=embed";
    }
  } else {
    // 2. PLAN B (EL QUE NO FALLA): Generar el link con la dirección de texto
    // Esto es lo que hizo que "Las Fábricas" sí cargara con el pin rojo.
    const direccionSegura = encodeURIComponent(tienda.direccion);
    urlFinal = `https://maps.google.com/maps?q=${direccionSegura}&t=&z=16&ie=UTF8&iwloc=addr&output=embed`;
  }

  // 3. Aplicar seguridad y mostrar
  this.mapaSeguro = this.sanitizer.bypassSecurityTrustResourceUrl(urlFinal);
  
  window.scrollTo({ top: 150, behavior: 'smooth' });
}

// ... rest of the file ...

// ... tu método cerrarMapa ...

  cerrarMapa() {
    this.mapaSeguro = null;
  }

  // Función para verificar si está abierto (ponla dentro de tu clase)
estaAbierto(horario: string): boolean {
  if (!horario) return false;

  const ahora = new Date();
  const horaActualDecimal = ahora.getHours() + (ahora.getMinutes() / 60);

  // 1. Limpiamos: buscamos el primer número que aparece en el texto, 
  // ignorando todo lo que diga "Lun", "Sáb", "Dom", etc.
  const regexExtraer = /(\d{1,2}(?::\d{2})?\s*(?:am|pm))/gi;
  const horasEncontradas = horario.match(regexExtraer);

  if (!horasEncontradas || horasEncontradas.length < 2) return false;

  const parsearHora = (texto: string): number => {
    const match = texto.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (!match) return 0;

    let horas = parseInt(match[1]);
    const minutos = match[2] ? parseInt(match[2]) : 0;
    const esPM = match[3].toLowerCase().includes('pm');
    const esAM = match[3].toLowerCase().includes('am');

    if (esPM && horas < 12) horas += 12;
    if (esAM && horas === 12) horas = 0;

    return horas + (minutos / 60);
  };

  const apertura = parsearHora(horasEncontradas[0]);
  const cierre = parsearHora(horasEncontradas[1]);

  // 2. Comparamos
  return horaActualDecimal >= apertura && horaActualDecimal < cierre;
}
}