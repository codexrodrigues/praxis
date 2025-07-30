import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  LOCALE_ID
} from '@angular/core';
import { CommonModule, DatePipe, formatNumber } from '@angular/common';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import {
  CompositeFilterDescriptor,
  FilterDescriptor as KendoFilterDescriptor,
} from '@progress/kendo-data-query';

// Extende FilterDescriptor para incluir o campo 'type'
interface FilterDescriptor extends KendoFilterDescriptor {
  type?: FieldDataType;
}
import { FieldMetadata, FieldDataType } from '../../../models/field-metadata.model';
import { FormContextService } from '../../services/form-context.service';
import { FormsModule } from '@angular/forms';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';

interface ConditionItem {
  id: number;
  field?: string;
  operator?: string;
  value?: any;
  fieldType?: FieldDataType;
}

export const FIELD_TYPE_OPTIONS: { value: FieldDataType; text: string }[] = [
  { value: 'text', text: 'Texto' },
  { value: 'number', text: 'Número' },
  { value: 'date', text: 'Data' },
  { value: 'date-time', text: 'Data e Hora' },
  { value: 'boolean', text: 'Booleano' },
];

@Component({
  selector: 'app-condition-builder',
  templateUrl: './condition-builder.component.html',
  styleUrls: ['./condition-builder.component.css'],
  standalone: true,
    providers: [
      {
        provide: IntlService,
        useClass: CldrIntlService,
      },
      {
        provide: LOCALE_ID,
        useValue: "pt-BR",
      },
    ],
  imports: [CommonModule, ButtonsModule, DropDownsModule, InputsModule, DateInputsModule,FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConditionBuilderComponent implements OnChanges {

   /** Lista de campos disponíveis para seleção */
  @Input() availableFields: FieldMetadata[] = [];
  /** Condições iniciais para o filtro composto */
  @Input() initialConditions: CompositeFilterDescriptor | null = null;
  /** Emite as condições atualizadas sempre que houver alteração */
  @Output() conditionsChange =
    new EventEmitter<CompositeFilterDescriptor | null>();

  /** Lista de condições atuais */
  conditions: ConditionItem[] = [];
  /** Operador lógico global ('and' ou 'or') */
  logicOperator: 'and' | 'or' = 'and';
  /** Próximo id incremental para condição */
  private nextId = 0;
  /** Cache de componentes de campo para performance */
  private fieldComponentsCache = new Map<string, any>();

  /** Contexto de uso do builder (ex: 'visibility', 'required') */
  @Input() context: 'visibility' | 'required' = 'visibility';

  /**
   * Mapeamento dos operadores disponíveis por tipo de campo.
   * Usado para popular dropdowns de operadores.
   */
  readonly operatorsByType: Record<
    FieldDataType,
    { value: string; text: string }[]
  > = {
    text: [
      { value: 'eq', text: 'é igual a' },
      { value: 'neq', text: 'é diferente de' },
      { value: 'contains', text: 'contém' },
      { value: 'doesnotcontain', text: 'não contém' },
      { value: 'startswith', text: 'inicia com' },
      { value: 'endswith', text: 'termina com' },
      { value: 'isnull', text: 'está vazio' },
      { value: 'isnotnull', text: 'não está vazio' },
    ],
    number: [
      { value: 'eq', text: 'é igual a' },
      { value: 'neq', text: 'é diferente de' },
      { value: 'gt', text: 'é maior que' },
      { value: 'gte', text: 'é maior ou igual a' },
      { value: 'lt', text: 'é menor que' },
      { value: 'lte', text: 'é menor ou igual a' },
      { value: 'isnull', text: 'está vazio' },
      { value: 'isnotnull', text: 'não está vazio' },
    ],
    date: [
      { value: 'eq', text: 'é igual a' },
      { value: 'neq', text: 'é diferente de' },
      { value: 'gt', text: 'é posterior a' },
      { value: 'gte', text: 'a partir de' },
      { value: 'lt', text: 'é anterior a' },
      { value: 'lte', text: 'até' },
      { value: 'isnull', text: 'está vazio' },
      { value: 'isnotnull', text: 'não está vazio' },
    ],
    'date-time': [
      { value: 'eq', text: 'é igual a' },
      { value: 'neq', text: 'é diferente de' },
      { value: 'gt', text: 'é posterior a' },
      { value: 'gte', text: 'a partir de' },
      { value: 'lt', text: 'é anterior a' },
      { value: 'lte', text: 'até' },
      { value: 'isnull', text: 'está vazio' },
      { value: 'isnotnull', text: 'não está vazio' },
    ],
    boolean: [
      { value: 'eq', text: 'é' },
      { value: 'neq', text: 'não é' },
    ],
    array: [
      { value: 'contains', text: 'contém' },
      { value: 'doesnotcontain', text: 'não contém' },
      { value: 'isnull', text: 'está vazio' },
      { value: 'isnotnull', text: 'não está vazio' },
    ],
    json: [
      { value: 'isnull', text: 'está vazio' },
      { value: 'isnotnull', text: 'não está vazio' },
    ],
    file: [
      { value: 'isnull', text: 'está vazio' },
      { value: 'isnotnull', text: 'não está vazio' },
    ],
    time: [
      // Exemplo: operadores para o tipo 'time'.
      { value: 'eq', text: 'é igual a' },
      { value: 'neq', text: 'é diferente de' },
      { value: 'gt', text: 'é maior que' },
      { value: 'gte', text: 'é maior ou igual a' },
      { value: 'lt', text: 'é menor que' },
      { value: 'lte', text: 'é menor ou igual a' },
      { value: 'isnull', text: 'está vazio' },
      { value: 'isnotnull', text: 'não está vazio' },
    ],
  };

  /**
   * Construtor do componente.
   * @param cdRef Service de detecção de mudanças para atualização manual.
   * @param locale Locale injetado para formatação de datas e números.
   * @param formContextService Service para obter metadados e componentes de campos dinâmicos.
   */
  constructor(
    private cdRef: ChangeDetectorRef,
    @Inject(LOCALE_ID) private locale: string,
    private formContextService: FormContextService
  ) {}

  /**
   * Lifecycle hook chamado quando inputs mudam.
   * Inicializa condições e atualiza tipos de campo conforme necessário.
   * @param changes Mudanças detectadas nos inputs
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialConditions']) {
      this.initializeConditions();
    }
    if (changes['availableFields']) {
      this.updateFieldTypes();
    }
  }

  /**
   * Inicializa as condições a partir do input inicial.
   * Faz parsing dos valores e tipos, garantindo consistência.
   */
  private initializeConditions(): void {
    // Reinicia as condições de forma imutável
    this.conditions = [];
    this.logicOperator =
      (this.initialConditions?.logic as 'and' | 'or') || 'and';
    this.nextId = 0;

    if (this.initialConditions?.filters?.length) {
      const newConditions = this.initialConditions.filters.reduce(
        (acc: ConditionItem[], filter: any) => {
          if (
            this.isFilterDescriptor(filter) &&
            typeof filter.field === 'string'
          ) {
            const fieldMeta = this.getFieldByName(filter.field);
            if (fieldMeta) {
              const parsedValue = this.parseValue(filter.value, fieldMeta.type);

              acc.push({
                id: this.nextId++,
                field: filter.field,
                operator: filter.operator as string,
                value: parsedValue,
                fieldType: filter.type ?? fieldMeta.type,
              });
            }
          }
          return acc;
        },
        [] as ConditionItem[]
      );
      this.conditions = [...newConditions];
    }
    this.buildAndEmitFilter();
    this.cdRef.markForCheck();
  }

  /**
   * Faz o parsing do valor de acordo com o tipo do campo.
   * Para datas, converte string para Date.
   * @param value Valor original
   * @param type Tipo do campo
   * @returns Valor convertido
   */
  private parseValue(value: any, type: FieldDataType): any {
    if (
      (type === 'date' || type === 'date-time') &&
      typeof value === 'string'
    ) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return value;
  }

  /**
   * Atualiza os tipos dos campos das condições atuais conforme os metadados disponíveis.
   * Útil quando a lista de campos muda dinamicamente.
   */
  private updateFieldTypes(): void {
    this.conditions = this.conditions.map((condition) => {
      const fieldMeta = this.getFieldByName(condition.field);
      return fieldMeta
        ? { ...condition, fieldType: fieldMeta.type }
        : condition;
    });
    this.cdRef.markForCheck();
  }

  /**
   * Adiciona uma nova condição com valores padrão.
   * Usa o primeiro campo disponível como base.
   */
  addCondition(): void {
    const defaultField = this.availableFields[0];
    if (!defaultField) return;
    const defaultType = (defaultField.type || 'text') as FieldDataType;
    const newCondition: ConditionItem = {
      id: this.nextId++,
      field: defaultField.name,
      operator: this.getDefaultOperator(defaultType),
      value: this.getDefaultValueForType(defaultType),
      fieldType: defaultType,
    };
    this.conditions = [...this.conditions, newCondition];
    this.cdRef.markForCheck();
    this.buildAndEmitFilter();
  }

  /**
   * Remove uma condição pelo índice.
   * @param index Índice da condição a ser removida
   */
  removeCondition(index: number): void {
    this.conditions = this.conditions.filter((_, i) => i !== index);
    this.cdRef.markForCheck();
    this.buildAndEmitFilter();
  }

  /**
   * Handler para mudança de campo em uma condição.
   * Atualiza tipo, operador e valor conforme o novo campo.
   * @param index Índice da condição
   * @param fieldName Novo nome do campo
   */
  onFieldChange(index: number, fieldName: string): void {
    if (!fieldName) return;
    const fieldMeta = this.getFieldByName(fieldName);
    if (!fieldMeta) return;
    const updatedCondition: ConditionItem = {
      ...this.conditions[index],
      field: fieldName,
      fieldType: fieldMeta.type,
      operator: this.getDefaultOperator(fieldMeta.type),
      value: this.getDefaultValueForType(fieldMeta.type),
    };
    this.conditions = this.conditions.map((c, i) =>
      i === index ? updatedCondition : c
    );
    this.cdRef.markForCheck();
    this.buildAndEmitFilter();
  }

  /**
   * Handler para mudança de operador em uma condição.
   * Se o operador não requer valor, zera o valor.
   * @param index Índice da condição
   * @param operator Novo operador
   */
  onOperatorChange(index: number, operator: string): void {
    if (!operator) return;
    let updatedCondition = { ...this.conditions[index], operator };
    if (!this.requiresValue(operator)) {
      updatedCondition.value = null;
    }
    this.conditions = this.conditions.map((c, i) =>
      i === index ? updatedCondition : c
    );
    this.cdRef.markForCheck();
    this.buildAndEmitFilter();
  }

  /**
   * Handler para mudança de valor em uma condição.
   * Faz parsing defensivo para datas.
   * @param index Índice da condição
   * @param value Novo valor
   */
  onValueChange(index: number, value: any): void {
    let newValue = value;
    const condition = this.conditions[index];
    if (condition.fieldType === 'date' || condition.fieldType === 'date-time') {
      const dateValue = value instanceof Date ? value : new Date(value);
      newValue = isNaN(dateValue.getTime()) ? null : dateValue;
    }
    const updatedCondition = { ...condition, value: newValue };
    this.conditions = this.conditions.map((c, i) =>
      i === index ? updatedCondition : c
    );
    this.cdRef.markForCheck();
    this.buildAndEmitFilter();
  }

  /**
   * Handler para mudança do operador lógico global (and/or).
   * @param logic Novo operador lógico
   */
  onLogicChange(logic: 'and' | 'or'): void {
    this.logicOperator = logic;
    this.buildAndEmitFilter();
  }

  /**
   * Monta e emite o filtro composto para o output.
   * Apenas condições válidas são consideradas.
   */
  private buildAndEmitFilter(): void {
    const validConditions = this.conditions.filter(
      (c) =>
        c.field &&
        c.operator &&
        (!this.requiresValue(c.operator) || c.value != null)
    );

    if (!validConditions.length) {
      this.conditionsChange.emit(null);
      return;
    }

    const filter: CompositeFilterDescriptor = {
      logic: this.logicOperator,
      filters: validConditions.map(
        (c) =>
          ({
            field: c.field,
            operator: c.operator,
            value: c.value,
            ignoreCase: c.fieldType === 'text',
            type: c.fieldType,
          } as FilterDescriptor)
      ),
    };
    this.conditionsChange.emit(filter);
  }

  /**
   * Retorna a lista de operadores disponíveis para o tipo de campo informado.
   * @param fieldType Tipo do campo (ex: 'text', 'number', 'date', etc)
   * @returns Array de operadores disponíveis para o tipo
   */
  getOperatorsForField(
    fieldType?: FieldDataType
  ): { value: string; text: string }[] {
    return this.operatorsByType[fieldType || 'text'] || [];
  }

  /**
   * Retorna o operador padrão para o tipo de campo informado.
   * @param fieldType Tipo do campo
   * @returns O valor do operador padrão ou undefined
   */
  private getDefaultOperator(fieldType?: FieldDataType): string | undefined {
    const operators = this.getOperatorsForField(fieldType);
    return operators.length ? operators[0].value : undefined;
  }

  /**
   * Retorna o valor padrão para o tipo de campo informado.
   * Para datas, retorna sempre null para evitar problemas de UX e runtime.
   * @param fieldType Tipo do campo
   * @returns Valor padrão para o tipo
   */
  private getDefaultValueForType(fieldType?: FieldDataType): any {
    switch (fieldType) {
      case 'boolean':
        return false;
      case 'number':
        return 0;
      case 'date':
      case 'date-time':
        return new Date();
      default:
        return '';
    }
  }

  /**
   * Busca e faz cache do componente de campo pelo nome.
   * @param fieldName Nome do campo
   * @returns Instância do componente de campo ou undefined
   */
  private getFieldComponent(fieldName: string): any {
    if (!this.fieldComponentsCache.has(fieldName)) {
      const component = this.formContextService.getFieldComponent(fieldName);
      this.fieldComponentsCache.set(fieldName, component);
    }
    return this.fieldComponentsCache.get(fieldName);
  }

  /**
   * Busca metadados do campo pelo nome.
   * @param fieldName Nome do campo
   * @returns Metadados do campo ou undefined
   */
  getFieldByName(fieldName?: string): FieldMetadata | undefined {
    if (!fieldName) return undefined;
    const fieldItem = this.getFieldComponent(fieldName);
    return (
      fieldItem?.fieldInstance?.metadata ||
      this.availableFields.find((f) => f.name === fieldName)
    );
  }

  /**
   * Retorna as opções de valor para um campo, se disponíveis.
   * Busca do componente dinâmico, do método getFieldOptions ou dos metadados.
   * @param fieldName Nome do campo
   * @returns Array de opções para o campo
   */
  getFieldOptions(fieldName?: string): any[] {
    if (!fieldName) return [];
    const fieldItem = this.getFieldComponent(fieldName);
    if (fieldItem?.isListComponent) {
      return fieldItem.fieldData || [];
    }
    if (fieldItem?.fieldInstance?.getFieldOptions) {
      return fieldItem.fieldInstance.getFieldOptions() || [];
    }
    return this.getFieldByName(fieldName)?.options || [];
  }

  /**
   * Verifica se o campo possui opções de valor.
   * @param fieldName Nome do campo
   * @returns true se houver opções, false caso contrário
   */
  hasFieldOptions(fieldName?: string): boolean {
    return this.getFieldOptions(fieldName).length > 0;
  }

  /**
   * Verifica se o operador exige valor para comparação.
   * @param operator Operador a ser verificado
   * @returns true se exige valor, false caso contrário
   */
  requiresValue(operator?: string): boolean {
    if (!operator) return false;
    if (['isnull', 'isnotnull'].includes(operator)) return false;
    return true;
  }

  /**
   * Verifica se o objeto é um FilterDescriptor válido.
   * @param filter Objeto a ser verificado
   * @returns true se for FilterDescriptor
   */
  private isFilterDescriptor(filter: any): filter is FilterDescriptor {
    return filter && typeof filter.field === 'string';
  }

  /**
   * Função de trackBy para *ngFor, usando o id da condição.
   * @param _
   * @param item Condição
   * @returns id único
   */
  trackById(_: number, item: ConditionItem): number {
    return item.id;
  }

  /**
   * Formata o valor para exibição no sumário da condição.
   * Usa formatação de datas, números e resolve opções de campos.
   * @param fieldType Tipo do campo
   * @param value Valor a ser formatado
   * @param field Nome do campo
   * @returns Valor formatado como string
   */
  private formatValue(
    fieldType: FieldDataType | undefined,
    value: any,
    field?: string
  ): string {
    if (value == null) return '[valor pendente]';

    // Se o campo possuir opções, tenta retornar a descrição.
    if (field && this.hasFieldOptions(field)) {
      const options = this.getFieldOptions(field);
      const option = options.find((opt) => opt.valueField === value);
      if (option) {
        return `"${option.displayField}"`;
      }
    }

    switch (fieldType) {
      case 'boolean':
        return value ? 'Sim' : 'Não';
      case 'date':
        // Para datas, utiliza 'shortDate' (ex.: 01/01/2025)
        return (
          new DatePipe(this.locale).transform(value, 'shortDate') ||
          String(value)
        );
      case 'date-time':
        // Para datas com hora, pode-se usar o formato 'short' (ex.: 1/1/2025, 13:45)
        return (
          new DatePipe(this.locale).transform(value, 'short') || String(value)
        );
      case 'number':
        return formatNumber(value, this.locale, '1.0-2');
      default:
        return `"${String(value)}"`;
    }
  }


  getConditionSummary(condition: ConditionItem): string {
    if (!condition.field || !condition.operator) return '';
    const fieldMeta = this.getFieldByName(condition.field);
    const fieldLabel = fieldMeta?.label || condition.field;
    const operatorText = this.getOperatorsForField(condition.fieldType)
      .find(op => op.value === condition.operator)?.text || condition.operator;
    const valueText = this.requiresValue(condition.operator)
      ? this.formatValue(condition.fieldType, condition.value, condition.field)
      : '';

    // Decide o prefixo de acordo com o contexto
    let prefix: string;
    let iconClass: string;

    if (this.context === 'visibility') {
      prefix = '<strong>Exibir</strong>';
      iconClass = 'bi bi-eye-fill';
    } else {
      prefix = '<strong>Obrigatório</strong>';
      iconClass = 'bi bi-exclamation-circle-fill';
    }

    // Retorna o HTML formatado
    return `
    <i class="summary-icon ${iconClass}"></i>
    <span>${prefix} se <strong>${fieldLabel}</strong> ${operatorText} <strong>${valueText}</strong></span>
  `;
  }

   /**
   * Retorna as opções de tipo para o campo selecionado.
   * Exemplo: [{ value: 'number', text: 'Número' }, ...]
   * @param _fieldName Nome do campo (não utilizado, mas pode ser útil para lógica futura)
   * @returns Array de opções de tipo
   */
  getFieldTypeOptions(
    _fieldName?: string
  ): { value: FieldDataType; text: string }[] {
    return FIELD_TYPE_OPTIONS;
  }

  /**
   * Handler para mudança do tipo do campo (parse/casting)
   * Atualiza operador e valor padrão conforme o novo tipo.
   * @param index Índice da condição
   * @param newType Novo tipo selecionado
   */
  onFieldTypeChange(index: number, newType: FieldDataType): void {
    // Garante que o tipo é string e válido
    const typeStr = (
      typeof newType === 'string' ? newType : String(newType)
    ) as FieldDataType;
    if (!FIELD_TYPE_OPTIONS.some((opt) => opt.value === typeStr)) return;
    const condition = this.conditions[index];
    if (!condition) return;
    const updatedCondition: ConditionItem = {
      ...condition,
      fieldType: typeStr,
      operator: this.getDefaultOperator(typeStr),
      value: this.getDefaultValueForType(typeStr),
    };
    this.conditions = this.conditions.map((c, i) =>
      i === index ? updatedCondition : c
    );
    this.cdRef.markForCheck();
    this.buildAndEmitFilter();
  }

  /**
   * Retorna a data/hora atual.
   * Útil para testes e valores default.
   * @returns Instância de Date atual
   */
  getDateNow(): Date {
    return new Date();
  }

  /**
   * Garante que o valor é sempre Date ou null para os componentes de data.
   * Usado no binding dos componentes Kendo DatePicker/DateTimePicker.
   * @param value Valor a ser validado
   * @returns Date válido ou null
   */
  getValidDate(value: any): Date | null {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }
    if (typeof value === 'string' && value) {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  /**
   * Retorna o texto amigável do tipo atual com base em FIELD_TYPE_OPTIONS.
   * @param fieldType Tipo do campo
   * @returns Texto amigável do tipo
   */
  getFieldTypeText(fieldType: FieldDataType): string {
    const typeOption = FIELD_TYPE_OPTIONS.find(
      (option) => option.value === fieldType
    );
    return typeOption ? typeOption.text : 'Desconhecido';
  }

  /**
   * Retorna o tipo do campo disponível selecionado.
   * @param field Nome do campo selecionado
   * @returns Tipo do campo ou undefined se não encontrado
   */
  getSelectedFieldType(field: string): FieldDataType | undefined {
    const selectedField = this.availableFields.find((f) => f.name === field);
    return selectedField ? selectedField.type : undefined;
  }
}
