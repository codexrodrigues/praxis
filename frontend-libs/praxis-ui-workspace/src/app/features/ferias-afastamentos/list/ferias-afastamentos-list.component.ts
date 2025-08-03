import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PraxisTable } from '@praxis/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ferias-afastamentos-list',
  standalone: true,
  imports: [MatCardModule, MatIconModule, PraxisTable],
  templateUrl: './ferias-afastamentos-list.component.html',
  styleUrl: './ferias-afastamentos-list.component.scss',
})
export class FeriasAfastamentosListComponent {
  constructor(private router: Router) {}

  onRowClick(event: any): void {
    if (event?.row?.id != null) {
      this.router.navigate(['/ferias-afastamentos/view', event.row.id]);
    } else if (event?.id != null) {
      this.router.navigate(['/ferias-afastamentos/view', event.id]);
    }
  }

  onRowAction(event: { action: string; row: any }): void {
    switch (event.action) {
      case 'view':
      case 'edit':
        this.router.navigate(['/ferias-afastamentos/view', event.row.id]);
        break;
      case 'delete':
        // TODO: implementar chamada de deleção
        break;
    }
  }
}
