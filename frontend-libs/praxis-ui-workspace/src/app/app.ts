import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {PraxisTable} from '@praxis/table';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PraxisTable],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'praxis-ui-workspace';
}
