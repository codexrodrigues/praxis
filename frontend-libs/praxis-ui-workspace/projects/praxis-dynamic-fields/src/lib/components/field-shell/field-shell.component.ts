import {
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FieldMetadata } from '@praxis/core';

@Component({
  selector: 'praxis-field-shell',
  standalone: true,
  template: `
    <ng-container *ngIf="itemTemplate; else plain">
      <ng-container
        [ngTemplateOutlet]="itemTemplate"
        [ngTemplateOutletContext]="{ field: field, index: index }"
      ></ng-container>
    </ng-container>
    <ng-template #plain></ng-template>
    <ng-container #insertionPoint></ng-container>
  `,
})
export class FieldShellComponent {
  @Input() field!: FieldMetadata;
  @Input() index!: number;
  @Input() itemTemplate?: TemplateRef<any>;
  @ViewChild('insertionPoint', { read: ViewContainerRef, static: true })
  vc!: ViewContainerRef;
}
