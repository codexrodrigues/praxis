import { Specification } from './specification';
import { ContextProvider, DefaultContextProvider } from '../context/context-provider';
import { SpecificationMetadata } from './specification-metadata';

export class ContextualSpecification<T extends object> extends Specification<T> {
  private static readonly TOKEN_REGEX = /\$\{([^}]+)\}/g;

  constructor(
    private template: string,
    private contextProvider?: ContextProvider,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    const resolvedExpression = this.resolveTokens(this.template, obj);
    // This would need to be evaluated by the DSL parser
    // For now, we'll throw an error indicating this needs the parser
    throw new Error(`ContextualSpecification requires DSL parser to evaluate: ${resolvedExpression}`);
  }

  toJSON(): any {
    return {
      type: 'contextual',
      template: this.template,
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object>(json: any, contextProvider?: ContextProvider): ContextualSpecification<T> {
    return new ContextualSpecification<T>(json.template, contextProvider, json.metadata);
  }

  toDSL(): string {
    return this.template;
  }

  resolveTokens(template: string, obj: T): string {
    const provider = this.contextProvider || new DefaultContextProvider();
    
    return template.replace(ContextualSpecification.TOKEN_REGEX, (match, tokenPath) => {
      // First try to resolve from context
      if (provider.hasValue(tokenPath)) {
        const value = provider.getValue(tokenPath);
        return this.valueToString(value);
      }
      
      // Then try to resolve from object fields
      if (tokenPath in obj) {
        const value = (obj as any)[tokenPath];
        return this.valueToString(value);
      }
      
      // If not found, return the original token
      return match;
    });
  }

  private valueToString(value: any): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (value instanceof Date) {
      return `"${value.toISOString()}"`;
    }
    return JSON.stringify(value);
  }

  getTemplate(): string {
    return this.template;
  }

  getContextProvider(): ContextProvider | undefined {
    return this.contextProvider;
  }

  setContextProvider(provider: ContextProvider): ContextualSpecification<T> {
    return new ContextualSpecification<T>(this.template, provider, this.metadata);
  }

  getTokens(): string[] {
    const tokens: string[] = [];
    let match;
    const regex = new RegExp(ContextualSpecification.TOKEN_REGEX);
    
    while ((match = regex.exec(this.template)) !== null) {
      tokens.push(match[1]);
    }
    
    return tokens;
  }

  clone(): ContextualSpecification<T> {
    return new ContextualSpecification<T>(this.template, this.contextProvider, this.metadata);
  }
}