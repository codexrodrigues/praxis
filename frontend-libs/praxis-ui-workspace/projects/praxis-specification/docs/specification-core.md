# Specification Core

> Understanding the fundamental Specification Pattern and base classes

## 🎯 Overview

The core of the Praxis Specification library is built around the **Specification Pattern**, which encapsulates business rules in a composable, testable, and reusable way. Every validation rule in the library implements the base `Specification<T>` class.

## 🏗️ Base Specification Class

```typescript
export abstract class Specification<T extends object = any> {
  protected metadata?: SpecificationMetadata;
  
  constructor(metadata?: SpecificationMetadata) {
    this.metadata = metadata;
  }
  
  // Core validation method
  abstract isSatisfiedBy(obj: T): boolean;
  
  // Serialization support
  abstract toJSON(): any;
  static fromJSON<T extends object = any>(json: any): Specification<T>;
  
  // Human-readable DSL export
  abstract toDSL(): string;
  
  // Deep cloning support
  abstract clone(): Specification<T>;
  
  // Metadata access (Phase 2)
  getMetadata(): SpecificationMetadata | undefined {
    return this.metadata;
  }
}
```

### Key Principles

1. **Single Responsibility**: Each specification validates one specific rule
2. **Type Safety**: Full TypeScript generics with object constraints
3. **Immutability**: Specifications are immutable and side-effect free
4. **Composability**: Can be combined using boolean operators
5. **Serializable**: Can be converted to/from JSON for storage
6. **Human Readable**: Can export to DSL for documentation

## 📝 Core Interface

### `isSatisfiedBy(obj: T): boolean`

The heart of every specification - determines if an object satisfies the validation rule.

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

const ageSpec = SpecificationFactory.greaterThan<User>('age', 18);
const user = { name: 'John', age: 25, email: 'john@example.com' };

console.log(ageSpec.isSatisfiedBy(user)); // true
```

### `toJSON(): any`

Converts the specification to a JSON representation for storage or transmission.

```typescript
const spec = SpecificationFactory.equals<User>('name', 'John');
const json = spec.toJSON();

console.log(JSON.stringify(json, null, 2));
// Output:
// {
//   "type": "field",
//   "field": "name",
//   "operator": "equals",
//   "value": "John",
//   "metadata": undefined
// }
```

### `fromJSON<T>(json: any): Specification<T>`

Static method to reconstruct specifications from JSON.

```typescript
const json = {
  type: "field",
  field: "age",
  operator: "greaterThan",
  value: 18
};

const spec = Specification.fromJSON<User>(json);
console.log(spec.isSatisfiedBy({ age: 25 })); // true
```

### `toDSL(): string`

Exports the specification to a human-readable Domain Specific Language.

```typescript
const spec = SpecificationFactory.and(
  SpecificationFactory.greaterThan<User>('age', 18),
  SpecificationFactory.contains<User>('email', '@')
);

console.log(spec.toDSL());
// Output: "age > 18 && contains(email, \"@\")"
```

### `clone(): Specification<T>`

Creates a deep copy of the specification, including all nested specifications and metadata.

```typescript
const original = SpecificationFactory.equals<User>('name', 'John');
const cloned = original.clone();

// Independent instances
console.log(original !== cloned); // true
console.log(original.toDSL() === cloned.toDSL()); // true
```

## 🔧 Creating Custom Specifications

### Basic Custom Specification

```typescript
export class EmailValidationSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private field: keyof T,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }
  
  isSatisfiedBy(obj: T): boolean {
    const email = obj[this.field] as string;
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  toJSON(): any {
    return {
      type: 'emailValidation',
      field: String(this.field),
      metadata: this.metadata
    };
  }
  
  static override fromJSON<T extends object = any>(json: any): EmailValidationSpecification<T> {
    return new EmailValidationSpecification<T>(json.field as keyof T, json.metadata);
  }
  
  toDSL(): string {
    return `isValidEmail(${String(this.field)})`;
  }
  
  clone(): EmailValidationSpecification<T> {
    return new EmailValidationSpecification<T>(this.field, this.metadata);
  }
  
  getField(): keyof T {
    return this.field;
  }
}

// Usage
const emailSpec = new EmailValidationSpecification<User>('email');
console.log(emailSpec.isSatisfiedBy({ email: 'user@example.com' })); // true
console.log(emailSpec.toDSL()); // "isValidEmail(email)"
```

### Advanced Custom Specification with Options

```typescript
interface ValidationOptions {
  allowEmpty?: boolean;
  customDomains?: string[];
  requireTLD?: boolean;
}

