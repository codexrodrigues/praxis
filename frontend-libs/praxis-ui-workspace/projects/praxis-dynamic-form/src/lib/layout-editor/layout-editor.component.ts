import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  FormConfig,
  FormSection,
  FormRow,
  FormColumn,
  FieldMetadata,
} from '@praxis/core';
import { SectionConfiguratorComponent } from './section-configurator.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FieldConfiguratorComponent } from './field-configurator.component';

@Component({
  selector: 'praxis-layout-editor',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    SectionConfiguratorComponent,
    FieldConfiguratorComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="layout-editor-wrapper" cdkDropListGroup>
      <div class="available-fields">
        <h4>Campos Disponíveis</h4>
        <div
          cdkDropList
          id="available-fields-list"
          [cdkDropListData]="availableFields"
          class="field-list"
        >
          <praxis-field-configurator
            *ngFor="let field of availableFields"
            [field]="field"
            cdkDrag
          ></praxis-field-configurator>
        </div>
      </div>
      <div class="layout-canvas">
        <button mat-raised-button color="primary" (click)="addSection()">
          <mat-icon>add</mat-icon>
          Adicionar Seção
        </button>
        <div
          cdkDropList
          [cdkDropListData]="config.sections"
          (cdkDropListDropped)="dropSection($event)"
          class="section-list"
        >
          <praxis-section-configurator
            *ngFor="let section of config.sections; let i = index"
            [section]="section"
            [allSections]="config.sections"
            [fieldMetadata]="config.fieldMetadata || []"
            (remove)="removeSection(i)"
            (sectionChange)="onSectionUpdated(i, $event)"
            cdkDrag
          ></praxis-section-configurator>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .layout-editor-wrapper {
        display: flex;
        gap: 16px;
      }
      .available-fields {
        width: 250px;
        border: 1px solid #ccc;
        padding: 8px;
      }
      .layout-canvas {
        flex-grow: 1;
      }
      .field-list {
        min-height: 100px;
      }
    `,
  ],
})
export class LayoutEditorComponent {
  @Input() config!: FormConfig;
  @Output() configChange = new EventEmitter<FormConfig>();

  get availableFields(): FieldMetadata[] {
    if (!this.config || !this.config.fieldMetadata || !this.config.sections) {
      return [];
    }
    const placedFieldNames = new Set<string>();
    this.config.sections.forEach((s: FormSection) => {
      s.rows.forEach((r: FormRow) => {
        r.columns.forEach((c: FormColumn) => {
          c.fields.forEach((f: string) => placedFieldNames.add(f));
        });
      });
    });
    return this.config.fieldMetadata.filter(
      (f) => !placedFieldNames.has(f.name),
    );
  }

  dropSection(event: CdkDragDrop<FormSection[]>) {
    const sections = [...this.config.sections];
    if (event.previousContainer === event.container) {
      moveItemInArray(sections, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.emitNewConfig({ sections });
  }

  addSection(): void {
    const newSection: FormSection = {
      id: `section_${Date.now()}`,
      title: 'Nova Seção',
      rows: [],
    };
    const sections = [...this.config.sections, newSection];
    this.emitNewConfig({ sections });
  }

  removeSection(index: number): void {
    const sections = [...this.config.sections];
    sections.splice(index, 1);
    this.emitNewConfig({ sections });
  }

  onSectionUpdated(index: number, updatedSection: FormSection): void {
    const sections = [...this.config.sections];
    sections[index] = updatedSection;
    this.emitNewConfig({ sections });
  }

  private emitNewConfig(configChanges: Partial<FormConfig>): void {
    const newConfig: FormConfig = {
      ...this.config,
      ...configChanges,
    };
    this.configChange.emit(newConfig);
  }
}
