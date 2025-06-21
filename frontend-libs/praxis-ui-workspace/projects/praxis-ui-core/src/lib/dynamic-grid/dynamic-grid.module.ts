import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicGridComponent } from './dynamic-grid.component';

@NgModule({
  declarations: [DynamicGridComponent],
  imports: [CommonModule],
  exports: [DynamicGridComponent]
})
export class DynamicGridModule {}
