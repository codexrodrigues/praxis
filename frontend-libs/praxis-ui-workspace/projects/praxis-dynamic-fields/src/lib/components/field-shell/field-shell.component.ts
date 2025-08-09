import {
  ChangeDetectionStrategy,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #contentTpl>
      <ng-container #insertionPoint></ng-container>
    </ng-template>

    <ng-container *ngIf="itemTemplate; else defaultTpl">
      <ng-container
        [ngTemplateOutlet]="itemTemplate"
        [ngTemplateOutletContext]="{
          field: field,
          index: index,
          content: contentTpl,
        }"
      ></ng-container>
    </ng-container>

    <ng-template #defaultTpl>
      <ng-container [ngTemplateOutlet]="contentTpl"></ng-container>
    </ng-template>
  `,
})
export class FieldShellComponent {
  @Input() field!: FieldMetadata;
  @Input() index!: number;
  @Input()
  itemTemplate?: TemplateRef<{
    field: FieldMetadata;
    index: number;
    content: TemplateRef<any>;
  }>;

  @ViewChild('insertionPoint', { read: ViewContainerRef, static: true })
  vc!: ViewContainerRef;
}
