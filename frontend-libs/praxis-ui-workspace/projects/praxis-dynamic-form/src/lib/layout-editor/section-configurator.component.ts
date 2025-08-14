import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { RowConfiguratorComponent } from './row-configurator.component';
import { FormSection, FormRow, FieldMetadata } from '@praxis/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'praxis-section-configurator',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    RowConfiguratorComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  template: `
    <mat-card class="section-card" cdkDrag>
      <mat-card-header>
        <mat-card-title>
          <mat-form-field>
            <mat-label>Título da Seção</mat-label>
            <input matInput [(ngModel)]="section.title" (ngModelChange)="onSectionUpdated()" />
          </mat-form-field>
        </mat-card-title>
        <button mat-icon-button (click)="onRemoveSection()">
          <mat-icon>delete</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field class="full-width">
          <mat-label>Descrição da Seção</mat-label>
          <textarea matInput [(ngModel)]="section.description" (ngModelChange)="onSectionUpdated()"></textarea>
        </mat-form-field>

        <h5>Linhas</h5>
        <div class="row-list" cdkDropList [cdkDropListData]="section.rows" (cdkDropListDropped)="dropRow($event)">
          <praxis-row-configurator *ngFor="let row of section.rows; let i = index"
            [row]="row"
            [fieldMetadata]="fieldMetadata"
            (rowChange)="onRowUpdated(i, $event)"
            (remove)="removeRow(i)"
            cdkDrag
          ></praxis-row-configurator>
        </div>
        <button mat-stroked-button (click)="addRow()">
          <mat-icon>add</mat-icon> Adicionar Linha
        </button>
      </mat-card-content>
    </mat-card>
  `,
})
export class SectionConfiguratorComponent {
  @Input() section!: FormSection;
  @Input() allSections: FormSection[] = [];
  @Input() fieldMetadata: FieldMetadata[] = [];
  @Output() sectionChange = new EventEmitter<FormSection>();
  @Output() remove = new EventEmitter<void>();

  dropRow(event: CdkDragDrop<FormRow[]>) {
    const rows = [...this.section.rows];
    if (event.previousContainer === event.container) {
      moveItemInArray(rows, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.onSectionUpdated({ rows });
  }

  addRow(): void {
    const newRow: FormRow = { columns: [{ fields: [] }] };
    const rows = [...this.section.rows, newRow];
    this.onSectionUpdated({ rows });
  }

  removeRow(index: number): void {
    const rows = [...this.section.rows];
    rows.splice(index, 1);
    this.onSectionUpdated({ rows });
  }

  onRowUpdated(index: number, updatedRow: FormRow): void {
    const rows = [...this.section.rows];
    rows[index] = updatedRow;
    this.onSectionUpdated({ rows });
  }

  onSectionUpdated(changes: Partial<FormSection> = {}): void {
    this.sectionChange.emit({
      ...this.section,
      ...changes
    });
  }

  onRemoveSection(): void {
    this.remove.emit();
  }
}
