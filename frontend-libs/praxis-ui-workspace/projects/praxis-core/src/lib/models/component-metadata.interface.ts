/**
 * @fileoverview Base metadata interfaces for dynamic Angular Material components
 * 
 * This file implements a hierarchical system of metadata interfaces designed for
 * maximum flexibility, type safety, and Angular Material integration.
 * 
 * Architecture:
 * - ComponentMetadata (universal base)
 * - FieldMetadata (form fields)  
 * - Specialized interfaces (MaterialInput, MaterialSelect, etc.)
 * 
 * Design Principles:
 * - Configuration over Code
 * - JSON serializable
 * - Type-safe with strict TypeScript
 * - Backward compatible
 * - Angular Material 3 native support
 */

import { FieldDataType } from '../metadata/field-data-type.constants';
import { FieldControlType } from '../metadata/field-control-type.constants';

// Re-export para compatibilidade
export { FieldControlType, FieldDataType };

// =============================================================================
// BASE INTERFACES
// =============================================================================

/**
 * Universal base interface for all dynamic components.
 * 
 * Provides maximum extensibility through index signature while maintaining
 * essential metadata properties for component lifecycle management.
 * 
 * @example
 * ```typescript
 * const buttonMetadata: ComponentMetadata = {
 *   id: 'submit-btn',
 *   version: '1.0.0',
 *   context: 'form',
 *   customProperty: 'any value'
 * };
 * ```
 */
export interface ComponentMetadata {
  /** Unique identifier for the component instance */
  id?: string;
  
  /** Metadata schema version for migration support */
  version?: string;
  
  /** Application context where component is used */
  context?: 'form' | 'filter' | 'table' | 'dialog' | 'standalone';
  
  /** Timestamp when metadata was created */
  createdAt?: string;
  
  /** Timestamp when metadata was last updated */
  updatedAt?: string;
  
  /** Tags for categorization and filtering */
  tags?: string[];
  
  /** Custom CSS classes to apply to the component */
  cssClass?: string;
  
  /** Inline styles as CSS properties object */
  style?: Record<string, string>;
  
  /** Data attributes for testing or analytics */
  dataAttributes?: Record<string, string>;
  
  /** Extensibility: allow any additional properties */
  [key: string]: any;
}

/**
 * Enhanced validation configuration for comprehensive field validation.
 * 
 * Supports both built-in Angular validators and custom validation logic
 * with internationalization support for error messages.
 */
export interface ValidatorOptions {
  // =============================================================================
  // BASIC VALIDATORS
  // =============================================================================
  
  /** Field is required */
  required?: boolean;
  
  /** Custom message for required validation */
  requiredMessage?: string;
  
  /** Minimum text length */
  minLength?: number;
  
  /** Custom message for minLength validation */
  minLengthMessage?: string;
  
  /** Maximum text length */
  maxLength?: number;
  
  /** Custom message for maxLength validation */
  maxLengthMessage?: string;
  
  /** Minimum numeric value */
  min?: number;
  
  /** Custom message for min validation */
  minMessage?: string;
  
  /** Maximum numeric value */
  max?: number;
  
  /** Custom message for max validation */
  maxMessage?: string;
  
  // =============================================================================
  // PATTERN VALIDATORS
  // =============================================================================
  
  /** RegExp pattern for validation */
  pattern?: string | RegExp;
  
  /** Custom message for pattern validation */
  patternMessage?: string;
  
  /** Built-in email validation */
  email?: boolean;
  
  /** Custom message for email validation */
  emailMessage?: string;
  
  /** Built-in URL validation */
  url?: boolean;
  
  /** Custom message for URL validation */
  urlMessage?: string;
  
  // =============================================================================
  // ADVANCED VALIDATORS
  // =============================================================================
  
  /** Custom synchronous validator function */
  customValidator?: (value: any, context?: any) => boolean | string | null;
  
  /** Custom asynchronous validator function */
  asyncValidator?: (value: any, context?: any) => Promise<boolean | string | null>;
  
  /** Cross-field validation - must match another field */
  matchField?: string;
  
  /** Custom message for field matching validation */
  matchFieldMessage?: string;
  
  /** Unique value validation via API call */
  uniqueValidator?: (value: any) => Promise<boolean>;
  
  /** Custom message for unique validation */
  uniqueMessage?: string;
  
  /** Conditional validation rules */
  conditionalValidation?: {
    condition: (formValue: any) => boolean;
    validators: Omit<ValidatorOptions, 'conditionalValidation'>;
  }[];
  
  /** Require checkbox to be checked (for checkbox fields) */
  requiredChecked?: boolean;
  
  // =============================================================================
  // VALIDATION BEHAVIOR
  // =============================================================================
  
  /** When to trigger validation */
  validationTrigger?: 'change' | 'blur' | 'submit' | 'immediate';
  
