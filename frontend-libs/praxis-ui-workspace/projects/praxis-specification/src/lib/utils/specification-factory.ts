import { Specification } from '../specification/specification';
import { FieldSpecification } from '../specification/field-specification';
import { AndSpecification } from '../specification/and-specification';
import { OrSpecification } from '../specification/or-specification';
import { NotSpecification } from '../specification/not-specification';
import { XorSpecification } from '../specification/xor-specification';
import { ImpliesSpecification } from '../specification/implies-specification';
import { FunctionSpecification } from '../specification/function-specification';
import { AtLeastSpecification } from '../specification/at-least-specification';
import { ExactlySpecification } from '../specification/exactly-specification';
import { FieldToFieldSpecification } from '../specification/field-to-field-specification';
import { ContextualSpecification } from '../specification/contextual-specification';
import { ComparisonOperator } from '../specification/comparison-operator';
import { FunctionRegistry } from '../registry/function-registry';
import { TransformRegistry } from '../registry/transform-registry';
import { ContextProvider } from '../context/context-provider';
import { SpecificationMetadata } from '../specification/specification-metadata';
import {
  RequiredIfSpecification,
  VisibleIfSpecification,
  DisabledIfSpecification,
  ReadonlyIfSpecification
} from '../specification/conditional-validators';
import {
  ForEachSpecification,
  UniqueBySpecification,
  MinLengthSpecification,
  MaxLengthSpecification
} from '../specification/collection-specifications';
import {
  IfDefinedSpecification,
  IfNotNullSpecification,
  IfExistsSpecification,
  WithDefaultSpecification
} from '../specification/optional-specifications';
import { FormSpecification } from '../specification/form-specification';

export class SpecificationFactory {

