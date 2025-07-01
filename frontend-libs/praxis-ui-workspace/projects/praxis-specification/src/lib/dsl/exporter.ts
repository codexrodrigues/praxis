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

export interface ExportOptions {
  prettyPrint?: boolean;
  indentSize?: number;
  maxLineLength?: number;
  useParentheses?: 'minimal' | 'explicit' | 'auto';
  includeMetadata?: boolean;
  metadataPosition?: 'before' | 'after' | 'inline';
}

export class DslExporter {
  private options: Required<ExportOptions>;

  constructor(options: ExportOptions = {}) {
    this.options = {
      prettyPrint: options.prettyPrint ?? false,
      indentSize: options.indentSize ?? 2,
      maxLineLength: options.maxLineLength ?? 80,
      useParentheses: options.useParentheses ?? 'auto',
      includeMetadata: options.includeMetadata ?? false,
      metadataPosition: options.metadataPosition ?? 'before'
    };
  }

  export<T extends object = any>(specification: Specification<T>): string {
    const dsl = this.exportSpecification(specification, 0);
    
    if (this.options.prettyPrint) {
      return this.formatPretty(dsl);
    }
    
    return dsl;
  }

  /**
   * Exports specification with metadata comments
   */
  exportWithMetadata<T extends object = any>(specification: Specification<T>): string {
    const originalIncludeMetadata = this.options.includeMetadata;
    this.options.includeMetadata = true;
    
    const result = this.export(specification);
    
    this.options.includeMetadata = originalIncludeMetadata;
    return result;
  }

  private exportSpecification<T extends object = any>(spec: Specification<T>, depth: number): string {
    const baseDsl = this.getSpecificationDsl(spec, depth);
    
    if (!this.options.includeMetadata) {
      return baseDsl;
    }

    return this.addMetadataComments(spec, baseDsl, depth);
  }

  private getSpecificationDsl<T extends object = any>(spec: Specification<T>, depth: number): string {
    if (spec instanceof FieldSpecification) {
      return this.exportFieldSpecification(spec);
    }
    
    if (spec instanceof AndSpecification) {
      return this.exportAndSpecification(spec, depth);
    }
    
    if (spec instanceof OrSpecification) {
      return this.exportOrSpecification(spec, depth);
    }
    
    if (spec instanceof NotSpecification) {
      return this.exportNotSpecification(spec, depth);
    }
    
    if (spec instanceof XorSpecification) {
      return this.exportXorSpecification(spec, depth);
    }
    
    if (spec instanceof ImpliesSpecification) {
      return this.exportImpliesSpecification(spec, depth);
    }
    
    if (spec instanceof FunctionSpecification) {
      return this.exportFunctionSpecification(spec);
    }
    
    if (spec instanceof AtLeastSpecification) {
      return this.exportAtLeastSpecification(spec, depth);
    }
    
    if (spec instanceof ExactlySpecification) {
      return this.exportExactlySpecification(spec, depth);
    }
    
    if (spec instanceof FieldToFieldSpecification) {
      return this.exportFieldToFieldSpecification(spec);
    }
    
    if (spec instanceof ContextualSpecification) {
      return this.exportContextualSpecification(spec);
    }
    
    // Fallback to toDSL method
    return spec.toDSL();
  }

  private addMetadataComments<T extends object = any>(spec: Specification<T>, dsl: string, depth: number): string {
    const metadata = spec.getMetadata();
    if (!metadata) {
      return dsl;
    }

    const indent = ' '.repeat(depth * this.options.indentSize);
    const comments: string[] = [];

    // Add metadata comments
    if (metadata.code) {
      comments.push(`${indent}// code: ${metadata.code}`);
    }
    
    if (metadata.message) {
      comments.push(`${indent}// message: ${metadata.message}`);
    }
    
    if (metadata.tag) {
      comments.push(`${indent}// tag: ${metadata.tag}`);
    }

    if (metadata.uiConfig) {
      const uiConfigStr = JSON.stringify(metadata.uiConfig);
      comments.push(`${indent}// uiConfig: ${uiConfigStr}`);
    }

    // Add any other metadata properties
    const standardKeys = ['code', 'message', 'tag', 'uiConfig'];
    for (const [key, value] of Object.entries(metadata)) {
      if (!standardKeys.includes(key) && value !== undefined) {
        comments.push(`${indent}// ${key}: ${JSON.stringify(value)}`);
      }
    }

    if (comments.length === 0) {
      return dsl;
    }

    switch (this.options.metadataPosition) {
      case 'before':
        return `${comments.join('\n')}\n${indent}${dsl}`;
      
      case 'after':
        return `${indent}${dsl}\n${comments.join('\n')}`;
      
      case 'inline':
        const firstComment = comments[0] ? ` ${comments[0].trim()}` : '';
        return `${indent}${dsl}${firstComment}`;
      
      default:
        return dsl;
    }
  }

  private exportFieldSpecification<T extends object = any>(spec: FieldSpecification<T>): string {
    return spec.toDSL();
  }

  private exportAndSpecification<T extends object = any>(spec: AndSpecification<T>, depth: number): string {
    const specifications = spec.getSpecifications();
    const parts = specifications.map(s => {
      const dsl = this.exportSpecification(s, depth + 1);
      return this.needsParentheses(s, 'and') ? `(${dsl})` : dsl;
    });
    
    if (this.options.prettyPrint && this.shouldBreakLine(parts.join(' && '))) {
      const indent = ' '.repeat(depth * this.options.indentSize);
      const nextIndent = ' '.repeat((depth + 1) * this.options.indentSize);
      return parts.join(` &&\n${nextIndent}`);
    }
    
    return parts.join(' && ');
  }

