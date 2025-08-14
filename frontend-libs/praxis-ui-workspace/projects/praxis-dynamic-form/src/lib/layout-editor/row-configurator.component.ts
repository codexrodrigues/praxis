import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FieldConfiguratorComponent } from './field-configurator.component';
import {
  FormRow,
  FormColumn,
  FieldMetadata,
  FieldControlType,
} from '@praxis/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'praxis-row-configurator',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    FieldConfiguratorComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="row-container">
      <div class="row">
        <div
          *ngFor="let column of row.columns; let i = index"
          class="column"
          [id]="'column-' + i"
          cdkDropList
          [cdkDropListData]="column.fields"
          (cdkDropListDropped)="drop($event)"
        >
          <praxis-field-configurator
            *ngFor="let fieldName of column.fields"
            [field]="getFieldByName(fieldName)"
            cdkDrag
          ></praxis-field-configurator>
          <button
            mat-icon-button
            (click)="removeColumn(i)"
            class="remove-column-btn"
          >
            <mat-icon>delete_forever</mat-icon>
          </button>
        </div>
      </div>
      <div class="row-actions">
        <button mat-icon-button (click)="addColumn()">
          <mat-icon>add</mat-icon>
        </button>
        <button mat-icon-button color="warn" (click)="removeRow()">
          <mat-icon>delete</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .row-container {
        display: flex;
        align-items: center;
      }
      .row {
        display: flex;
        flex-grow: 1;
      }
      .column {
        flex: 1;
        border: 1px dashed #ccc;
        margin: 4px;
        padding: 4px;
        min-height: 50px;
      }
      .row-actions {
        display: flex;
        flex-direction: column;
      }
    `,
  ],
})
export class RowConfiguratorComponent {
  @Input() row!: FormRow;
  @Input() fieldMetadata: FieldMetadata[] = [];
  @Output() rowChange = new EventEmitter<FormRow>();
  @Output() remove = new EventEmitter<void>();

  getFieldByName(fieldName: string): FieldMetadata {
    return (
      this.fieldMetadata.find((f) => f.name === fieldName) || {
        name: fieldName,
        label: fieldName,
        controlType: FieldControlType.INPUT,
      }
    );
  }

  drop(event: CdkDragDrop<string[], any, string>) {
    const columns = this.row.columns.map((c) => ({
      ...c,
      fields: [...c.fields],
    }));
    const previousColumnIndex = this.getColumnIndex(event.previousContainer.id);
    const currentColumnIndex = this.getColumnIndex(event.container.id);

    if (event.previousContainer === event.container) {
      moveItemInArray(
        columns[currentColumnIndex].fields,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        columns[previousColumnIndex].fields,
        columns[currentColumnIndex].fields,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.rowChange.emit({ ...this.row, columns });
  }

  addColumn(): void {
    const columns = [...this.row.columns, { fields: [] }];
    this.rowChange.emit({ ...this.row, columns });
  }

  removeColumn(index: number): void {
    const columns = [...this.row.columns];
    columns.splice(index, 1);
    this.rowChange.emit({ ...this.row, columns });
  }

  removeRow(): void {
    this.remove.emit();
  }

  private getColumnIndex(containerId: string): number {
    const match = containerId.match(/column-(\d+)/);
    return match ? parseInt(match[1], 10) : -1;
  }
}
