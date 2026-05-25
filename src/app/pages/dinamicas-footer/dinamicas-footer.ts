import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupabaseService } from '../../services/supabase'; 
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dinamicas-footer',
  templateUrl: './dinamicas-footer.html',
  styleUrls: ['./dinamicas-footer.css'],
  standalone: false
})
export class DinamicasFooter implements OnInit {
  
  todasLasDinamicas: any[] = [];
  mostrarModal = false;
  videoSeleccionado: any = null;

  constructor(
    private supabase: SupabaseService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      setTimeout(() => {
        this.cargarDinamicas();
      }, 100); 
    });
  }

  ngOnInit() {
    this.cargarDinamicas();
    
  }

  async cargarDinamicas() {
    
    try {
      this.todasLasDinamicas = [];

      const { data, error } = await this.supabase.client
        .from('videos_inicio')
        .select('*') 
        .eq('activo', true)
        .order('orden', { ascending: true });

      if (error) throw error;

      if (data) {
  console.log("¡Llegaron " + data.length + " videos de Supabase!"); // ESTO TE DIRÁ SI LLEGAN LOS 13
  this.todasLasDinamicas = data.map((item: any) => {
          let rawUrl = item.video_path;
          
          // --- PARCHE DE LIMPIEZA DE DRIVE (NO TOCAR) ---
          if (rawUrl && rawUrl.includes('drive.google.com')) {
            const videoIdMatch = rawUrl.match(/[-\w]{25,}/);
            if (videoIdMatch) {
              // Forzamos el formato uc?id= que es el ÚNICO que permite streaming sin controles
              rawUrl = `https://drive.google.com/uc?id=${videoIdMatch[0]}`;
            }
          }
          
          const redesDisponibles = [];
          if (item.url_tiktok?.trim()) redesDisponibles.push({ tipo: 'tiktok', icono: 'bi-tiktok', url: item.url_tiktok.trim(), color: '#000', borde: '#ff0050' });
          if (item.url_instagram?.trim()) redesDisponibles.push({ tipo: 'instagram', icono: 'bi-instagram', url: item.url_instagram.trim(), color: '#E4405F', borde: '#f09433' });
          if (item.url_facebook?.trim()) redesDisponibles.push({ tipo: 'facebook', icono: 'bi-facebook', url: item.url_facebook.trim(), color: '#1877F2', borde: '#1877F2' });

          return {
            ...item,
            // Sanitizamos la URL para el tag <video> real
            video: this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl),
            redes: redesDisponibles 
          };
        });

        this.cdr.detectChanges();
      }
    } catch (err) {
      console.error("Error en carga:", err);
    }
  }

  abrirModal(video: any) {
    this.videoSeleccionado = video;
    this.mostrarModal = true;
    
    // Forzamos la reproducción del video real una vez que el modal cargue
    setTimeout(() => {
      const modalVideo = document.querySelector('.video-foreground') as HTMLVideoElement;
      if (modalVideo) {
        modalVideo.muted = true; // El autoplay requiere mute en Chrome/UTP
        modalVideo.play().catch(e => console.log("Autoplay bloqueado:", e));
      }
    }, 150);
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.videoSeleccionado = null;
  }

  redigirDinamica(url: any) {
    if (url) {
      window.open(url, '_blank');
    }
  }
}