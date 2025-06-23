import { Component } from '@angular/core';
import {GenericCrudService, PraxisCore} from '@praxis/core';

@Component({
  selector: 'praxis-table',
  imports: [
    PraxisCore
  ],
  template: `
    <praxis-praxis-core></praxis-praxis-core>
  `,
  styles: ``,
  providers: [GenericCrudService],
})
export class PraxisTable {

  funcionarios: any[] = [];

  constructor(service: GenericCrudService<any>) {
    console.log('PraxisTable component initialized');
    service.configure("funcionarios");
    service.getAll().subscribe({
      next: (response) => {
        this.funcionarios = response || [];
        console.log('Funcionários carregados:', this.funcionarios);
      },
      error: (erro) => {
        console.error('Erro ao carregar funcionários:', erro);
      },
      complete: () => {
        console.log('Consulta de funcionários finalizada');
      }
    });
  }


}
