# Metadata Support

> Rich validation metadata for enhanced user experience and error handling

## 🎯 Overview

Phase 2 introduced comprehensive metadata support for all specifications, enabling rich error messages, UI integration hints, error codes for programmatic handling, and extensible configuration. Metadata transforms simple validation rules into user-friendly, actionable feedback systems.

## 🏗️ Metadata Interface

```typescript
export interface SpecificationMetadata {
  /**
   * Human-readable error message
   */
  message?: string;
  
  /**
   * Error code for programmatic handling
   */
  code?: string;
  
  /**
   * Classification tag for grouping/filtering
   */
  tag?: string;
  
  /**
   * UI-specific configuration
   */
  uiConfig?: {
    highlight?: boolean;
    color?: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
    icon?: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'inline';
    animation?: string;
    theme?: 'light' | 'dark' | 'auto';
    [key: string]: any; // Extensible for custom UI frameworks
  };
}
```

## 📝 Basic Metadata Usage

### Simple Field Validation with Metadata

```typescript
interface User {
  name: string;
  email: string;
  age: number;
  phone?: string;
}

// Age validation with rich metadata
const ageSpec = SpecificationFactory.fieldWithMetadata<User>(
  'age',
  ComparisonOperator.GREATER_THAN_OR_EQUAL,
  18,
  {
    message: 'User must be at least 18 years old to register',
    code: 'MIN_AGE_VIOLATION',
    tag: 'validation:user:age',
    uiConfig: {
      highlight: true,
      color: '#dc3545',
      severity: 'error',
      icon: 'warning-circle',
      position: 'bottom'
    }
  }
);

// Email validation with metadata
const emailSpec = SpecificationFactory.fieldWithMetadata<User>(
  'email',
  ComparisonOperator.CONTAINS,
  '@',
  {
    message: 'Please enter a valid email address',
    code: 'INVALID_EMAIL_FORMAT',
    tag: 'validation:user:email',
    uiConfig: {
      highlight: true,
      color: '#dc3545',
      severity: 'error',
      icon: 'mail-x'
    }
  }
);

// Usage and metadata access
const user = { name: 'John', email: 'invalid-email', age: 16, phone: undefined };

console.log(ageSpec.isSatisfiedBy(user)); // false
console.log(ageSpec.getMetadata()?.message); // "User must be at least 18 years old to register"
console.log(ageSpec.getMetadata()?.code); // "MIN_AGE_VIOLATION"
```

### Convenience Methods with Metadata

```typescript
// Factory methods for common scenarios with metadata
const userValidation = SpecificationFactory.and(
  SpecificationFactory.equalsWithMetadata<User>('isActive', true, {
    message: 'Account must be active',
    code: 'ACCOUNT_INACTIVE',
    tag: 'validation:user:status'
  }),
  
  SpecificationFactory.greaterThanWithMetadata<User>('age', 18, {
    message: 'Must be an adult user',
    code: 'UNDERAGE_USER',
    tag: 'validation:user:age',
    uiConfig: {
      severity: 'error',
      icon: 'alert-triangle'
    }
  })
);
```

## 🎨 Advanced Metadata Patterns

### Internationalization Support

```typescript
// Metadata with i18n keys
const createValidationWithI18n = (locale: string) => {
  return SpecificationFactory.fieldWithMetadata<User>(
    'age',
    ComparisonOperator.GREATER_THAN_OR_EQUAL,
    18,
    {
      message: `user.validation.age.minimum.${locale}`, // i18n key
      code: 'MIN_AGE_VIOLATION',
      tag: 'validation:user:age',
      uiConfig: {
        severity: 'error',
        theme: locale.startsWith('ar') ? 'rtl' : 'ltr' // RTL support
      }
    }
  );
};

const englishValidation = createValidationWithI18n('en');
const spanishValidation = createValidationWithI18n('es');
const arabicValidation = createValidationWithI18n('ar');
```

### Context-Aware Metadata

