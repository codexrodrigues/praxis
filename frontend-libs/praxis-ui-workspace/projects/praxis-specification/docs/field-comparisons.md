# Field Comparisons

> Type-safe field validation with comprehensive comparison operators

## 🎯 Overview

Field comparisons are the foundation of most validation scenarios. The `FieldSpecification` class provides type-safe field validation with a rich set of comparison operators, supporting various data types including strings, numbers, dates, arrays, and objects.

## 🏗️ FieldSpecification Class

```typescript
export class FieldSpecification<T extends object = any> extends Specification<T> {
  constructor(
    private field: keyof T,
    private operator: ComparisonOperator,
    private value: any,
    metadata?: SpecificationMetadata
  ) {
    super(metadata);
  }
  
  isSatisfiedBy(obj: T): boolean {
    const fieldValue = obj[this.field];
    return this.compareValues(fieldValue, this.value, this.operator);
  }
}
```

## 🔧 Comparison Operators

### Equality Operators

#### `EQUALS` / `eq`
Tests for strict equality.

```typescript
interface User {
  name: string;
  role: string;
  isActive: boolean;
}

// String equality
const nameSpec = SpecificationFactory.equals<User>('name', 'John');
console.log(nameSpec.isSatisfiedBy({ name: 'John', role: 'admin', isActive: true })); // true

// Boolean equality
const activeSpec = SpecificationFactory.equals<User>('isActive', true);
console.log(activeSpec.toDSL()); // "isActive == true"

// JSON representation
console.log(JSON.stringify(nameSpec.toJSON(), null, 2));
// {
//   "type": "field",
//   "field": "name",
//   "operator": "equals",
//   "value": "John"
// }
```

#### `NOT_EQUALS` / `neq`
Tests for inequality.

```typescript
const notAdminSpec = SpecificationFactory.notEquals<User>('role', 'admin');
console.log(notAdminSpec.isSatisfiedBy({ role: 'user' })); // true
console.log(notAdminSpec.toDSL()); // "role != \"admin\""
```

### Numeric Comparisons

#### `GREATER_THAN` / `gt`
Tests if field value is greater than the specified value.

```typescript
interface Product {
  price: number;
  stock: number;
  rating: number;
}

const expensiveSpec = SpecificationFactory.greaterThan<Product>('price', 100);
console.log(expensiveSpec.isSatisfiedBy({ price: 150, stock: 5, rating: 4.5 })); // true
console.log(expensiveSpec.toDSL()); // "price > 100"
```

#### `GREATER_THAN_OR_EQUAL` / `gte`
Tests if field value is greater than or equal to the specified value.

```typescript
const adultSpec = SpecificationFactory.greaterThanOrEqual<User>('age', 18);
console.log(adultSpec.isSatisfiedBy({ age: 18 })); // true
console.log(adultSpec.toDSL()); // "age >= 18"
```

#### `LESS_THAN` / `lt`
Tests if field value is less than the specified value.

```typescript
const juniorSpec = SpecificationFactory.lessThan<User>('age', 30);
console.log(juniorSpec.isSatisfiedBy({ age: 25 })); // true
console.log(juniorSpec.toDSL()); // "age < 30"
```

#### `LESS_THAN_OR_EQUAL` / `lte`
Tests if field value is less than or equal to the specified value.

```typescript
const seniorDiscountSpec = SpecificationFactory.lessThanOrEqual<User>('age', 65);
console.log(seniorDiscountSpec.toDSL()); // "age <= 65"
```

### String Operations

#### `CONTAINS`
Tests if string field contains the specified substring.

```typescript
interface Document {
  title: string;
  content: string;
  tags: string[];
}

const hasKeywordSpec = SpecificationFactory.contains<Document>('content', 'important');
console.log(hasKeywordSpec.isSatisfiedBy({ 
  title: 'Report', 
  content: 'This is an important document', 
  tags: [] 
})); // true

console.log(hasKeywordSpec.toDSL()); // "contains(content, \"important\")"
```

#### `STARTS_WITH`
Tests if string field starts with the specified prefix.

```typescript
const userEmailSpec = SpecificationFactory.startsWith<User>('email', 'user.');
console.log(userEmailSpec.isSatisfiedBy({ email: 'user.john@company.com' })); // true
console.log(userEmailSpec.toDSL()); // "startsWith(email, \"user.\")"
```

#### `ENDS_WITH`
Tests if string field ends with the specified suffix.

