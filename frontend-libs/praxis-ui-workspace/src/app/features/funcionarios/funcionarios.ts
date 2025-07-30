import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PraxisTable } from '@praxis/table';

@Component({
  selector: 'app-funcionarios',
  imports: [
    PraxisTable
  ],
  templateUrl: './funcionarios.html',
  styleUrl: './funcionarios.scss'
})
export class Funcionarios {
  constructor(private router: Router) {}

  onRowClick(event: any): void {
    // Temporário: aceitar qualquer tipo de evento até que o PraxisTable seja corrigido
    if (event?.row?.id != null) {
      this.router.navigate(['/funcionarios/view', event.row.id]);
    } else if (event?.id != null) {
      // Fallback se o evento vier diretamente com o objeto
      this.router.navigate(['/funcionarios/view', event.id]);
    }
  }

  onRowAction(event: {action: string, row: any}): void {
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

  onToolbarAction(event: {action: string}): void {
    if (event.action === 'add') {
      this.router.navigate(['/funcionarios/view', 'new']);
    }
  }
}
