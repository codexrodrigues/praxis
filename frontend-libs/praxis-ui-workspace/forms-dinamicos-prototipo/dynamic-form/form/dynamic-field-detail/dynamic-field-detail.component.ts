import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogService } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { KENDO_LAYOUT } from '@progress/kendo-angular-layout';
import { FieldMetadataEditorComponent } from '../../field-configurator/field-metadata-editor/field-metadata-editor.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { FormsModule } from '@angular/forms';
import { KENDO_LISTBOX, ListBoxComponent, ListBoxSelectionEvent } from "@progress/kendo-angular-listbox";
import { FieldsetConfig } from '../../fieldset-configurator/fieldset-configurator/fieldset-configurator.component';
import { RowConfig } from '../../row-configurator/row-configurator/row-configurator.component';
import { KENDO_TOOLTIPS } from "@progress/kendo-angular-tooltip";
import { KENDO_BUTTONS } from "@progress/kendo-angular-buttons";
import { UpdatedFieldSets } from './models/updated-fieldsets';
import { UpdatedFieldSet } from './models/updated-fieldset';
import { UpdatedRow } from './models/updated-row';
import { FieldMetadata } from '../../../models/field-metadata.model';
import { FieldsetLayout } from '../../../models/form-layout.model';

@Component({
  selector: 'th-dynamic-field-detail',
  templateUrl: './dynamic-field-detail.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropDownsModule,
    InputsModule,
    KENDO_LAYOUT,
    FormsModule,
    KENDO_LISTBOX,
    LabelModule,
    ButtonsModule,
    KENDO_TOOLTIPS,
    KENDO_BUTTONS],
  styleUrl: './dynamic-field-detail.component.css'
})
export class DynamicFieldDetailComponent implements OnInit {
  // Usar esse input para edição de formulários onde pode ter múltiplos fieldsets
  @Input() fieldsets?: FieldsetLayout[];

  // Usar esse input para edição de fieldset onde tem apenas um fieldset
  @Input() fieldset?: FieldsetConfig;

  // Usar esse input para edição de linha onde tem apenas uma linha
  @Input() row?: RowConfig;

  // Eventos de alterações
  @Output() fieldsetsChange = new EventEmitter<UpdatedFieldSets>();
  @Output() fieldsetChange = new EventEmitter<UpdatedFieldSet>();
  @Output() rowChange = new EventEmitter<UpdatedRow>();

  @ViewChild('listBox') listBoxComponent?: ListBoxComponent;

  // Variáveis de controle dos forms
  forms!: FormArray;
  selectedIndex: number | null = null;
  filteredFields: FormGroup[] = [];

  // Variáveis de controle dos filtros
  filterAll = true;
  filterRequired = false;
  filterVisible = false;
  filterReadOnly = false;

  // Variáveis para a listbox
  textField = 'label';
  toolbar = { tools: [] };
  noDataText = 'Nenhum campo encontrado.';

  get formFields(): FormGroup[] {
    return this.forms.controls as FormGroup[];
  }

  get selectedFormGroup(): FormGroup {
    if (this.selectedIndex !== null && this.filteredFields[this.selectedIndex]) {
      return this.filteredFields[this.selectedIndex];
    }

    // Retorno default vazio
    return this.fb.group({
      name: [''],
      label: [''],
      required: [false],
      readOnly: [false],
      visible: [false],
    });
  }

  get listBoxData(): any[] {
    return this.filteredFields.map((field) => field.getRawValue());
  }

  constructor(private fb: FormBuilder, private dialogService: DialogService) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    // Determina a origem dos campos
    let fields: FieldMetadata[] = [];

    // Verifica se é uma edição de múltiplos fieldsets
    if (this.fieldsets?.length) {
      this.fieldsets.forEach((fs) => {
        fs.rows?.forEach((row) => {
          fields.push(...row.fields);
        });
      });
    }
    // Verifica se é uma edição de apenas um fieldset
    else if (this.fieldset?.rows?.length) {
      this.fieldset.rows.forEach((row) => {
        fields.push(...row.fields);
      });
    }
    // Verifica se é uma edição de apenas uma linha
    else if (this.row?.fields?.length) {
      fields = [...this.row.fields];
    }

    // Cria os form groups com base nos fields encontrados
    const groups = fields.map((field) => this.buildFieldFormGroup(field));

    this.forms = this.fb.array(groups);
    this.applyFilters();

    console.table(this.forms)