```typescript
const imageFileSpec = SpecificationFactory.endsWith<Document>('filename', '.jpg');
console.log(imageFileSpec.isSatisfiedBy({ filename: 'photo.jpg' })); // true
console.log(imageFileSpec.toDSL()); // "endsWith(filename, \".jpg\")"
```

#### `MATCHES`
Tests if string field matches a regular expression pattern.

```typescript
const phoneSpec = SpecificationFactory.field<User>('phone', ComparisonOperator.MATCHES, /^\+\d{1,3}\d{10}$/);
console.log(phoneSpec.isSatisfiedBy({ phone: '+5511999999999' })); // true
console.log(phoneSpec.toDSL()); // "matches(phone, /^\\+\\d{1,3}\\d{10}$/)"
```

### Array/Collection Operations

#### `IN`
Tests if field value is contained in the specified array.

```typescript
const validRoleSpec = SpecificationFactory.isIn<User>('role', ['admin', 'user', 'moderator']);
console.log(validRoleSpec.isSatisfiedBy({ role: 'admin' })); // true
console.log(validRoleSpec.toDSL()); // "role in [\"admin\", \"user\", \"moderator\"]"

// With numbers
const validScoreSpec = SpecificationFactory.isIn<Product>('rating', [1, 2, 3, 4, 5]);
console.log(validScoreSpec.isSatisfiedBy({ rating: 4 })); // true
```

#### `NOT_IN`
Tests if field value is NOT contained in the specified array.

```typescript
const notBannedSpec = SpecificationFactory.field<User>('status', ComparisonOperator.NOT_IN, ['banned', 'suspended']);
console.log(notBannedSpec.isSatisfiedBy({ status: 'active' })); // true
console.log(notBannedSpec.toDSL()); // "status not in [\"banned\", \"suspended\"]"
```

### Null/Undefined Checks

#### `IS_NULL`
Tests if field value is null.

```typescript
const noPhoneSpec = SpecificationFactory.field<User>('phone', ComparisonOperator.IS_NULL, null);
console.log(noPhoneSpec.isSatisfiedBy({ phone: null })); // true
console.log(noPhoneSpec.toDSL()); // "phone is null"
```

#### `IS_NOT_NULL`
Tests if field value is not null.

```typescript
const hasPhoneSpec = SpecificationFactory.field<User>('phone', ComparisonOperator.IS_NOT_NULL, null);
console.log(hasPhoneSpec.isSatisfiedBy({ phone: '+1234567890' })); // true
console.log(hasPhoneSpec.toDSL()); // "phone is not null"
```

#### `IS_EMPTY`
Tests if string/array field is empty.

```typescript
const emptyNameSpec = SpecificationFactory.field<User>('name', ComparisonOperator.IS_EMPTY, null);
console.log(emptyNameSpec.isSatisfiedBy({ name: '' })); // true
console.log(emptyNameSpec.isSatisfiedBy({ tags: [] })); // true (for arrays)
console.log(emptyNameSpec.toDSL()); // "name is empty"
```

#### `IS_NOT_EMPTY`
Tests if string/array field is not empty.

```typescript
const hasNameSpec = SpecificationFactory.field<User>('name', ComparisonOperator.IS_NOT_EMPTY, null);
console.log(hasNameSpec.isSatisfiedBy({ name: 'John' })); // true
console.log(hasNameSpec.toDSL()); // "name is not empty"
```

## 🎨 Advanced Examples

### Complex Field Validations

```typescript
interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  shippingAddress?: Address;
  discountCode?: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Address {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

// Order validation specification
const validOrderSpec = SpecificationFactory.and(
  // ID format validation
  SpecificationFactory.matches<Order>('id', /^ORD-\d{8}$/),
  
  // Minimum order total
  SpecificationFactory.greaterThan<Order>('total', 0),
  
  // Valid status
  SpecificationFactory.isIn<Order>('status', ['pending', 'processing', 'shipped', 'delivered']),
  
  // Must have items
  SpecificationFactory.field<Order>('items', ComparisonOperator.IS_NOT_EMPTY, null),
  
  // Recent order (within last year)
  SpecificationFactory.greaterThan<Order>('createdAt', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
);

// Test the specification
const order: Order = {
  id: 'ORD-12345678',
  customerId: 'CUST-001',
  items: [
    { productId: 'PROD-001', quantity: 2, price: 29.99 },
    { productId: 'PROD-002', quantity: 1, price: 19.99 }
  ],
  total: 79.97,
  status: 'pending',
  createdAt: new Date()
};

console.log(validOrderSpec.isSatisfiedBy(order)); // true
console.log(validOrderSpec.toDSL());
// Output: "matches(id, /^ORD-\\d{8}$/) && total > 0 && status in [\"pending\", \"processing\", \"shipped\", \"delivered\"] && items is not empty && createdAt > 2023-06-30T..."
```