  /** Debounce time for validation in milliseconds */
  validationDebounce?: number;
  
  /** Show validation errors inline */
  showInlineErrors?: boolean;
  
  /** Custom error display position */
  errorPosition?: 'bottom' | 'top' | 'tooltip';
}

/**
 * Configuration for field options in selection components.
 * 
 * Supports both static arrays and dynamic loading from APIs
 * with flexible data transformation capabilities.
 */
export interface FieldOption {
  /** The actual value to be stored */
  value: any;
  
  /** Display text shown to user */
  text: string;
  
  /** Optional grouping for organized display */
  group?: string;
  
  /** Whether this option is disabled */
  disabled?: boolean;
  
  /** Additional data associated with option */
  data?: any;
  
  /** CSS class for styling */
  cssClass?: string;
  
  /** Icon to display with option */
  icon?: string;
  
  /** Tooltip text for option */
  tooltip?: string;
}

/**
 * Angular Material specific styling and behavior options.
 * 
 * Covers appearance, theming, density, and interaction patterns
 * specific to Material Design 3 components.
 */
export interface MaterialDesignConfig {
  /** Material appearance variant */
  appearance?: 'fill' | 'outline';
  
  /** Material color theme */
  color?: 'primary' | 'accent' | 'warn' | 'basic';
  
  /** Label floating behavior */
  floatLabel?: 'auto' | 'always' | 'never';
  
  /** Subscript sizing strategy */
  subscriptSizing?: 'fixed' | 'dynamic';
  
  /** Hide required marker asterisk */
  hideRequiredMarker?: boolean;
  
  /** Component density */
  density?: 'comfortable' | 'compact' | 'dense';
  
  /** Disable ripple effects */
  disableRipple?: boolean;
  
  /** Custom theme palette override */
  customPalette?: {
    primary?: string;
    accent?: string;
    warn?: string;
  };
  
  /** Animation configuration */
  animations?: {
    disabled?: boolean;
    duration?: number;
    easing?: string;
  };
}

// =============================================================================
// FIELD METADATA - CORE INTERFACE
// =============================================================================

/**
 * Comprehensive metadata interface for form fields.
 * 
 * This is the main interface that extends ComponentMetadata with field-specific
 * properties covering behavior, validation, data binding, and UI configuration.
 * 
 * @example
 * ```typescript
 * const emailField: FieldMetadata = {
 *   name: 'email',
 *   label: 'Email Address',
 *   controlType: 'input',
 *   required: true,
 *   validators: {
 *     required: true,
 *     email: true,
 *     requiredMessage: 'Email is required',
 *     emailMessage: 'Please enter a valid email'
 *   },
 *   materialDesign: {
 *     appearance: 'outline',
 *     color: 'primary'
 *   }
 * };
 * ```
 */
export interface FieldMetadata extends ComponentMetadata {
  // =============================================================================
  // IDENTITY AND STRUCTURE
  // =============================================================================
  
  /** Unique field identifier (required) */
  name: string;
  
  /** Display label for the field */
  label: string;
  
  /** Field control type for component resolution */
  controlType: FieldControlType;
  
  /** Data type for processing and validation */
  dataType?: FieldDataType;
  
  /** Display order in form */
  order?: number;
  
  /** Logical grouping of related fields */
  group?: string;
  
  /** Detailed description for tooltips */
  description?: string;
  
  // =============================================================================
  // BEHAVIOR AND STATE
  // =============================================================================
  
  /** Field is required */
  required?: boolean;
  
  /** Field is disabled */
  disabled?: boolean;
  
  /** Field is read-only */
  readOnly?: boolean;
  
  /** Field is hidden from display */
  hidden?: boolean;
  
  /** Default value when form initializes */
  defaultValue?: any;
  
  /** Placeholder text for empty fields */
  placeholder?: string;
  
  /** Help text displayed below field */
  hint?: string;
  
  /** Tooltip text on hover */
  tooltip?: string;
  
  // =============================================================================
  // VALIDATION CONFIGURATION
  // =============================================================================
  
  /** Comprehensive validation rules */
  validators?: ValidatorOptions;
  
  /** When to validate field changes */
  validationMode?: 'immediate' | 'blur' | 'submit';
  
  /** Debounce time for validation (ms) */
  debounceTime?: number;
  
  /** Validate uniqueness via API */
  unique?: boolean;
  
  // =============================================================================
  // DATA BINDING AND OPTIONS
  // =============================================================================
  
  /** Static options for selection fields */
  options?: FieldOption[];
  
  /** API endpoint for dynamic data loading */
  endpoint?: string;
  
  /** Field name for option values */
  valueField?: string;
  
  /** Field name for option display text */
  displayField?: string;
  
