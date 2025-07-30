import { Component, Input } from '@angular/core';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FieldMetadata } from '@praxis/core';

@Component({
  selector: 'praxis-field-configurator',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div cdkDrag>{{ field.name }}</div>
  `,
})
export class FieldConfiguratorComponent {
  @Input() field!: FieldMetadata;
}
