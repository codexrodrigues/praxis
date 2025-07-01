import { Specification } from './specification';
import { SpecificationMetadata } from './specification-metadata';

export class AndSpecification<T extends object = any> extends Specification<T> {
  constructor(private specifications: Specification<T>[], metadata?: SpecificationMetadata) {
    super(metadata);
    if (specifications.length === 0) {
      throw new Error('AndSpecification requires at least one specification');
    }
  }

  isSatisfiedBy(obj: T): boolean {
    return this.specifications.every(spec => spec.isSatisfiedBy(obj));
  }

  toJSON(): any {
    return {
      type: 'and',
      specs: this.specifications.map(spec => spec.toJSON())
    };
  }

  static override fromJSON<T extends object = any>(json: any): AndSpecification<T> {
    const specs = json.specs.map((specJson: any) => 
      Specification.fromJSON<T>(specJson)
    );
    return new AndSpecification<T>(specs);
  }

  toDSL(): string {
    if (this.specifications.length === 1) {
      return this.specifications[0].toDSL();
    }
    
    const parts = this.specifications.map(spec => {
      const dsl = spec.toDSL();
      // Add parentheses if needed for precedence
      if (spec instanceof OrSpecification || spec instanceof XorSpecification) {
        return `(${dsl})`;
      }
      return dsl;
    });
    
    return parts.join(' && ');
  }

  getSpecifications(): Specification<T>[] {
    return [...this.specifications];
  }

  add(specification: Specification<T>): AndSpecification<T> {
    return new AndSpecification<T>([...this.specifications, specification], this.metadata);
  }

  clone(): AndSpecification<T> {
    return new AndSpecification<T>(this.specifications.map(spec => spec.clone()), this.metadata);
  }
}

// Avoid circular import
import { OrSpecification } from './or-specification';
import { XorSpecification } from './xor-specification';