export class AdvancedEmailSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private field: keyof T,
    private options: ValidationOptions = {},
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }
  
  isSatisfiedBy(obj: T): boolean {
    const email = obj[this.field] as string;
    
    // Allow empty if configured
    if (!email && this.options.allowEmpty) {
      return true;
    }
    
    if (!email) return false;
    
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    // Custom domain validation
    if (this.options.customDomains) {
      const domain = email.split('@')[1];
      return this.options.customDomains.includes(domain);
    }
    
    // TLD requirement
    if (this.options.requireTLD) {
      const parts = email.split('.');
      return parts.length >= 2 && parts[parts.length - 1].length >= 2;
    }
    
    return true;
  }
  
  toJSON(): any {
    return {
      type: 'advancedEmail',
      field: String(this.field),
      options: this.options,
      metadata: this.metadata
    };
  }
  
  static override fromJSON<T extends object = any>(json: any): AdvancedEmailSpecification<T> {
    return new AdvancedEmailSpecification<T>(
      json.field as keyof T, 
      json.options || {}, 
      json.metadata
    );
  }
  
  toDSL(): string {
    const optionsStr = Object.keys(this.options).length > 0 
      ? `, ${JSON.stringify(this.options)}` 
      : '';
    return `advancedEmail(${String(this.field)}${optionsStr})`;
  }
  
  clone(): AdvancedEmailSpecification<T> {
    return new AdvancedEmailSpecification<T>(
      this.field, 
      { ...this.options }, 
      this.metadata
    );
  }
}

// Usage
const corporateEmailSpec = new AdvancedEmailSpecification<User>('email', {
  customDomains: ['company.com', 'enterprise.org'],
  requireTLD: true
});

console.log(corporateEmailSpec.isSatisfiedBy({ 
  email: 'user@company.com' 
})); // true

console.log(corporateEmailSpec.isSatisfiedBy({ 
  email: 'user@gmail.com' 
})); // false
```

## 🎭 Metadata Integration (Phase 2)

Specifications can carry rich metadata for UI integration and error reporting.

```typescript
interface SpecificationMetadata {
  message?: string;           // Human-readable error message
  code?: string;             // Error code for programmatic handling
  tag?: string;              // Classification tag
  uiConfig?: {               // UI-specific configuration
    highlight?: boolean;
    color?: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
    icon?: string;
  };
}

// Create specification with metadata
const ageSpec = new FieldSpecification<User>(
  'age', 
  ComparisonOperator.GREATER_THAN, 
  18,
  {
    message: 'User must be at least 18 years old',
    code: 'MIN_AGE_VIOLATION',
    tag: 'validation:user:age',
    uiConfig: {
      highlight: true,
      color: 'red',
      severity: 'error',
      icon: 'warning'
    }
  }
);

