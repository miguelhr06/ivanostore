import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Inicio } from './pages/inicio/inicio'; // <--- IMPORTA INICIO
import { Nosotros } from './pages/nosotros/nosotros';
import { Contacto } from './pages/contacto/contacto';
import { Patrocinios } from './pages/patrocinios/patrocinios';
import { Tiendas} from './pages/tiendas/tiendas';
import { DevolucionesComponent } from './pages/devoluciones/devoluciones';
import { TerminosComponent } from './pages/terminos/terminos';
import { EnviosComponent } from './pages/envios/envios';
import { PrivacidadComponent} from './pages/privacidad/privacidad';
import { PreguntasFrecuentesComponent } from './pages/preguntas-frecuentes/preguntas-frecuentes';
import { LibroReclamacionesComponent } from './pages/libro-reclamaciones/libro-reclamaciones';
import { AtencionAlCliente } from './pages/atencion-al-cliente/atencion-al-cliente';
import { DinamicasFooter } from './pages/dinamicas-footer/dinamicas-footer';
import { CaballeroComponent } from './features/catalogo/caballero/caballero';
import { DamaComponent } from './features/catalogo/dama/dama';
import { NinosComponent} from './features/catalogo/ninos/ninos';
import { AccesoriosComponent } from './features/catalogo/accesorios/accesorios';
import { SafeUrlPipe } from './pipe/safe-url-pipe';
import { GrandeComponent } from './productos/grande/grande';
import { MedianoComponent } from './productos/mediano/mediano';
import { MorralesComponent } from './productos/accesorios/morrales/morrales';
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
import { PequenoComponent } from './productos/pequeno/pequeno';
import { CheckoutComponent } from './components/checkout/checkout';
import { PagoComponent } from './components/pago/pago';
import { LoginComponent } from './components/login/login';
import { RegistroComponent } from './components/registro/registro';
import { RecuperarComponent } from './components/recuperar/recuperar';
import { MiPerfilComponent } from './components/mi-perfil/mi-perfil';
import { MisMensajesComponent } from './components/mi-perfil/sub-components/mis-mensajes/mis-mensajes';

const routes: Routes = [
  { path: '', component: Inicio }, 
  { path: 'nosotros', component: Nosotros },
  { path: 'contacto', component: Contacto },
  { path: 'patrocinios', component: Patrocinios },
  { path: 'tiendas', component: Tiendas },
  { path: 'cambios-y-devoluciones', component: DevolucionesComponent },
  { path: 'devoluciones', redirectTo: 'cambios-y-devoluciones', pathMatch: 'full' },
  { path: 'terminos-y-condiciones', component: TerminosComponent },
  { path: 'politica-de-envios', component: EnviosComponent },
  { path: 'politica-de-privacidad', component: PrivacidadComponent},
  { path: 'preguntas-frecuentes', component: PreguntasFrecuentesComponent},
  { path: 'libro-reclamaciones', component: LibroReclamacionesComponent},
  { path: 'atencion-al-cliente', component: AtencionAlCliente},
  { path: 'dinamicas-footer', component: DinamicasFooter },
  
  // Catálogo
  { path: 'caballero', component: CaballeroComponent },
  { path: 'caballero', component: CaballeroComponent },
  { path: 'caballero/:modulo', component: CaballeroComponent },
  { path: 'caballero/:modulo/:filtro', component: CaballeroComponent },
  { path: 'caballero/:modulo/:filtro/:modelo/:slug', component: CaballeroComponent },

  { path: 'dama', component: DamaComponent },
  { path: 'dama', component: DamaComponent },
  { path: 'dama/:modulo', component: DamaComponent },
  { path: 'dama/:modulo/:filtro', component: DamaComponent },
  { path: 'dama/:modulo/:filtro/:modelo/:slug', component: DamaComponent },

  { path: 'ninos', component: NinosComponent },
  { path: 'ninos', component: NinosComponent },
  { path: 'ninos/:filtro', component: NinosComponent },
  { path: 'ninos/:filtro/:modelo/:slug', component: NinosComponent },

  { path: 'accesorios', component: AccesoriosComponent },
  { path: 'accesorios', component: AccesoriosComponent },
  { path: 'accesorios/:filtro', component: AccesoriosComponent },
  { path: 'accesorios/:filtro/:modelo/:slug', component: AccesoriosComponent },

  // 1. Calzado Caballeros (Ej: /caballero/grande/F0008/zapatillas-para-hombre-modelo-bridge-plomo)
  { path: 'caballero/:tamano/:modelo/:slug', component: CaballeroComponent },

  // 2. Accesorios desde Caballeros (Ej: /ACCESORIO/caballero/billeteras/A0001/billetera-cuero-premium)
  { path: 'ACCESORIO/caballero/:categoria/:modelo/:slug', component: CaballeroComponent },

  // 3. Calzado Damas (Repites la misma lógica apuntando a DamaComponent)
  { path: 'dama/:tamano/:modelo/:slug', component: DamaComponent },

  // 4. Accesorios desde Damas
  { path: 'ACCESORIO/dama/:categoria/:modelo/:slug', component: DamaComponent },

  // PRODUCTOS (Asegúrate que el nombre coincida con tu link en el Navbar)
  { path: 'grandes', component: GrandeComponent },
  { path: 'mediano', component: MedianoComponent },
  { path: 'pequeno', component: PequenoComponent} ,
  { path: 'morrales', component: MorralesComponent},
  { path: 'mochilas', component: MochilasComponent},
  { path: 'billeteras', component: BilleterasComponent},
  { path: 'canguros', component: CangurosComponent},
  { path: 'neceser', component: NecesersComponent},
  { path: 'portafolios', component: PortafoliosComponent},
  { path: 'bolsos-pecho', component: BolsosPechoComponent},
  { path: 'maletines', component: MaletinesComponent},
  { path: 'correas', component: CorreasComponent},
  { path: 'monederos', component: MonederosComponent},
  { path: 'tarjeteros', component: TarjeterosComponent},
  { path: 'carteras', component: CarterasComponent},
  { path: 'bolsos', component: BolsosComponent},
  { path: 'checkout', component: CheckoutComponent},
  { path: 'pago', component: PagoComponent},
  { path: 'login', component: LoginComponent},
  { path: 'registro', component: RegistroComponent},
  { path: 'recuperar', component: RecuperarComponent},
  { 
  path: 'mi-perfil', 
  component: MiPerfilComponent,
  children: [
    { path: 'datos', component: MiPerfilComponent },
    { path: 'direcciones', component: MiPerfilComponent },
    { path: 'compras', component: MiPerfilComponent },
    { path: 'favoritos', component: MiPerfilComponent },
    { path: 'beneficios', component: MiPerfilComponent },
    { path: 'ajustes', component: MiPerfilComponent }, // Agregué ajustes por si acaso
    { path: 'mensajes', component: MisMensajesComponent }, // Agregué ajustes por si acaso

    { path: '', redirectTo: 'datos', pathMatch: 'full' } // <--- ESTO ES LO QUE TE FALTA
  ]
},


  // EL COMODÍN SIEMPRE VA AL FINAL
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { 
    
    scrollPositionRestoration: 'enabled' 
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }