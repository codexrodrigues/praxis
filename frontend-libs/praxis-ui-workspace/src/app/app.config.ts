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
import {MonacoEditorModule, provideMonacoEditor} from 'ngx-monaco-editor-v2';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideRouter(routes),
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: LOCALE_ID, useValue: "pt-BR" },
    provideMonacoEditor({
      defaultOptions: {
        scrollBeyondLastLine: false,
        theme: 'vs-dark',
        language: 'json',
        automaticLayout: true,
        minimap: {
          enabled: false
        }
      },
      onMonacoLoad: () => {
        console.log('Monaco Editor carregado!');
      }
    })
  ]
};
