import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { RowConfiguratorComponent } from './row-configurator.component';
import { FieldsetLayout, FormRowLayout } from '@praxis/core';

@Component({
  selector: 'praxis-fieldset-configurator',
  standalone: true,
  imports: [CommonModule, DragDropModule, RowConfiguratorComponent],
  template: `
    <div class="fieldset" cdkDropList [cdkDropListData]="fieldset.rows" (cdkDropListDropped)="dropRow($event)">
      <h4>{{ fieldset.title }}</h4>
      <praxis-row-configurator *ngFor="let row of fieldset.rows" [row]="row" cdkDrag></praxis-row-configurator>
    </div>
  `,
})
export class FieldsetConfiguratorComponent {
  @Input() fieldset!: FieldsetLayout;
  @Input() allFieldsets: FieldsetLayout[] = [];
  @Output() fieldsetChange = new EventEmitter<FieldsetLayout>();

  dropRow(event: CdkDragDrop<FormRowLayout[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.fieldset.rows, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.fieldsetChange.emit(this.fieldset);
  }
}
