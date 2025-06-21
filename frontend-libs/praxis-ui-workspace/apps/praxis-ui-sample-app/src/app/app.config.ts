import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PraxisUiCoreModule } from '../../../projects/praxis-ui-core/src/public-api';
import { API_URL } from '../../../projects/praxis-ui-core/src/lib/tokens/api-url.token';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    importProvidersFrom(PraxisUiCoreModule),
    { provide: API_URL, useValue: environment.apiUrl }
  ]
};
