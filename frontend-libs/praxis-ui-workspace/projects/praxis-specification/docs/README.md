# Praxis Specification Library

> A powerful TypeScript library for building type-safe, composable validation specifications with DSL support and metadata integration.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/praxis/frontend-libs)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-17+-red)](https://angular.io/)

## 🚀 Quick Start

```typescript
import { SpecificationFactory } from '@praxis/specification';

// Create a user validation specification
const userSpec = SpecificationFactory.and(
  SpecificationFactory.greaterThan('age', 18),
  SpecificationFactory.contains('email', '@'),
  SpecificationFactory.requiredIf('phone', 
    SpecificationFactory.equals('role', 'admin')
  )
);

// Validate data
const user = { age: 25, email: 'user@company.com', role: 'admin' };
const isValid = userSpec.isSatisfiedBy(user); // false - missing phone

// Export to DSL
console.log(userSpec.toDSL());
// Output: age > 18 && contains(email, "@") && requiredIf(phone, role == "admin")

// Export to JSON
const json = userSpec.toJSON();
console.log(JSON.stringify(json, null, 2));
```

## 📚 Table of Contents

### Core Concepts
- [Architecture Overview](./architecture.md)
- [Specification Pattern](./specification-core.md)
- [Type Safety & Generics](./type-safety.md)

### Phase 1 Features (Stable)
- [Field Comparisons](./field-comparisons.md) - `eq`, `gt`, `contains`, etc.
- [Boolean Composition](./boolean-composition.md) - `and`, `or`, `not`, `xor`, `implies`
- [Cardinality](./cardinality.md) - `atLeast`, `exactly`
- [Function Specifications](./function-specs.md) - Custom validation functions
- [Field-to-Field Comparisons](./field-to-field.md) - Compare object fields
- [Transforms](./transforms.md) - Data transformation before validation
- [Contextual Specifications](./contextual-specs.md) - Dynamic context (`${now}`, `${user.role}`)
- [DSL Parser](./dsl-parser.md) - Parse validation expressions
- [DSL Exporter](./dsl-exporter.md) - Export to human-readable format
- [JSON Serialization](./json-roundtrip.md) - Serialize/deserialize specifications

### Phase 2 Features (Latest)
- [Metadata Support](./metadata.md) - Rich validation metadata
- [Conditional Validators](./validators.md) - `requiredIf`, `visibleIf`, etc.
- [Array/Collection Validation](./arrays.md) - `forEach`, `uniqueBy`, etc.
- [Optional Field Handling](./optional-fields.md) - `ifDefined`, `ifNotNull`, etc.
- [Form Specifications](./form-specs.md) - Complex form validation
- [DSL Validation & Linting](./dsl-validation.md) - Error detection and suggestions

### Utilities & Integration
- [Specification Factory](./utils.md) - Convenience methods
- [Integration Examples](./integration.md) - Angular forms, reactive forms
- [Performance Guide](./performance.md) - Optimization tips

## 🏗️ Architecture

```
praxis-specification/
├── specification/          # Core specification classes
│   ├── specification.ts   # Base class
│   ├── field-specification.ts
│   ├── boolean compositions (and, or, not, etc.)
│   ├── conditional-validators.ts  # Phase 2
│   └── collection-specifications.ts  # Phase 2
├── dsl/                   # DSL parsing and export
│   ├── tokenizer.ts
│   ├── parser.ts
│   ├── exporter.ts
│   └── dsl-validator.ts   # Phase 2
├── registry/              # Function and transform registries
├── context/               # Dynamic context support
└── utils/                 # Factory and utilities
```

## ✨ Key Features

### 🎯 **Type-Safe Validation**
- Full TypeScript generics support
- Compile-time field validation
- IntelliSense and auto-completion

### 🧩 **Composable Design**
- Build complex validations from simple rules
- Boolean composition (`and`, `or`, `not`, etc.)
- Reusable specification components

### 📝 **Human-Readable DSL**
```typescript
// TypeScript
SpecificationFactory.and(
  SpecificationFactory.greaterThan('age', 18),
  SpecificationFactory.requiredIf('email', 
    SpecificationFactory.equals('type', 'premium')
  )
)

// DSL Output
"age > 18 && requiredIf(email, type == 'premium')"
```

### 🔄 **JSON Serialization**
- Perfect round-trip serialization
- Store validations in databases
- Dynamic validation loading

### 🎨 **Rich Metadata**
```typescript
const spec = SpecificationFactory.greaterThanWithMetadata('age', 18, {
  message: 'User must be an adult',
  code: 'MIN_AGE_VIOLATION',
  tag: 'validation:user:age',
  uiConfig: {
    highlight: true,
    severity: 'error',
    color: 'red'
  }
});
```

### 🚦 **Advanced Validators** (Phase 2)
- **Conditional**: `requiredIf`, `visibleIf`, `disabledIf`, `readonlyIf`
- **Collections**: `forEach`, `uniqueBy`, `minLength`, `maxLength`
- **Optional Fields**: `ifDefined`, `ifNotNull`, `ifExists`, `withDefault`
- **Forms**: Complex form validation scenarios

## 🛠️ Installation

```bash
npm install @praxis/specification
```

### Angular Integration
```typescript
// app.module.ts
import { PraxisSpecificationModule } from '@praxis/specification';

@NgModule({
  imports: [
    PraxisSpecificationModule.forRoot({
      // Optional configuration
    })
  ]
})
export class AppModule { }
```

## 🎯 Use Cases

### ✅ **Form Validation**
```typescript
const registrationForm = SpecificationFactory.form({
  message: 'User registration validation'
})
  .setRequired('email', true)
  .addFieldRule('password', 
    SpecificationFactory.minLength('password', 8)
  )
  .addConditionalRule('phone',
    SpecificationFactory.requiredIf('phone',
      SpecificationFactory.equals('notifications', 'sms')
    )
  );
```

### ✅ **Business Rules**
```typescript
const discountEligibility = SpecificationFactory.and(
  SpecificationFactory.greaterThanOrEqual('totalAmount', 100),
  SpecificationFactory.equals('customerType', 'premium'),
  SpecificationFactory.lessThan('lastOrderDays', 30)
);
```

### ✅ **Dynamic Validation**
```typescript
// Load validation from API/database
const validationJson = await api.getValidationRules('user-registration');
const specification = SpecificationFactory.fromJSON(validationJson);

// Apply to form data
const isValid = specification.isSatisfiedBy(formData);
```

### ✅ **Multi-Step Forms**
```typescript
const step1 = SpecificationFactory.and(
  SpecificationFactory.notEmpty('firstName'),
  SpecificationFactory.notEmpty('lastName')
);

const step2 = SpecificationFactory.and(
  SpecificationFactory.contains('email', '@'),
  SpecificationFactory.requiredIf('phone', step1)
);
```

## 🔧 Advanced Configuration

### Function Registry
```typescript
import { FunctionRegistry } from '@praxis/specification';

// Register custom functions
FunctionRegistry.getInstance()
  .register('isValidCPF', (obj: any, field: string) => {
    // Custom CPF validation logic
    return validateCPF(obj[field]);
  })
  .register('isBusinessEmail', (obj: any, field: string) => {
    return !obj[field].includes('gmail.com');
  });

// Use in specifications
const spec = SpecificationFactory.func('isValidCPF', ['document']);
```

### Transform Registry
```typescript
import { TransformRegistry } from '@praxis/specification';

// Register transformations
TransformRegistry.getInstance()
  .register('uppercase', (value: string) => value.toUpperCase())
  .register('removeSpaces', (value: string) => value.replace(/\s/g, ''));

// Use in field-to-field comparisons
const spec = SpecificationFactory.fieldToField(
  'email', 'equals', 'confirmEmail',
  ['uppercase'], ['uppercase']  // Transform both fields
);
```

## 🎪 Examples

### Real-World User Registration
```typescript
import { SpecificationFactory } from '@praxis/specification';

interface UserRegistration {
  personalInfo: {
    firstName: string;
    lastName: string;
    age: number;
    email: string;
  };
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
  };
  contactInfo: {
    phone?: string;
    address: {
      street: string;
      city: string;
      zipCode: string;
    };
  };
}

const registrationSpec = SpecificationFactory.and(
  // Personal info validation
  SpecificationFactory.notEmpty('personalInfo.firstName'),
  SpecificationFactory.notEmpty('personalInfo.lastName'),
  SpecificationFactory.greaterThanOrEqual('personalInfo.age', 18),
  SpecificationFactory.contains('personalInfo.email', '@'),
  
  // Conditional phone requirement
  SpecificationFactory.requiredIf('contactInfo.phone',
    SpecificationFactory.equals('preferences.smsNotifications', true)
  ),
  
  // Address validation
  SpecificationFactory.forEach('contactInfo.address',
    SpecificationFactory.and(
      SpecificationFactory.notEmpty('street'),
      SpecificationFactory.notEmpty('city'),
      SpecificationFactory.matches('zipCode', /^\d{5}-?\d{3}$/)
    )
  )
);

// Usage
const userData: UserRegistration = {
  personalInfo: {
    firstName: 'João',
    lastName: 'Silva', 
    age: 25,
    email: 'joao@company.com'
  },
  preferences: {
    newsletter: true,
    smsNotifications: true  // Requires phone
  },
  contactInfo: {
    // phone: missing! - will fail validation
    address: {
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      zipCode: '01234-567'
    }
  }
};

const result = registrationSpec.isSatisfiedBy(userData);
console.log('Is valid:', result); // false - missing required phone

// Get DSL representation
console.log('Validation rule:');
console.log(registrationSpec.toDSL());
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/praxis/frontend-libs/issues)
- 💬 [Discussions](https://github.com/praxis/frontend-libs/discussions)
- 📧 [Email Support](mailto:support@praxis.dev)

---

**Built with ❤️ by the Praxis Team**