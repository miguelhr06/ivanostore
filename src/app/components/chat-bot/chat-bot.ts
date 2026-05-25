import { Component, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { AuthService } from '../../services/auth';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './chat-bot.html',
  styleUrls: ['./chat-bot.css']
})
export class ChatBotComponent implements AfterViewChecked, OnInit {
  @ViewChild('scrollMe') private scrollContainer!: ElementRef;
  
  isOpen = false;
  isTyping = false;
  userInput = '';
  mensajes: any[] = [{ remitente: 'bot', contenido: '¡Hola! Soy IvanoBot. ¿En qué te ayudo?' }];
  
  // 'start' | 'awaiting_order' | 'human_handoff' | 'faq' | 'recommendation'
  step: string = 'start'; 
  tiendasCache: any[] = [];

  constructor(
    private supabase: SupabaseService, 
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) { this.cargarTiendas(); }

  ngOnInit() {
    if (localStorage.getItem('isLogged') === 'true' && localStorage.getItem('pendiente_asesor') === 'true') {
      localStorage.removeItem('pendiente_asesor');
      this.router.navigateByUrl('/mi-perfil/mensajes');
    }
  }

  async cargarTiendas() {
    const { data } = await this.supabase.client.from('tiendas').select('*');
    if (data) this.tiendasCache = data;
  }

  async handleOption(option: { id: number, label: string }) {
    this.mensajes.push({ remitente: 'cliente', contenido: option.label });
    this.cdr.detectChanges();

    switch(option.id) {
      case 1: // Estado de Pedido
        this.step = 'awaiting_order';
        this.mensajes.push({ remitente: 'bot', contenido: 'Por favor, escribe tu número de pedido para consultarlo:' });
        break;
      case 2: // Tiendas
        const res = this.tiendasCache.map(t => `📍 ${t.nombre}\nEstado: ${this.estaAbierto(t.horario) ? '✅ ABIERTO' : '❌ CERRADO'}`).join('\n\n');
        this.mensajes.push({ remitente: 'bot', contenido: res || 'No hay tiendas.' });
        break;
      case 3: // Asesor
        if (localStorage.getItem('isLogged') === 'true') this.router.navigateByUrl('/mi-perfil/mensajes');
        else { localStorage.setItem('pendiente_asesor', 'true'); this.router.navigate(['/login']); }
        break;
      case 4: // Guía de Tallas
        this.mensajes.push({ remitente: 'bot', contenido: 'Puedes ver nuestra guía de tallas aquí: [Enlace a tu guía]' });
        break;
      case 5: // Promociones
        this.mensajes.push({ remitente: 'bot', contenido: '🔥 ¡Tenemos 20% OFF en toda la colección de verano! Cupón: IVANO20' });
        break;
      case 6: // Recomendaciones
        this.step = 'recommendation';
        this.mensajes.push({ remitente: 'bot', contenido: '¿Qué buscas? (Caballero / Dama / Niños)' });
        break;
    }
    this.cdr.detectChanges();
  }

  async sendText() {
    if (!this.userInput.trim()) return;
    const text = this.userInput;
    this.userInput = '';
    this.mensajes.push({ remitente: 'cliente', contenido: text });

    if (this.step === 'awaiting_order') {
      this.isTyping = true;
      const { data } = await this.supabase.client.from('pedidos').select('estado').eq('id', text.trim()).maybeSingle();
      const respuesta = data ? `Tu pedido #${text} está: ${data.estado}` : "❌ No encontramos ese número de pedido.";
      this.mensajes.push({ remitente: 'bot', contenido: respuesta });
      this.step = 'start';
      this.isTyping = false;
    } else if (this.step === 'recommendation') {
      this.mensajes.push({ remitente: 'bot', contenido: `Genial, buscando lo más vendido en ${text}... (Aquí mostrarías tus productos)` });
      this.step = 'start';
    }
    this.cdr.detectChanges();
  }

  private estaAbierto(horario: string): boolean { /* tu lógica original */ return true; }
  ngAfterViewChecked() { if (this.scrollContainer) this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight; }
  toggleChat() { this.isOpen = !this.isOpen; }
}