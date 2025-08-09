import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PraxisTable } from '@praxis/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GenericCrudService, ApiEndpoint } from '@praxis/core';

@Component({
  selector: 'app-funcionarios-list',
  standalone: true,
  imports: [MatCardModule, MatIconModule, PraxisTable],
  providers: [GenericCrudService],
  templateUrl: './funcionarios-list.component.html',
  styleUrl: './funcionarios-list.component.scss',
})
export class FuncionariosListComponent {
  constructor(
    private router: Router,
    private crudService: GenericCrudService<any>,
  ) {
    this.crudService.configure('funcionarios', ApiEndpoint.HumanResources);
  }

  onRowClick(event: any): void {
    // Temporário: aceitar qualquer tipo de evento até que o PraxisTable seja corrigido
    if (event?.row?.id != null) {
      this.router.navigate(['/funcionarios/view', event.row.id]);
    } else if (event?.id != null) {
      // Fallback se o evento vier diretamente com o objeto
      this.router.navigate(['/funcionarios/view', event.id]);
    }
  }

  onRowAction(event: { action: string; row: any }): void {
    switch (event.action) {
      case 'view':
        this.router.navigate(['/funcionarios/view', event.row.id]);
        break;
      case 'edit':
        this.router.navigate(['/funcionarios/view', event.row.id]);
        break;
      case 'delete':
        // TODO: implementar chamada de deleção
        break;
    }
  }
}
