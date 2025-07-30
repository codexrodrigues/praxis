import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import {
  CardActionsComponent,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  CardSubtitleDirective,
  CardTitleDirective,
  TabContentDirective,
  TabStripComponent,
  TabStripTabComponent,
} from '@progress/kendo-angular-layout';
import { ButtonComponent } from '@progress/kendo-angular-buttons';
import { DialogComponent, DialogRef } from '@progress/kendo-angular-dialog';
import { JsonPipe, NgClass, NgIf } from '@angular/common';
import { Subscription } from 'rxjs'; // Importar Subscription
import { DynamicFormGroupService } from '../../../services/dynamic-form-group.service';
import {
  FieldMetadata,
  ValidatorOptions,
} from '../../../models/field-metadata.model';
import { DynamicFieldLoaderDirective } from '../../../directives/dynamic-field-loader.directive';
import {
  FieldControlTypeOption,
  FieldTypeOption,
} from '../../../models/field-options.model';
import { FieldOptionsService } from '../../../services/field-options.service';
import { FieldConfigService } from '../field-config.service';
import { SchemaNormalizerService } from '../../../services/schema-normalizer.service';
// Remover import do KENDO_FILTER se não for mais usado
// import { KENDO_FILTER, FilterExpression } from "@progress/kendo-angular-filter";
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FormContextService } from '../../services/form-context.service'; // Serviço para obter todos os campos
import { ConditionBuilderComponent } from '../condition-builder/condition-builder.component'; // <<< Importar o novo componente
import { forbiddenValuesValidator } from '../../form-validators/custom-validators';

