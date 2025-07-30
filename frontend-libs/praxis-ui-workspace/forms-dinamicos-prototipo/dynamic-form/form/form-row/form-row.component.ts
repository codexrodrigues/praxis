// src/app/funcionalidades/form-field-drag/row-item/row-item.component.ts
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {FormRowHeaderComponent} from '../form-row-header/form-row-header.component';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';
import {FieldItemComponent} from '../field-item/field-item.component';
import {ResizableDirective} from '../../../directives/resizable';
import {FieldMetadata} from '../../../models/field-metadata.model';
import {animate, query, stagger, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'row',
  templateUrl: './form-row.component.html',
  standalone: true,
  imports: [
    FormRowHeaderComponent,
    CdkDropList,
    NgStyle,
    FieldItemComponent,
    NgForOf,
    NgIf,
    CdkDrag,
    NgClass,
    ResizableDirective
  ],
  styleUrls: ['./form-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fieldAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px) scale(0.95)' }),
          stagger('60ms', [
            animate('0.35s cubic-bezier(0.35, 0, 0.25, 1)',
              style({ opacity: 1, transform: 'translateY(0) scale(1)' })
            )
          ])
        ], { optional: true }),
      ])
    ])
  ]
})
export class FormRowComponent {
  @Input() row: any;
  @Input() fieldset: any;
  @Input() rowIndex: number = 0;
  @Input() editMode: boolean = false;
  @Input() formGroup: FormGroup = new FormGroup({});

  @Input() connectedItemsDropLists: string[] = [];

  @Output() toggleRowOrientation = new EventEmitter<any>();
  @Output() addRow = new EventEmitter<any>();
  @Output() removeRow = new EventEmitter<any>();
  @Output() fieldDropped = new EventEmitter<CdkDragDrop<any[]>>();

  // Output event for field removal with complete context
  @Output() fieldRemoved = new EventEmitter<{field: FieldMetadata, rowId: string}>();

  onFieldDrop(event: CdkDragDrop<any[]>) {
    this.fieldDropped.emit(event);
  }

  getVisibleFields(fields: FieldMetadata[]): FieldMetadata[] {
    if (!fields) return [];
    return fields.filter(field => (!field.formHidden) && (!field.hidden));
  }

  // Adicione um novo método para gerenciar o redimensionamento
  onFieldResize(dimensions: {width: string, height: string}, field: FieldMetadata): void {
    // Atualize o metadado do campo com as novas dimensões
    field.width = dimensions.width;

    // Se você quiser persistir a altura também, adicione um campo height no FieldMetadata
    // e atualize aqui
    // field.height = dimensions.height;

    console.log(`Campo ${field.name} redimensionado: ${dimensions.width} x ${dimensions.height}`);
  }

}
