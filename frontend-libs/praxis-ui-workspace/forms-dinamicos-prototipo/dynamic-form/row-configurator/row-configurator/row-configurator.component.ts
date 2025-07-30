import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  CardActionsComponent,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  CardSubtitleDirective,
  CardTitleDirective,
  TabContentDirective,
  TabStripComponent,
  TabStripTabComponent
} from '@progress/kendo-angular-layout';
import { ButtonComponent } from '@progress/kendo-angular-buttons';
import { DialogComponent, DialogRef } from '@progress/kendo-angular-dialog';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { DynamicFormGroupService } from '../../../services/dynamic-form-group.service';
import { FieldMetadata } from '../../../models/field-metadata.model';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FormContextService } from '../../services/form-context.service';
import { ConditionBuilderComponent } from '../../field-configurator/condition-builder/condition-builder.component';
import { DynamicFieldDetailComponent } from '../../form/dynamic-field-detail/dynamic-field-detail.component';
import { UpdatedRow } from '../../form/dynamic-field-detail/models/updated-row';

// Interface para representar a configuração de uma linha
export interface RowConfig {
  id: string;
  name?: string;
  label?: string;
  orientation: 'horizontal' | 'vertical';
  fields: FieldMetadata[];
  hiddenCondition?: CompositeFilterDescriptor;
  visibilityCondition?: CompositeFilterDescriptor;
  // Outras propriedades específicas de row que possam ser necessárias
}

@Component({
  selector: 'row-configurator',
  templateUrl: './row-configurator.component.html',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    // Kendo Layout
    CardActionsComponent,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    CardSubtitleDirective,
    CardTitleDirective,
    TabContentDirective,
    TabStripComponent,
    TabStripTabComponent,
    // Kendo Buttons
    ButtonComponent,
    // Kendo Dialog
    DialogComponent,
    // Diretivas e Componentes Customizados
    ConditionBuilderComponent,
    DynamicFieldDetailComponent
  ],
  styleUrls: ['./row-configurator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RowConfiguratorComponent implements OnInit, OnChanges, OnDestroy {
  private _rowConfig!: RowConfig;

  @Input() set rowConfig(value: RowConfig) {
    this._rowConfig = value;
    this.initializeGeneralForm();
  }

  get rowConfig(): RowConfig {
    return this._rowConfig;
  }

  formGroup!: FormGroup;
  rowSchema: any[] = []; // Schema para propriedades gerais da linha
  fieldsInRow: FieldMetadata[] = []; // Campos presentes nesta linha

  // Para condições de visibilidade
  otherAvailableFields: FieldMetadata[] = [];
  private _allAvailableFields: FieldMetadata[] = [];
  private fieldsSubscription: Subscription | null = null;

  isFormValid = true;

  constructor(
    private fb: FormBuilder,
    private dynamicFormGroupService: DynamicFormGroupService,
    private dialogRef: DialogRef,
    private fieldMetadataSharingService: FormContextService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Obter todos os campos disponíveis para condições
    this.fieldsSubscription = this.fieldMetadataSharingService.getAvailableFields$().subscribe(allFields => {
      this._allAvailableFields = allFields || [];
      this.updateAvailableFields();
      this.cdRef.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rowConfig'] && !changes['rowConfig'].firstChange) {
      this.fieldsInRow = this.rowConfig.fields || [];
      this.initializeGeneralForm();
    }
  }

  ngOnDestroy(): void {
    this.fieldsSubscription?.unsubscribe();
  }

  private initializeGeneralForm(): void {
    if (this.rowConfig) {
      this.fieldsInRow = this.rowConfig.fields || [];

      // Criar schema básico para configuração da linha
      this.rowSchema = [
        {
          name: 'name',
          label: 'Nome da Linha',
          controlType: 'textbox',
          type: 'string',
          required: true,
          defaultValue: this.rowConfig.name
        },
        {
          name: 'label',
          label: 'Título Exibido',
          controlType: 'textbox',
          type: 'string',
          defaultValue: this.rowConfig.label
        },
        {
          name: 'orientation',
          label: 'Orientação',
          controlType: 'dropdown',
          type: 'string',
          options: [
            { value: 'horizontal', label: 'Horizontal (Campos em Linha)' },
            { value: 'vertical', label: 'Vertical (Campos em Coluna)' }
          ],
          defaultValue: this.rowConfig.orientation
        }
      ];

      // Criar FormGroup a partir do schema
      this.formGroup = this.dynamicFormGroupService.createFormGroup(this.rowSchema);
      this.cdRef.markForCheck();
    }
  }

  private updateAvailableFields(): void {
    // Aqui podemos decidir quais campos estarão disponíveis para condições
    // Podemos incluir todos ou filtrar conforme necessidade
    this.otherAvailableFields = this._allAvailableFields;
    this.cdRef.markForCheck();
  }

  onConditionsChange(filter: CompositeFilterDescriptor | null, type: 'hiddenCondition' | 'visibilityCondition'): void {
    console.log(`Conditions for ${type} changed:`, filter);

    if (type === 'hiddenCondition') {
      this.rowConfig.hiddenCondition = filter ?? undefined;
    } else if (type === 'visibilityCondition') {
      this.rowConfig.visibilityCondition = filter ?? undefined;
    }
  }

  save(): void {
    if (this.formGroup.valid) {
      const updatedRowConfig = {
        ...this.rowConfig,
        ...this.formGroup.value
      };
      console.log('Row configuration updated:', updatedRowConfig);
      this.dialogRef.close(updatedRowConfig);
    } else {
      console.warn("Formulário de propriedades da linha inválido.");
    }
  }

  cancel(): void {
    console.log('Edição cancelada');
    this.dialogRef.close(null);
  }

  onRowFieldsUpdated(event: UpdatedRow): void {
    this.isFormValid = event.isValid;
    this._rowConfig = event.updatedRow;
    this.fieldsInRow = event.updatedRow.fields;
    this.cdRef.markForCheck();
  }
}
