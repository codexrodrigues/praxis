import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PraxisTableComponent } from './praxis-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { GenericCrudService } from '@praxis/core';

@NgModule({
  declarations: [PraxisTableComponent],
  imports: [CommonModule, MatTableModule, MatPaginatorModule],
  exports: [PraxisTableComponent],
  providers: [GenericCrudService]
})
export class PraxisTableModule {}