  static fromJSON<T extends object = any>(json: any): Specification<T> {
    // Robustez: validar entrada e inferir quando possível
    if (json == null) {
      throw new Error('Invalid specification JSON: null/undefined');
    }

    if (Array.isArray(json)) {
      const specs = json.map((specJson) => SpecificationFactory.fromJSON<T>(specJson));
      return new AndSpecification<T>(specs);
    }

    if (typeof json !== 'object') {
      throw new Error(`Invalid specification JSON: expected object/array, got ${typeof json}`);
    }

    // Inferência quando 'type' está ausente
    if (!json.type) {
      if (Array.isArray(json.specs)) {
        const specs = json.specs.map((specJson: any) => SpecificationFactory.fromJSON<T>(specJson));
        return new AndSpecification<T>(specs);
      }

      if ('field' in json && 'operator' in json) {
        return FieldSpecification.fromJSON<T>({ type: 'field', ...json });
      }

      if ('antecedent' in json && 'consequent' in json) {
        const antecedent = SpecificationFactory.fromJSON<T>(json.antecedent);
        const consequent = SpecificationFactory.fromJSON<T>(json.consequent);
        return new ImpliesSpecification<T>(antecedent, consequent);
      }

      if ('spec' in json) {
        const notSpec = SpecificationFactory.fromJSON<T>(json.spec);
        return new NotSpecification<T>(notSpec);
      }

      if ('itemSpecification' in json && 'arrayField' in json) {
        const itemSpec = SpecificationFactory.fromJSON(json.itemSpecification);
        return new ForEachSpecification<T>(json.arrayField as keyof T, itemSpec, json.metadata);
      }

      // Se não for possível inferir, manter erro claro
      throw new Error('Unknown specification type: undefined');
    }

    switch (json.type) {
      case 'field':
        return FieldSpecification.fromJSON<T>(json);

      case 'and':
        const andSpecs = json.specs.map((specJson: any) =>
          SpecificationFactory.fromJSON<T>(specJson)
        );
        return new AndSpecification<T>(andSpecs);

      case 'or':
        const orSpecs = json.specs.map((specJson: any) =>
          SpecificationFactory.fromJSON<T>(specJson)
        );
        return new OrSpecification<T>(orSpecs);

      case 'not':
        const notSpec = SpecificationFactory.fromJSON<T>(json.spec);
        return new NotSpecification<T>(notSpec);

      case 'xor':
        const xorSpecs = json.specs.map((specJson: any) =>
          SpecificationFactory.fromJSON<T>(specJson)
        );
        return new XorSpecification<T>(xorSpecs);

      case 'implies':
        const antecedent = SpecificationFactory.fromJSON<T>(json.antecedent);
        const consequent = SpecificationFactory.fromJSON<T>(json.consequent);
        return new ImpliesSpecification<T>(antecedent, consequent);

      case 'function':
        return FunctionSpecification.fromJSON<T>(json);

      case 'atLeast':
        const atLeastSpecs = json.specs.map((specJson: any) =>
          SpecificationFactory.fromJSON<T>(specJson)
        );
        return new AtLeastSpecification<T>(json.minimum, atLeastSpecs);

      case 'exactly':
        const exactlySpecs = json.specs.map((specJson: any) =>
          SpecificationFactory.fromJSON<T>(specJson)
        );
        return new ExactlySpecification<T>(json.exact, exactlySpecs);

      case 'fieldToField':
        return FieldToFieldSpecification.fromJSON<T>(json);

      case 'contextual':
        return ContextualSpecification.fromJSON<T>(json);

      case 'requiredIf':
        const requiredCondition = SpecificationFactory.fromJSON<T>(json.condition);
        return new RequiredIfSpecification<T>(json.field as keyof T, requiredCondition, json.metadata);

      case 'visibleIf':
        const visibleCondition = SpecificationFactory.fromJSON<T>(json.condition);
        return new VisibleIfSpecification<T>(json.field as keyof T, visibleCondition, json.metadata);

      case 'disabledIf':
        const disabledCondition = SpecificationFactory.fromJSON<T>(json.condition);
        return new DisabledIfSpecification<T>(json.field as keyof T, disabledCondition, json.metadata);

      case 'readonlyIf':
        const readonlyCondition = SpecificationFactory.fromJSON<T>(json.condition);
        return new ReadonlyIfSpecification<T>(json.field as keyof T, readonlyCondition, json.metadata);

      case 'forEach':
        const itemSpec = SpecificationFactory.fromJSON(json.itemSpecification);
        return new ForEachSpecification<T>(json.arrayField as keyof T, itemSpec, json.metadata);

      case 'uniqueBy':
        return UniqueBySpecification.fromJSON<T>(json);

      case 'minLength':
        return MinLengthSpecification.fromJSON<T>(json);

      case 'maxLength':
        return MaxLengthSpecification.fromJSON<T>(json);

      case 'ifDefined':
        const ifDefinedSpec = SpecificationFactory.fromJSON<T>(json.specification);
        return new IfDefinedSpecification<T>(json.field as keyof T, ifDefinedSpec, json.metadata);

      case 'ifNotNull':
        const ifNotNullSpec = SpecificationFactory.fromJSON<T>(json.specification);
        return new IfNotNullSpecification<T>(json.field as keyof T, ifNotNullSpec, json.metadata);

      case 'ifExists':
        const ifExistsSpec = SpecificationFactory.fromJSON<T>(json.specification);
        return new IfExistsSpecification<T>(json.field as keyof T, ifExistsSpec, json.metadata);

      case 'withDefault':
        const withDefaultSpec = SpecificationFactory.fromJSON<T>(json.specification);
        return new WithDefaultSpecification<T>(json.field as keyof T, json.defaultValue, withDefaultSpec, json.metadata);

      case 'form':
        // Form specifications require special reconstruction
        throw new Error('FormSpecification.fromJSON not yet implemented');

      default:
        throw new Error(`Unknown specification type: ${json.type}`);
    }
  }

  static field<T extends object = any>(field: keyof T, operator: ComparisonOperator, value: any): FieldSpecification<T> {
    return new FieldSpecification<T>(field, operator, value);
  }

