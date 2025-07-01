import { Specification } from './specification';
import { FunctionRegistry } from '../registry/function-registry';
import { SpecificationMetadata } from './specification-metadata';

export class FunctionSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private functionName: string,
    private args: any[],
    private registry?: FunctionRegistry<T>,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    const registry = this.registry || FunctionRegistry.getInstance<T>();
    return registry.execute(this.functionName, obj, ...this.args);
  }

  toJSON(): any {
    return {
      type: 'function',
      name: this.functionName,
      args: this.args
    };
  }

  static override fromJSON<T extends object = any>(json: any, registry?: FunctionRegistry<T>): FunctionSpecification<T> {
    return new FunctionSpecification<T>(json.name, json.args, registry);
  }

  toDSL(): string {
    const argsStr = this.args.map(arg => {
      if (typeof arg === 'string') {
        return JSON.stringify(arg);
      }
      if (typeof arg === 'object' && arg !== null && arg.type === 'field') {
        return `${arg.field}`;
      }
      return JSON.stringify(arg);
    }).join(', ');

    return `${this.functionName}(${argsStr})`;
  }

  getFunctionName(): string {
    return this.functionName;
  }

  getArgs(): any[] {
    return [...this.args];
  }

  getRegistry(): FunctionRegistry<T> | undefined {
    return this.registry;
  }

  clone(): FunctionSpecification<T> {
    return new FunctionSpecification<T>(
      this.functionName,
      [...this.args],
      this.registry,
      this.metadata
    );
  }
}