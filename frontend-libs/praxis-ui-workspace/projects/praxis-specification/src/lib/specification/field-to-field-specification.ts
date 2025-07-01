import { Specification } from './specification';
import { ComparisonOperator, OPERATOR_SYMBOLS } from './comparison-operator';
import { TransformRegistry } from '../registry/transform-registry';
import { SpecificationMetadata } from './specification-metadata';

export class FieldToFieldSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private fieldA: keyof T,
    private operator: ComparisonOperator,
    private fieldB: keyof T,
    private transformA?: string[],
    private transformB?: string[],
    private transformRegistry?: TransformRegistry,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    let valueA = obj[this.fieldA];
    let valueB = obj[this.fieldB];

    const registry = this.transformRegistry || TransformRegistry.getInstance();

    // Apply transforms if specified
    if (this.transformA && this.transformA.length > 0) {
      valueA = registry.applyChain(this.transformA, valueA);
    }
    if (this.transformB && this.transformB.length > 0) {
      valueB = registry.applyChain(this.transformB, valueB);
    }

    switch (this.operator) {
      case ComparisonOperator.EQUALS:
        return valueA === valueB;
      
      case ComparisonOperator.NOT_EQUALS:
        return valueA !== valueB;
      
      case ComparisonOperator.LESS_THAN:
        return valueA < valueB;
      
      case ComparisonOperator.LESS_THAN_OR_EQUAL:
        return valueA <= valueB;
      
      case ComparisonOperator.GREATER_THAN:
        return valueA > valueB;
      
      case ComparisonOperator.GREATER_THAN_OR_EQUAL:
        return valueA >= valueB;
      
      case ComparisonOperator.CONTAINS:
        return String(valueA).includes(String(valueB));
      
      case ComparisonOperator.STARTS_WITH:
        return String(valueA).startsWith(String(valueB));
      
      case ComparisonOperator.ENDS_WITH:
        return String(valueA).endsWith(String(valueB));
      
      case ComparisonOperator.IN:
        return Array.isArray(valueB) && valueB.includes(valueA);
      
      default:
        throw new Error(`Unsupported operator: ${this.operator}`);
    }
  }

  toJSON(): any {
    return {
      type: 'fieldToField',
      fieldA: String(this.fieldA),
      operator: this.operator,
      fieldB: String(this.fieldB),
      transformA: this.transformA,
      transformB: this.transformB,
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any, transformRegistry?: TransformRegistry): FieldToFieldSpecification<T> {
    return new FieldToFieldSpecification<T>(
      json.fieldA as keyof T,
      json.operator as ComparisonOperator,
      json.fieldB as keyof T,
      json.transformA,
      json.transformB,
      transformRegistry,
      json.metadata
    );
  }

  toDSL(): string {
    const fieldAName = String(this.fieldA);
    const fieldBName = String(this.fieldB);
    
    let leftField = fieldAName;
    let rightField = fieldBName;

    // Apply transform notation
    if (this.transformA && this.transformA.length > 0) {
      leftField = `${fieldAName}.${this.transformA.join('.')}`;
    }
    if (this.transformB && this.transformB.length > 0) {
      rightField = `${fieldBName}.${this.transformB.join('.')}`;
    }

    const symbol = OPERATOR_SYMBOLS[this.operator];
    
    switch (this.operator) {
      case ComparisonOperator.CONTAINS:
        return `contains(${leftField}, ${rightField})`;
      
      case ComparisonOperator.STARTS_WITH:
        return `startsWith(${leftField}, ${rightField})`;
      
      case ComparisonOperator.ENDS_WITH:
        return `endsWith(${leftField}, ${rightField})`;
      
      case ComparisonOperator.IN:
        return `${leftField} in ${rightField}`;
      
      default:
        return `${leftField} ${symbol} ${rightField}`;
    }
  }

  getFieldA(): keyof T {
    return this.fieldA;
  }

  getFieldB(): keyof T {
    return this.fieldB;
  }

  getOperator(): ComparisonOperator {
    return this.operator;
  }

  getTransformA(): string[] | undefined {
    return this.transformA ? [...this.transformA] : undefined;
  }

  getTransformB(): string[] | undefined {
    return this.transformB ? [...this.transformB] : undefined;
  }

  clone(): FieldToFieldSpecification<T> {
    return new FieldToFieldSpecification<T>(
      this.fieldA,
      this.operator,
      this.fieldB,
      this.transformA ? [...this.transformA] : undefined,
      this.transformB ? [...this.transformB] : undefined,
      this.transformRegistry,
      this.metadata
    );
  }
}