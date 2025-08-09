import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PraxisTable } from '@praxis/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GenericCrudService, ApiEndpoint } from '@praxis/core';

@Component({
  selector: 'app-folhas-pagamento-list',
  standalone: true,
  imports: [MatCardModule, MatIconModule, PraxisTable],
  providers: [GenericCrudService],
  templateUrl: './folhas-pagamento-list.component.html',
  styleUrl: './folhas-pagamento-list.component.scss',
})
export class FolhasPagamentoListComponent {
  constructor(
    private router: Router,
    private crudService: GenericCrudService<any>,
  ) {
    this.crudService.configure('folhas-pagamento', ApiEndpoint.HumanResources);
  }

  onRowClick(event: any): void {
    if (event?.row?.id != null) {
      this.router.navigate(['/folhas-pagamento/view', event.row.id]);
    } else if (event?.id != null) {
      this.router.navigate(['/folhas-pagamento/view', event.id]);
    }
  }

  onRowAction(event: { action: string; row: any }): void {
    switch (event.action) {
      case 'view':
      case 'edit':
        this.router.navigate(['/folhas-pagamento/view', event.row.id]);
        break;
      case 'delete':
        // TODO: implementar chamada de deleção
        break;
    }
  }
}