  private exportOrSpecification<T extends object = any>(spec: OrSpecification<T>, depth: number): string {
    const specifications = spec.getSpecifications();
    const parts = specifications.map(s => {
      const dsl = this.exportSpecification(s, depth + 1);
      return this.needsParentheses(s, 'or') ? `(${dsl})` : dsl;
    });
    
    if (this.options.prettyPrint && this.shouldBreakLine(parts.join(' || '))) {
      const nextIndent = ' '.repeat((depth + 1) * this.options.indentSize);
      return parts.join(` ||\n${nextIndent}`);
    }
    
    return parts.join(' || ');
  }

  private exportNotSpecification<T extends object = any>(spec: NotSpecification<T>, depth: number): string {
    const innerSpec = spec.getSpecification();
    const innerDsl = this.exportSpecification(innerSpec, depth);
    
    if (this.needsParentheses(innerSpec, 'not')) {
      return `!(${innerDsl})`;
    }
    
    return `!${innerDsl}`;
  }

  private exportXorSpecification<T extends object = any>(spec: XorSpecification<T>, depth: number): string {
    const specifications = spec.getSpecifications();
    const parts = specifications.map(s => {
      const dsl = this.exportSpecification(s, depth + 1);
      return this.needsParentheses(s, 'xor') ? `(${dsl})` : dsl;
    });
    
    if (this.options.prettyPrint && this.shouldBreakLine(parts.join(' xor '))) {
      const nextIndent = ' '.repeat((depth + 1) * this.options.indentSize);
      return parts.join(` xor\n${nextIndent}`);
    }
    
    return parts.join(' xor ');
  }

  private exportImpliesSpecification<T extends object = any>(spec: ImpliesSpecification<T>, depth: number): string {
    const antecedent = this.exportSpecification(spec.getAntecedent(), depth + 1);
    const consequent = this.exportSpecification(spec.getConsequent(), depth + 1);
    
    const leftPart = this.needsParentheses(spec.getAntecedent(), 'implies') 
      ? `(${antecedent})` : antecedent;
    const rightPart = this.needsParentheses(spec.getConsequent(), 'implies') 
      ? `(${consequent})` : consequent;
    
    if (this.options.prettyPrint && this.shouldBreakLine(`${leftPart} implies ${rightPart}`)) {
      const nextIndent = ' '.repeat((depth + 1) * this.options.indentSize);
      return `${leftPart} implies\n${nextIndent}${rightPart}`;
    }
    
    return `${leftPart} implies ${rightPart}`;
  }

  private exportFunctionSpecification<T extends object = any>(spec: FunctionSpecification<T>): string {
    return spec.toDSL();
  }

  private exportAtLeastSpecification<T extends object = any>(spec: AtLeastSpecification<T>, depth: number): string {
    const minimum = spec.getMinimum();
    const specifications = spec.getSpecifications();
    const specDsls = specifications.map(s => this.exportSpecification(s, depth + 1));
    
    if (this.options.prettyPrint && specDsls.length > 2) {
      const nextIndent = ' '.repeat((depth + 1) * this.options.indentSize);
      const specsStr = specDsls.join(`,\n${nextIndent}`);
      return `atLeast(${minimum}, [\n${nextIndent}${specsStr}\n${' '.repeat(depth * this.options.indentSize)}])`;
    }
    
    return `atLeast(${minimum}, [${specDsls.join(', ')}])`;
  }

  private exportExactlySpecification<T extends object = any>(spec: ExactlySpecification<T>, depth: number): string {
    const exact = spec.getExact();
    const specifications = spec.getSpecifications();
    const specDsls = specifications.map(s => this.exportSpecification(s, depth + 1));
    
    if (this.options.prettyPrint && specDsls.length > 2) {
      const nextIndent = ' '.repeat((depth + 1) * this.options.indentSize);
      const specsStr = specDsls.join(`,\n${nextIndent}`);
      return `exactly(${exact}, [\n${nextIndent}${specsStr}\n${' '.repeat(depth * this.options.indentSize)}])`;
    }
    
    return `exactly(${exact}, [${specDsls.join(', ')}])`;
  }

  private exportFieldToFieldSpecification<T extends object = any>(spec: FieldToFieldSpecification<T>): string {
    return spec.toDSL();
  }

  private exportContextualSpecification<T extends object = any>(spec: ContextualSpecification<T>): string {
    return spec.toDSL();
  }

  private needsParentheses<T extends object = any>(spec: Specification<T>, parentContext: string): boolean {
    if (this.options.useParentheses === 'explicit') {
      return true;
    }
    
    if (this.options.useParentheses === 'minimal') {
      return false;
    }
    
    // Auto mode - determine based on operator precedence
    const precedence = this.getOperatorPrecedence(spec);
    const parentPrecedence = this.getContextPrecedence(parentContext);
    
    return precedence < parentPrecedence;
  }

  private getOperatorPrecedence<T extends object = any>(spec: Specification<T>): number {
    if (spec instanceof NotSpecification) return 5;
    if (spec instanceof AndSpecification) return 4;
    if (spec instanceof OrSpecification) return 3;
    if (spec instanceof XorSpecification) return 2;
    if (spec instanceof ImpliesSpecification) return 1;
    return 6; // Highest precedence for primitives
  }

  private getContextPrecedence(context: string): number {
    switch (context) {
      case 'not': return 5;
      case 'and': return 4;
      case 'or': return 3;
      case 'xor': return 2;
      case 'implies': return 1;
      default: return 0;
    }
  }

  private shouldBreakLine(line: string): boolean {
    return line.length > this.options.maxLineLength;
  }

  private formatPretty(dsl: string): string {
    // Additional pretty-printing logic could go here
    // For now, just return the DSL as-is since we handle formatting
    // in the individual export methods
    return dsl;
  }
}