import 'zone.js'; // <-- Esta es la línea que falta e importa la librería
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app-module';

platformBrowserDynamic().bootstrapModule(AppModule)
.catch((err: any) => console.error(err));