  static and<T extends object = any>(...specs: Specification<T>[]): AndSpecification<T> {
    return new AndSpecification<T>(specs);
  }

  static or<T extends object = any>(...specs: Specification<T>[]): OrSpecification<T> {
    return new OrSpecification<T>(specs);
  }

  static not<T extends object = any>(spec: Specification<T>): NotSpecification<T> {
    return new NotSpecification<T>(spec);
  }

  static xor<T extends object = any>(...specs: Specification<T>[]): XorSpecification<T> {
    return new XorSpecification<T>(specs);
  }

  static implies<T extends object = any>(antecedent: Specification<T>, consequent: Specification<T>): ImpliesSpecification<T> {
    return new ImpliesSpecification<T>(antecedent, consequent);
  }

  static func<T extends object = any>(name: string, args: any[], registry?: FunctionRegistry<T>): FunctionSpecification<T> {
    return new FunctionSpecification<T>(name, args, registry);
  }

  static atLeast<T extends object = any>(minimum: number, specs: Specification<T>[]): AtLeastSpecification<T> {
    return new AtLeastSpecification<T>(minimum, specs);
  }

  static exactly<T extends object = any>(exact: number, specs: Specification<T>[]): ExactlySpecification<T> {
    return new ExactlySpecification<T>(exact, specs);
  }

  static fieldToField<T extends object = any>(
    fieldA: keyof T,
    operator: ComparisonOperator,
    fieldB: keyof T,
    transformA?: string[],
    transformB?: string[],
    registry?: TransformRegistry
  ): FieldToFieldSpecification<T> {
    return new FieldToFieldSpecification<T>(fieldA, operator, fieldB, transformA, transformB, registry);
  }

  static contextual<T extends object = any>(template: string, provider?: ContextProvider): ContextualSpecification<T> {
    return new ContextualSpecification<T>(template, provider);
  }

  // Convenience methods for common operators
  static equals<T extends object = any>(field: keyof T, value: any): FieldSpecification<T> {
    return new FieldSpecification<T>(field, ComparisonOperator.EQUALS, value);
  }

  static notEquals<T extends object = any>(field: keyof T, value: any): FieldSpecification<T> {
    return new FieldSpecification<T>(field, ComparisonOperator.NOT_EQUALS, value);
  }

  static greaterThan<T extends object = any>(field: keyof T, value: any): FieldSpecification<T> {
    return new FieldSpecification<T>(field, ComparisonOperator.GREATER_THAN, value);
  }

  static lessThan<T extends object = any>(field: keyof T, value: any): FieldSpecification<T> {
    return new FieldSpecification<T>(field, ComparisonOperator.LESS_THAN, value);
  }

  static contains<T extends object = any>(field: keyof T, value: any): FieldSpecification<T> {
    return new FieldSpecification<T>(field, ComparisonOperator.CONTAINS, value);
  }

  static startsWith<T extends object = any>(field: keyof T, value: any): FieldSpecification<T> {
    return new FieldSpecification<T>(field, ComparisonOperator.STARTS_WITH, value);
  }

  static endsWith<T extends object = any>(field: keyof T, value: any): FieldSpecification<T> {
    return new FieldSpecification<T>(field, ComparisonOperator.ENDS_WITH, value);
  }

  static isIn<T extends object = any>(field: keyof T, values: any[]): FieldSpecification<T> {
    return new FieldSpecification<T>(field, ComparisonOperator.IN, values);
  }

  // Phase 2: Conditional validators
  static requiredIf<T extends object = any>(
    field: keyof T,
    condition: Specification<T>,
    metadata?: SpecificationMetadata
  ): RequiredIfSpecification<T> {
    return new RequiredIfSpecification<T>(field, condition, metadata);
  }

  static visibleIf<T extends object = any>(
    field: keyof T,
    condition: Specification<T>,
    metadata?: SpecificationMetadata
  ): VisibleIfSpecification<T> {
    return new VisibleIfSpecification<T>(field, condition, metadata);
  }

