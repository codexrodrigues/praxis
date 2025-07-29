/**
 * @fileoverview Providers para configuração da biblioteca praxis-dynamic-fields
 * 
 * Providers necessários para o funcionamento correto da biblioteca,
 * incluindo HttpClient e outros serviços essenciais.
 */

import { Provider, EnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

/**
 * Providers essenciais para praxis-dynamic-fields
 * 
 * Inclui HttpClient para data loading e outros providers necessários.
 * 
 * @example
 * ```typescript
 * // No app.config.ts ou main.ts
 * import { providePraxisDynamicFields } from 'praxis-dynamic-fields';
 * 
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     ...providePraxisDynamicFields(),
 *     // outros providers...
 *   ]
 * });
 * ```
 */
export function providePraxisDynamicFields(): (Provider | EnvironmentProviders)[] {
  return [
    // HttpClient para data loading
    provideHttpClient(withInterceptorsFromDi()),
    
    // Outros providers podem ser adicionados aqui no futuro
  ];
}

/**
 * Providers básicos sem HttpClient (para casos onde já está configurado)
 */
export function providePraxisDynamicFieldsCore(): Provider[] {
  return [
    // Providers core da biblioteca (sem HttpClient)
    // Pode ser expandido no futuro
  ];
}