import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { DialogRef, KENDO_DIALOGS } from '@progress/kendo-angular-dialog';
import { FieldOptionsService } from '../../../services/field-options.service';
import { FieldConfigService } from '../field-config.service';
import { DynamicFormGroupService } from '../../../services/dynamic-form-group.service';
import { FieldControlTypeOption, FieldTypeOption } from '../../../models/field-options.model';
import { FieldMetadata } from '../../../models/field-metadata.model';
import {JsonPipe, NgClass, NgIf} from '@angular/common';
import { ButtonComponent } from '@progress/kendo-angular-buttons';
import { DynamicFieldLoaderDirective } from '../../../directives/dynamic-field-loader.directive';
import {SchemaNormalizerService} from '../../../services/schema-normalizer.service';
import {TextBoxComponent} from '@progress/kendo-angular-inputs';
import {AvatarComponent, StepperComponent, StepperStepTemplateDirective} from '@progress/kendo-angular-layout';
import { KENDO_LISTVIEW } from '@progress/kendo-angular-listview';

@Component({
  selector: 'app-field-wizard-dialog',
  templateUrl: './field-wizard-dialog.component.html',
  standalone: true,
  imports: [
    KENDO_DIALOGS,
    ReactiveFormsModule,
    NgIf,
    JsonPipe,
    StepperComponent,
    ButtonComponent,
    StepperStepTemplateDirective,
    DynamicFieldLoaderDirective,
    NgClass,
    FormsModule,
    AvatarComponent,
    KENDO_LISTVIEW,
    TextBoxComponent,
  ],
  styleUrls: ['./field-wizard-dialog.component.scss']
})
export class FieldWizardDialogComponent implements OnInit {
  currentWizardStep: number = 1;

  basicFieldForm!: FormGroup;
  advancedFieldForm!: FormGroup;
  fieldMetadata!: FieldMetadata;

  public steps: Array<any> = [
    { label: 'Básico', description: 'Qual o tipo de componente?', icon: 'bi bi-pencil' },
    { label: 'Avançado', description: 'Configure as opções avançadas do componente', icon: 'bi bi-gear' },
    { label: 'Resumo', description: 'Revise e confirme as configurações', icon: 'bi bi-check-circle' }
  ];

  fieldSummaryData: any;

  availableControlTypes: FieldControlTypeOption[] = [];
  availableDataTypes: FieldTypeOption[] = [];
  advancedFieldSchema: FieldMetadata[] = [];

  constructor(
    private fb: FormBuilder,
    private fieldOptionsService: FieldOptionsService,
    private fieldConfigService: FieldConfigService,
    private schemaNormalizerService: SchemaNormalizerService,
    private dynamicFormGroupService: DynamicFormGroupService,
    private dialogRef: DialogRef
  ) {}

  ngOnInit(): void {
    // Carrega opções para os dropdowns
    this.availableControlTypes = this.fieldOptionsService.getAllControlTypes();
    this.availableDataTypes = this.fieldOptionsService.getAllFieldTypes();

    // Inicializa o formulário básico (Etapa 1)
    this.basicFieldForm = this.fb.group({
      controlType: [null, Validators.required]
    });
  }

  /**
   * Avança para a próxima etapa do wizard.
   * Na Etapa 1, gera o schema avançado com base no controle selecionado,
   * aplica normalizações e cria o FormGroup dinâmico.
   * Na Etapa 2, consolida os dados para o resumo.
   */
  public selectedControl: FieldControlTypeOption | null = null;
  goToNextStep(): void {
    if (this.currentWizardStep === 1 && this.basicFieldForm.valid) {
      const selectedControl = this.basicFieldForm.get('controlType')?.value;
      this.selectedControl = selectedControl;

      // Carrega as configurações para o controle selecionado
      const fieldConfigurations = this.fieldConfigService.getConfig(selectedControl.type);

      // Normaliza e aplica as configurações avançadas
      this.advancedFieldSchema = fieldConfigurations.map(config => {
        // Normaliza a configuração antes de mapear
        const normalizedConfig = this.schemaNormalizerService.normalizeField(config);
        return {
          ...normalizedConfig,
        } as FieldMetadata;
      });

      // Cria o FormGroup dinâmico com base no schema avançado
      this.advancedFieldForm = this.dynamicFormGroupService.createFormGroup(this.advancedFieldSchema);
      this.currentWizardStep = 2;
    } else if (this.currentWizardStep === 2 && this.advancedFieldForm.valid) {

      // Construção inicial do objeto
      const rawFieldMetadata = {
        order: 0,
        controlType: this.basicFieldForm.value.controlType.type,
        ...this.advancedFieldForm.value
      };

      // Normalização final antes do resumo
      this.fieldMetadata = this.schemaNormalizerService.normalizeField(rawFieldMetadata) as FieldMetadata;

      this.currentWizardStep = 3;
    }
  }

  goToPreviousStep(): void {
    if (this.currentWizardStep > 1) {
      this.currentWizardStep--;
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  /**
   * Conclui o wizard e retorna o FieldMetadata montado,
   * mesclando dados básicos e avançados.
   */
  onSubmitField(): void {
    // const constructedFieldMetadata: FieldMetadata = {
    //   order: 0,
    //   name: this.basicFieldForm.value.name,
    //   controlType: this.basicFieldForm.value.controlType.type,
    //   ...this.advancedFieldForm.value
    // };
    // //Mostrar constructedFieldMetadata  como JSON no console
    // this.fieldMetadata = constructedFieldMetadata;
    console.log("Field Metadata:", JSON.stringify(this.fieldMetadata));

    this.dialogRef.close(this.fieldMetadata);
  }

  protected readonly Object = Object;

  /**
   * Retorna o tipo do valor do controle informado.
   * Útil no template para definir qual componente renderizar.
   */
  getControlType(controlName: string): string {
    return typeof this.advancedFieldForm.controls[controlName].value;
  }

  getControlTypeDescription(): string {
    const selectedType = this.basicFieldForm.get('controlType')?.value;
    return selectedType?.description || ''; // Retorna '' se selec
  }

  getControlTypeSelected(): FieldControlTypeOption | null {
    return this.basicFieldForm.get('controlType')?.value;
  }
  public onSelectComponentType(item: FieldControlTypeOption): void {
    // Seta o valor no form (campo 'controlType')
    this.basicFieldForm.patchValue({ controlType: item });
  }


  filterTerm: string  = '';

  public get filteredControlTypes(): FieldControlTypeOption[] {
    if (!this.filterTerm) {
      return this.availableControlTypes;
    }
    const term = this.filterTerm
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    return this.availableControlTypes.filter(item => {
      const shortDesc = item.shortDescription
        ? item.shortDescription.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        : "";
      const desc = item.description
        ? item.description.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        : "";
      const type = item.type
        ? item.type.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        : "";

      return shortDesc.includes(term) || desc.includes(term) || type.includes(term);
    });
  }


}
