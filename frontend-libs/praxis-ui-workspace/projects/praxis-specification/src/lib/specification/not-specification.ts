import { Specification } from './specification';
import { SpecificationMetadata } from './specification-metadata';

export class NotSpecification<T extends object = any> extends Specification<T> {
  constructor(private specification: Specification<T>, metadata?: SpecificationMetadata) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    return !this.specification.isSatisfiedBy(obj);
  }

  toJSON(): any {
    return {
      type: 'not',
      spec: this.specification.toJSON()
    };
  }

  static override fromJSON<T extends object = any>(json: any): NotSpecification<T> {
    const spec = Specification.fromJSON<T>(json.spec);
    return new NotSpecification<T>(spec);
  }

  toDSL(): string {
    const innerDsl = this.specification.toDSL();
    
    // Add parentheses for complex expressions
    if (this.specification instanceof AndSpecification || 
        this.specification instanceof OrSpecification ||
        this.specification instanceof XorSpecification ||
        this.specification instanceof ImpliesSpecification) {
      return `!(${innerDsl})`;
    }
    
    return `!${innerDsl}`;
  }

  getSpecification(): Specification<T> {
    return this.specification;
  }

  clone(): NotSpecification<T> {
    return new NotSpecification<T>(this.specification.clone(), this.metadata);
  }
}

// Avoid circular imports
import { AndSpecification } from './and-specification';
import { OrSpecification } from './or-specification';
import { XorSpecification } from './xor-specification';
import { ImpliesSpecification } from './implies-specification';