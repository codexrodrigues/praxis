import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PraxisTable } from '@praxis/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-eventos-folha-list',
  standalone: true,
  imports: [MatCardModule, MatIconModule, PraxisTable],
  templateUrl: './eventos-folha-list.component.html',
  styleUrl: './eventos-folha-list.component.scss',
})
export class EventosFolhaListComponent {
  constructor(private router: Router) {}

  onRowClick(event: any): void {
    if (event?.row?.id != null) {
      this.router.navigate(['/eventos-folha/view', event.row.id]);
    } else if (event?.id != null) {
      this.router.navigate(['/eventos-folha/view', event.id]);
    }
  }

  onRowAction(event: { action: string; row: any }): void {
    switch (event.action) {
      case 'view':
      case 'edit':
        this.router.navigate(['/eventos-folha/view', event.row.id]);
        break;
      case 'delete':
        // TODO: implementar chamada de deleção
        break;
    }
  }
}
