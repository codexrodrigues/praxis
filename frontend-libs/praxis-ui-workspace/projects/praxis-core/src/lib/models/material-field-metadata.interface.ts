/**
 * @fileoverview Specialized metadata interfaces for Angular Material components
 *
 * This file extends the base FieldMetadata interface with component-specific
 * properties for each Material Design component type.
 *
 * Each interface follows the pattern:
 * - Extends FieldMetadata
 * - Adds component-specific properties
 * - Maintains type safety with literal types
 * - Supports Material Design 3 specifications
 */

import {
  FieldMetadata,
  FieldControlType,
} from './component-metadata.interface';
import { ThemePalette } from '@angular/material/core';
import { ValidationErrors } from '@angular/forms';

// =============================================================================
// ENHANCED VALIDATION TYPES (CRITICAL ISSUE #11)
// =============================================================================

/**
 * Enhanced validation context with type safety
 * Provides comprehensive context for custom validation functions
 */
export interface ValidationContext {
  /** Current form values */
  formValue: Record<string, any>;
  /** Current field name */
  fieldName: string;
  /** Field metadata configuration */
  metadata: FieldMetadata;
  /** Form state information */
  formState?: {
    pristine: boolean;
    dirty: boolean;
    touched: boolean;
    submitted: boolean;
  };
}

/**
 * Type-safe validation result
 * Can return null (valid), string (error message), or ValidationErrors object
 */
export type ValidationResult = null | string | ValidationErrors;

/**
 * Enhanced validator function with proper typing
 * Replaces the generic (value: any, context?: any) => boolean | string | null
 */
export type ValidatorFunction = (
  value: any,
  context: ValidationContext,
) => ValidationResult | Promise<ValidationResult>;

/**
 * Validation configuration with enhanced options
 */
export interface EnhancedValidationConfig {
  /** Custom validator function with proper typing */
  customValidator?: ValidatorFunction;
  /** Async validator function */
  asyncValidator?: ValidatorFunction;
  /** Debounce time for async validation (ms) */
  asyncDebounceTime?: number;
  /** Validation triggers */
  validationTriggers?: ('change' | 'blur' | 'submit')[];
  /** Show validation errors immediately */
  showErrorsImmediately?: boolean;
}

// =============================================================================
// INPUT FIELD INTERFACES
// =============================================================================

/**
 * Base interface for all Material input-like components.
 *
 * Centraliza propriedades compartilhadas entre os 13 componentes de input
 * planejados (color, date, datetime-local, email, month, number, password,
 * search, tel, text, time, url e week). Interfaces especializadas devem
 * estender esta base e definir `controlType` e `inputType` apropriados.
 */
export interface BaseMaterialInputMetadata extends FieldMetadata {
  /** Máximo de caracteres permitidos */
  maxLength?: number;

  /** Mínimo de caracteres exigidos */
  minLength?: number;

  /** Dica para autofill do navegador */
  autocomplete?: string;

  /** Atributo nativo readonly do input */
  readonly?: boolean;
}

/**
 * Specialized metadata for Material Input components.
 *
 * Interface baseada na especificação oficial do Angular Material Input (matInput directive).
 * Projetada especificamente para ambientes corporativos com foco em:
 * - Validação robusta e estados de erro customizáveis
 * - Integração completa com mat-form-field (labels, hints, errors)
 * - Suporte completo aos tipos HTML5 oficialmente suportados
 * - Acessibilidade WCAG 2.1 AA automática
 * - Recursos empresariais como readonly, disabled interactive, autofill
 *
 * @see https://material.angular.dev/components/input/api - Documentação oficial
 *
 * @example Configuração típica corporativa
 * ```typescript
 * const corporateEmailInput: MaterialInputMetadata = {
 *   name: 'email',
 *   label: 'Email Corporativo',
 *   controlType: 'input',
 *   inputType: 'email', // Tipo oficialmente suportado
 *   autocomplete: 'email', // Integração com autofill corporativo
 *   maxLength: 100,
 *   required: true,
 *   spellcheck: false,
 *   readonly: false, // Material Input native property
 *   disabledInteractive: false, // Mantém interatividade quando disabled
 *   errorStateMatcher: 'showOnDirtyAndInvalid', // Controle corporativo de erros
 *   hint: 'Use seu email institucional (@empresa.com)',
 *   showCharacterCount: true
 * };
 * ```
 *
 * @example Input numérico para formulários financeiros
 * ```typescript
 * const financialInput: MaterialInputMetadata = {
 *   name: 'valor',
 *   label: 'Valor (R$)',
 *   controlType: 'input',
 *   inputType: 'number', // Suporte nativo a number
 *   inputMode: 'decimal', // Teclado otimizado mobile
 *   prefix: 'R$', // mat-form-field prefix
 *   suffix: '.00', // mat-form-field suffix
 *   required: true,
 *   readonly: false,
 *   autoFocus: true, // Foco automático para workflows
 *   hint: 'Digite apenas números'
 * };
 * ```
 */
