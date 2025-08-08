import {
  ApplicationConfig,
  LOCALE_ID,
  APP_INITIALIZER,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { API_URL } from '@praxis/core';
import { environment } from '../environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
//import {MonacoEditorModule, provideMonacoEditor} from 'ngx-monaco-editor-v2';
import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  LowerCasePipe,
  PercentPipe,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import {
  initializeComponentSystem,
  configureDynamicFieldsLogger,
  LoggerPresets,
} from '@praxis/dynamic-fields';
import { notFoundLoggerInterceptor } from './core/interceptors/not-found-logger.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([notFoundLoggerInterceptor])),
    provideAnimationsAsync(),
    provideRouter(routes),
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        // Configurar logger para reduzir spam
        configureDynamicFieldsLogger(LoggerPresets.DEVELOPMENT);
        // Retornar a função de inicialização dos componentes
        return initializeComponentSystem();
      },
      multi: true,
    },
    DatePipe,
    UpperCasePipe,
    DecimalPipe,
    CurrencyPipe,
    PercentPipe,
    LowerCasePipe,
    TitleCasePipe,
    // provideMonacoEditor({
    //   defaultOptions: {
    //     scrollBeyondLastLine: false,
    //     theme: 'vs-dark',
    //     language: 'json',
    //     automaticLayout: true,
    //     minimap: {
    //       enabled: false
    //     }
    //   },
    //   onMonacoLoad: () => {
    //     console.log('Monaco Editor carregado!');
    //   }
    // })
  ],
};
