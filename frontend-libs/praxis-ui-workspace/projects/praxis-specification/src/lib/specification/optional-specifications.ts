import { Specification } from './specification';
import { SpecificationMetadata } from './specification-metadata';

/**
 * Only applies the inner specification if the field is defined (not null, undefined, or empty)
 */
export class IfDefinedSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private field: keyof T,
    private innerSpecification: Specification<T>,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    const fieldValue = obj[this.field];
    
    // If field is not defined, validation passes
    if (this.isUndefined(fieldValue)) {
      return true;
    }

    // If field is defined, apply the inner specification
    return this.innerSpecification.isSatisfiedBy(obj);
  }

  private isUndefined(value: any): boolean {
    return value === null || value === undefined || value === '';
  }

  toJSON(): any {
    return {
      type: 'ifDefined',
      field: String(this.field),
      specification: this.innerSpecification.toJSON(),
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): IfDefinedSpecification<T> {
    throw new Error('Use SpecificationFactory.fromJSON() for proper reconstruction');
  }

  toDSL(): string {
    return `ifDefined(${String(this.field)}, ${this.innerSpecification.toDSL()})`;
  }

  clone(): IfDefinedSpecification<T> {
    return new IfDefinedSpecification<T>(
      this.field,
      this.innerSpecification.clone(),
      this.metadata
    );
  }

  getField(): keyof T {
    return this.field;
  }

  getInnerSpecification(): Specification<T> {
    return this.innerSpecification;
  }
}

/**
 * Only applies the inner specification if the field value is not null
 */
export class IfNotNullSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private field: keyof T,
    private innerSpecification: Specification<T>,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    const fieldValue = obj[this.field];
    
    // If field is null, validation passes
    if (fieldValue === null) {
      return true;
    }

    // If field is not null, apply the inner specification
    return this.innerSpecification.isSatisfiedBy(obj);
  }

  toJSON(): any {
    return {
      type: 'ifNotNull',
      field: String(this.field),
      specification: this.innerSpecification.toJSON(),
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): IfNotNullSpecification<T> {
    throw new Error('Use SpecificationFactory.fromJSON() for proper reconstruction');
  }

  toDSL(): string {
    return `ifNotNull(${String(this.field)}, ${this.innerSpecification.toDSL()})`;
  }

  clone(): IfNotNullSpecification<T> {
    return new IfNotNullSpecification<T>(
      this.field,
      this.innerSpecification.clone(),
      this.metadata
    );
  }

  getField(): keyof T {
    return this.field;
  }

  getInnerSpecification(): Specification<T> {
    return this.innerSpecification;
  }
}

/**
 * Only applies the inner specification if the field exists as a property on the object
 */
export class IfExistsSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private field: keyof T,
    private innerSpecification: Specification<T>,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    // If field doesn't exist as a property, validation passes
    if (!(this.field in obj)) {
      return true;
    }

    // If field exists, apply the inner specification
    return this.innerSpecification.isSatisfiedBy(obj);
  }

  toJSON(): any {
    return {
      type: 'ifExists',
      field: String(this.field),
      specification: this.innerSpecification.toJSON(),
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): IfExistsSpecification<T> {
    throw new Error('Use SpecificationFactory.fromJSON() for proper reconstruction');
  }

  toDSL(): string {
    return `ifExists(${String(this.field)}, ${this.innerSpecification.toDSL()})`;
  }

  clone(): IfExistsSpecification<T> {
    return new IfExistsSpecification<T>(
      this.field,
      this.innerSpecification.clone(),
      this.metadata
    );
  }

  getField(): keyof T {
    return this.field;
  }

  getInnerSpecification(): Specification<T> {
    return this.innerSpecification;
  }
}

/**
 * Provides a default value for a field if it's undefined, then applies the specification
 */
export class WithDefaultSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private field: keyof T,
    private defaultValue: any,
    private innerSpecification: Specification<T>,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    // Create a copy of the object with default value if field is undefined
    const objWithDefault = { ...obj };
    
    if (this.isUndefined(obj[this.field])) {
      (objWithDefault as any)[this.field] = this.defaultValue;
    }

    return this.innerSpecification.isSatisfiedBy(objWithDefault);
  }

  private isUndefined(value: any): boolean {
    return value === null || value === undefined;
  }

  toJSON(): any {
    return {
      type: 'withDefault',
      field: String(this.field),
      defaultValue: this.defaultValue,
      specification: this.innerSpecification.toJSON(),
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): WithDefaultSpecification<T> {
    throw new Error('Use SpecificationFactory.fromJSON() for proper reconstruction');
  }

  toDSL(): string {
    const defaultStr = JSON.stringify(this.defaultValue);
    return `withDefault(${String(this.field)}, ${defaultStr}, ${this.innerSpecification.toDSL()})`;
  }

  clone(): WithDefaultSpecification<T> {
    return new WithDefaultSpecification<T>(
      this.field,
      this.defaultValue,
      this.innerSpecification.clone(),
      this.metadata
    );
  }

  getField(): keyof T {
    return this.field;
  }

  getDefaultValue(): any {
    return this.defaultValue;
  }

  getInnerSpecification(): Specification<T> {
    return this.innerSpecification;
  }
}