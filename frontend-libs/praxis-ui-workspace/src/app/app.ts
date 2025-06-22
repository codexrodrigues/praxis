import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {PraxisTableComponent} from "@praxis/table";

@Component({
  selector: 'app-root',
    imports: [RouterOutlet, PraxisTableComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'praxis-ui-workspace';
}