  static disabledIf<T extends object = any>(
    field: keyof T,
    condition: Specification<T>,
    metadata?: SpecificationMetadata
  ): DisabledIfSpecification<T> {
    return new DisabledIfSpecification<T>(field, condition, metadata);
  }

  static readonlyIf<T extends object = any>(
    field: keyof T,
    condition: Specification<T>,
    metadata?: SpecificationMetadata
  ): ReadonlyIfSpecification<T> {
    return new ReadonlyIfSpecification<T>(field, condition, metadata);
  }

  // Phase 2: Collection specifications
  static forEach<T extends object = any, TItem extends object = any>(
    arrayField: keyof T,
    itemSpecification: Specification<TItem>,
    metadata?: SpecificationMetadata
  ): ForEachSpecification<T, TItem> {
    return new ForEachSpecification<T, TItem>(arrayField, itemSpecification, metadata);
  }

  static uniqueBy<T extends object = any>(
    arrayField: keyof T,
    keySelector: string | ((item: any) => any),
    metadata?: SpecificationMetadata
  ): UniqueBySpecification<T> {
    return new UniqueBySpecification<T>(arrayField, keySelector, metadata);
  }

  static minLength<T extends object = any>(
    arrayField: keyof T,
    minLength: number,
    metadata?: SpecificationMetadata
  ): MinLengthSpecification<T> {
    return new MinLengthSpecification<T>(arrayField, minLength, metadata);
  }

  static maxLength<T extends object = any>(
    arrayField: keyof T,
    maxLength: number,
    metadata?: SpecificationMetadata
  ): MaxLengthSpecification<T> {
    return new MaxLengthSpecification<T>(arrayField, maxLength, metadata);
  }

  // Phase 2: Optional field handling
  static ifDefined<T extends object = any>(
    field: keyof T,
    specification: Specification<T>,
    metadata?: SpecificationMetadata
  ): IfDefinedSpecification<T> {
    return new IfDefinedSpecification<T>(field, specification, metadata);
  }

  static ifNotNull<T extends object = any>(
    field: keyof T,
    specification: Specification<T>,
    metadata?: SpecificationMetadata
  ): IfNotNullSpecification<T> {
    return new IfNotNullSpecification<T>(field, specification, metadata);
  }

  static ifExists<T extends object = any>(
    field: keyof T,
    specification: Specification<T>,
    metadata?: SpecificationMetadata
  ): IfExistsSpecification<T> {
    return new IfExistsSpecification<T>(field, specification, metadata);
  }

  static withDefault<T extends object = any>(
    field: keyof T,
    defaultValue: any,
    specification: Specification<T>,
    metadata?: SpecificationMetadata
  ): WithDefaultSpecification<T> {
    return new WithDefaultSpecification<T>(field, defaultValue, specification, metadata);
  }

  // Phase 2: Form specifications
  static form<T extends object = any>(metadata?: SpecificationMetadata): FormSpecification<T> {
    return new FormSpecification<T>(metadata);
  }

  // Phase 2: Enhanced field specifications with metadata
  static fieldWithMetadata<T extends object = any>(
    field: keyof T,
    operator: ComparisonOperator,
    value: any,
    metadata: SpecificationMetadata
  ): FieldSpecification<T> {
    return new FieldSpecification<T>(field, operator, value, metadata);
  }

  // Convenience methods with metadata support
  static equalsWithMetadata<T extends object = any>(
    field: keyof T,
    value: any,
    metadata: SpecificationMetadata
  ): FieldSpecification<T> {
    return new FieldSpecification<T>(field, ComparisonOperator.EQUALS, value, metadata);
  }

  static greaterThanWithMetadata<T extends object = any>(
    field: keyof T,
    value: any,
    metadata: SpecificationMetadata
  ): FieldSpecification<T> {
    return new FieldSpecification<T>(field, ComparisonOperator.GREATER_THAN, value, metadata);
  }
}
