import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-atencion-al-cliente',
  templateUrl: './atencion-al-cliente.html',
  styleUrls: ['./atencion-al-cliente.css'],
  standalone: false
})
export class AtencionAlCliente {

  constructor(private supabaseService: SupabaseService) {}

  // Tus redes oficiales actualizadas
  redes = {
  // WhatsApp: Mensaje directo sobre información general
  whatsapp: "https://wa.me/51959554211?text=Hola%20Ivano%20Store,%20necesito%20más%20información",
  
  // Facebook Messenger: El parámetro ?text funciona en la versión móvil/web moderna
  facebook: "https://m.me/ivanofootwear?text=Hola%20Ivano%20Store,%20deseo%20más%20información",
  
  // Instagram: Abre el chat directo, pero no permite precargar texto por URL por sus políticas
  instagram: "https://ig.me/m/ivano.oficial",
  
  // TikTok: Abre el perfil directamente (TikTok bloquea mensajes automáticos externos)
  tiktok: "https://www.tiktok.com/@ivanooficial",
  
  // Gmail: Destinatario ventas@ivano.pe con asunto y cuerpo detallado
  gmail: "mailto:ventas@ivano.pe?subject=Consulta%20Web%20IvanoStore&body=Hola,%20deseo%20más%20información%20sobre..."
};
  async registrarYRedirigir(canal: string) {
    const url = this.redes[canal as keyof typeof this.redes];

    // Registro en la tabla 'contactos_atencion' que acabas de crear
    const { error } = await this.supabaseService.client
      .from('contactos_atencion')
      .insert([
        { 
          canal: canal, 
          mensaje_previo: `Clic desde la página de atención al cliente` 
        }
      ]);

    if (error) console.error("Error al registrar métrica:", error);

    // Abrir la red social o Gmail en pestaña nueva
    window.open(url, '_blank');
  }
}