### Date Comparisons

```typescript
interface Event {
  name: string;
  startDate: Date;
  endDate: Date;
  isPublic: boolean;
}

// Events happening in the future
const futureEventSpec = SpecificationFactory.greaterThan<Event>('startDate', new Date());

// Events lasting more than 1 day
const multiDayEventSpec = SpecificationFactory.field<Event>(
  'endDate', 
  ComparisonOperator.GREATER_THAN, 
  // This would need field-to-field comparison - see field-to-field.md
  null // Placeholder - use FieldToFieldSpecification for this
);

// Public events only
const publicEventSpec = SpecificationFactory.equals<Event>('isPublic', true);

const upcomingPublicEvents = SpecificationFactory.and(
  futureEventSpec,
  publicEventSpec
);
```

### Nested Object Field Access

```typescript
interface User {
  profile: {
    name: string;
    age: number;
    preferences: {
      theme: 'light' | 'dark';
      language: string;
    };
  };
  settings: {
    notifications: boolean;
    privacy: 'public' | 'friends' | 'private';
  };
}

// Access nested fields using dot notation in field name
const darkThemeSpec = SpecificationFactory.equals<User>('profile.preferences.theme' as keyof User, 'dark');
const adultUserSpec = SpecificationFactory.greaterThanOrEqual<User>('profile.age' as keyof User, 18);

// Note: For deep nested access, consider using contextual specifications
```

## 🧪 Testing Field Comparisons

### Unit Tests

```typescript
describe('FieldSpecification', () => {
  interface TestObject {
    stringField: string;
    numberField: number;
    booleanField: boolean;
    arrayField: string[];
    nullableField?: string;
  }

  describe('String operations', () => {
    it('should handle EQUALS correctly', () => {
      const spec = SpecificationFactory.equals<TestObject>('stringField', 'test');
      
      expect(spec.isSatisfiedBy({ stringField: 'test' })).toBe(true);
      expect(spec.isSatisfiedBy({ stringField: 'other' })).toBe(false);
      expect(spec.toDSL()).toBe('stringField == "test"');
    });

    it('should handle CONTAINS correctly', () => {
      const spec = SpecificationFactory.contains<TestObject>('stringField', 'est');
      
      expect(spec.isSatisfiedBy({ stringField: 'test' })).toBe(true);
      expect(spec.isSatisfiedBy({ stringField: 'testing' })).toBe(true);
      expect(spec.isSatisfiedBy({ stringField: 'other' })).toBe(false);
    });

    it('should handle STARTS_WITH correctly', () => {
      const spec = SpecificationFactory.startsWith<TestObject>('stringField', 'te');
      
      expect(spec.isSatisfiedBy({ stringField: 'test' })).toBe(true);
      expect(spec.isSatisfiedBy({ stringField: 'testing' })).toBe(true);
      expect(spec.isSatisfiedBy({ stringField: 'other' })).toBe(false);
    });
  });

  describe('Numeric operations', () => {
    it('should handle GREATER_THAN correctly', () => {
      const spec = SpecificationFactory.greaterThan<TestObject>('numberField', 10);
      
      expect(spec.isSatisfiedBy({ numberField: 15 })).toBe(true);
      expect(spec.isSatisfiedBy({ numberField: 10 })).toBe(false);
      expect(spec.isSatisfiedBy({ numberField: 5 })).toBe(false);
    });

    it('should handle GREATER_THAN_OR_EQUAL correctly', () => {
      const spec = SpecificationFactory.greaterThanOrEqual<TestObject>('numberField', 10);
      
      expect(spec.isSatisfiedBy({ numberField: 15 })).toBe(true);
      expect(spec.isSatisfiedBy({ numberField: 10 })).toBe(true);
      expect(spec.isSatisfiedBy({ numberField: 5 })).toBe(false);
    });
  });

  describe('Array operations', () => {
    it('should handle IN correctly', () => {
      const spec = SpecificationFactory.isIn<TestObject>('stringField', ['a', 'b', 'c']);
      
      expect(spec.isSatisfiedBy({ stringField: 'a' })).toBe(true);
      expect(spec.isSatisfiedBy({ stringField: 'b' })).toBe(true);
      expect(spec.isSatisfiedBy({ stringField: 'd' })).toBe(false);
    });
  });
});
```

