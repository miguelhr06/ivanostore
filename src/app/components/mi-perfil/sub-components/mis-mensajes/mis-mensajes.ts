import { Component, Input, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { SupabaseService } from '../../../../services/supabase';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-mensajes.html',
  styleUrls: ['./mis-mensajes.css']
})
export class MisMensajesComponent implements OnInit, AfterViewChecked {
  @Input() usuario: any;
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  
  mensajes: any[] = [];
  nuevoMensaje: string = '';
  chatId: number | null = null;
  loading: boolean = true;
  private shouldScrollDown: boolean = true;

  constructor(private supabase: SupabaseService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.cargarChat();
  }

  // Esto asegura que el chat siempre baje automáticamente al recibir mensajes
  ngAfterViewChecked() {
    if (this.shouldScrollDown) {
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  async cargarChat() {
    let { data: chat } = await this.supabase.client
      .from('chats')
      .select('id')
      .eq('user_id', this.usuario.id)
      .maybeSingle();

    if (!chat) {
      const { data: nuevoChat } = await this.supabase.client
        .from('chats')
        .insert([{ user_id: this.usuario.id, asunto: 'Consulta de Usuario' }])
        .select()
        .single();
      chat = nuevoChat;
    }

    this.chatId = chat.id;
    await this.obtenerMensajes();
  }

  async obtenerMensajes() {
    const { data } = await this.supabase.client
      .from('mensajes')
      .select('*')
      .eq('chat_id', this.chatId)
      .order('created_at', { ascending: true });

    this.mensajes = data || [];
    this.loading = false;
    this.shouldScrollDown = true; // Activamos scroll al recibir datos
    this.cdr.detectChanges();
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    const mensajeObj = {
      chat_id: this.chatId,
      contenido: this.nuevoMensaje,
      remitente: 'cliente'
    };

    const tempMensaje = { ...mensajeObj, created_at: new Date().toISOString() };
    this.mensajes.push(tempMensaje); // Optimistic UI
    this.nuevoMensaje = '';
    
    await this.supabase.client.from('mensajes').insert([mensajeObj]);
    await this.obtenerMensajes();
  }
}