```typescript
interface FormContext {
  mode: 'create' | 'edit' | 'view';
  userRole: 'user' | 'admin' | 'moderator';
  formStep?: number;
}

const createContextualValidation = (context: FormContext) => {
  const isEditing = context.mode === 'edit';
  const isAdmin = context.userRole === 'admin';
  
  return SpecificationFactory.fieldWithMetadata<User>(
    'email',
    ComparisonOperator.CONTAINS,
    '@',
    {
      message: isEditing 
        ? 'Update email address to a valid format'
        : 'Please enter a valid email address',
      code: 'INVALID_EMAIL_FORMAT',
      tag: `validation:${context.mode}:email`,
      uiConfig: {
        severity: isAdmin ? 'warning' : 'error', // Different severity for admins
        highlight: context.mode !== 'view',
        position: context.formStep ? 'inline' : 'bottom'
      }
    }
  );
};
```

### Dynamic Metadata

```typescript
// Metadata that changes based on validation result
class DynamicAgeSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private field: keyof T,
    private minAge: number
  ) {
    super();
  }
  
  isSatisfiedBy(obj: T): boolean {
    const age = obj[this.field] as number;
    return age >= this.minAge;
  }
  
  getMetadata(): SpecificationMetadata | undefined {
    return {
      message: `Age must be at least ${this.minAge} years`,
      code: 'MIN_AGE_VIOLATION',
      tag: 'validation:user:age',
      uiConfig: {
        severity: this.minAge >= 21 ? 'error' : 'warning',
        color: this.minAge >= 21 ? '#dc3545' : '#ffc107'
      }
    };
  }
  
  // Other required methods...
  toJSON(): any { return { type: 'dynamicAge', field: String(this.field), minAge: this.minAge }; }
  toDSL(): string { return `${String(this.field)} >= ${this.minAge}`; }
  clone(): DynamicAgeSpecification<T> { return new DynamicAgeSpecification<T>(this.field, this.minAge); }
}
```

## 🎭 Phase 2 Specifications with Metadata

### Conditional Validators

```typescript
// requiredIf with metadata
const phoneRequiredSpec = SpecificationFactory.requiredIf<User>(
  'phone',
  SpecificationFactory.equals<User>('role', 'admin'),
  {
    message: 'Phone number is required for administrator accounts',
    code: 'ADMIN_PHONE_REQUIRED',
    tag: 'validation:conditional:phone',
    uiConfig: {
      severity: 'error',
      icon: 'phone',
      highlight: true,
      animation: 'shake'
    }
  }
);

// visibleIf with UI-specific metadata
const adminPanelVisibilitySpec = SpecificationFactory.visibleIf<User>(
  'adminPanel',
  SpecificationFactory.equals<User>('role', 'admin'),
  {
    message: 'Admin panel is only visible to administrators',
    code: 'ADMIN_PANEL_VISIBILITY',
    tag: 'validation:ui:visibility',
    uiConfig: {
      severity: 'info',
      icon: 'eye',
      animation: 'fadeIn'
    }
  }
);
```

### Collection Specifications

```typescript
interface Order {
  items: OrderItem[];
  addresses: Address[];
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
}

// forEach with detailed error metadata
const validItemsSpec = SpecificationFactory.forEach<Order, OrderItem>(
  'items',
  SpecificationFactory.greaterThan<OrderItem>('price', 0),
  {
    message: 'All order items must have a valid price greater than zero',
    code: 'INVALID_ITEM_PRICE',
    tag: 'validation:order:items',
    uiConfig: {
      severity: 'error',
      icon: 'dollar-sign',
      highlight: true,
      position: 'inline'
    }
  }
);

// uniqueBy with specific error handling
const uniqueAddressesSpec = SpecificationFactory.uniqueBy<Order>(
  'addresses',
  'zipCode',
  {
    message: 'Shipping addresses must have unique zip codes',
    code: 'DUPLICATE_ADDRESSES',
    tag: 'validation:order:addresses',
    uiConfig: {
      severity: 'warning',
      icon: 'map-pin',
      color: '#ffc107'
    }
  }
);
```

