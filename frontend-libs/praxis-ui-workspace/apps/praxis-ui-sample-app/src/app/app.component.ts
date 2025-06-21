import { Component } from '@angular/core';
import { PraxisUiCoreModule } from '../../../projects/praxis-ui-core/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PraxisUiCoreModule],
  templateUrl: './app.component.html'
})
export class AppComponent {}
