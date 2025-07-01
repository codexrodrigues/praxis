import { Specification } from './specification';
import { SpecificationMetadata } from './specification-metadata';
import { RequiredIfSpecification, VisibleIfSpecification, DisabledIfSpecification, ReadonlyIfSpecification } from './conditional-validators';

/**
 * Form validation result for a specific field
 */
export interface FieldValidationResult {
  field: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: SpecificationMetadata;
}

/**
 * Complete form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  fields: Record<string, FieldValidationResult>;
  globalErrors: string[];
  warnings: string[];
}

/**
 * Field rules configuration
 */
export interface FieldRules<T extends object = any> {
  validation?: Specification<T>[];
  required?: boolean | Specification<T>;
  visible?: boolean | Specification<T>;
  disabled?: boolean | Specification<T>;
  readonly?: boolean | Specification<T>;
  metadata?: SpecificationMetadata;
}

/**
 * Form specification that manages validation rules for multiple fields
 */
export class FormSpecification<T extends object = any> extends Specification<T> {
  private fieldRules = new Map<keyof T, FieldRules<T>>();
  private globalValidations: Specification<T>[] = [];

  constructor(metadata?: SpecificationMetadata) {
    super(metadata);
  }

  /**
   * Adds validation rules for a specific field
   */
  addFieldRules(field: keyof T, rules: FieldRules<T>): FormSpecification<T> {
    this.fieldRules.set(field, rules);
    return this;
  }

  /**
   * Adds a global validation rule that applies to the entire form
   */
  addGlobalValidation(specification: Specification<T>): FormSpecification<T> {
    this.globalValidations.push(specification);
    return this;
  }

  /**
   * Sets required condition for a field
   */
  setRequired(field: keyof T, condition: boolean | Specification<T>): FormSpecification<T> {
    const existing = this.fieldRules.get(field) || {};
    existing.required = condition;
    this.fieldRules.set(field, existing);
    return this;
  }

  /**
   * Sets visibility condition for a field
   */
  setVisible(field: keyof T, condition: boolean | Specification<T>): FormSpecification<T> {
    const existing = this.fieldRules.get(field) || {};
    existing.visible = condition;
    this.fieldRules.set(field, existing);
    return this;
  }

  /**
   * Sets disabled condition for a field
   */
  setDisabled(field: keyof T, condition: boolean | Specification<T>): FormSpecification<T> {
    const existing = this.fieldRules.get(field) || {};
    existing.disabled = condition;
    this.fieldRules.set(field, existing);
    return this;
  }

  /**
   * Sets readonly condition for a field
   */
  setReadonly(field: keyof T, condition: boolean | Specification<T>): FormSpecification<T> {
    const existing = this.fieldRules.get(field) || {};
    existing.readonly = condition;
    this.fieldRules.set(field, existing);
    return this;
  }

  /**
   * Basic satisfaction check - validates all rules
   */
  isSatisfiedBy(obj: T): boolean {
    const result = this.validateForm(obj);
    return result.isValid;
  }

  /**
   * Comprehensive form validation with detailed results
   */
  validateForm(obj: T): FormValidationResult {
    const result: FormValidationResult = {
      isValid: true,
      fields: {},
      globalErrors: [],
      warnings: []
    };

    // Validate each field
    for (const [field, rules] of this.fieldRules.entries()) {
      const fieldResult = this.validateField(field, rules, obj);
      result.fields[String(field)] = fieldResult;
      
      if (!fieldResult.isValid) {
        result.isValid = false;
      }
    }

    // Validate global rules
    for (const globalSpec of this.globalValidations) {
      try {
        if (!globalSpec.isSatisfiedBy(obj)) {
          const metadata = globalSpec.getMetadata();
          const message = metadata?.message || 'Global validation failed';
          result.globalErrors.push(message);
          result.isValid = false;
        }
      } catch (error) {
        result.globalErrors.push(`Global validation error: ${error}`);
        result.isValid = false;
      }
    }

    return result;
  }

  private validateField(field: keyof T, rules: FieldRules<T>, obj: T): FieldValidationResult {
    const fieldResult: FieldValidationResult = {
      field: String(field),
      isValid: true,
      errors: [],
      warnings: [],
      metadata: rules.metadata
    };

    // Check if field should be visible
    if (!this.isFieldVisible(field, rules, obj)) {
      // If field is not visible, skip validation
      return fieldResult;
    }

    // Check required validation
    if (rules.required) {
      const isRequired = typeof rules.required === 'boolean' 
        ? rules.required 
        : rules.required.isSatisfiedBy(obj);

      if (isRequired) {
        const fieldValue = obj[field];
        if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
          fieldResult.errors.push(rules.metadata?.message || `${String(field)} is required`);
          fieldResult.isValid = false;
        }
      }
    }

