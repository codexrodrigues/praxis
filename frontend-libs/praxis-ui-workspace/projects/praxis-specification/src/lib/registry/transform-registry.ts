export type TransformFunction = (value: any) => any;

export class TransformRegistry {
  private static instance: TransformRegistry;
  private transforms = new Map<string, TransformFunction>();

  private constructor() {
    // Register default transforms
    this.registerDefaults();
  }

  static getInstance(): TransformRegistry {
    if (!this.instance) {
      this.instance = new TransformRegistry();
    }
    return this.instance;
  }

  private registerDefaults(): void {
    this.register('toLowerCase', (value: any) => String(value).toLowerCase());
    this.register('toUpperCase', (value: any) => String(value).toUpperCase());
    this.register('trim', (value: any) => String(value).trim());
    this.register('toString', (value: any) => String(value));
    this.register('toNumber', (value: any) => Number(value));
    this.register('toBoolean', (value: any) => Boolean(value));
    this.register('length', (value: any) => {
      if (typeof value === 'string' || Array.isArray(value)) {
        return value.length;
      }
      return 0;
    });
  }

  register(name: string, fn: TransformFunction): void {
    this.transforms.set(name, fn);
  }

  unregister(name: string): boolean {
    return this.transforms.delete(name);
  }

  get(name: string): TransformFunction | undefined {
    return this.transforms.get(name);
  }

  has(name: string): boolean {
    return this.transforms.has(name);
  }

  getAll(): Map<string, TransformFunction> {
    return new Map(this.transforms);
  }

  clear(): void {
    this.transforms.clear();
    this.registerDefaults();
  }

  apply(name: string, value: any): any {
    const transform = this.transforms.get(name);
    if (!transform) {
      throw new Error(`Transform '${name}' not found in registry`);
    }
    return transform(value);
  }

  applyChain(transforms: string[], value: any): any {
    return transforms.reduce((acc, transformName) => {
      return this.apply(transformName, acc);
    }, value);
  }
}