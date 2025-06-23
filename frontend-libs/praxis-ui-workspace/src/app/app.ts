import { Component } from '@angular/core';
import { PraxisTable } from '@praxis/table';

@Component({
  selector: 'app-root',
  imports: [PraxisTable],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'praxis-ui-workspace';
}
