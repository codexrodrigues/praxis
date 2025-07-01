import { Specification } from './specification';
import { SpecificationMetadata } from './specification-metadata';

export class XorSpecification<T extends object = any> extends Specification<T> {
  constructor(private specifications: Specification<T>[], metadata?: SpecificationMetadata) {
    super(metadata);
    if (specifications.length < 2) {
      throw new Error('XorSpecification requires at least two specifications');
    }
  }

  isSatisfiedBy(obj: T): boolean {
    const satisfiedCount = this.specifications.filter(spec => spec.isSatisfiedBy(obj)).length;
    return satisfiedCount === 1;
  }

  toJSON(): any {
    return {
      type: 'xor',
      specs: this.specifications.map(spec => spec.toJSON())
    };
  }

  static override fromJSON<T extends object = any>(json: any): XorSpecification<T> {
    const specs = json.specs.map((specJson: any) => 
      Specification.fromJSON<T>(specJson)
    );
    return new XorSpecification<T>(specs);
  }

  toDSL(): string {
    const parts = this.specifications.map(spec => {
      const dsl = spec.toDSL();
      // Add parentheses if needed for precedence
      if (spec instanceof AndSpecification || spec instanceof OrSpecification) {
        return `(${dsl})`;
      }
      return dsl;
    });
    
    return parts.join(' xor ');
  }

  getSpecifications(): Specification<T>[] {
    return [...this.specifications];
  }

  clone(): XorSpecification<T> {
    return new XorSpecification<T>(this.specifications.map(spec => spec.clone()), this.metadata);
  }
}

// Avoid circular imports
import { AndSpecification } from './and-specification';
import { OrSpecification } from './or-specification';