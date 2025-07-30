import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FieldConfiguratorComponent } from './field-configurator.component';
import { FormRowLayout } from '@praxis/core';

@Component({
  selector: 'praxis-row-configurator',
  standalone: true,
  imports: [CommonModule, DragDropModule, FieldConfiguratorComponent],
  template: `
    <div cdkDropList (cdkDropListDropped)="drop($event)">
      <praxis-field-configurator *ngFor="let field of row.fields" [field]="field" cdkDrag></praxis-field-configurator>
    </div>
  `,
})
export class RowConfiguratorComponent {
  @Input() row!: FormRowLayout;
  @Output() rowChange = new EventEmitter<FormRowLayout>();

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.row.fields, event.previousIndex, event.currentIndex);
    this.rowChange.emit(this.row);
  }
}