    // Run validation specifications
    if (rules.validation) {
      for (const spec of rules.validation) {
        try {
          if (!spec.isSatisfiedBy(obj)) {
            const metadata = spec.getMetadata();
            const message = metadata?.message || `${String(field)} validation failed`;
            fieldResult.errors.push(message);
            fieldResult.isValid = false;
          }
        } catch (error) {
          fieldResult.errors.push(`Validation error for ${String(field)}: ${error}`);
          fieldResult.isValid = false;
        }
      }
    }

    return fieldResult;
  }

  /**
   * Checks if a field should be visible
   */
  isFieldVisible(field: keyof T, rules: FieldRules<T> | undefined, obj: T): boolean {
    if (!rules?.visible) {
      return true; // Default to visible
    }

    return typeof rules.visible === 'boolean' 
      ? rules.visible 
      : rules.visible.isSatisfiedBy(obj);
  }

  /**
   * Checks if a field should be disabled
   */
  isFieldDisabled(field: keyof T, obj: T): boolean {
    const rules = this.fieldRules.get(field);
    if (!rules?.disabled) {
      return false; // Default to enabled
    }

    return typeof rules.disabled === 'boolean' 
      ? rules.disabled 
      : rules.disabled.isSatisfiedBy(obj);
  }

  /**
   * Checks if a field should be readonly
   */
  isFieldReadonly(field: keyof T, obj: T): boolean {
    const rules = this.fieldRules.get(field);
    if (!rules?.readonly) {
      return false; // Default to editable
    }

    return typeof rules.readonly === 'boolean' 
      ? rules.readonly 
      : rules.readonly.isSatisfiedBy(obj);
  }

  /**
   * Gets all configured fields
   */
  getFields(): (keyof T)[] {
    return Array.from(this.fieldRules.keys());
  }

  /**
   * Gets rules for a specific field
   */
  getFieldRules(field: keyof T): FieldRules<T> | undefined {
    return this.fieldRules.get(field);
  }

  toJSON(): any {
    const fieldsJson: Record<string, any> = {};
    
    for (const [field, rules] of this.fieldRules.entries()) {
      fieldsJson[String(field)] = {
        validation: rules.validation?.map(spec => spec.toJSON()),
        required: typeof rules.required === 'object' ? rules.required.toJSON() : rules.required,
        visible: typeof rules.visible === 'object' ? rules.visible.toJSON() : rules.visible,
        disabled: typeof rules.disabled === 'object' ? rules.disabled.toJSON() : rules.disabled,
        readonly: typeof rules.readonly === 'object' ? rules.readonly.toJSON() : rules.readonly,
        metadata: rules.metadata
      };
    }

    return {
      type: 'form',
      fields: fieldsJson,
      globalValidations: this.globalValidations.map(spec => spec.toJSON()),
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): FormSpecification<T> {
    throw new Error('FormSpecification.fromJSON not yet implemented - requires SpecificationFactory');
  }

  toDSL(): string {
    const parts: string[] = [];
    
    // Export field rules
    for (const [field, rules] of this.fieldRules.entries()) {
      if (rules.required && typeof rules.required === 'object') {
        parts.push(`requiredIf(${String(field)}, ${rules.required.toDSL()})`);
      }
      if (rules.visible && typeof rules.visible === 'object') {
        parts.push(`visibleIf(${String(field)}, ${rules.visible.toDSL()})`);
      }
      if (rules.disabled && typeof rules.disabled === 'object') {
        parts.push(`disabledIf(${String(field)}, ${rules.disabled.toDSL()})`);
      }
      if (rules.readonly && typeof rules.readonly === 'object') {
        parts.push(`readonlyIf(${String(field)}, ${rules.readonly.toDSL()})`);
      }
      if (rules.validation) {
        for (const spec of rules.validation) {
          parts.push(spec.toDSL());
        }
      }
    }

    // Export global validations
    for (const spec of this.globalValidations) {
      parts.push(spec.toDSL());
    }

    return parts.join(' && ');
  }

  clone(): FormSpecification<T> {
    const cloned = new FormSpecification<T>(this.metadata);
    
    // Clone field rules
    for (const [field, rules] of this.fieldRules.entries()) {
      const clonedRules: FieldRules<T> = {
        validation: rules.validation?.map(spec => spec.clone()),
        required: typeof rules.required === 'object' ? rules.required.clone() : rules.required,
        visible: typeof rules.visible === 'object' ? rules.visible.clone() : rules.visible,
        disabled: typeof rules.disabled === 'object' ? rules.disabled.clone() : rules.disabled,
        readonly: typeof rules.readonly === 'object' ? rules.readonly.clone() : rules.readonly,
        metadata: rules.metadata
      };
      cloned.fieldRules.set(field, clonedRules);
    }

    // Clone global validations
    cloned.globalValidations = this.globalValidations.map(spec => spec.clone());

    return cloned;
  }
}