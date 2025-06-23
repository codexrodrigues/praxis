import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {API_URL} from '@praxis/core';
import {environment} from '../environments/environment';
import {provideHttpClient} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideRouter(routes),
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: LOCALE_ID, useValue: "pt-BR" }
  ]
};
