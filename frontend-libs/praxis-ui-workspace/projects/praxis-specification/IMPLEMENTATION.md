# Praxis Specification - Phase 1 Implementation

## Overview

This document describes the complete Phase 1 implementation of the Praxis Specification library, a powerful rules engine based on the Specification pattern with DSL support, JSON serialization, and extensible architecture.

## ✅ Completed Features

### 1. Core Specification Infrastructure

#### Base Specification Class
- `Specification<T extends object>` - Abstract base class
- Type-safe evaluation with `isSatisfiedBy(obj: T): boolean`
- JSON serialization with `toJSON()` and `fromJSON()`
- DSL export with `toDSL()`

#### Field Comparisons (`FieldSpecification<T>`)
**Supported Operators:**
- `eq` (equals) - `==`
- `neq` (not equals) - `!=`
- `lt` (less than) - `<`
- `lte` (less than or equal) - `<=`
- `gt` (greater than) - `>`
- `gte` (greater than or equal) - `>=`
- `contains` - String containment
- `startsWith` - String prefix matching
- `endsWith` - String suffix matching
- `in` - Array membership testing

**Example:**
```typescript
const ageSpec = SpecificationFactory.greaterThan<User>('age', 18);
// DSL: age > 18
// JSON: {"type": "field", "field": "age", "operator": "gt", "value": 18}
```

### 2. Boolean Composition

#### Logical Operators
- `AndSpecification<T>` - Logical AND (&&)
- `OrSpecification<T>` - Logical OR (||)
- `NotSpecification<T>` - Logical NOT (!)
- `XorSpecification<T>` - Exclusive OR (xor)
- `ImpliesSpecification<T>` - Logical implication (implies)

**Example:**
```typescript
const complexSpec = SpecificationFactory.and(
  SpecificationFactory.greaterThan<User>('age', 18),
  SpecificationFactory.equals<User>('isActive', true)
);
// DSL: age > 18 && isActive == true
```

### 3. Cardinality Specifications

#### At Least / Exactly
- `AtLeastSpecification<T>` - At least N conditions must be satisfied
- `ExactlySpecification<T>` - Exactly N conditions must be satisfied

**Example:**
```typescript
const cardinalitySpec = SpecificationFactory.atLeast(2, [
  SpecificationFactory.greaterThan<User>('age', 25),
  SpecificationFactory.equals<User>('isActive', true),
  SpecificationFactory.contains<User>('name', 'admin')
]);
// DSL: atLeast(2, [age > 25, isActive == true, contains(name, "admin")])
```

### 4. Function Registry and Custom Functions

#### FunctionRegistry
- Singleton registry per context
- Type-safe function registration
- Runtime function execution
- Support for parameterized functions

**Example:**
```typescript
const registry = FunctionRegistry.getInstance<User>();
registry.register('isAdult', (user: User) => user.age >= 18);
registry.register('daysSince', (user: User, date: Date) => {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
});

const funcSpec = SpecificationFactory.func<User>('isAdult', []);
// DSL: isAdult()
```

### 5. Field-to-Field Comparisons

#### FieldToFieldSpecification
- Compare two object fields
- Transform values before comparison using TransformRegistry
- Support for chained transformations

**Example:**
```typescript
const fieldToFieldSpec = SpecificationFactory.fieldToField<User>(
  'name', ComparisonOperator.GREATER_THAN, 'email',
  ['length'], ['length']
);
// DSL: name.length > email.length
```

### 6. Transform Registry

#### Built-in Transforms
- `toLowerCase` - Convert to lowercase
- `toUpperCase` - Convert to uppercase  
- `trim` - Remove whitespace
- `toString` - Convert to string
- `toNumber` - Convert to number
- `length` - Get string/array length

**Custom Transform Example:**
```typescript
const transformRegistry = TransformRegistry.getInstance();
transformRegistry.register('reverse', (value: string) => 
  value.split('').reverse().join('')
);
```

### 7. Contextual Specifications

#### Context Providers
- `DefaultContextProvider` - Object-based context
- `DateContextProvider` - Date/time context (`${now}`, `${today}`)
- `CompositeContextProvider` - Multiple provider support

**Example:**
```typescript
const contextSpec = SpecificationFactory.contextual<User>(
  '${age} > 18 && ${role} == "admin"'
);
// Resolves tokens at evaluation time
```

### 8. DSL Parser and Tokenizer

#### Comprehensive DSL Support
- **Tokenizer**: Lexical analysis with proper operator precedence
- **Parser**: Recursive descent parser with error handling
- **Expression Evaluation**: Support for complex nested expressions

**Supported DSL Syntax:**
```
// Basic comparisons
age > 18
name == "Alice"
isActive != false

// Boolean operations
age > 18 && isActive == true
role == "admin" || age > 30
!(isActive == false)

// Function calls
startsWith(name, "A")
contains(email, "@example.com")
atLeast(2, [age > 25, isActive == true, role == "admin"])

// Contextual expressions
${age} > 18 && startsWith(${name}, "A")
```

### 9. DSL Exporter

#### Pretty Printing
- Configurable indentation and line breaking
- Intelligent parentheses placement
- Operator precedence handling

