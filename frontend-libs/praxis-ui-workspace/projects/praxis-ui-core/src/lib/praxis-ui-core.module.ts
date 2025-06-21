import { NgModule } from '@angular/core';
import { DynamicFormModule } from './dynamic-form/dynamic-form.module';
import { DynamicGridModule } from './dynamic-grid/dynamic-grid.module';

@NgModule({
  exports: [DynamicFormModule, DynamicGridModule]
})
export class PraxisUiCoreModule {}
