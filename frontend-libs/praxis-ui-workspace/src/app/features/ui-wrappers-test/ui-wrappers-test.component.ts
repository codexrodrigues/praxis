import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PraxisDynamicForm } from '@praxis/dynamic-form';
import apiRoutes from '../../../../api-routes.json';

@Component({
  selector: 'app-ui-wrappers-test',
  standalone: true,
  imports: [MatCardModule, MatIconModule, PraxisDynamicForm],
  templateUrl: './ui-wrappers-test.component.html',
  styleUrl: './ui-wrappers-test.component.scss',
})
export class UiWrappersTestComponent {
  protected readonly resourcePath = apiRoutes.uiWrappersTest
    .replace(apiRoutes.apiBase, '')
    .replace(/^\/+/g, '');
}