    // Garante que cada alteração será disparada
    this.forms.valueChanges.subscribe(() => {
      this.emitAllFields();
    });
  }

  applyFilters(): void {
    this.selectedIndex = null;
    this.listBoxComponent?.clearSelection();

    this.filteredFields = this.filterAll
      ? [...this.formFields]
      : this.formFields.filter((field) => {
          return (
            field.get('required')?.value === this.filterRequired &&
            field.get('visible')?.value === this.filterVisible &&
            field.get('readOnly')?.value === this.filterReadOnly
          );
        });
  }

  onFilterChange(changed: 'all' | 'required' | 'visible' | 'readOnly'): void {
    if (changed === 'all') {
      if (this.filterAll) {
        // Marca "Todos", desmarca os demais
        this.filterRequired = false;
        this.filterVisible = false;
        this.filterReadOnly = false;
      } else {
        // Se desmarcar "Todos", ativa "Visível" como default
        this.filterVisible = true;
      }
    } else {
      // Qualquer filtro individual foi alterado → desmarcar "Todos"
      this.filterAll = false;

      // Se todos os individuais estão desmarcados, ativa "Todos" novamente
      const noneSelected =
        !this.filterRequired && !this.filterVisible && !this.filterReadOnly;
      if (noneSelected) {
        this.filterAll = true;
      }
    }

    this.applyFilters();
  }

  openSettings(event: MouseEvent, index: number): void {
    event.stopPropagation();

    console.table(this.filteredFields[index])

    const fieldControl = this.filteredFields[index]; // FormGroup do campo
    const field = fieldControl.getRawValue(); // FieldMetadata

    this.openFieldWizardDialog(field, fieldControl);
  }

  openFieldWizardDialog(field: FieldMetadata, formGroup: FormGroup): void {
    const dialogRef = this.dialogService.open({
      title: 'Configurações do Field',
      content: FieldMetadataEditorComponent,
    });

    const componentInstance = dialogRef.content.instance;
    componentInstance.fieldMetadata = field;

    componentInstance.result.subscribe((dialogResult: FieldMetadata | null) => {
      const result = dialogResult as FieldMetadata | null;
      if (result) {
        // Atualiza objeto original
        Object.assign(field, result);
        // Atualiza o FormGroup com novos valores
        Object.keys(result).forEach((key) => {
          if (formGroup.contains(key)) {
            formGroup.get(key)?.setValue((result as any)[key]);
          }
        });
      }
    });
  }

  onListBoxSelection(event: ListBoxSelectionEvent): void {
    const index = event.index;

    if (index >= 0 && index < this.filteredFields.length) {
      this.selectedIndex = index;

      const labelControl = this.selectedFormGroup.get('label');
      if (labelControl && !labelControl.validator) {
        labelControl.setValidators(Validators.required);
        labelControl.updateValueAndValidity();
      }
    } else {
      this.selectedIndex = null;
    }
  }

  private emitAllFields(): void {
    const updatedFields: FieldMetadata[] = this.formFields.map((field) => {
      const raw = field.getRawValue();
      // Recalcula hidden com base no campo visible do form
      raw.hidden = !raw.visible;
      delete raw.visible;
      return raw;
    });

    const isValid = this.forms.valid;

    if (this.fieldsets?.length) { // Emite evento fieldSets Change
      const updatedFieldsets = this.fieldsets.map(fieldset => ({
        ...fieldset,
        rows: fieldset.rows?.map((row) => ({
          ...row,
          fields: row.fields.map((field) => {
            const updated = updatedFields.find((f) => f.name === field.name);
            return updated ? { ...field, ...updated } : field;
          }),
        })),
      }));
      this.fieldsetsChange.emit(new UpdatedFieldSets(updatedFieldsets, isValid));
    } else if (this.fieldset) { // Emite evento fieldSet Change
      const updatedFieldset: FieldsetConfig = {
        ...this.fieldset,
        rows: this.fieldset.rows?.map((row) => ({
          ...row,
          fields: (row.fields as FieldMetadata[]).map((field) => {
            const updated = updatedFields.find((f) => f.name === field.name);
            return updated ? { ...field, ...updated } : field;
          }),
        })),
      };
      this.fieldsetChange.emit(new UpdatedFieldSet(updatedFieldset, isValid));
    } else if (this.row) { // Emite evento Row Change
      const updatedRow: RowConfig = {
        ...this.row,
        fields: (this.row.fields as FieldMetadata[]).map((field) => {
          const updated = updatedFields.find((f) => f.name === field.name);
          return updated ? { ...field, ...updated } : field;
        }),
      };
      this.rowChange.emit(new UpdatedRow(updatedRow, isValid));
    }
  }

  private buildFieldFormGroup(field: FieldMetadata): FormGroup {
    const group: { [key: string]: any } = {};

    Object.entries(field).forEach(([key, value]) => {
      if (typeof value !== 'function') {
        // Apenas "name" e "label" são required
        if (key === 'name' || key === 'label') {
          group[key] = [value ?? null, Validators.required];
        } else {
          group[key] = [value ?? null];
        }
      }
    });

    // Converte `hidden` em `visible` para o form
    group['visible'] = [!field.hidden];

    return this.fb.group(group);
  }
}