### Optional Field Handling

```typescript
// ifDefined with helpful metadata
const phoneFormatSpec = SpecificationFactory.ifDefined<User>(
  'phone',
  SpecificationFactory.startsWith<User>('phone', '+'),
  {
    message: 'Phone number must include country code (e.g., +1234567890)',
    code: 'INVALID_PHONE_FORMAT',
    tag: 'validation:user:phone',
    uiConfig: {
      severity: 'warning',
      icon: 'phone',
      position: 'right'
    }
  }
);

// withDefault with informative metadata
const ageWithDefaultSpec = SpecificationFactory.withDefault<User>(
  'age',
  18,
  SpecificationFactory.greaterThanOrEqual<User>('age', 18),
  {
    message: 'Age defaults to 18 if not provided, must be 18 or older',
    code: 'DEFAULT_AGE_APPLIED',
    tag: 'validation:user:age:default',
    uiConfig: {
      severity: 'info',
      icon: 'info-circle',
      color: '#17a2b8'
    }
  }
);
```

## 🎨 DSL Export with Metadata

The DSL exporter can include metadata as comments for documentation and debugging.

```typescript
import { DslExporter } from '@praxis/specification';

const complexSpec = SpecificationFactory.and(
  SpecificationFactory.equalsWithMetadata<User>('isActive', true, {
    message: 'User must be active',
    code: 'USER_INACTIVE'
  }),
  SpecificationFactory.greaterThanWithMetadata<User>('age', 18, {
    message: 'User must be an adult',
    code: 'UNDERAGE'
  })
);

// Export with metadata comments
const exporter = new DslExporter({
  includeMetadata: true,
  metadataPosition: 'before', // 'before' | 'after' | 'inline'
  prettyPrint: true,
  indentSize: 2
});

console.log(exporter.exportWithMetadata(complexSpec));

// Output:
// // message: User must be active
// // code: USER_INACTIVE
// isActive == true &&
// // message: User must be an adult
// // code: UNDERAGE
// age > 18
```

### Different Metadata Positions

```typescript
// Metadata before expressions
const beforeExporter = new DslExporter({
  includeMetadata: true,
  metadataPosition: 'before'
});

// Metadata after expressions
const afterExporter = new DslExporter({
  includeMetadata: true,
  metadataPosition: 'after'
});

// Inline metadata
const inlineExporter = new DslExporter({
  includeMetadata: true,
  metadataPosition: 'inline'
});

console.log(beforeExporter.exportWithMetadata(complexSpec));
// // message: User must be active
// isActive == true

console.log(afterExporter.exportWithMetadata(complexSpec));
// isActive == true
// // message: User must be active

console.log(inlineExporter.exportWithMetadata(complexSpec));
// isActive == true /* message: User must be active */
```

## 🧪 Testing with Metadata

### Unit Tests

```typescript
describe('Specification Metadata', () => {
  it('should preserve metadata in specifications', () => {
    const metadata: SpecificationMetadata = {
      message: 'Test validation message',
      code: 'TEST_CODE',
      tag: 'test:validation',
      uiConfig: {
        severity: 'error',
        highlight: true
      }
    };
    
    const spec = SpecificationFactory.fieldWithMetadata<User>(
      'age',
      ComparisonOperator.GREATER_THAN,
      18,
      metadata
    );
    
    const retrievedMetadata = spec.getMetadata();
    expect(retrievedMetadata).toEqual(metadata);
    expect(retrievedMetadata?.message).toBe('Test validation message');
    expect(retrievedMetadata?.code).toBe('TEST_CODE');
    expect(retrievedMetadata?.uiConfig?.severity).toBe('error');
  });
  
  it('should preserve metadata through cloning', () => {
    const originalSpec = SpecificationFactory.greaterThanWithMetadata<User>('age', 18, {
      message: 'Age validation',
      code: 'AGE_CHECK'
    });
    
    const clonedSpec = originalSpec.clone();
    
    expect(clonedSpec.getMetadata()).toEqual(originalSpec.getMetadata());
    expect(clonedSpec).not.toBe(originalSpec); // Different instances
  });
  
  it('should include metadata in JSON serialization', () => {
    const spec = SpecificationFactory.equalsWithMetadata<User>('name', 'John', {
      message: 'Name must be John',
      code: 'INVALID_NAME'
    });
    
    const json = spec.toJSON();
    expect(json.metadata).toBeDefined();
    expect(json.metadata.message).toBe('Name must be John');
    expect(json.metadata.code).toBe('INVALID_NAME');
  });
});
```