export interface MaterialInputMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.INPUT;

  /**
   * HTML5 input type - APENAS tipos oficialmente suportados pelo matNativeControl
   *
   * Tipos suportadas conforme documentação oficial:
   * - 'text': Texto padrão (mais comum em corporativo)
   * - 'email': Validação automática de email + teclado mobile otimizado
   * - 'password': Mascaramento automático + recursos de segurança
   * - 'tel': Formatação telefone + teclado numérico mobile
   * - 'url': Validação de URL + autocompletar navegador
   * - 'search': Interface de busca + botão clear automático
   * - 'number': Input numérico + controles spinner + validação
   * - 'date': Datepicker nativo do navegador
   * - 'datetime-local': Data e hora local
   * - 'time': Seletor de hora
   * - 'month': Seletor de mês/ano
   * - 'week': Seletor de semana
   * - 'color': Seletor de cor nativo
   *
   * ⚠️ IMPORTANTE: Usar tipos não suportados causará erro "Input type isn't supported by matInput"
   *
   * @default 'text'
   */
  inputType?:
    | 'text'
    | 'email'
    | 'password'
    | 'tel'
    | 'url'
    | 'search'
    | 'number'
    | 'date'
    | 'datetime-local'
    | 'time'
    | 'month'
    | 'week'
    | 'color';

  // maxLength, minLength e autocomplete foram movidos para
  // BaseMaterialInputMetadata para eliminar duplicação entre
  // componentes especializados.

  /**
   * Atributo HTML spellcheck - Verificação ortográfica
   *
   * Configuração recomendada:
   * - true: Campos de texto livre (comentários, descrições)
   * - false: Códigos, emails, URLs, senhas, dados técnicos
   *
   * @default true (comportamento padrão do navegador)
   */
  spellcheck?: boolean;

  /**
   * Transformação de texto via CSS text-transform
   *
   * Aplicações corporativas:
   * - 'uppercase': Códigos, siglas, placas
   * - 'lowercase': URLs, emails padronizados
   * - 'capitalize': Nomes próprios, títulos
   * - 'none': Texto livre, preservar entrada do usuário
   */
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';

  /**
   * HTML inputmode - Otimização de teclado mobile
   *
   * Essencial para apps corporativas mobile:
   * - 'text': Teclado padrão com predição
   * - 'numeric': Apenas números (0-9)
   * - 'decimal': Números com ponto decimal
   * - 'tel': Layout de telefone
   * - 'email': Layout otimizado para email
   * - 'url': Layout para URLs
   * - 'search': Layout de busca
   *
   * ⚠️ Não confundir com inputType - inputMode é só visual mobile
   */
  inputMode?:
    | 'text'
    | 'numeric'
    | 'decimal'
    | 'tel'
    | 'email'
    | 'url'
    | 'search';

  /**
   * Foco automático no carregamento do componente
   *
   * Usar com cuidado em ambientes corporativos:
   * ✅ Bom: Primeiro campo de formulários de login
   * ✅ Bom: Campo de busca em páginas de consulta
   * ❌ Evitar: Formulários longos (UX ruim)
   * ❌ Evitar: Múltiplos campos com autoFocus
   *
   * Chama automaticamente o método focus() do Material Input
   */
  autoFocus?: boolean;

  /**
   * Exibir contador de caracteres visual
   *
   * Renderizado como mat-hint align="end" automático
   * Funciona em conjunto com maxLength para mostrar "N / Max"
   *
   * Útil para:
   * - Campos com limite rígido (descrições, comentários)
   * - Feedback visual em tempo real
   * - Compliance com guidelines de UX corporativo
   */
  showCharacterCount?: boolean;

  /**
   * Configuração de botão "limpar" integrado
   *
   * Implementado como mat-icon-button no suffix do mat-form-field
   * Comum em:
   * - Campos de busca corporativa
   * - Formulários de filtros
   * - Campos opcionais que precisam reset rápido
   */
  clearButton?: {
    /** Habilitar funcionalidade de clear */
    enabled: boolean;
    /** Nome do ícone Material (default: 'clear') */
    icon?: string;
    /** Posição fixa no 'end' conforme Material Design */
    position?: 'end';
    /** Tooltip text for accessibility */
    tooltip?: string;
    /** ARIA label for screen readers */
    ariaLabel?: string;
    /** Show only when field has value */
    showOnlyWhenFilled?: boolean;
  };

  // =============================================================================
  // PROPRIEDADES NATIVAS DO MATERIAL INPUT (conforme API oficial)
  // =============================================================================

  /**
   * Manter interatividade quando disabled
   *
   * ⚠️ NÃO IMPLEMENTADO: Funcionalidade planejada mas não desenvolvida
   * Será implementada em versão futura
   *
   * @todo Implementar na próxima iteração
   * @see MatInput.disabledInteractive property
   */
  disabledInteractive?: boolean;

  /**
   * Estratégia customizada para exibição de erros
   *
   * ⚠️ PARCIALMENTE IMPLEMENTADO: Interface existe mas lógica não aplicada
   * Atualmente usa apenas comportamento padrão do Material
   *
   * @todo Implementar ErrorStateMatcher na próxima iteração
   * @see MatInput.errorStateMatcher property
   */
  errorStateMatcher?:
    | 'default'
    | 'showOnDirtyAndInvalid'
    | 'showOnSubmitted'
    | 'showImmediately';

  // =============================================================================
  // INTEGRAÇÃO COM MAT-FORM-FIELD (recursos automáticos)
  // =============================================================================

  /**
   * Texto de prefixo (antes do input)
   *
   * Renderizado como <mat-icon matPrefix> ou <span matPrefix>
   * Exemplos corporativos:
   * - Símbolos monetários: 'R$', '$', '€'
   * - Códigos: 'REF:', 'ID:'
   * - Ícones: 'person', 'email', 'phone'
   */
  prefix?: string;

  /**
   * Texto de sufixo (após o input)
   *
   * Renderizado como <mat-icon matSuffix> ou <span matSuffix>
   * Exemplos corporativos:
   * - Unidades: 'kg', 'm²', '%'
   * - Ações: Botão de busca, clear, etc.
   * - Status: Ícones de validação
   */
  suffix?: string;

  /**
   * Texto de dica contextual
   *
   * Renderizado como <mat-hint>
   * Posicionamento automático ou customizável
   *
   * Boas práticas corporativas:
   * - Exemplo de formato esperado
   * - Instruções de preenchimento
   * - Limitações ou regras de negócio
   */
  hint?: string;

  /**
   * Alinhamento da dica (hint)
   *
   * - 'start': Alinhado à esquerda
   * - 'end': Alinhado à direita (comum para contadores)
   *
   * @default 'start'
   */
  hintAlign?: 'start' | 'end';

  // =============================================================================
  // PROPRIEDADES ÓRFÃS IMPLEMENTADAS - Alinhamento com componentes
  // =============================================================================

  /**
   * Configuração de aparência Material Design
   *
   * Propriedades usadas pelos componentes mas que estavam ausentes da interface.
   * Adicionadas para alinhamento entre interface e implementação.
   */
  materialDesign?: {
    /** Aparência do mat-form-field */
    appearance?: 'fill' | 'outline';
    /** Cor do tema Material */
    color?: 'primary' | 'accent' | 'warn';
    /** Comportamento do float label */
    floatLabel?: 'always' | 'auto';
    /** Dimensionamento do subscript */
    subscriptSizing?: 'fixed' | 'dynamic';
    /** Ocultar marcador de obrigatório */
    hideRequiredMarker?: boolean;
  };

  /**
   * Ícone de prefixo (usado pela implementação)
   * Renderizado como mat-icon matPrefix
   */
  prefixIcon?: string;

  /**
   * Ícone de sufixo (usado pela implementação)
   * Renderizado como mat-icon matSuffix
   */
  suffixIcon?: string;

  /**
   * Valor mínimo para inputs numéricos
   * Usado pela implementação em inputs type="number"
   */
  min?: number;

  /**
   * Valor máximo para inputs numéricos
   * Usado pela implementação em inputs type="number"
   */
  max?: number;

  /**
   * Incremento para inputs numéricos
   * Usado pela implementação em inputs type="number"
   */
  step?: number;

  /**
   * @deprecated Use 'readonly' instead. Will be removed in next version.
   * This property exists for backward compatibility only.
   */
  readOnly?: boolean;
}

