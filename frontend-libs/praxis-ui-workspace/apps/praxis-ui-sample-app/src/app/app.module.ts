import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PraxisUiCoreModule } from '../../../projects/praxis-ui-core/src/public-api';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, PraxisUiCoreModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
