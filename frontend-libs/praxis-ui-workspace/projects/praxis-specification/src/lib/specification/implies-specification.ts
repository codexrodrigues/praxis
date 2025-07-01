import { Specification } from './specification';
import { SpecificationMetadata } from './specification-metadata';

export class ImpliesSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private antecedent: Specification<T>,
    private consequent: Specification<T>,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    // A implies B is equivalent to (!A || B)
    return !this.antecedent.isSatisfiedBy(obj) || this.consequent.isSatisfiedBy(obj);
  }

  toJSON(): any {
    return {
      type: 'implies',
      antecedent: this.antecedent.toJSON(),
      consequent: this.consequent.toJSON()
    };
  }

  static override fromJSON<T extends object = any>(json: any): ImpliesSpecification<T> {
    const antecedent = Specification.fromJSON<T>(json.antecedent);
    const consequent = Specification.fromJSON<T>(json.consequent);
    return new ImpliesSpecification<T>(antecedent, consequent);
  }

  toDSL(): string {
    const antecedentDsl = this.antecedent.toDSL();
    const consequentDsl = this.consequent.toDSL();
    
    // Add parentheses for complex expressions
    const leftPart = (this.antecedent instanceof AndSpecification || 
                     this.antecedent instanceof OrSpecification ||
                     this.antecedent instanceof XorSpecification) 
                     ? `(${antecedentDsl})` : antecedentDsl;
                     
    const rightPart = (this.consequent instanceof AndSpecification || 
                      this.consequent instanceof OrSpecification ||
                      this.consequent instanceof XorSpecification) 
                      ? `(${consequentDsl})` : consequentDsl;
    
    return `${leftPart} implies ${rightPart}`;
  }

  getAntecedent(): Specification<T> {
    return this.antecedent;
  }

  getConsequent(): Specification<T> {
    return this.consequent;
  }

  clone(): ImpliesSpecification<T> {
    return new ImpliesSpecification<T>(
      this.antecedent.clone(),
      this.consequent.clone(),
      this.metadata
    );
  }
}

// Avoid circular imports
import { AndSpecification } from './and-specification';
import { OrSpecification } from './or-specification';
import { XorSpecification } from './xor-specification';