/**
 * Specialized metadata for Material Textarea components.
 *
 * Interface baseada na especificação oficial do Angular Material Textarea (matInput directive).
 * Projetada para ambientes corporativos com foco em:
 * - Entrada de texto multi-linha com controle preciso de dimensionamento
 * - Auto-resize inteligente usando CDK Textarea Autosize
 * - Integração completa com mat-form-field (mesmos recursos do input)
 * - Validação robusta para campos de texto longo
 * - Recursos empresariais específicos para formulários complexos
 *
 * @see https://material.angular.dev/components/input/api - Documentação oficial
 * @see https://material.angular.dev/cdk/text-field/api - CDK TextareaAutosize
 *
 * @example Configuração típica para comentários corporativos
 * ```typescript
 * const commentTextarea: MaterialTextareaMetadata = {
 *   name: 'observacoes',
 *   label: 'Observações',
 *   controlType: 'textarea',
 *   rows: 4, // Altura inicial
 *   autoSize: true, // Auto-resize conforme conteúdo
 *   minRows: 2, // Altura mínima
 *   maxRows: 8, // Altura máxima
 *   maxLength: 1000, // Limite corporativo padrão
 *   showCharacterCount: true, // Feedback visual
 *   spellcheck: true, // Verificação ortográfica
 *   wrap: 'soft', // Quebra de linha automática
 *   placeholder: 'Digite suas observações aqui...',
 *   hint: 'Máximo 1000 caracteres. Use linguagem profissional.'
 * };
 * ```
 *
 * @example Configuração para código/texto técnico
 * ```typescript
 * const codeTextarea: MaterialTextareaMetadata = {
 *   name: 'codigo',
 *   label: 'Código SQL',
 *   controlType: 'textarea',
 *   rows: 10, // Mais espaço para código
 *   autoSize: false, // Tamanho fixo para código
 *   resize: 'vertical', // Permite redimensionar verticalmente
 *   maxLength: 5000, // Limite maior para código
 *   spellcheck: false, // Sem verificação para código
 *   wrap: 'off', // Sem quebra automática (código)
 *   readonly: false,
 *   hint: 'Cole ou digite seu código SQL aqui'
 * };
 * ```
 */
export interface MaterialTextareaMetadata extends FieldMetadata {
  controlType: typeof FieldControlType.TEXTAREA;