### Integration Tests

```typescript
describe('Metadata Integration', () => {
  interface ValidationResult {
    isValid: boolean;
    errors: Array<{
      field: string;
      message: string;
      code: string;
      severity: string;
    }>;
  }
  
  const validateWithMetadata = (obj: any, spec: Specification<any>): ValidationResult => {
    const isValid = spec.isSatisfiedBy(obj);
    const errors: ValidationResult['errors'] = [];
    
    if (!isValid) {
      const collectErrors = (specification: Specification<any>, path = ''): void => {
        if (specification instanceof AndSpecification) {
          specification.getSpecifications().forEach(childSpec => {
            if (!childSpec.isSatisfiedBy(obj)) {
              collectErrors(childSpec, path);
            }
          });
        } else if (specification instanceof FieldSpecification) {
          const metadata = specification.getMetadata();
          if (metadata) {
            errors.push({
              field: String(specification.getField()),
              message: metadata.message || 'Validation failed',
              code: metadata.code || 'VALIDATION_ERROR',
              severity: metadata.uiConfig?.severity || 'error'
            });
          }
        }
      };
      
      collectErrors(spec);
    }
    
    return { isValid, errors };
  };
  
  it('should collect validation errors with metadata', () => {
    const userSpec = SpecificationFactory.and(
      SpecificationFactory.fieldWithMetadata<User>('age', ComparisonOperator.GREATER_THAN_OR_EQUAL, 18, {
        message: 'Must be 18 or older',
        code: 'MIN_AGE',
        uiConfig: { severity: 'error' }
      }),
      SpecificationFactory.fieldWithMetadata<User>('email', ComparisonOperator.CONTAINS, '@', {
        message: 'Invalid email format',
        code: 'INVALID_EMAIL',
        uiConfig: { severity: 'error' }
      })
    );
    
    const invalidUser = { name: 'John', age: 16, email: 'invalid' };
    const result = validateWithMetadata(invalidUser, userSpec);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].code).toBe('MIN_AGE');
    expect(result.errors[1].code).toBe('INVALID_EMAIL');
  });
});
```

## 🎯 UI Integration Examples

### Angular Reactive Forms Integration

```typescript
import { FormControl, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';

// Custom validator with metadata support
const createSpecificationValidator = (spec: Specification<any>): ValidatorFn => {
  return (control: AbstractControl) => {
    if (!control.value) return null;
    
    const isValid = spec.isSatisfiedBy({ [control.parent?.get('fieldName')?.value || 'value']: control.value });
    
    if (isValid) return null;
    
    const metadata = spec.getMetadata();
    return {
      specification: {
        message: metadata?.message || 'Validation failed',
        code: metadata?.code || 'VALIDATION_ERROR',
        severity: metadata?.uiConfig?.severity || 'error'
      }
    };
  };
};

// Usage in Angular form
const userForm = new FormGroup({
  age: new FormControl('', [
    createSpecificationValidator(
      SpecificationFactory.greaterThanWithMetadata('age', 18, {
        message: 'You must be at least 18 years old',
        code: 'MIN_AGE_VIOLATION',
        uiConfig: { severity: 'error', icon: 'warning' }
      })
    )
  ]),
  
  email: new FormControl('', [
    createSpecificationValidator(
      SpecificationFactory.fieldWithMetadata('email', ComparisonOperator.CONTAINS, '@', {
        message: 'Please enter a valid email address',
        code: 'INVALID_EMAIL_FORMAT'
      })
    )
  ])
});

// Access validation metadata in template
// {{ userForm.get('age')?.errors?.['specification']?.message }}
```

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';