@Component({
  selector: 'field-metadata-editor',
  templateUrl: './field-metadata-editor.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
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
    DynamicFieldLoaderDirective,
    ConditionBuilderComponent, // <<< Adicionar o novo componente aos imports
    // Remover KENDO_FILTER se não for mais usado
  ],
  styleUrls: ['./field-metadata-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Opcional: usar OnPush para melhor performance
})
export class FieldMetadataEditorComponent
  implements OnInit, OnChanges, OnDestroy
{
  // Adicionar OnDestroy
  private _fieldMetadata!: FieldMetadata;
  // Remover filterFields - não é mais necessário para kendo-filter
  // protected filterFields: { field: string; title: string; editor: string; operators: string[]; }[] | undefined;

  @Input() set fieldMetadata(value: FieldMetadata) {
    this._fieldMetadata = value;
    // Se a lista de campos já estiver disponível, filtre-a imediatamente
    if (this._allAvailableFields?.length) {
      this.updateOtherAvailableFields();
    }
    // Inicializa o formulário de propriedades gerais
    this.initializeGeneralForm();
  }

  get fieldMetadata(): FieldMetadata {
    return this._fieldMetadata;
  }

  formGroup!: FormGroup; // Formulário para propriedades gerais
  fieldSchema: FieldMetadata[] = []; // Schema para propriedades gerais
  fieldTypeOption?: FieldTypeOption;
  fieldControlTypeOption?: FieldControlTypeOption;

  // Propriedade para armazenar a lista de campos *exceto* o atual
  otherAvailableFields: FieldMetadata[] = [];
  private _allAvailableFields: FieldMetadata[] = []; // Cache da lista completa
  private fieldsSubscription: Subscription | null = null; // Para gerenciar a inscrição

  constructor(
    private fieldOptionsService: FieldOptionsService,
    private dynamicFormGroupService: DynamicFormGroupService,
    private fieldConfigService: FieldConfigService,
    private schemaNormalizerService: SchemaNormalizerService,
    private dialogRef: DialogRef,
    private fieldMetadataSharingService: FormContextService, // Injetar o serviço
    private cdRef: ChangeDetectorRef // Injetar ChangeDetectorRef se usar OnPush
  ) {}

  ngOnInit(): void {
    // Inscreve-se para receber atualizações da lista de campos disponíveis
    this.fieldsSubscription = this.fieldMetadataSharingService
      .getAvailableFields$()
      .subscribe((allFields) => {
        this._allAvailableFields = allFields || [];
        console.log(
          'Lista de campos disponíveis atualizada:',
          this._allAvailableFields
        );
        // Filtra a lista para remover o campo atual
        this.updateOtherAvailableFields();
        //mostrar no console
        console.log(
          'Lista de campos disponíveis atualizada:',
          this._allAvailableFields
        );

        if (this.formGroup) this.customizeValidators();

        this.cdRef.markForCheck();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Se o fieldMetadata mudar (embora o setter já trate isso)
    if (changes['fieldMetadata'] && !changes['fieldMetadata'].firstChange) {
      // O setter já chama initializeGeneralForm e updateOtherAvailableFields
    }
  }

  ngOnDestroy(): void {
    // Cancela a inscrição para evitar memory leaks
    this.fieldsSubscription?.unsubscribe();
  }

  // Inicializa apenas o formulário da aba "Propriedades Gerais"
  private initializeGeneralForm(): void {
    if (this.fieldMetadata) {
      // Recupera as descrições do tipo de dado e do controle
      this.fieldTypeOption = this.fieldOptionsService.getFieldTypeByType(
        this.fieldMetadata.type
      );
      this.fieldControlTypeOption =
        this.fieldOptionsService.getFieldControlTypeByType(
          this.fieldMetadata.controlType
        );

      // Carrega as configurações para o controle selecionado (apenas propriedades gerais)
      const fieldConfigurations = this.fieldConfigService.getConfig(
        this.fieldMetadata.controlType
      );

      // Normaliza as configurações e mescla com os valores já presentes em fieldMetadata
      this.fieldSchema = fieldConfigurations.map((config) => {
        const normalizedConfig = this.schemaNormalizerService.normalizeField(
          config as FieldMetadata
        ); // Cast para FieldMetadata
        if (normalizedConfig.name) {
          return {
            ...normalizedConfig,
            // Usa o valor existente em fieldMetadata OU o defaultValue da config OU null
            defaultValue:
              (this.fieldMetadata as any)[normalizedConfig.name] ??
              normalizedConfig.defaultValue ??
              null,
          } as FieldMetadata;
        }
        return normalizedConfig as FieldMetadata; // Retorna mesmo se não tiver nome? Verificar necessidade.
      });

      // Cria o FormGroup dinâmico utilizando o schema atualizado
      this.formGroup = this.dynamicFormGroupService.createFormGroup(
        this.fieldSchema
      );
      // Aplica os validadores customizados
      this.cdRef.markForCheck(); // Notifica o Angular sobre a mudança (se OnPush)
    }
  }

  // Filtra a lista completa de campos para excluir o campo atual
  private updateOtherAvailableFields(): void {
    if (this.fieldMetadata && this._allAvailableFields) {
      this.otherAvailableFields = this._allAvailableFields.filter(
        (field) => field.name !== this.fieldMetadata.name
      );
      this.cdRef.markForCheck(); // Notifica o Angular sobre a mudança (se OnPush)
    } else {
      this.otherAvailableFields = [];
    }
  }

  // Método chamado pelo output (conditionsChange) do ConditionBuilderComponent
  onConditionsChange(
    filter: CompositeFilterDescriptor | null,
    type: 'hiddenCondition' | 'conditionalRequired'
  ): void {
    console.log(`Conditions for ${type} changed:`, filter);

    // Atualiza a propriedade correspondente no fieldMetadata
    // O valor pode ser o CompositeFilterDescriptor ou null (se nenhuma condição válida foi definida)
    if (type === 'hiddenCondition') {
      this.fieldMetadata.hiddenCondition = filter ?? undefined; // Armazena undefined se for null
    } else if (type === 'conditionalRequired') {
      this.fieldMetadata.conditionalRequired = filter ?? undefined; // Armazena undefined se for null
    }
    // Não precisa de markForCheck aqui pois fieldMetadata não é usado diretamente no template desta forma
  }

  save(): void {
    if (this.formGroup.valid) {
      const generalPropertiesData = this.formGroup.value;
      // Mescla as propriedades gerais atualizadas com as propriedades de condição já atualizadas
      this.fieldMetadata = {
        ...this.fieldMetadata, // Mantém as propriedades existentes (incluindo hiddenCondition/conditionalRequired)
        ...generalPropertiesData, // Sobrescreve com os valores do formulário de propriedades gerais
      };
      console.log('Propriedades atualizadas:', this.fieldMetadata);

      this.cdRef.markForCheck();

      this.dialogRef.close(this.fieldMetadata); // Retorna o objeto completo atualizado
    } else {
      console.warn('Formulário de propriedades gerais inválido.');
      // Adicionar feedback visual para o usuário aqui se desejar
    }
  }

  cancel(): void {
    console.log('Edição cancelada');
    this.dialogRef.close(null); // Retorna null ao cancelar
  }

  // Método para personalizar os validadores dos inputs do modo edição
  customizeValidators(): void {
    this.formGroup
      .get('name')
      ?.setValidators(
        forbiddenValuesValidator(
          this.otherAvailableFields.map((field) => field.name)
        )
      );
  }
}