  /**
   * Número de linhas visíveis iniciais
   *
   * Define a altura inicial do textarea em linhas de texto.
   * Funciona como o atributo HTML rows padrão.
   *
   * Configurações comuns corporativas:
   * - Comentários curtos: 2-3 linhas
   * - Descrições médias: 4-6 linhas
   * - Texto longo: 8-12 linhas
   * - Código/JSON: 10-20 linhas
   *
   * @default 4 (padrão do navegador)
   */
  rows?: number;

  /**
   * Número máximo de linhas para auto-resize
   *
   * Trabalha em conjunto com autoSize=true e cdkTextareaAutosize.
   * Evita que o textarea cresça infinitamente, mantendo a UX controlada.
   *
   * Importante para:
   * - Layouts responsivos (não quebrar design)
   * - Performance (textareas muito grandes são lentos)
   * - UX consistente em diferentes dispositivos
   *
   * @see CDK TextareaAutosize cdkAutosizeMaxRows
   */
  maxRows?: number;

  /**
   * Número mínimo de linhas para auto-resize
   *
   * Trabalha com autoSize=true para garantir altura mínima.
   * Evita que textarea fique muito pequeno quando vazio.
   *
   * Geralmente menor que rows:
   * - minRows: altura quando vazio
   * - rows: altura inicial com conteúdo
   * - maxRows: altura máxima permitida
   */
  minRows?: number;

  /**
   * Comportamento de redimensionamento manual
   *
   * Controla se usuário pode redimensionar manualmente:
   * - 'none': Sem redimensionamento (padrão Material)
   * - 'vertical': Apenas altura (mais comum)
   * - 'horizontal': Apenas largura (raro)
   * - 'both': Altura e largura (evitar em layouts fixos)
   * - 'auto': Baseado no CSS/browser default
   *
   * ✅ Recomendado: 'vertical' para ambiente corporativo
   * ❌ Evitar: 'horizontal'/'both' (quebra layout responsivo)
   */
  resize?: 'none' | 'both' | 'horizontal' | 'vertical' | 'auto';

  /**
   * Auto-redimensionamento baseado no conteúdo
   *
   * Usa CDK TextareaAutosize para crescer/diminuir automaticamente.
   * Muito útil para UX moderna e formulários dinâmicos.
   *
   * Benefícios corporativos:
   * - UX fluida (não precisa scroll interno)
   * - Melhor para mobile/tablet
   * - Adapta a quantidade de conteúdo
   *
   * Cuidados:
   * - Usar sempre com maxRows definido
   * - Testar em diferentes dispositivos
   * - Pode impactar performance com muito texto
   *
   * @see CDK cdkTextareaAutosize directive
   */
  autoSize?: boolean;

  /**
   * Comprimento máximo de caracteres
   *
   * Idêntico ao input, mas importante para textareas:
   * - Integração com showCharacterCount
   * - Validação automática do Angular Forms
   * - Feedback visual em tempo real
   *
   * Limites comuns corporativos:
   * - Comentários: 500-1000 caracteres
   * - Descrições: 1000-2000 caracteres
   * - Observações longas: 2000-5000 caracteres
   * - Código/JSON: 10000+ caracteres
   */
  maxLength?: number;

  /**
   * Comprimento mínimo de caracteres
   * Funciona idêntico ao MaterialInputMetadata
   */
  minLength?: number;

  /**
   * Exibir contador de caracteres
   *
   * Ainda mais importante em textarea que em input:
   * - Usuários digitam mais texto
   * - Harder to estimate character count visually
   * - Critical for compliance/business rules
   *
   * Renderizado como mat-hint align="end"
   * Formato: "N / MaxLength" ou "N characters"
   */
  showCharacterCount?: boolean;

  /**
   * Comportamento de quebra de linha
   *
   * Atributo HTML wrap:
   * - 'soft': Quebra visual, mas não insere \n no valor (padrão)
   * - 'hard': Quebra visual E insere \n no valor (raro)
   * - 'off': Sem quebra automática, scroll horizontal
   *
   * Uso corporativo:
   * - 'soft': Texto natural, comentários, descrições
   * - 'off': Código, URLs, dados estruturados
   * - 'hard': Raramente usado (compatibilidade legacy)
   *
   * @default 'soft'
   */
  wrap?: 'soft' | 'hard' | 'off';

  /**
   * Verificação ortográfica (idêntico ao input)
   *
   * Ainda mais relevante para textarea:
   * - Mais texto = mais chance de erros
   * - Importante para textos corporativos profissionais
   *
   * @default true
   */
  spellcheck?: boolean;

  /**
   * Estado readonly (idêntico ao input)
   * @see MaterialInputMetadata.readonly
   */
  readonly?: boolean;

  /**
   * Foco automático (herdado, usar com cautela)
   *
   * Menos comum em textarea:
   * - Geralmente não é o primeiro campo
   * - Pode ser intrusivo (abre teclado mobile)
   * - Use apenas em casos específicos
   */
  autoFocus?: boolean;

  /**
   * Texto de dica contextual (idêntico ao input)
   * @see MaterialInputMetadata.hint
   */
  hint?: string;

  /**
   * Estratégia de exibição de erros (herdado)
   *
   * Para textareas, considerar:
   * - 'showOnDirtyAndInvalid': Melhor para textos longos
   * - Usuários gastam mais tempo digitando
   * - Validação imediata pode ser intrusiva
   */
  errorStateMatcher?:
    | 'default'
    | 'showOnDirtyAndInvalid'
    | 'showOnSubmitted'
    | 'showImmediately';

