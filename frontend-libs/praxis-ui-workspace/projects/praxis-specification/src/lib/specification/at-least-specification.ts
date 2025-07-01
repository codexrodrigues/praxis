import { Specification } from './specification';
import { SpecificationMetadata } from './specification-metadata';

export class AtLeastSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private minimum: number,
    private specifications: Specification<T>[],
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
    if (minimum < 0) {
      throw new Error('Minimum count must be non-negative');
    }
    if (specifications.length === 0) {
      throw new Error('AtLeastSpecification requires at least one specification');
    }
  }

  isSatisfiedBy(obj: T): boolean {
    const satisfiedCount = this.specifications.filter(spec => spec.isSatisfiedBy(obj)).length;
    return satisfiedCount >= this.minimum;
  }

  toJSON(): any {
    return {
      type: 'atLeast',
      minimum: this.minimum,
      specs: this.specifications.map(spec => spec.toJSON()),
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): AtLeastSpecification<T> {
    const specs = json.specs.map((specJson: any) => 
      Specification.fromJSON<T>(specJson)
    );
    return new AtLeastSpecification<T>(json.minimum, specs, json.metadata);
  }

  toDSL(): string {
    const specDsls = this.specifications.map(spec => spec.toDSL());
    const specsStr = specDsls.join(', ');
    return `atLeast(${this.minimum}, [${specsStr}])`;
  }

  getMinimum(): number {
    return this.minimum;
  }

  getSpecifications(): Specification<T>[] {
    return [...this.specifications];
  }

  getSatisfiedCount(obj: T): number {
    return this.specifications.filter(spec => spec.isSatisfiedBy(obj)).length;
  }

  clone(): AtLeastSpecification<T> {
    const clonedSpecs = this.specifications.map(spec => spec.clone());
    return new AtLeastSpecification<T>(this.minimum, clonedSpecs, this.metadata);
  }
}