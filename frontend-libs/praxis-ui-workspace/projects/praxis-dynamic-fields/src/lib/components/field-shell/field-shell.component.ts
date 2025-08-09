import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldMetadata } from '@praxis/core';

/**
 * Internal wrapper used by {@link DynamicFieldLoaderDirective}.
 *
 * Provides an insertion point (`vc`) where the resolved field component is
 * created and optionally wraps it with a host-provided `itemTemplate` that can
 * project additional chrome around the field.
 */
@Component({
  selector: 'praxis-field-shell',
  standalone: true,
  imports: [CommonModule],
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
  /** Metadata for the dynamic field being rendered. */
  @Input() field!: FieldMetadata;

  /** Index position of the field within the directive's list. */
  @Input() index!: number;

  /**
   * Host wrapper template. Receives `field`, `index` and a `content` template
   * that projects the actual field component.
   */
  @Input()
  itemTemplate?: TemplateRef<{
    field: FieldMetadata;
    index: number;
    content: TemplateRef<any>;
  }>;

  /** View container used as the insertion point for the field component. */
  @ViewChild('insertionPoint', { read: ViewContainerRef, static: true })
  vc!: ViewContainerRef;
}