  /** Field name for option filtering */
  filterField?: string;
  
  /** Additional query parameters for API calls */
  queryParams?: Record<string, any>;
  
  /** Cache duration for remote data (ms) */
  cacheDuration?: number;
  
  // =============================================================================
  // UI CONFIGURATION
  // =============================================================================
  
  /** Field width specification */
  width?: string | number;
  
  /** Use flexbox sizing */
  isFlex?: boolean;
  
  /** Icons configuration */
  prefixIcon?: string;
  suffixIcon?: string;
  iconPosition?: 'start' | 'end';
  iconSize?: 'small' | 'medium' | 'large';
  
  /** Input masking pattern */
  mask?: string;
  
  /** Format for display values */
  format?: string;
  
  /** Material Design specific configuration */
  materialDesign?: MaterialDesignConfig;
  
  // =============================================================================
  // ADVANCED BEHAVIOR
  // =============================================================================
  
  /** Fields this field depends on */
  dependencyFields?: string[];
  
  /** Conditional required based on other fields */
  conditionalRequired?: string | ((formValue: any) => boolean);
  
  /** Conditional visibility rules */
  conditionalDisplay?: string | ((formValue: any) => boolean);
  
  /** Reset value when dependency changes */
  resetOnDependentChange?: boolean;
  
  /** Allow inline editing in tables */
  inlineEditing?: boolean;
  
  /** Transform value before display */
  transformDisplayValue?: (value: any) => any;
  
  /** Transform value before saving */
  transformSaveValue?: (value: any) => any;
  
  // =============================================================================
  // CONTEXT VISIBILITY
  // =============================================================================
  
  /** Contexts where field should be visible */
  visibleIn?: Array<'form' | 'filter' | 'table' | 'dialog'>;
  
  /** Hide in specific form contexts */
  formHidden?: boolean;
  
  /** Hide in table contexts */
  tableHidden?: boolean;
  
  /** Hide in filter contexts */
  filterHidden?: boolean;
  
  // =============================================================================
  // ACCESSIBILITY
  // =============================================================================
  
  /** ARIA label for screen readers */
  ariaLabel?: string;
  
  /** ARIA described by element IDs */
  ariaDescribedBy?: string;
  
  /** Tab index for keyboard navigation */
  tabIndex?: number;
  
  /** Keyboard shortcuts */
  accessKey?: string;
}

// =============================================================================
// CONTROL TYPE CONSTANTS
// =============================================================================

// FieldControlType é importado das constantes para evitar duplicação

// FieldDataType é importado das constantes para evitar duplicação

// =============================================================================
// DATE RANGE SPECIFIC INTERFACES
// =============================================================================

/**
 * Date range value object for daterange control type.
 * 
 * Represents a date range selection with start and end dates,
 * commonly used in corporate reporting and analytics scenarios.
 * 
 * @example
 * ```typescript
 * const quarterRange: DateRangeValue = {
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-03-31'),
 *   preset: 'thisQuarter',
 *   timezone: 'America/New_York'
 * };
 * ```
 */
export interface DateRangeValue {
  /** Start date of the range */
  startDate: Date | null;
  
  /** End date of the range */
  endDate: Date | null;
  
  /** Applied preset name if range was selected via preset */
  preset?: string;
  
  /** Timezone context for the range */
  timezone?: string;
  
  /** User-friendly label for the range */
  label?: string;
  
  /** Whether this is a comparison range */
  isComparison?: boolean;
}

/**
 * Corporate preset configuration for date ranges.
 * 
 * Defines common business date ranges used in enterprise applications
 * for reporting, analytics, and compliance purposes.
 */
export interface DateRangePreset {
  /** Unique identifier for the preset */
  id: string;
  
  /** Display label for the preset */
  label: string;
  
  /** Icon to display with the preset */
  icon?: string;
  
  /** Category for grouping presets */
  category?: 'standard' | 'fiscal' | 'custom' | 'comparison';
  
  /** Function to calculate the date range */
  calculateRange: (referenceDate?: Date) => DateRangeValue;
  
  /** Whether this preset is commonly used */
  isPopular?: boolean;
  
  /** Tooltip description */
  description?: string;
  
  /** Display order in preset list */
  order?: number;
}

// =============================================================================
// TYPE UTILITIES
// =============================================================================

/** Helper type for partial field metadata updates */
export type PartialFieldMetadata = Partial<FieldMetadata> & {
  name: string;
};

/** Helper type for required core field properties */
export type CoreFieldMetadata = Pick<FieldMetadata, 'name' | 'label' | 'controlType'>;

/** Helper type for field metadata without computed properties */
export type SerializableFieldMetadata = Omit<FieldMetadata, 'conditionalRequired' | 'conditionalDisplay' | 'transformDisplayValue' | 'transformSaveValue'>;