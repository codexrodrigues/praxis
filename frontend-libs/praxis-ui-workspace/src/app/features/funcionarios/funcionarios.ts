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

  onRowClick(event: { row: any }): void {
    if (event?.row?.id != null) {
      this.router.navigate(['/funcionarios/view', event.row.id]);
    }
  }
}