  /**
   * Número de colunas para textarea
   * Controla largura inicial em caracteres
   */
  cols?: number;

  /**
   * Configuração de aparência Material Design
   * Idêntica ao MaterialInputMetadata para consistência
   */
  materialDesign?: {
    appearance?: 'fill' | 'outline';
    color?: 'primary' | 'accent' | 'warn';
    floatLabel?: 'always' | 'auto';
    subscriptSizing?: 'fixed' | 'dynamic';
    hideRequiredMarker?: boolean;
  };

  /**
   * Ícone de prefixo (usado pela implementação)
   */
  prefixIcon?: string;

  /**
   * Ícone de sufixo (usado pela implementação)
   */
  suffixIcon?: string;

  /**
   * @deprecated Use 'readonly' instead. Will be removed in next version.
   */
  readOnly?: boolean;
}

/**
 * Metadata for `<input type="number">` rendered via Material directives.
 *
 * Planejamento para o futuro `NumberInputComponent`, com suporte a
 * formatação, incremento e validação de faixa numérica.
 */
export interface MaterialNumericMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.NUMERIC_TEXT_BOX;
  inputType: 'number';

  /** Minimum allowed value */
  min?: number;

  /** Maximum allowed value */
  max?: number;

  /** Step increment for number controls */
  step?: number;

  /** Number formatting options */
  numberFormat?: {
    /** Decimal places to display */
    decimalPlaces?: number;
    /** Thousand separator character */
    thousandSeparator?: string;
    /** Decimal separator character */
    decimalSeparator?: string;
    /** Currency symbol */
    currency?: string;
    /** Currency position */
    currencyPosition?: 'before' | 'after';
    /** Locale for number formatting */
    locale?: string;
  };
}

/**
 * Specialized metadata for Material Select components.
 *
 * Handles dropdown selection with single/multiple values,
 * option groups, and dynamic data loading.
 */
export interface MaterialSelectMetadata extends FieldMetadata {
  controlType:
    | typeof FieldControlType.SELECT
    | typeof FieldControlType.MULTI_SELECT;

  /** Selection options */
  selectOptions?: Array<{
    value: any;
    text: string;
    label?: string;
    description?: string;
    disabled?: boolean;
    group?: string;
  }>;

  /** Enable multiple selection */
  multiple?: boolean;

  /** Enable option search/filter */
  searchable?: boolean;

  /** Show "Select All" option for multiple */
  selectAll?: boolean;

  /** Maximum number of selections (for multiple) */
  maxSelections?: number;
}

/**
 * Specialized metadata for Material Checkbox components.
 *
 * Handles boolean values with indeterminate state support
 * and checkbox group functionality.
 */
export interface MaterialCheckboxMetadata extends FieldMetadata {
  controlType: typeof FieldControlType.CHECKBOX;

  /** Checkbox options for group selection */
  checkboxOptions?: Array<{
    value: any;
    text: string;
    label?: string;
    description?: string;
    disabled?: boolean;
  }>;

  /** Enable option search/filter */
  searchable?: boolean;

  /** Show "Select All" option */
  selectAll?: boolean;

  /** Maximum number of selections */
  maxSelections?: number;

  /** Backend resource for dynamic option loading */
  resourcePath?: string;

  /** Additional filter criteria for backend requests */
  filterCriteria?: Record<string, any>;

  /** Key for option label when loading from backend */
  optionLabelKey?: string;

  /** Key for option value when loading from backend */
  optionValueKey?: string;

  /** Layout direction */
  layout?: 'horizontal' | 'vertical';

  /** Checkbox color theme */
  color?: ThemePalette;

  /** Checkbox label position */
  labelPosition?: 'before' | 'after';

  /** Enable indeterminate state */
  indeterminate?: boolean;

  /** Link text for checkbox with clickable link */
  linkText?: string;

  /** URL for checkbox link */
  linkUrl?: string;

  /** Link target (_blank or _self) */
  linkTarget?: '_blank' | '_self';
}

/**
 * Specialized metadata for Material Radio Button components.
 *
 * Handles single selection from a group of options
 * with horizontal/vertical layout support.
 */
export interface MaterialRadioMetadata extends FieldMetadata {
  controlType: typeof FieldControlType.RADIO;

  /** Radio button options */
  radioOptions?: Array<{
    value: any;
    text: string;
    label?: string;
    description?: string;
    disabled?: boolean;
  }>;

  /** Backend resource for dynamic option loading */
  resourcePath?: string;

  /** Additional filter criteria for backend requests */
  filterCriteria?: Record<string, any>;

  /** Key for option label when loading from backend */
  optionLabelKey?: string;

  /** Key for option value when loading from backend */
  optionValueKey?: string;

  /** Layout direction */
  layout?: 'horizontal' | 'vertical';

  /** Radio button color theme */
  color?: ThemePalette;

  /** Label position relative to the radio button */
  labelPosition?: 'before' | 'after';
}

/**
 * Specialized metadata for Material Date Picker components.
 *
 * Handles date selection with calendar popup,
 * date range selection, and validation.
 */
export interface MaterialDatepickerMetadata extends FieldMetadata {
  controlType: typeof FieldControlType.DATE_PICKER;

