import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { CarritoService } from './services/carrito';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
// Componentes CLÁSICOS (Standalone: false)
import { App } from './app';
import { Inicio } from './pages/inicio/inicio';
import { Nosotros } from './pages/nosotros/nosotros';
import { Contacto } from './pages/contacto/contacto';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { Patrocinios } from './pages/patrocinios/patrocinios';
import { Tiendas } from './pages/tiendas/tiendas';
import { AtencionAlCliente } from './pages/atencion-al-cliente/atencion-al-cliente';
import { HomeDinamicas } from './components/home-dinamicas/home-dinamicas';
import { DinamicasFooter } from './pages/dinamicas-footer/dinamicas-footer';
import { CaballeroComponent } from './features/catalogo/caballero/caballero';
import { DamaComponent } from './features/catalogo/dama/dama';
import { AccesoriosComponent } from './features/catalogo/accesorios/accesorios';
import { NinosComponent } from './features/catalogo/ninos/ninos';

// Componentes STANDALONE (Deben ir en imports)
import { DevolucionesComponent } from './pages/devoluciones/devoluciones';
import { TerminosComponent } from './pages/terminos/terminos';
import { EnviosComponent } from './pages/envios/envios';
import { PrivacidadComponent } from './pages/privacidad/privacidad';
import { PreguntasFrecuentesComponent } from './pages/preguntas-frecuentes/preguntas-frecuentes';
import { LibroReclamacionesComponent } from './pages/libro-reclamaciones/libro-reclamaciones';
import { GrandeComponent } from './productos/grande/grande';
import { MedianoComponent } from './productos/mediano/mediano';
import { PequenoComponent } from './productos/pequeno/pequeno';
import { MorralesComponent } from './productos/accesorios/morrales/morrales'; // Servicios y Pipes
import { SupabaseService } from './services/supabase';
import { SafeUrlPipe } from './pipe/safe-url-pipe';
import { MochilasComponent } from './productos/accesorios/mochilas/mochilas';
import { BilleterasComponent } from './productos/accesorios/billeteras/billeteras';
import { CangurosComponent } from './productos/accesorios/canguros/canguros';
import { NecesersComponent } from './productos/accesorios/neceser/neceser';
import { PortafoliosComponent } from './productos/accesorios/portafolios/portafolios';
import { BolsosPechoComponent } from './productos/accesorios/bolsos-pecho/bolsos-pecho';
import { MaletinesComponent } from './productos/accesorios/maletines/maletines';
import { CorreasComponent } from './productos/accesorios/correas/correas';
import { MonederosComponent } from './productos/accesorios/monederos/monederos';
import { TarjeterosComponent } from './productos/accesorios/tarjeteros/tarjeteros';
import { CarterasComponent } from './productos/accesorios/carteras/carteras';
import { BolsosComponent } from './productos/accesorios/bolsos/bolsos';
import { CarritoSidebarComponent } from './features/catalogo/carrito-sidebar/carrito-sidebar';
import { CheckoutComponent } from './components/checkout/checkout';
import { PagoComponent } from './components/pago/pago';
import { LoginComponent } from './components/login/login';
import { RegistroComponent } from './components/registro/registro';
import { RecuperarComponent } from './components/recuperar/recuperar';
import { MiPerfilComponent } from './components/mi-perfil/mi-perfil';
import { MisComprasComponent } from './components/mi-perfil/sub-components/mis-compras/mis-compras';
import { MisFavoritosComponent } from './components/mi-perfil/sub-components/mis-favoritos/mis-favoritos';
import { MisDireccionesComponent } from './components/mi-perfil/sub-components/mis-direcciones/mis-direcciones';
import { MisBeneficiosComponent } from './components/mi-perfil/sub-components/mis-beneficios/mis-beneficios';
import { MisDatosComponent } from './components/mi-perfil/sub-components/mis-datos/mis-datos';
import { MisMensajesComponent } from './components/mi-perfil/sub-components/mis-mensajes/mis-mensajes';
import { ChatBotComponent } from './components/chat-bot/chat-bot';

@NgModule({
  declarations: [
    App,
    Inicio,
    Nosotros,
    Contacto,
    Navbar,
    Footer,
    Patrocinios,
    Tiendas,
    AtencionAlCliente,
    HomeDinamicas,
    DinamicasFooter,
    CaballeroComponent,
    DamaComponent,
    NinosComponent,
    AccesoriosComponent,
    GrandeComponent,
    MedianoComponent,
    PequenoComponent,
    MorralesComponent,
    MochilasComponent,
    BilleterasComponent,
    CangurosComponent,
    NecesersComponent,
    PortafoliosComponent,
    BolsosPechoComponent,
    MaletinesComponent,
    CorreasComponent,
    MonederosComponent,
    TarjeterosComponent,
    CarterasComponent,
    BolsosComponent,
    CarritoSidebarComponent,
    
  ],
  imports: [
    BrowserModule,
    CommonModule, // <--- Esto arregla los errores de [ngClass]
    AppRoutingModule, // <--- Esto arregla el <router-outlet>
    RouterModule,
    DragDropModule, // <--- Aquí
    // Importamos los componentes Standalone
    DevolucionesComponent,
    TerminosComponent,
    EnviosComponent,
    PrivacidadComponent,
    PreguntasFrecuentesComponent,
    LibroReclamacionesComponent,
    SafeUrlPipe,
    CheckoutComponent,
    PagoComponent,
    LoginComponent,
    RegistroComponent,
    RecuperarComponent,
    MiPerfilComponent,
    MisComprasComponent,
    MisFavoritosComponent,
    MisDireccionesComponent,
    MisBeneficiosComponent,
    MisDatosComponent,
    MisMensajesComponent,
    ChatBotComponent,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    FormsModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    SupabaseService,
    CarritoService,
    provideHttpClient(),
  ],
  bootstrap: [App],
})
export class AppModule {}
