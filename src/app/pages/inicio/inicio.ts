import { Component, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupabaseService } from '../../services/supabase'; 

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css'],
  standalone: false
})
export class Inicio implements AfterViewInit, OnInit {
  isMuted = true;
  isPlaying = true;
  isDragging = false;
  startX = 0;
  scrollLeft = 0;

  mostrarModal = false;
  videoSeleccionado: any = null;
  estaEnPip = false; 

  modelosTendencia = [
    { id: 1, nombre: 'MODELO 120 - BLACK', img: 'modelos/modelo1.jpg', precio: '169.90' },
    { id: 2, nombre: 'MODELO 120 - WHITE', img: 'modelos/modelo2.jpg', precio: '169.90' },
    { id: 3, nombre: 'FLARE EDITION', img: 'modelos/modelo3.jpg', precio: '169.90' },
    { id: 4, nombre: 'MODELO 100 - BLACK', img: 'modelos/modelo4.jpg', precio: '169.90' },
    { id: 5, nombre: 'MODELO 08 - WHITE', img: 'modelos/modelo5.jpg', precio: '169.90' },
    { id: 6, nombre: 'FIRE 115', img: 'modelos/modelo6.jpg', precio: '169.90' }
  ];

  dinamicas: any[] = [];

  get dinamicasInicio() {
    return this.dinamicas.slice(0, 3);
  }

  constructor(
    private supabase: SupabaseService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDinamicasDesdeSupabase();
  }

  async cargarDinamicasDesdeSupabase() {
    try {
      const { data, error } = await this.supabase.client
        .from('videos_inicio')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true });

      if (error) throw error;

      if (data) {
        this.dinamicas = data.map((item: any) => {
          // --- CAMBIO AQUÍ: Quitamos la llamada al storage.from('dinamicas') ---

          const redesDisponibles = [];
          if (item.url_facebook) redesDisponibles.push({ tipo: 'facebook', icono: 'bi-facebook', url: item.url_facebook });
          if (item.url_instagram) redesDisponibles.push({ tipo: 'instagram', icono: 'bi-instagram', url: item.url_instagram });
          if (item.url_tiktok) redesDisponibles.push({ tipo: 'tiktok', icono: 'bi-tiktok', url: item.url_tiktok });

          return {
            ...item,
            // Jalamamos la URL directa de la columna video_path
            video: this.sanitizer.bypassSecurityTrustResourceUrl(item.video_path),
            redes: redesDisponibles
          };
        });
        
        this.cdr.detectChanges();
      }
    } catch (err) {
      console.error('Error al obtener dinámicas en Inicio:', err);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  togglePlay(videoPlayer: HTMLVideoElement) {
    this.isPlaying = !this.isPlaying;
    if (videoPlayer) {
      this.isPlaying ? videoPlayer.play() : videoPlayer.pause();
    }
  }

  abrirModal(item: any) {
    const videosGrid = document.querySelectorAll('.trend-video-player') as NodeListOf<HTMLVideoElement>;
    videosGrid.forEach(v => v.pause());

    this.videoSeleccionado = item;
    this.mostrarModal = true;
    this.estaEnPip = false;

    setTimeout(() => {
      const video = document.querySelector('.video-foreground') as HTMLVideoElement;
      if (video) {
        video.addEventListener('enterpictureinpicture', () => {
          this.estaEnPip = true;
        });
        video.addEventListener('leavepictureinpicture', () => {
          this.estaEnPip = false;
        });
      }
    }, 500);
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.videoSeleccionado = null;
    this.estaEnPip = false;
  }

  redigirDinamica(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.isDragging = true;
    el.style.cursor = 'grabbing';
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging(el: HTMLDivElement) {
    this.isDragging = false;
    el.style.cursor = 'grab';
  }

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    if (!this.isDragging) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - this.startX) * 2;
    el.scrollLeft = this.scrollLeft - walk;
  }

  ngAfterViewInit() {
    console.log('Ivano Store - Inicio cargado correctamente con modo multicanal');
  }
}