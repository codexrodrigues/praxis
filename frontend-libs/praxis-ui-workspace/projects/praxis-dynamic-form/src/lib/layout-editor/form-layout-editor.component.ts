import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormLayout, FieldsetLayout } from '@praxis/core';
import { FieldsetConfiguratorComponent } from './fieldset-configurator.component';

@Component({
  selector: 'praxis-form-layout-editor',
  standalone: true,
  imports: [CommonModule, DragDropModule, FieldsetConfiguratorComponent],
  template: `
    <div class="layout-editor" cdkDropListGroup>
      <div cdkDropList [cdkDropListData]="layout.fieldsets" (cdkDropListDropped)="dropFieldset($event)" class="fieldset-list">
        <praxis-fieldset-configurator *ngFor="let fs of layout.fieldsets" [fieldset]="fs" [allFieldsets]="layout.fieldsets" cdkDrag></praxis-fieldset-configurator>
      </div>
    </div>
  `,
})
export class FormLayoutEditorComponent {
  @Input() layout!: FormLayout;
  @Output() layoutChange = new EventEmitter<FormLayout>();

  dropFieldset(event: CdkDragDrop<FieldsetLayout[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.layout.fieldsets, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.layoutChange.emit(this.layout);
  }
}
