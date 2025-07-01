import { Specification } from './specification';
import { SpecificationMetadata } from './specification-metadata';

export class ExactlySpecification<T extends object = any> extends Specification<T> {
  constructor(
    private exact: number,
    private specifications: Specification<T>[],
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
    if (exact < 0) {
      throw new Error('Exact count must be non-negative');
    }
    if (specifications.length === 0) {
      throw new Error('ExactlySpecification requires at least one specification');
    }
  }

  isSatisfiedBy(obj: T): boolean {
    const satisfiedCount = this.specifications.filter(spec => spec.isSatisfiedBy(obj)).length;
    return satisfiedCount === this.exact;
  }

  toJSON(): any {
    return {
      type: 'exactly',
      exact: this.exact,
      specs: this.specifications.map(spec => spec.toJSON()),
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): ExactlySpecification<T> {
    const specs = json.specs.map((specJson: any) => 
      Specification.fromJSON<T>(specJson)
    );
    return new ExactlySpecification<T>(json.exact, specs, json.metadata);
  }

  toDSL(): string {
    const specDsls = this.specifications.map(spec => spec.toDSL());
    const specsStr = specDsls.join(', ');
    return `exactly(${this.exact}, [${specsStr}])`;
  }

  getExact(): number {
    return this.exact;
  }

  getSpecifications(): Specification<T>[] {
    return [...this.specifications];
  }

  getSatisfiedCount(obj: T): number {
    return this.specifications.filter(spec => spec.isSatisfiedBy(obj)).length;
  }

  clone(): ExactlySpecification<T> {
    const clonedSpecs = this.specifications.map(spec => spec.clone());
    return new ExactlySpecification<T>(this.exact, clonedSpecs, this.metadata);
  }
}