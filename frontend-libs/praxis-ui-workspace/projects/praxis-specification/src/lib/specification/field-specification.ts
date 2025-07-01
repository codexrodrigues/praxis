import { Specification } from './specification';
import { ComparisonOperator, OPERATOR_SYMBOLS } from './comparison-operator';
import { SpecificationMetadata } from './specification-metadata';

export class FieldSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private field: keyof T,
    private operator: ComparisonOperator,
    private value: any,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    const fieldValue = obj[this.field];
    
    switch (this.operator) {
      case ComparisonOperator.EQUALS:
        return fieldValue === this.value;
      
      case ComparisonOperator.NOT_EQUALS:
        return fieldValue !== this.value;
      
      case ComparisonOperator.LESS_THAN:
        return fieldValue < this.value;
      
      case ComparisonOperator.LESS_THAN_OR_EQUAL:
        return fieldValue <= this.value;
      
      case ComparisonOperator.GREATER_THAN:
        return fieldValue > this.value;
      
      case ComparisonOperator.GREATER_THAN_OR_EQUAL:
        return fieldValue >= this.value;
      
      case ComparisonOperator.CONTAINS:
        return String(fieldValue).includes(String(this.value));
      
      case ComparisonOperator.STARTS_WITH:
        return String(fieldValue).startsWith(String(this.value));
      
      case ComparisonOperator.ENDS_WITH:
        return String(fieldValue).endsWith(String(this.value));
      
      case ComparisonOperator.IN:
        return Array.isArray(this.value) && this.value.includes(fieldValue);
      
      default:
        throw new Error(`Unsupported operator: ${this.operator}`);
    }
  }

  toJSON(): any {
    return {
      type: 'field',
      field: String(this.field),
      operator: this.operator,
      value: this.value,
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): FieldSpecification<T> {
    return new FieldSpecification<T>(
      json.field as keyof T,
      json.operator as ComparisonOperator,
      json.value,
      json.metadata
    );
  }

  clone(): FieldSpecification<T> {
    return new FieldSpecification<T>(this.field, this.operator, this.value, this.metadata);
  }

  toDSL(): string {
    const fieldName = String(this.field);
    const symbol = OPERATOR_SYMBOLS[this.operator];
    
    switch (this.operator) {
      case ComparisonOperator.CONTAINS:
        return `contains(${fieldName}, ${JSON.stringify(this.value)})`;
      
      case ComparisonOperator.STARTS_WITH:
        return `startsWith(${fieldName}, ${JSON.stringify(this.value)})`;
      
      case ComparisonOperator.ENDS_WITH:
        return `endsWith(${fieldName}, ${JSON.stringify(this.value)})`;
      
      case ComparisonOperator.IN:
        const values = Array.isArray(this.value) 
          ? this.value.map(v => JSON.stringify(v)).join(', ')
          : JSON.stringify(this.value);
        return `${fieldName} in (${values})`;
      
      default:
        return `${fieldName} ${symbol} ${JSON.stringify(this.value)}`;
    }
  }

  getField(): keyof T {
    return this.field;
  }

  getOperator(): ComparisonOperator {
    return this.operator;
  }

  getValue(): any {
    return this.value;
  }
}