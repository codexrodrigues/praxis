export type SpecificationFunction<T> = (obj: T, ...args: any[]) => boolean;

export class FunctionRegistry<T> {
  private static instances = new Map<string, FunctionRegistry<any>>();
  private functions = new Map<string, SpecificationFunction<T>>();

  private constructor(private contextKey: string) {}

  static getInstance<T>(contextKey: string = 'default'): FunctionRegistry<T> {
    if (!this.instances.has(contextKey)) {
      this.instances.set(contextKey, new FunctionRegistry<T>(contextKey));
    }
    return this.instances.get(contextKey)!;
  }

  register(name: string, fn: SpecificationFunction<T>): void {
    this.functions.set(name, fn);
  }

  unregister(name: string): boolean {
    return this.functions.delete(name);
  }

  get(name: string): SpecificationFunction<T> | undefined {
    return this.functions.get(name);
  }

  has(name: string): boolean {
    return this.functions.has(name);
  }

  getAll(): Map<string, SpecificationFunction<T>> {
    return new Map(this.functions);
  }

  clear(): void {
    this.functions.clear();
  }

  execute(name: string, obj: T, ...args: any[]): boolean {
    const fn = this.functions.get(name);
    if (!fn) {
      throw new Error(`Function '${name}' not found in registry`);
    }
    return fn(obj, ...args);
  }

  getContextKey(): string {
    return this.contextKey;
  }
}