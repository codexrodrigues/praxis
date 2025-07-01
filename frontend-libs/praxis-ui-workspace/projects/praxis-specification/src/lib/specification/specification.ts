import { SpecificationMetadata } from './specification-metadata';

export abstract class Specification<T extends object = any> {
  protected metadata?: SpecificationMetadata;

  constructor(metadata?: SpecificationMetadata) {
    this.metadata = metadata;
  }

  /**
   * Evaluates whether the given object satisfies this specification
   */
  abstract isSatisfiedBy(obj: T): boolean;

  /**
   * Serializes this specification to JSON format
   */
  abstract toJSON(): any;

  /**
   * Creates a specification from JSON format
   */
  static fromJSON<T extends object = any>(json: any): Specification<T> {
    throw new Error('fromJSON must be implemented by concrete classes');
  }

  /**
   * Exports this specification to DSL format
   */
  abstract toDSL(): string;

  /**
   * Gets the metadata associated with this specification
   */
  getMetadata(): SpecificationMetadata | undefined {
    return this.metadata;
  }

  /**
   * Sets the metadata for this specification
   */
  setMetadata(metadata: SpecificationMetadata): Specification<T> {
    this.metadata = metadata;
    return this;
  }

  /**
   * Creates a copy of this specification with additional metadata
   */
  withMetadata(metadata: SpecificationMetadata): Specification<T> {
    const copy = this.clone();
    copy.metadata = { ...this.metadata, ...metadata };
    return copy;
  }

  /**
   * Creates a deep copy of this specification
   */
  abstract clone(): Specification<T>;

  /**
   * Combines this specification with another using AND logic
   */
  and(other: Specification<T>): Specification<T> {
    // Return a generic specification that will be resolved at build time
    throw new Error('Use SpecificationFactory.and() instead of instance method');
  }

  /**
   * Combines this specification with another using OR logic
   */
  or(other: Specification<T>): Specification<T> {
    throw new Error('Use SpecificationFactory.or() instead of instance method');
  }

  /**
   * Negates this specification
   */
  not(): Specification<T> {
    throw new Error('Use SpecificationFactory.not() instead of instance method');
  }

  /**
   * Combines this specification with another using XOR logic
   */
  xor(other: Specification<T>): Specification<T> {
    throw new Error('Use SpecificationFactory.xor() instead of instance method');
  }

  /**
   * Creates an implication relationship (this implies other)
   */
  implies(other: Specification<T>): Specification<T> {
    throw new Error('Use SpecificationFactory.implies() instead of instance method');
  }
}