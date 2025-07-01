import { Specification } from './specification';
import { SpecificationMetadata } from './specification-metadata';

export class OrSpecification<T extends object = any> extends Specification<T> {
  constructor(private specifications: Specification<T>[], metadata?: SpecificationMetadata) {
    super(metadata);
    if (specifications.length === 0) {
      throw new Error('OrSpecification requires at least one specification');
    }
  }

  isSatisfiedBy(obj: T): boolean {
    return this.specifications.some(spec => spec.isSatisfiedBy(obj));
  }

  toJSON(): any {
    return {
      type: 'or',
      specs: this.specifications.map(spec => spec.toJSON())
    };
  }

  static override fromJSON<T extends object = any>(json: any): OrSpecification<T> {
    const specs = json.specs.map((specJson: any) => 
      Specification.fromJSON<T>(specJson)
    );
    return new OrSpecification<T>(specs);
  }

  toDSL(): string {
    if (this.specifications.length === 1) {
      return this.specifications[0].toDSL();
    }
    
    const parts = this.specifications.map(spec => {
      const dsl = spec.toDSL();
      // Add parentheses if needed for precedence
      if (spec instanceof AndSpecification) {
        return `(${dsl})`;
      }
      return dsl;
    });
    
    return parts.join(' || ');
  }

  getSpecifications(): Specification<T>[] {
    return [...this.specifications];
  }

  add(specification: Specification<T>): OrSpecification<T> {
    return new OrSpecification<T>([...this.specifications, specification], this.metadata);
  }

  clone(): OrSpecification<T> {
    return new OrSpecification<T>(this.specifications.map(spec => spec.clone()), this.metadata);
  }
}

// Avoid circular import
import { AndSpecification } from './and-specification';