interface FormData {
  age: number;
  email: string;
}

const useSpecificationValidation = () => {
  const ageSpec = SpecificationFactory.greaterThanWithMetadata<FormData>('age', 18, {
    message: 'Must be 18 or older',
    code: 'MIN_AGE'
  });
  
  const emailSpec = SpecificationFactory.fieldWithMetadata<FormData>('email', ComparisonOperator.CONTAINS, '@', {
    message: 'Invalid email format',
    code: 'INVALID_EMAIL'
  });
  
  return {
    age: (value: number) => {
      const isValid = ageSpec.isSatisfiedBy({ age: value } as FormData);
      if (isValid) return true;
      
      const metadata = ageSpec.getMetadata();
      return metadata?.message || 'Invalid value';
    },
    
    email: (value: string) => {
      const isValid = emailSpec.isSatisfiedBy({ email: value } as FormData);
      if (isValid) return true;
      
      const metadata = emailSpec.getMetadata();
      return metadata?.message || 'Invalid value';
    }
  };
};

// Usage in React component
const MyForm: React.FC = () => {
  const validators = useSpecificationValidation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input
        {...register('age', { validate: validators.age })}
        type="number"
      />
      {errors.age && <span className="error">{errors.age.message}</span>}
      
      <input
        {...register('email', { validate: validators.email })}
        type="email"
      />
      {errors.email && <span className="error">{errors.email.message}</span>}
    </form>
  );
};
```

## 🎨 Best Practices

### 1. **Consistent Metadata Structure**

```typescript
// ✅ Good: Consistent metadata patterns
const createValidationMetadata = (
  message: string,
  code: string,
  severity: 'error' | 'warning' | 'info' = 'error'
): SpecificationMetadata => ({
  message,
  code,
  tag: `validation:${code.toLowerCase()}`,
  uiConfig: {
    severity,
    highlight: severity === 'error',
    icon: severity === 'error' ? 'alert-circle' : 'info-circle'
  }
});

const ageSpec = SpecificationFactory.fieldWithMetadata(
  'age', ComparisonOperator.GREATER_THAN_OR_EQUAL, 18,
  createValidationMetadata('Must be 18 or older', 'MIN_AGE')
);
```

### 2. **Hierarchical Error Codes**

```typescript
// ✅ Good: Hierarchical error codes for organization
const ErrorCodes = {
  USER: {
    AGE: {
      MIN_AGE: 'USER.AGE.MIN_AGE',
      MAX_AGE: 'USER.AGE.MAX_AGE'
    },
    EMAIL: {
      INVALID_FORMAT: 'USER.EMAIL.INVALID_FORMAT',
      DOMAIN_NOT_ALLOWED: 'USER.EMAIL.DOMAIN_NOT_ALLOWED'
    }
  }
} as const;
```

### 3. **Theme-Aware UI Configuration**

```typescript
// ✅ Good: Theme-aware metadata
const createThemeAwareMetadata = (
  message: string,
  code: string,
  theme: 'light' | 'dark' = 'light'
): SpecificationMetadata => ({
  message,
  code,
  uiConfig: {
    severity: 'error',
    color: theme === 'dark' ? '#ff6b6b' : '#dc3545',
    highlight: true,
    theme
  }
});
```

### 4. **Metadata Inheritance**

```typescript
// ✅ Good: Base metadata that can be extended
const baseValidationMetadata: Partial<SpecificationMetadata> = {
  uiConfig: {
    highlight: true,
    position: 'bottom',
    animation: 'fadeIn'
  }
};

const createFieldMetadata = (message: string, code: string): SpecificationMetadata => ({
  ...baseValidationMetadata,
  message,
  code,
  tag: `validation:field:${code.toLowerCase()}`
});
```

Metadata support transforms basic validation into a rich, user-friendly experience. By providing context, error codes, and UI hints, specifications become self-documenting and easily integrated into any user interface framework.