  /** Date format for display */
  dateFormat?: string;

  /** Minimum selectable date */
  minDate?: Date | string;

  /** Maximum selectable date */
  maxDate?: Date | string;

  /** Start view (month, year, multi-year) */
  startView?: 'month' | 'year' | 'multi-year';

  /** Date to open calendar at */
  startAt?: Date | string;

  /** Enables touch UI mode */
  touchUi?: boolean;

  /** Filter function for allowed dates */
  dateFilter?: (date: Date | null) => boolean;
}

export interface MaterialDateRangeMetadata extends FieldMetadata {
  controlType: typeof FieldControlType.DATE_RANGE;

  /** Minimum selectable date */
  minDate?: Date | string;

  /** Maximum selectable date */
  maxDate?: Date | string;

  /** Date to open calendar at */
  startAt?: Date | string;

  /** Enables touch UI mode */
  touchUi?: boolean;

  /** Filter function for allowed dates */
  dateFilter?: (date: Date | null) => boolean;

  /** Placeholder for start date input */
  startPlaceholder?: string;

  /** Placeholder for end date input */
  endPlaceholder?: string;

  /** Accessibility label for start date input */
  startAriaLabel?: string;

  /** Accessibility label for end date input */
  endAriaLabel?: string;

  /** Start view (month, year, multi-year) */
  startView?: 'month' | 'year' | 'multi-year';
}

/**
 * Metadata for a price range input using two currency fields.
 */
export interface MaterialPriceRangeMetadata extends FieldMetadata {
  controlType: typeof FieldControlType.RANGE_SLIDER;

  /** Minimum allowed value */
  min?: number;

  /** Maximum allowed value */
  max?: number;

  /** Step for value increments */
  step?: number;

  /** Currency code (USD, EUR, BRL, etc.) */
  currency: string;

  /** Currency symbol position */
  currencyPosition?: 'before' | 'after';

  /** Number of decimal places */
  decimalPlaces?: number;

  /** Locale for formatting */
  locale?: string;

  /** Thousands separator override */
  thousandsSeparator?: string;

  /** Decimal separator override */
  decimalSeparator?: string;

  /** Allow negative values */
  allowNegative?: boolean;

  /** Placeholder for start input */
  startPlaceholder?: string;

  /** Placeholder for end input */
  endPlaceholder?: string;

  /** Label for start input */
  startLabel?: string;

  /** Label for end input */
  endLabel?: string;
}

/**
 * Specialized metadata for Material Button components.
 *
 * Handles action buttons with various styles,
 * icons, and click behaviors.
 */
export interface MaterialButtonMetadata extends FieldMetadata {
  controlType: typeof FieldControlType.BUTTON;

  /** Button style variant */
  variant?: 'raised' | 'stroked' | 'flat' | 'icon' | 'fab' | 'mini-fab';

  /** Button color theme */
  color?: ThemePalette;

  /** Button icon */
  icon?: string;

  /** Icon position */
  buttonIconPosition?: 'before' | 'after';

  /** Button action/command */
  action?: string;

  /** Disable button ripple effect */
  disableRipple?: boolean;

  /** Confirmation message for destructive actions */
  confirmationMessage?: string;

  /** Confirmation dialog title */
  confirmationTitle?: string;

  /** Custom confirmation dialog buttons */
  confirmationButtons?: {
    confirm: string;
    cancel: string;
  };
}

// =============================================================================
// FUTURE COMPONENT INTERFACES - PLANNING STAGE
// =============================================================================
//
// ⚠️ IMPORTANTE: Estas interfaces foram criadas para definir a API futura
// dos componentes, mas os componentes físicos ainda NÃO foram implementados.
//
// Status atual:
// - ✅ Interface de metadata definida
// - ❌ Componente físico não implementado
// - ❌ Não registrado no ComponentRegistry
//
// Para usar essas interfaces, será necessário implementar os componentes
// correspondentes em praxis-dynamic-fields/src/lib/components/
// =============================================================================

/**
 * Specialized metadata for Material Toggle/Switch components.
 *
 * Implemented via `MaterialToggleComponent` and registered in
 * `ComponentRegistryService`.
 *
 * Handles boolean toggle state with Material Design switch styling.
 */
export interface MaterialToggleMetadata extends FieldMetadata {
  controlType: typeof FieldControlType.TOGGLE;

  /** Toggle color theme */
  color?: ThemePalette;

  /** Toggle label position */
  labelPosition?: 'before' | 'after';

  /** Hide toggle thumb icon */
  hideIcon?: boolean;

  /** Disable toggle ripple effect */
  disableRipple?: boolean;
}

/**
 * Specialized metadata for Material Slider components.
 *
 * Implemented via `MaterialSliderComponent` and registered in
 * `ComponentRegistryService`.
 *
 * Handles numeric range selection with visual slider control.
 */
export interface MaterialSliderMetadata extends FieldMetadata {
  controlType: typeof FieldControlType.SLIDER;

  /** Minimum value */
  min?: number;

  /** Maximum value */
  max?: number;

  /** Step increment */
  step?: number;

  /** Show value label */
  thumbLabel?: boolean;

  /** Slider orientation */
  vertical?: boolean;

  /** Slider color theme */
  color?: ThemePalette;

  /** Show tick marks */
  tickInterval?: number | 'auto';