### Integration Tests

```typescript
describe('Field Specification Integration', () => {
  interface User {
    name: string;
    email: string;
    age: number;
    roles: string[];
  }

  it('should work in complex compositions', () => {
    const userValidation = SpecificationFactory.and(
      SpecificationFactory.field<User>('name', ComparisonOperator.IS_NOT_EMPTY, null),
      SpecificationFactory.contains<User>('email', '@'),
      SpecificationFactory.greaterThanOrEqual<User>('age', 18),
      SpecificationFactory.field<User>('roles', ComparisonOperator.IS_NOT_EMPTY, null)
    );

    const validUser: User = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
      roles: ['user']
    };

    const invalidUser: User = {
      name: '',
      email: 'invalid-email',
      age: 16,
      roles: []
    };

    expect(userValidation.isSatisfiedBy(validUser)).toBe(true);
    expect(userValidation.isSatisfiedBy(invalidUser)).toBe(false);
  });

  it('should serialize and deserialize correctly', () => {
    const original = SpecificationFactory.and(
      SpecificationFactory.equals<User>('name', 'John'),
      SpecificationFactory.greaterThan<User>('age', 18)
    );

    const json = original.toJSON();
    const restored = SpecificationFactory.fromJSON<User>(json);

    expect(restored.toDSL()).toBe(original.toDSL());
    
    const testUser = { name: 'John', age: 25, email: 'john@test.com', roles: ['user'] };
    expect(restored.isSatisfiedBy(testUser)).toBe(original.isSatisfiedBy(testUser));
  });
});
```

## 🎯 Best Practices

### 1. **Use Type-Safe Field Names**

```typescript
// ✅ Good: Type-safe field access
const spec = SpecificationFactory.equals<User>('name', 'John');

// ❌ Avoid: String literals that might not exist
const spec = SpecificationFactory.equals<User>('nonExistentField' as keyof User, 'value');
```

### 2. **Choose Appropriate Operators**

```typescript
// ✅ Good: Use specific operators
const emailSpec = SpecificationFactory.contains<User>('email', '@');
const ageSpec = SpecificationFactory.greaterThanOrEqual<User>('age', 18);

// ❌ Avoid: Using generic equals for complex checks
const emailSpec = SpecificationFactory.equals<User>('email', 'user@domain.com'); // Too specific
```

### 3. **Add Meaningful Metadata**

```typescript
// ✅ Good: Rich metadata for UI integration
const ageSpec = SpecificationFactory.fieldWithMetadata<User>(
  'age',
  ComparisonOperator.GREATER_THAN_OR_EQUAL,
  18,
  {
    message: 'User must be at least 18 years old',
    code: 'MIN_AGE_VIOLATION',
    tag: 'validation:user:age',
    uiConfig: {
      severity: 'error',
      highlight: true
    }
  }
);

// ❌ Avoid: No context for errors
const ageSpec = SpecificationFactory.greaterThanOrEqual<User>('age', 18);
```

### 4. **Handle Edge Cases**

```typescript
// ✅ Good: Explicit null/undefined handling
const hasPhoneSpec = SpecificationFactory.and(
  SpecificationFactory.field<User>('phone', ComparisonOperator.IS_NOT_NULL, null),
  SpecificationFactory.field<User>('phone', ComparisonOperator.IS_NOT_EMPTY, null)
);

// ❌ Avoid: Assuming values exist
const phoneValidSpec = SpecificationFactory.startsWith<User>('phone', '+'); // Might fail on null
```

### 5. **Performance Considerations**

```typescript
// ✅ Good: Simple comparisons first
const userValidation = SpecificationFactory.and(
  SpecificationFactory.equals<User>('isActive', true),     // Fast boolean check
  SpecificationFactory.isIn<User>('role', validRoles),     // Fast array lookup
  SpecificationFactory.matches<User>('email', emailRegex)  // Expensive regex last
);

// ❌ Avoid: Expensive operations first
const userValidation = SpecificationFactory.and(
  SpecificationFactory.matches<User>('email', complexRegex), // Expensive first
  SpecificationFactory.equals<User>('isActive', true)        // Simple check last
);
```

Field comparisons provide the building blocks for most validation scenarios. Combined with boolean composition and other specification types, they enable the creation of sophisticated, type-safe validation systems.