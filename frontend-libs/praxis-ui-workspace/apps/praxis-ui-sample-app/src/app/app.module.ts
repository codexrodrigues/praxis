import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PraxisUiCoreModule } from '../../../projects/praxis-ui-core/src/public-api';
import { API_URL } from '../../../projects/praxis-ui-core/src/lib/tokens/api-url.token';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, PraxisUiCoreModule],
  providers: [{ provide: API_URL, useValue: environment.apiUrl }],
  bootstrap: [AppComponent]
})
export class AppModule {}
