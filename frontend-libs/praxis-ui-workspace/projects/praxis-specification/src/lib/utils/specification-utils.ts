import { Specification } from '../specification/specification';
import { AndSpecification } from '../specification/and-specification';
import { OrSpecification } from '../specification/or-specification';
import { NotSpecification } from '../specification/not-specification';
import { FieldSpecification } from '../specification/field-specification';

export class SpecificationUtils {
  
  /**
   * Simplifies a specification by removing redundant nesting and applying logical rules
   */
  static simplify<T extends object = any>(spec: Specification<T>): Specification<T> {
    if (spec instanceof AndSpecification) {
      return this.simplifyAnd(spec);
    }
    
    if (spec instanceof OrSpecification) {
      return this.simplifyOr(spec);
    }
    
    if (spec instanceof NotSpecification) {
      return this.simplifyNot(spec);
    }
    
    return spec;
  }

  private static simplifyAnd<T extends object = any>(spec: AndSpecification<T>): Specification<T> {
    const specs = spec.getSpecifications();
    const flattened: Specification<T>[] = [];
    
    // Flatten nested AND specifications
    for (const s of specs) {
      const simplified = this.simplify(s);
      if (simplified instanceof AndSpecification) {
        flattened.push(...simplified.getSpecifications());
      } else {
        flattened.push(simplified);
      }
    }
    
    // Remove duplicates and contradictions
    const unique = this.removeDuplicates(flattened);
    
    if (unique.length === 0) {
      throw new Error('Empty AND specification');
    }
    
    if (unique.length === 1) {
      return unique[0];
    }
    
    return new AndSpecification<T>(unique);
  }

  private static simplifyOr<T extends object = any>(spec: OrSpecification<T>): Specification<T> {
    const specs = spec.getSpecifications();
    const flattened: Specification<T>[] = [];
    
    // Flatten nested OR specifications
    for (const s of specs) {
      const simplified = this.simplify(s);
      if (simplified instanceof OrSpecification) {
        flattened.push(...simplified.getSpecifications());
      } else {
        flattened.push(simplified);
      }
    }
    
    // Remove duplicates
    const unique = this.removeDuplicates(flattened);
    
    if (unique.length === 0) {
      throw new Error('Empty OR specification');
    }
    
    if (unique.length === 1) {
      return unique[0];
    }
    
    return new OrSpecification<T>(unique);
  }

  private static simplifyNot<T extends object = any>(spec: NotSpecification<T>): Specification<T> {
    const inner = spec.getSpecification();
    
    // Double negation elimination: !!A = A
    if (inner instanceof NotSpecification) {
      return this.simplify(inner.getSpecification());
    }
    
    const simplified = this.simplify(inner);
    
    if (simplified === inner) {
      return spec;
    }
    
    return new NotSpecification<T>(simplified);
  }

  private static removeDuplicates<T extends object = any>(specs: Specification<T>[]): Specification<T>[] {
    const unique: Specification<T>[] = [];
    const seen = new Set<string>();
    
    for (const spec of specs) {
      const key = JSON.stringify(spec.toJSON());
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(spec);
      }
    }
    
    return unique;
  }

  /**
   * Checks if two specifications are logically equivalent
   */
  static areEquivalent<T extends object = any>(spec1: Specification<T>, spec2: Specification<T>): boolean {
    const json1 = JSON.stringify(this.simplify(spec1).toJSON());
    const json2 = JSON.stringify(this.simplify(spec2).toJSON());
    return json1 === json2;
  }

  /**
   * Gets all field references used in a specification
   */
  static getReferencedFields<T extends object = any>(spec: Specification<T>): Set<keyof T> {
    const fields = new Set<keyof T>();
    this.collectFields(spec, fields);
    return fields;
  }

  private static collectFields<T extends object = any>(spec: Specification<T>, fields: Set<keyof T>): void {
    if (spec instanceof FieldSpecification) {
      fields.add(spec.getField() as keyof T);
    } else if (spec instanceof AndSpecification || spec instanceof OrSpecification) {
      spec.getSpecifications().forEach(s => this.collectFields(s, fields));
    } else if (spec instanceof NotSpecification) {
      this.collectFields(spec.getSpecification(), fields);
    }
    // Add more cases as needed for other specification types
  }

  /**
   * Validates a specification for common issues
   */
  static validate<T extends object = any>(spec: Specification<T>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      this.validateSpecification(spec, errors, warnings);
    } catch (error) {
      errors.push(`Validation error: ${error}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static validateSpecification<T extends object = any>(
    spec: Specification<T>, 
    errors: string[], 
    warnings: string[]
  ): void {
    if (spec instanceof AndSpecification || spec instanceof OrSpecification) {
      const specs = spec.getSpecifications();
      if (specs.length === 0) {
        errors.push(`${spec.constructor.name} must have at least one specification`);
      }
      specs.forEach(s => this.validateSpecification(s, errors, warnings));
    } else if (spec instanceof NotSpecification) {
      this.validateSpecification(spec.getSpecification(), errors, warnings);
    }
    // Add more validation rules as needed
  }

  /**
   * Estimates the complexity of a specification (useful for performance analysis)
   */
  static getComplexity<T extends object = any>(spec: Specification<T>): number {
    if (spec instanceof FieldSpecification) {
      return 1;
    }
    
    if (spec instanceof AndSpecification || spec instanceof OrSpecification) {
      return spec.getSpecifications()
        .reduce((total, s) => total + this.getComplexity(s), 1);
    }
    
    if (spec instanceof NotSpecification) {
      return 1 + this.getComplexity(spec.getSpecification());
    }
    
    return 1; // Base complexity for unknown types
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}