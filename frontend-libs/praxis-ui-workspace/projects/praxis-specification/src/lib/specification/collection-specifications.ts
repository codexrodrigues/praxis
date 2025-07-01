import { Specification } from './specification';
import { SpecificationMetadata } from './specification-metadata';

/**
 * Applies a specification to all elements in an array field
 */
export class ForEachSpecification<T extends object = any, TItem extends object = any> extends Specification<T> {
  constructor(
    private arrayField: keyof T,
    private itemSpecification: Specification<TItem>,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    const arrayValue = obj[this.arrayField];
    
    // If not an array, fail validation
    if (!Array.isArray(arrayValue)) {
      return false;
    }

    // Check if all items satisfy the specification
    return arrayValue.every((item: TItem) => {
      try {
        return this.itemSpecification.isSatisfiedBy(item);
      } catch (error) {
        // If item doesn't match expected structure, fail validation
        return false;
      }
    });
  }

  toJSON(): any {
    return {
      type: 'forEach',
      arrayField: String(this.arrayField),
      itemSpecification: this.itemSpecification.toJSON(),
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): ForEachSpecification<T> {
    throw new Error('Use SpecificationFactory.fromJSON() for proper reconstruction');
  }

  toDSL(): string {
    return `forEach(${String(this.arrayField)}, ${this.itemSpecification.toDSL()})`;
  }

  clone(): ForEachSpecification<T, TItem> {
    return new ForEachSpecification<T, TItem>(
      this.arrayField,
      this.itemSpecification.clone(),
      this.metadata
    );
  }

  getArrayField(): keyof T {
    return this.arrayField;
  }

  getItemSpecification(): Specification<TItem> {
    return this.itemSpecification;
  }

  /**
   * Gets items that fail the specification
   */
  getFailingItems(obj: T): { index: number; item: any; errors?: string[] }[] {
    const arrayValue = obj[this.arrayField];
    
    if (!Array.isArray(arrayValue)) {
      return [];
    }

    const failingItems: { index: number; item: any; errors?: string[] }[] = [];
    
    arrayValue.forEach((item: any, index: number) => {
      if (!this.itemSpecification.isSatisfiedBy(item)) {
        failingItems.push({
          index,
          item,
          errors: [`Item at index ${index} failed validation`]
        });
      }
    });

    return failingItems;
  }
}

/**
 * Ensures all items in an array are unique based on a field or key selector
 */
export class UniqueBySpecification<T extends object = any> extends Specification<T> {
  constructor(
    private arrayField: keyof T,
    private keySelector: string | ((item: any) => any),
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    const arrayValue = obj[this.arrayField];
    
    // If not an array, pass validation (empty case)
    if (!Array.isArray(arrayValue)) {
      return true;
    }

    // If empty array, pass validation
    if (arrayValue.length === 0) {
      return true;
    }

    const seen = new Set();
    
    for (const item of arrayValue) {
      let key: any;
      
      if (typeof this.keySelector === 'string') {
        // Field name selector
        key = item?.[this.keySelector];
      } else {
        // Function selector
        key = this.keySelector(item);
      }

      // Convert key to string for Set comparison
      const keyStr = JSON.stringify(key);
      
      if (seen.has(keyStr)) {
        return false; // Duplicate found
      }
      
      seen.add(keyStr);
    }

    return true;
  }

  toJSON(): any {
    return {
      type: 'uniqueBy',
      arrayField: String(this.arrayField),
      keySelector: typeof this.keySelector === 'string' ? this.keySelector : '[Function]',
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): UniqueBySpecification<T> {
    return new UniqueBySpecification<T>(
      json.arrayField as keyof T,
      json.keySelector,
      json.metadata
    );
  }

  toDSL(): string {
    const selector = typeof this.keySelector === 'string' 
      ? `"${this.keySelector}"` 
      : '[Function]';
    return `uniqueBy(${String(this.arrayField)}, ${selector})`;
  }

  clone(): UniqueBySpecification<T> {
    return new UniqueBySpecification<T>(this.arrayField, this.keySelector, this.metadata);
  }

  getArrayField(): keyof T {
    return this.arrayField;
  }

  getKeySelector(): string | ((item: any) => any) {
    return this.keySelector;
  }

  /**
   * Gets duplicate items found in the array
   */
  getDuplicates(obj: T): { key: any; items: { index: number; item: any }[] }[] {
    const arrayValue = obj[this.arrayField];
    
    if (!Array.isArray(arrayValue)) {
      return [];
    }

    const keyMap = new Map<string, { index: number; item: any }[]>();
    
    arrayValue.forEach((item: any, index: number) => {
      let key: any;
      
      if (typeof this.keySelector === 'string') {
        key = item?.[this.keySelector];
      } else {
        key = this.keySelector(item);
      }

      const keyStr = JSON.stringify(key);
      
      if (!keyMap.has(keyStr)) {
        keyMap.set(keyStr, []);
      }
      
      keyMap.get(keyStr)!.push({ index, item });
    });

    // Return only keys that have duplicates
    return Array.from(keyMap.entries())
      .filter(([_, items]) => items.length > 1)
      .map(([keyStr, items]) => ({
        key: JSON.parse(keyStr),
        items
      }));
  }
}

/**
 * Validates that an array has a minimum number of elements
 */
export class MinLengthSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private arrayField: keyof T,
    private minLength: number,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    const arrayValue = obj[this.arrayField];
    
    if (!Array.isArray(arrayValue)) {
      return false;
    }

    return arrayValue.length >= this.minLength;
  }

  toJSON(): any {
    return {
      type: 'minLength',
      arrayField: String(this.arrayField),
      minLength: this.minLength,
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): MinLengthSpecification<T> {
    return new MinLengthSpecification<T>(
      json.arrayField as keyof T,
      json.minLength,
      json.metadata
    );
  }

  toDSL(): string {
    return `minLength(${String(this.arrayField)}, ${this.minLength})`;
  }

  clone(): MinLengthSpecification<T> {
    return new MinLengthSpecification<T>(this.arrayField, this.minLength, this.metadata);
  }

  getArrayField(): keyof T {
    return this.arrayField;
  }

  getMinLength(): number {
    return this.minLength;
  }
}

/**
 * Validates that an array has a maximum number of elements
 */
export class MaxLengthSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private arrayField: keyof T,
    private maxLength: number,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }

  isSatisfiedBy(obj: T): boolean {
    const arrayValue = obj[this.arrayField];
    
    if (!Array.isArray(arrayValue)) {
      return true; // If not array, max length doesn't apply
    }

    return arrayValue.length <= this.maxLength;
  }

  toJSON(): any {
    return {
      type: 'maxLength',
      arrayField: String(this.arrayField),
      maxLength: this.maxLength,
      metadata: this.metadata
    };
  }

  static override fromJSON<T extends object = any>(json: any): MaxLengthSpecification<T> {
    return new MaxLengthSpecification<T>(
      json.arrayField as keyof T,
      json.maxLength,
      json.metadata
    );
  }

  toDSL(): string {
    return `maxLength(${String(this.arrayField)}, ${this.maxLength})`;
  }

  clone(): MaxLengthSpecification<T> {
    return new MaxLengthSpecification<T>(this.arrayField, this.maxLength, this.metadata);
  }

  getArrayField(): keyof T {
    return this.arrayField;
  }

  getMaxLength(): number {
    return this.maxLength;
  }
}