  /** Invert slider direction */
  invert?: boolean;
}

/**
 * Specialized metadata for Material Rating components.
 *
 * ⚠️ COMPONENTE NÃO IMPLEMENTADO - Interface de planejamento
 *
 * Para implementar: criar MaterialRatingComponent em components/material-rating/
 * e registrar no ComponentRegistryService
 *
 * Handles star rating or numeric rating selection.
 */
export interface MaterialRatingMetadata extends FieldMetadata {
  controlType: typeof FieldControlType.RATING;

  /** Maximum rating value */
  max?: number;

  /** Rating precision (0.1, 0.5, 1) */
  precision?: number;

  /** Rating icon (default: star) */
  icon?: string;

  /** Empty icon (default: star_border) */
  emptyIcon?: string;

  /** Rating color theme */
  color?: ThemePalette;

  /** Enable half-star ratings */
  allowHalf?: boolean;

  /** Read-only mode */
  readonly?: boolean;

  /** Rating size */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Specialized metadata for Material Color Picker components.
 *
 * ⚠️ COMPONENTE NÃO IMPLEMENTADO - Interface de planejamento
 *
 * Para implementar: criar MaterialColorPickerComponent em components/material-colorpicker/
 * e registrar no ComponentRegistryService
 *
 * Handles color selection with various picker interfaces.
 */
export interface MaterialColorPickerMetadata extends FieldMetadata {
  controlType: typeof FieldControlType.COLOR_PICKER;

  /** Color picker format */
  format?: 'hex' | 'rgb' | 'hsl' | 'hsv';

  /** Show alpha/transparency slider */
  showAlpha?: boolean;

  /** Predefined color palette */
  presetColors?: string[];

  /** Allow custom colors */
  allowCustomColors?: boolean;

  /** Color picker variant */
  variant?: 'compact' | 'default' | 'block';

  /** Show color input field */
  showInput?: boolean;

  /** Show color preview */
  showPreview?: boolean;
}

// =============================================================================
// SPECIALIZED COMPONENT INTERFACES - PLANNING STAGE
// =============================================================================
//
// ⚠️ IMPORTANTE: Estas interfaces especializadas foram criadas para estender
// funcionalidades dos componentes base, mas os componentes especializados
// ainda NÃO foram implementados.
//
// Status atual:
// - ✅ Interface de metadata definida
// - ❌ Componente especializado não implementado
// - ❌ Atualmente usa MaterialInputComponent genérico
//
// Estes tipos são registrados no ComponentRegistry mas apontam para
// MaterialInputComponent. Para funcionalidade completa, implementar
// componentes especializados correspondentes.
// =============================================================================

/**
 * Specialized metadata for Material Currency Input components.
 *
 * Implemented via `MaterialCurrencyComponent` and registered in
 * `ComponentRegistryService`.
 *
 * Handles monetary values with currency formatting and validation.
 */
export interface MaterialCurrencyMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.CURRENCY_INPUT;
  inputType: 'text';

  /** Currency code (USD, EUR, BRL, etc.) */
  currency: string;

  /** Currency symbol position */
  currencyPosition?: 'before' | 'after';

  /** Number of decimal places */
  decimalPlaces?: number;

  /** Locale for formatting */
  locale?: string;

  /** Allow negative values */
  allowNegative?: boolean;

  /** Thousands separator */
  thousandsSeparator?: string;

  /** Decimal separator */
  decimalSeparator?: string;
}

/**
 * Specialized metadata for Material Email Input components.
 *
 * ⚠️ COMPONENTE ESPECIALIZADO NÃO IMPLEMENTADO - Interface de planejamento
 *
 * Atualmente: EMAIL_INPUT → MaterialInputComponent (genérico)
 * Para implementar: criar MaterialEmailComponent em components/material-email/
 *
 * Handles email addresses with validation and suggestions.
 */
export interface MaterialEmailMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.EMAIL_INPUT;
  inputType: 'email';

  /** Enable email domain suggestions */
  domainSuggestions?: string[];

  /** Validate email format on blur */
  validateOnBlur?: boolean;

  /** Show validation icon */
  showValidationIcon?: boolean;

  /** Allow multiple emails (comma-separated) */
  multiple?: boolean;

  /** Email separator for multiple emails */
  separator?: string;
}

/**
 * Specialized metadata for Material Phone Input components.
 *
 * ⚠️ COMPONENTE ESPECIALIZADO NÃO IMPLEMENTADO - Interface de planejamento
 *
 * Atualmente: PHONE → MaterialInputComponent (genérico)
 * Para implementar: criar MaterialPhoneComponent em components/material-phone/
 *
 * Handles phone numbers with international formatting.
 */
export interface MaterialPhoneMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.PHONE;
  inputType: 'tel';

  /** Default country code */
  defaultCountry?: string;

  /** Allowed country codes */
  allowedCountries?: string[];

  /** Show country selector */
  showCountrySelector?: boolean;

  /** Phone number format */
  phoneFormat?: 'national' | 'international' | 'e164';

  /** Enable auto-formatting while typing */
  autoFormat?: boolean;

  /** Validate phone number */
  validatePhoneNumber?: boolean;
}

/**
 * Metadata for Material Password Input components.
 *
 * TODO: Implement show/hide toggle and strength indicator.
 */
export interface MaterialPasswordMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.PASSWORD;
  inputType: 'password';
}

