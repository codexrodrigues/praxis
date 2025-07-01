import { Specification } from './specification';
import { SpecificationMetadata } from './specification-metadata';

/**
 * Types of conditional validation
 */
export enum ConditionalType {
  REQUIRED_IF = 'requiredIf',
  VISIBLE_IF = 'visibleIf',
  DISABLED_IF = 'disabledIf',
  READONLY_IF = 'readonlyIf'
}

/**
 * Base class for conditional validators
 */
export abstract class ConditionalSpecification<T extends object = any> extends Specification<T> {
  constructor(
    protected condition: Specification<T>,
    protected conditionalType: ConditionalType,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  getCondition(): Specification<T> {
    return this.condition;
  }

  getConditionalType(): ConditionalType {
    return this.conditionalType;
  }

  abstract override clone(): ConditionalSpecification<T>;
}

/**
 * Validates that a field is required when a condition is met
 */
export class RequiredIfSpecification<T extends object = any> extends ConditionalSpecification<T> {
  constructor(
    private field: keyof T,
    condition: Specification<T>,
    metadata?: SpecificationMetadata
  ) {
    super(condition, ConditionalType.REQUIRED_IF, metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    // If condition is not met, validation passes (field is not required)
    if (!this.condition.isSatisfiedBy(obj)) {
      return true;
    }

    // If condition is met, check if field has a value
    const fieldValue = obj[this.field];
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
  }

  toJSON(): any {
    return {
      type: 'requiredIf',
      field: String(this.field),
      condition: this.condition.toJSON(),
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): RequiredIfSpecification<T> {
    // This would need the SpecificationFactory to reconstruct the condition
    throw new Error('Use SpecificationFactory.fromJSON() for proper reconstruction');
  }

  toDSL(): string {
    return `requiredIf(${String(this.field)}, ${this.condition.toDSL()})`;
  }

  clone(): RequiredIfSpecification<T> {
    return new RequiredIfSpecification<T>(this.field, this.condition.clone(), this.metadata);
  }

  getField(): keyof T {
    return this.field;
  }
}

/**
 * Determines if a field should be visible based on a condition
 */
export class VisibleIfSpecification<T extends object = any> extends ConditionalSpecification<T> {
  constructor(
    private field: keyof T,
    condition: Specification<T>,
    metadata?: SpecificationMetadata
  ) {
    super(condition, ConditionalType.VISIBLE_IF, metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    // This returns whether the field should be visible
    return this.condition.isSatisfiedBy(obj);
  }

  toJSON(): any {
    return {
      type: 'visibleIf',
      field: String(this.field),
      condition: this.condition.toJSON(),
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): VisibleIfSpecification<T> {
    throw new Error('Use SpecificationFactory.fromJSON() for proper reconstruction');
  }

  toDSL(): string {
    return `visibleIf(${String(this.field)}, ${this.condition.toDSL()})`;
  }

  clone(): VisibleIfSpecification<T> {
    return new VisibleIfSpecification<T>(this.field, this.condition.clone(), this.metadata);
  }

  getField(): keyof T {
    return this.field;
  }
}

/**
 * Determines if a field should be disabled based on a condition
 */
export class DisabledIfSpecification<T extends object = any> extends ConditionalSpecification<T> {
  constructor(
    private field: keyof T,
    condition: Specification<T>,
    metadata?: SpecificationMetadata
  ) {
    super(condition, ConditionalType.DISABLED_IF, metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    // This returns whether the field should be disabled
    return this.condition.isSatisfiedBy(obj);
  }

  toJSON(): any {
    return {
      type: 'disabledIf',
      field: String(this.field),
      condition: this.condition.toJSON(),
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): DisabledIfSpecification<T> {
    throw new Error('Use SpecificationFactory.fromJSON() for proper reconstruction');
  }

  toDSL(): string {
    return `disabledIf(${String(this.field)}, ${this.condition.toDSL()})`;
  }

  clone(): DisabledIfSpecification<T> {
    return new DisabledIfSpecification<T>(this.field, this.condition.clone(), this.metadata);
  }

  getField(): keyof T {
    return this.field;
  }
}

/**
 * Determines if a field should be readonly based on a condition
 */
export class ReadonlyIfSpecification<T extends object = any> extends ConditionalSpecification<T> {
  constructor(
    private field: keyof T,
    condition: Specification<T>,
    metadata?: SpecificationMetadata
  ) {
    super(condition, ConditionalType.READONLY_IF, metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    // This returns whether the field should be readonly
    return this.condition.isSatisfiedBy(obj);
  }

  toJSON(): any {
    return {
      type: 'readonlyIf',
      field: String(this.field),
      condition: this.condition.toJSON(),
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): ReadonlyIfSpecification<T> {
    throw new Error('Use SpecificationFactory.fromJSON() for proper reconstruction');
  }

  toDSL(): string {
    return `readonlyIf(${String(this.field)}, ${this.condition.toDSL()})`;
  }

  clone(): ReadonlyIfSpecification<T> {
    return new ReadonlyIfSpecification<T>(this.field, this.condition.clone(), this.metadata);
  }

  getField(): keyof T {
    return this.field;
  }
}