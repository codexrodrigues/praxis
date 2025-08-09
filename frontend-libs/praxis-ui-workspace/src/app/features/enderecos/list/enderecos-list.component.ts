import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PraxisTable } from '@praxis/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GenericCrudService, ApiEndpoint } from '@praxis/core';

@Component({
  selector: 'app-enderecos-list',
  standalone: true,
  imports: [MatCardModule, MatIconModule, PraxisTable],
  providers: [GenericCrudService],
  templateUrl: './enderecos-list.component.html',
  styleUrl: './enderecos-list.component.scss',
})
export class EnderecosListComponent {
  constructor(
    private router: Router,
    private crudService: GenericCrudService<any>,
  ) {
    this.crudService.configure('enderecos', ApiEndpoint.HumanResources);
  }

  onRowClick(event: any): void {
    if (event?.row?.id != null) {
      this.router.navigate(['/enderecos/view', event.row.id]);
    } else if (event?.id != null) {
      this.router.navigate(['/enderecos/view', event.id]);
    }
  }

  onRowAction(event: { action: string; row: any }): void {
    switch (event.action) {
      case 'view':
      case 'edit':
        this.router.navigate(['/enderecos/view', event.row.id]);
        break;
      case 'delete':
        // TODO: implementar chamada de deleção
        break;
    }
  }
}