/**
 * Metadata for Material URL Input components.
 *
 * TODO: Add URL validation and preview options.
 */
export interface MaterialUrlInputMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.URL_INPUT;
  inputType: 'url';
}

/**
 * Metadata for Material Search Input components.
 *
 * TODO: Integrate with search handlers and clear button.
 */
export interface MaterialSearchInputMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.SEARCH_INPUT;
  inputType: 'search';
}

/**
 * Metadata for Material Date Input components.
 *
 * Supports native `min` and `max` attributes for constraining the
 * selectable date range.
 */
export interface MaterialDateInputMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.DATE_INPUT;
  inputType: 'date';
  /** Minimum selectable date in ISO format (YYYY-MM-DD). */
  min?: string;
  /** Maximum selectable date in ISO format (YYYY-MM-DD). */
  max?: string;
}

/**
 * Metadata for Material Datetime Local Input components.
 *
 * Supports native `min`, `max` and `step` attributes for constraining
 * selectable date-time ranges.
 *
 * TODO: Handle timezone conversion.
 */
export interface MaterialDatetimeLocalInputMetadata
  extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.DATETIME_LOCAL_INPUT;
  inputType: 'datetime-local';
  /** Minimum selectable date-time in ISO format (YYYY-MM-DDTHH:mm). */
  min?: string;
  /** Maximum selectable date-time in ISO format (YYYY-MM-DDTHH:mm). */
  max?: string;
  /** Step for minute increments in seconds. */
  step?: number;
}

/**
 * Metadata for Material Email Input components.
 *
 * Provides configuration for email fields with native autocomplete and
 * validation.
 */
export interface MaterialEmailInputMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.EMAIL_INPUT;
  inputType: 'email';
}

/**
 * Metadata for Material Month Input components.
 *
 * TODO: Validate month format and provide display options.
 */
export interface MaterialMonthInputMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.MONTH_INPUT;
  inputType: 'month';
  /** Minimum selectable month in ISO format (YYYY-MM). */
  min?: string;
  /** Maximum selectable month in ISO format (YYYY-MM). */
  max?: string;
}

/**
 * Metadata for Material Week Input components.
 *
 * TODO: Validate ISO week format and boundaries.
 */
export interface MaterialWeekInputMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.WEEK_INPUT;
  inputType: 'week';
  /** Minimum selectable week in ISO format (YYYY-Www). */
  min?: string;
  /** Maximum selectable week in ISO format (YYYY-Www). */
  max?: string;
}

/**
 * Metadata for Material Color Input components.
 *
 * TODO: Add color preview or palette integration.
 */
export interface MaterialColorInputMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.COLOR_INPUT;
  inputType: 'color';
}

/**
 * Metadata for Material Time Input components.
 *
 * TODO: Provide min/max and step configuration.
 */
export interface MaterialTimeInputMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.TIME_INPUT;
  inputType: 'time';
  /** Minimum time value in 24h format (HH:mm). */
  min?: string;
  /** Maximum time value in 24h format (HH:mm). */
  max?: string;
  /** Step for minute increments in seconds. */
  step?: number;
}

/**
 * Metadata for Material Timepicker components.
 *
 * Configures the Angular Material `mat-timepicker` which allows
 * selecting a time of day through an overlay panel.
 */
export interface MaterialTimepickerMetadata extends BaseMaterialInputMetadata {
  controlType: typeof FieldControlType.TIME_PICKER;
  /** Minimum selectable time in 24h format (HH:mm or HH:mm:ss). */
  min?: string;

  /** Maximum selectable time in 24h format (HH:mm or HH:mm:ss). */
  max?: string;

  /**
   * Interval between options in the timepicker.
   * Can be a number of seconds or a string with units like '30m'.
   * Ignored if `options` is provided.
   */
  interval?: number | string;

  /** Specific selectable time options. Takes precedence over `interval`. */
  timeOptions?: string[];

  /** Whether clicking the input should open the timepicker overlay. */
  openOnClick?: boolean;

  /** Use touch-friendly dialog UI. */
  touchUi?: boolean;

  /** Display time using 12-hour or 24-hour format. */
  format?: '12h' | '24h';

  /** Include seconds in the selection. */
  showSeconds?: boolean;

  /** Minute increment when entering time manually. */
  stepMinute?: number;

  /** Second increment when entering time manually. */
  stepSecond?: number;

  /** Identifier of a custom filter function to disable specific times. */
  timeFilter?: string;
}

/**
 * Node structure used by `MaterialMultiSelectTreeMetadata`.
 */
export interface MaterialTreeNode {
  /** Display label for the node */
  label: string;
  /** Value associated with the node */
  value: any;
  /** Whether the node is disabled */
  disabled?: boolean;
  /** Child nodes */
  children?: MaterialTreeNode[];
}

/**
 * Metadata configuration for the Material Multi Select Tree component.
 */
export interface MaterialMultiSelectTreeMetadata extends FieldMetadata {
  controlType: typeof FieldControlType.MULTI_SELECT_TREE;
  /** Tree nodes to display */
  nodes?: MaterialTreeNode[];
  /** Enable search input */
  searchable?: boolean;
  /** Show select all option */
  selectAll?: boolean;
  /** Maximum number of selections allowed */
  maxSelections?: number;
}