// Access metadata
const metadata = ageSpec.getMetadata();
console.log(metadata?.message); // "User must be at least 18 years old"
console.log(metadata?.code);    // "MIN_AGE_VIOLATION"
```

## 🧪 Testing Specifications

### Unit Testing Pattern

```typescript
describe('EmailValidationSpecification', () => {
  let spec: EmailValidationSpecification<User>;
  
  beforeEach(() => {
    spec = new EmailValidationSpecification<User>('email');
  });
  
  it('should validate correct email addresses', () => {
    expect(spec.isSatisfiedBy({ email: 'user@example.com' })).toBe(true);
    expect(spec.isSatisfiedBy({ email: 'test.email+tag@domain.co.uk' })).toBe(true);
  });
  
  it('should reject invalid email addresses', () => {
    expect(spec.isSatisfiedBy({ email: 'invalid-email' })).toBe(false);
    expect(spec.isSatisfiedBy({ email: '@domain.com' })).toBe(false);
    expect(spec.isSatisfiedBy({ email: 'user@' })).toBe(false);
  });
  
  it('should handle empty/null values', () => {
    expect(spec.isSatisfiedBy({ email: '' })).toBe(false);
    expect(spec.isSatisfiedBy({ email: null as any })).toBe(false);
  });
  
  it('should export correct DSL', () => {
    expect(spec.toDSL()).toBe('isValidEmail(email)');
  });
  
  it('should serialize to JSON correctly', () => {
    const json = spec.toJSON();
    expect(json.type).toBe('emailValidation');
    expect(json.field).toBe('email');
  });
  
  it('should clone correctly', () => {
    const cloned = spec.clone();
    expect(cloned).not.toBe(spec);
    expect(cloned.toDSL()).toBe(spec.toDSL());
  });
});
```

### Integration Testing

```typescript
describe('Specification Integration', () => {
  interface TestUser {
    name: string;
    email: string;
    age: number;
  }
  
  it('should work with SpecificationFactory', () => {
    // Extend factory for custom specification
    const customFactory = {
      ...SpecificationFactory,
      validEmail<T extends object = any>(field: keyof T): EmailValidationSpecification<T> {
        return new EmailValidationSpecification<T>(field);
      }
    };
    
    const userValidation = customFactory.and(
      customFactory.greaterThan<TestUser>('age', 18),
      customFactory.validEmail<TestUser>('email'),
      customFactory.notEmpty<TestUser>('name')
    );
    
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25
    };
    
    const invalidUser = {
      name: '',
      email: 'invalid-email',
      age: 16
    };
    
    expect(userValidation.isSatisfiedBy(validUser)).toBe(true);
    expect(userValidation.isSatisfiedBy(invalidUser)).toBe(false);
  });
});
```

## 🔗 Composition Examples

### Simple Composition

```typescript
const userValidation = SpecificationFactory.and(
  new EmailValidationSpecification<User>('email'),
  SpecificationFactory.greaterThan<User>('age', 18),
  SpecificationFactory.notEmpty<User>('name')
);
```

### Complex Composition

```typescript
const premiumUserValidation = SpecificationFactory.and(
  // Basic user validation
  new EmailValidationSpecification<User>('email'),
  SpecificationFactory.greaterThan<User>('age', 18),
  
  // Premium-specific rules
  SpecificationFactory.or(
    SpecificationFactory.greaterThan<User>('accountBalance', 1000),
    SpecificationFactory.equals<User>('membershipType', 'premium'),
    SpecificationFactory.and(
      SpecificationFactory.greaterThan<User>('yearsActive', 2),
      SpecificationFactory.greaterThan<User>('referralCount', 5)
    )
  )
);
```

## 🎨 Best Practices

### 1. **Type Safety First**

```typescript
// ✅ Good: Strong typing
const spec = new EmailValidationSpecification<User>('email');

// ❌ Avoid: Weak typing
const spec = new EmailValidationSpecification<any>('email');
```

### 2. **Descriptive Naming**

```typescript
// ✅ Good: Clear intent
const isAdultUser = SpecificationFactory.greaterThanOrEqual<User>('age', 18);
const hasValidEmail = new EmailValidationSpecification<User>('email');

// ❌ Avoid: Generic names
const spec1 = SpecificationFactory.greaterThan<User>('age', 18);
const spec2 = new EmailValidationSpecification<User>('email');
```

### 3. **Meaningful Metadata**

```typescript
// ✅ Good: Rich metadata
const ageSpec = SpecificationFactory.greaterThanWithMetadata<User>('age', 18, {
  message: 'User must be at least 18 years old to register',
  code: 'MIN_AGE_VIOLATION',
  tag: 'validation:registration:age'
});

// ❌ Avoid: No context
const ageSpec = SpecificationFactory.greaterThan<User>('age', 18);
```

### 4. **Consistent Error Handling**

```typescript
class CustomSpecification<T extends object = any> extends Specification<T> {
  isSatisfiedBy(obj: T): boolean {
    try {
      // Validation logic
      return this.performValidation(obj);
    } catch (error) {
      // Log error but don't throw
      console.warn('Validation error:', error);
      return false; // Fail safely
    }
  }
}
```

## 🚀 Performance Tips

### 1. **Reuse Specifications**

```typescript
// ✅ Good: Create once, reuse many times
const emailValidation = new EmailValidationSpecification<User>('email');
users.forEach(user => emailValidation.isSatisfiedBy(user));

// ❌ Avoid: Creating in loops
users.forEach(user => {
  const validation = new EmailValidationSpecification<User>('email');
  return validation.isSatisfiedBy(user);
});
```

### 2. **Lazy Composition**

```typescript
// ✅ Good: Lazy evaluation stops early
const validation = SpecificationFactory.and(
  quickValidation,        // Fast check first
  expensiveValidation     // Expensive check last
);
```

### 3. **Avoid Deep Nesting**

```typescript
// ✅ Good: Flat structure
const rules = [
  SpecificationFactory.notEmpty<User>('name'),
  SpecificationFactory.greaterThan<User>('age', 18),
  new EmailValidationSpecification<User>('email')
];
const validation = SpecificationFactory.and(...rules);

// ❌ Avoid: Deep nesting
const validation = SpecificationFactory.and(
  SpecificationFactory.and(
    SpecificationFactory.and(rule1, rule2),
    SpecificationFactory.and(rule3, rule4)
  ),
  rule5
);
```

The Specification core provides a solid foundation for building any type of validation logic while maintaining excellent type safety, composability, and performance.