**Export Options:**
```typescript
const exporter = new DslExporter({
  prettyPrint: true,
  indentSize: 2,
  maxLineLength: 80,
  useParentheses: 'auto' // 'minimal' | 'explicit' | 'auto'
});
```

### 10. JSON Serialization

#### Complete Round-trip Support
- All specifications serialize to JSON
- Factory method for reconstruction
- Maintains type safety and behavior

**Example JSON:**
```json
{
  "type": "and",
  "specs": [
    {
      "type": "field",
      "field": "age", 
      "operator": "gt",
      "value": 18
    },
    {
      "type": "function",
      "name": "startsWith",
      "args": [{"type": "field", "field": "name"}, "A"]
    }
  ]
}
```

### 11. Utility Classes

#### SpecificationFactory
- Centralized factory for all specification types
- Convenience methods for common patterns
- Type-safe builder methods

#### SpecificationUtils
- Specification simplification and optimization
- Field reference extraction
- Complexity analysis
- Validation utilities

## 🏗️ Architecture

### Directory Structure
```
projects/praxis-specification/src/lib/
├── specification/          # Core specification classes
│   ├── specification.ts    # Base abstract class
│   ├── field-specification.ts
│   ├── and-specification.ts
│   ├── or-specification.ts
│   ├── not-specification.ts
│   ├── xor-specification.ts
│   ├── implies-specification.ts
│   ├── function-specification.ts
│   ├── at-least-specification.ts
│   ├── exactly-specification.ts
│   ├── field-to-field-specification.ts
│   ├── contextual-specification.ts
│   └── comparison-operator.ts
├── dsl/                    # DSL parsing and export
│   ├── token.ts           # Token definitions
│   ├── tokenizer.ts       # Lexical analyzer
│   ├── parser.ts          # Expression parser
│   └── exporter.ts        # DSL pretty printer
├── registry/              # Function and transform registries
│   ├── function-registry.ts
│   └── transform-registry.ts
├── context/               # Context providers
│   └── context-provider.ts
└── utils/                 # Utilities and factories
    ├── specification-factory.ts
    └── specification-utils.ts
```

### Type Safety
- Full TypeScript generics with `extends object` constraint
- Compile-time field name validation via `keyof T`
- Type-safe registry and factory methods

### Extensibility
- Plugin architecture for custom functions
- Extensible transform system
- Context provider interface for external data

## 📝 Usage Examples

### Basic Usage
```typescript
import { SpecificationFactory, DslParser, DslExporter } from '@praxis/specification';

interface User {
  id: number;
  name: string;
  age: number;
  isActive: boolean;
  role: string;
}

// Create specifications
const spec = SpecificationFactory.and(
  SpecificationFactory.greaterThan<User>('age', 18),
  SpecificationFactory.equals<User>('isActive', true)
);

// Evaluate against objects
const user = { id: 1, name: 'Alice', age: 25, isActive: true, role: 'user' };
console.log(spec.isSatisfiedBy(user)); // true

// Export to DSL
console.log(spec.toDSL()); // "age > 18 && isActive == true"

// Serialize to JSON
const json = spec.toJSON();
const restored = SpecificationFactory.fromJSON<User>(json);

// Parse DSL
const parser = new DslParser<User>();
const parsed = parser.parse('age > 18 && startsWith(name, "A")');
```

### Advanced Usage
```typescript
// Custom functions
const registry = FunctionRegistry.getInstance<User>();
registry.register('isVip', (user: User) => user.role === 'vip' && user.age > 21);

// Field transformations
const fieldSpec = SpecificationFactory.fieldToField<User>(
  'name', ComparisonOperator.GREATER_THAN, 'email',
  ['toLowerCase', 'length'], ['length']
);

// Contextual specifications
const contextProvider = new DefaultContextProvider({
  minAge: 18,
  adminRole: 'admin'
});

const contextSpec = SpecificationFactory.contextual<User>(
  '${age} >= ${minAge} && ${role} == ${adminRole}',
  contextProvider
);

// Pretty printing
const exporter = new DslExporter({ prettyPrint: true, indentSize: 2 });
console.log(exporter.export(complexSpec));
```

## 🎯 Achievements

✅ **Complete Phase 1 Requirements Met:**
- ✅ Field comparisons with all operators
- ✅ Boolean composition (AND, OR, NOT, XOR, IMPLIES)
- ✅ Cardinality specifications (AtLeast, Exactly)
- ✅ Function registry and custom functions
- ✅ Field-to-field comparisons with transforms
- ✅ Contextual specifications with token resolution
- ✅ Complete DSL parser with precedence handling
- ✅ DSL exporter with pretty printing
- ✅ Full JSON serialization support
- ✅ Type-safe extensible architecture
- ✅ Comprehensive utility classes
- ✅ Angular library build successfully

## 🚀 Ready for Phase 2

The infrastructure is now ready for Phase 2 extensions:
- Visual rule builders
- Advanced validation engines
- Performance optimizations
- Additional DSL features
- Integration with Angular reactive forms
- Real-time rule evaluation

## 📦 Build Output

The library successfully builds as an Angular package in:
`/dist/praxis-specification/`

Ready for npm publishing and integration into Angular applications!