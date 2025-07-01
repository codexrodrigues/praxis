export interface ContextProvider {
  getValue(path: string): any;
  hasValue(path: string): boolean;
}

export class DefaultContextProvider implements ContextProvider {
  constructor(private context: Record<string, any> = {}) {}

  getValue(path: string): any {
    return this.getNestedValue(this.context, path);
  }

  hasValue(path: string): boolean {
    try {
      const value = this.getNestedValue(this.context, path);
      return value !== undefined;
    } catch {
      return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  setContext(context: Record<string, any>): void {
    this.context = context;
  }

  updateContext(updates: Record<string, any>): void {
    this.context = { ...this.context, ...updates };
  }

  getContext(): Record<string, any> {
    return { ...this.context };
  }
}

export class DateContextProvider implements ContextProvider {
  getValue(path: string): any {
    switch (path) {
      case 'now':
        return new Date();
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      case 'timestamp':
        return Date.now();
      default:
        return undefined;
    }
  }

  hasValue(path: string): boolean {
    return ['now', 'today', 'timestamp'].includes(path);
  }
}

export class CompositeContextProvider implements ContextProvider {
  constructor(private providers: ContextProvider[]) {}

  getValue(path: string): any {
    for (const provider of this.providers) {
      if (provider.hasValue(path)) {
        return provider.getValue(path);
      }
    }
    return undefined;
  }

  hasValue(path: string): boolean {
    return this.providers.some(provider => provider.hasValue(path));
  }

  addProvider(provider: ContextProvider): void {
    this.providers.push(provider);
  }

  removeProvider(provider: ContextProvider): void {
    const index = this.providers.indexOf(provider);
    if (index > -1) {
      this.providers.splice(index, 1);
    }
  }
}