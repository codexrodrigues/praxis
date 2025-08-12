import { Component } from '@angular/core';
import { PraxisCrudComponent, CrudMetadata } from '@praxis/crud';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GenericCrudService, ApiEndpoint } from '@praxis/core';

const metadata: CrudMetadata = {
  component: 'praxis-crud',
  resource: { path: 'cargos', idField: 'id', endpointKey: ApiEndpoint.HumanResources },
  table: {
    columns: [],
    actions: {
      row: {
        enabled: true,
        actions: [
          { id: 'view', label: 'Visualizar', action: 'view', icon: 'visibility' },
          { id: 'edit', label: 'Editar', action: 'edit', icon: 'edit' },
        ],
      },
      toolbar: {
        enabled: true,
        actions: [
          { id: 'create', label: 'Adicionar', action: 'create', icon: 'add' },
        ],
      },
    },
    resourcePath: 'cargos',
  } as any,
  actions: [
    {
      id: 'view',
      label: 'Visualizar',
      action: 'view',
      openMode: 'route',
      route: '/cargos/view/:id',
      params: [{ from: 'id', to: 'routeParam', name: 'id' }],
    },
    {
      id: 'edit',
      label: 'Editar',
      action: 'edit',
      openMode: 'modal',
      formId: 'cargos-edit',
      params: [{ from: 'id', to: 'input', name: 'id' }],
    },
    {
      id: 'create',
      label: 'Adicionar',
      action: 'create',
      openMode: 'modal',
      formId: 'cargos-create',
    },
  ],
  defaults: {
    openMode: 'modal',
    modal: { width: '880px', maxWidth: '95vw' },
  },
};

@Component({
  selector: 'app-cargos-crud',
  standalone: true,
  imports: [MatCardModule, MatIconModule, PraxisCrudComponent],
  providers: [GenericCrudService],
  templateUrl: './cargos-crud.component.html',
  styleUrls: ['./cargos-crud.component.scss'],
})
export class CargosCrudComponent {
  metadata = metadata;

  constructor(private crudService: GenericCrudService<any>) {
    this.crudService.configure('cargos', ApiEndpoint.HumanResources);
  }
}

