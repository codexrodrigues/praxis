# Boolean Composition

> Combine validation rules using logical operators for complex business logic

## 🎯 Overview

Boolean composition allows you to combine multiple specifications using logical operators (`AND`, `OR`, `NOT`, `XOR`, `IMPLIES`) to create complex validation rules. This is the heart of the composable design pattern, enabling you to build sophisticated validation logic from simple, reusable components.

## 🧩 Composition Types

### AND Specification (`&&`)

The `AndSpecification` requires **all** child specifications to be satisfied.

```typescript
export class AndSpecification<T extends object = any> extends Specification<T> {
  constructor(private specifications: Specification<T>[]) { }
  
  isSatisfiedBy(obj: T): boolean {
    return this.specifications.every(spec => spec.isSatisfiedBy(obj));
  }
}
```

#### Basic Usage

```typescript
interface User {
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

// User must be adult, active, and have email
const validUserSpec = SpecificationFactory.and(
  SpecificationFactory.greaterThanOrEqual<User>('age', 18),
  SpecificationFactory.equals<User>('isActive', true),
  SpecificationFactory.contains<User>('email', '@')
);

const user = {
  name: 'John',
  email: 'john@example.com',
  age: 25,
  isActive: true
};

console.log(validUserSpec.isSatisfiedBy(user)); // true
console.log(validUserSpec.toDSL()); 
// Output: "age >= 18 && isActive == true && contains(email, \"@\")"
```

#### JSON Representation

```typescript
const json = validUserSpec.toJSON();
console.log(JSON.stringify(json, null, 2));
// {
//   "type": "and",
//   "specs": [
//     {
//       "type": "field",
//       "field": "age",
//       "operator": "greaterThanOrEqual",
//       "value": 18
//     },
//     {
//       "type": "field", 
//       "field": "isActive",
//       "operator": "equals",
//       "value": true
//     },
//     {
//       "type": "field",
//       "field": "email", 
//       "operator": "contains",
//       "value": "@"
//     }
//   ]
// }
```

### OR Specification (`||`)

The `OrSpecification` requires **at least one** child specification to be satisfied.

```typescript
interface PaymentMethod {
  type: 'credit' | 'debit' | 'paypal' | 'crypto';
  cardNumber?: string;
  paypalEmail?: string;
  walletAddress?: string;
}

// Valid if has credit card OR PayPal OR crypto wallet
const validPaymentSpec = SpecificationFactory.or(
  // Credit/debit card
  SpecificationFactory.and(
    SpecificationFactory.isIn<PaymentMethod>('type', ['credit', 'debit']),
    SpecificationFactory.field<PaymentMethod>('cardNumber', ComparisonOperator.IS_NOT_EMPTY, null)
  ),
  
  // PayPal
  SpecificationFactory.and(
    SpecificationFactory.equals<PaymentMethod>('type', 'paypal'),
    SpecificationFactory.contains<PaymentMethod>('paypalEmail', '@')
  ),
  
  // Cryptocurrency
  SpecificationFactory.and(
    SpecificationFactory.equals<PaymentMethod>('type', 'crypto'),
    SpecificationFactory.field<PaymentMethod>('walletAddress', ComparisonOperator.IS_NOT_EMPTY, null)
  )
);

// Test different payment methods
const creditCard = { type: 'credit' as const, cardNumber: '1234567890123456' };
const paypal = { type: 'paypal' as const, paypalEmail: 'user@example.com' };
const crypto = { type: 'crypto' as const, walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' };

console.log(validPaymentSpec.isSatisfiedBy(creditCard)); // true
console.log(validPaymentSpec.isSatisfiedBy(paypal)); // true
console.log(validPaymentSpec.isSatisfiedBy(crypto)); // true

console.log(validPaymentSpec.toDSL());
// Output: "(type in [\"credit\", \"debit\"] && cardNumber is not empty) || (type == \"paypal\" && contains(paypalEmail, \"@\")) || (type == \"crypto\" && walletAddress is not empty)"
```

### NOT Specification (`!`)

The `NotSpecification` inverts the result of a child specification.

```typescript
interface Content {
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  tags: string[];
}

// Content that is NOT archived
const notArchivedSpec = SpecificationFactory.not(
  SpecificationFactory.equals<Content>('status', 'archived')
);

// Content that is NOT private (i.e., is public)
const notPrivateSpec = SpecificationFactory.not(
  SpecificationFactory.equals<Content>('isPublic', false)
);

// Content that doesn't have sensitive tags
const notSensitiveSpec = SpecificationFactory.not(
  SpecificationFactory.isIn<Content>('tags', ['confidential', 'internal', 'restricted'])
);

const content = {
  status: 'published' as const,
  isPublic: true,
  tags: ['news', 'announcement']
};

console.log(notArchivedSpec.isSatisfiedBy(content)); // true
console.log(notArchivedSpec.toDSL()); // "!(status == \"archived\")"

// Complex negation with AND
const publicContentSpec = SpecificationFactory.and(
  notArchivedSpec,
  notPrivateSpec,
  notSensitiveSpec
);

console.log(publicContentSpec.toDSL());
// Output: "!(status == \"archived\") && !(isPublic == false) && !(tags in [\"confidential\", \"internal\", \"restricted\"])"
```

### XOR Specification (`⊕`)

The `XorSpecification` requires **exactly one** child specification to be satisfied.

```typescript
interface AuthMethod {
  username?: string;
  email?: string;
  phoneNumber?: string;
  socialProvider?: 'google' | 'facebook' | 'twitter';
}

// User must provide exactly one authentication method
const authMethodSpec = SpecificationFactory.xor(
  SpecificationFactory.field<AuthMethod>('username', ComparisonOperator.IS_NOT_EMPTY, null),
  SpecificationFactory.field<AuthMethod>('email', ComparisonOperator.IS_NOT_EMPTY, null),
  SpecificationFactory.field<AuthMethod>('phoneNumber', ComparisonOperator.IS_NOT_EMPTY, null),
  SpecificationFactory.field<AuthMethod>('socialProvider', ComparisonOperator.IS_NOT_NULL, null)
);

// Valid: exactly one method
const validAuth1 = { username: 'john_doe' };
const validAuth2 = { email: 'john@example.com' };

// Invalid: multiple methods
const invalidAuth1 = { username: 'john_doe', email: 'john@example.com' };

// Invalid: no methods
const invalidAuth2 = {};

console.log(authMethodSpec.isSatisfiedBy(validAuth1)); // true
console.log(authMethodSpec.isSatisfiedBy(validAuth2)); // true
console.log(authMethodSpec.isSatisfiedBy(invalidAuth1)); // false
console.log(authMethodSpec.isSatisfiedBy(invalidAuth2)); // false

console.log(authMethodSpec.toDSL());
// Output: "username is not empty xor email is not empty xor phoneNumber is not empty xor socialProvider is not null"
```

### IMPLIES Specification (`→`)

The `ImpliesSpecification` implements logical implication: if the antecedent is true, then the consequent must also be true.

```typescript
interface Subscription {
  type: 'free' | 'premium' | 'enterprise';
  features: string[];
  maxUsers: number;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
}

// If premium subscription, then must have priority+ support
const premiumImpliesSupportSpec = SpecificationFactory.implies(
  SpecificationFactory.equals<Subscription>('type', 'premium'),
  SpecificationFactory.isIn<Subscription>('supportLevel', ['priority', 'dedicated'])
);

// If enterprise, then must have dedicated support AND more than 10 users
const enterpriseImpliesSpec = SpecificationFactory.implies(
  SpecificationFactory.equals<Subscription>('type', 'enterprise'),
  SpecificationFactory.and(
    SpecificationFactory.equals<Subscription>('supportLevel', 'dedicated'),
    SpecificationFactory.greaterThan<Subscription>('maxUsers', 10)
  )
);

const premiumSub = {
  type: 'premium' as const,
  features: ['analytics', 'api'],
  maxUsers: 5,
  supportLevel: 'priority' as const
};

const enterpriseSub = {
  type: 'enterprise' as const,
  features: ['analytics', 'api', 'sso', 'audit'],
  maxUsers: 50,
  supportLevel: 'dedicated' as const
};

console.log(premiumImpliesSupportSpec.isSatisfiedBy(premiumSub)); // true
console.log(enterpriseImpliesSpec.isSatisfiedBy(enterpriseSub)); // true

console.log(premiumImpliesSupportSpec.toDSL());
// Output: "type == \"premium\" implies supportLevel in [\"priority\", \"dedicated\"]"
```

## 🔄 Composition Patterns

### Nested Compositions

```typescript
interface Order {
  customerId: string;
  items: OrderItem[];
  shippingMethod: 'standard' | 'express' | 'overnight';
  total: number;
  discountCode?: string;
  customerType: 'regular' | 'premium' | 'vip';
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

// Complex order validation with nested logic
const validOrderSpec = SpecificationFactory.and(
  // Basic order requirements
  SpecificationFactory.field<Order>('customerId', ComparisonOperator.IS_NOT_EMPTY, null),
  SpecificationFactory.field<Order>('items', ComparisonOperator.IS_NOT_EMPTY, null),
  SpecificationFactory.greaterThan<Order>('total', 0),
  
  // Shipping and customer type rules
  SpecificationFactory.or(
    // Standard shipping for any customer
    SpecificationFactory.equals<Order>('shippingMethod', 'standard'),
    
    // Express shipping only for premium+ customers
    SpecificationFactory.and(
      SpecificationFactory.equals<Order>('shippingMethod', 'express'),
      SpecificationFactory.isIn<Order>('customerType', ['premium', 'vip'])
    ),
    
    // Overnight shipping only for VIP customers
    SpecificationFactory.and(
      SpecificationFactory.equals<Order>('shippingMethod', 'overnight'),
      SpecificationFactory.equals<Order>('customerType', 'vip')
    )
  ),
  
  // Discount code rules
  SpecificationFactory.implies(
    SpecificationFactory.field<Order>('discountCode', ComparisonOperator.IS_NOT_NULL, null),
    SpecificationFactory.or(
      SpecificationFactory.isIn<Order>('customerType', ['premium', 'vip']),
      SpecificationFactory.greaterThan<Order>('total', 100)
    )
  )
);

console.log(validOrderSpec.toDSL());
// Output: Complex nested DSL expression
```

### Short-Circuit Optimization

```typescript
// Expensive validations last for performance
const userValidationSpec = SpecificationFactory.and(
  // Fast checks first
  SpecificationFactory.equals<User>('isActive', true),           // Boolean check
  SpecificationFactory.field<User>('email', ComparisonOperator.IS_NOT_EMPTY, null), // String length
  
  // Medium cost checks
  SpecificationFactory.isIn<User>('role', ['user', 'admin', 'moderator']), // Array lookup
  SpecificationFactory.greaterThanOrEqual<User>('age', 18),      // Numeric comparison
  
  // Expensive checks last
  SpecificationFactory.matches<User>('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/), // Regex
  SpecificationFactory.func<User>('hasValidSubscription', [])    // External API call
);
```

## 🎨 Advanced Patterns

### Conditional Logic Chains

```typescript
interface DocumentApproval {
  documentType: 'contract' | 'invoice' | 'report' | 'policy';
  authorRole: 'employee' | 'manager' | 'director' | 'ceo';
  amount?: number;
  department: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

// Complex approval workflow
const approvalRulesSpec = SpecificationFactory.or(
  // CEO can approve anything
  SpecificationFactory.equals<DocumentApproval>('authorRole', 'ceo'),
  
  // Director approval rules
  SpecificationFactory.and(
    SpecificationFactory.equals<DocumentApproval>('authorRole', 'director'),
    SpecificationFactory.or(
      // Any non-financial document
      SpecificationFactory.isIn<DocumentApproval>('documentType', ['report', 'policy']),
      // Financial documents under 50k
      SpecificationFactory.and(
        SpecificationFactory.isIn<DocumentApproval>('documentType', ['contract', 'invoice']),
        SpecificationFactory.lessThanOrEqual<DocumentApproval>('amount', 50000)
      )
    )
  ),
  
  // Manager approval rules
  SpecificationFactory.and(
    SpecificationFactory.equals<DocumentApproval>('authorRole', 'manager'),
    SpecificationFactory.or(
      // Reports only
      SpecificationFactory.equals<DocumentApproval>('documentType', 'report'),
      // Small invoices/contracts under 10k
      SpecificationFactory.and(
        SpecificationFactory.isIn<DocumentApproval>('documentType', ['contract', 'invoice']),
        SpecificationFactory.lessThanOrEqual<DocumentApproval>('amount', 10000)
      )
    )
  ),
  
  // Emergency override for critical items
  SpecificationFactory.and(
    SpecificationFactory.equals<DocumentApproval>('urgency', 'critical'),
    SpecificationFactory.isIn<DocumentApproval>('authorRole', ['manager', 'director'])
  )
);
```

### Validation Rules with Exceptions

```typescript
interface Employee {
  id: string;
  age: number;
  department: string;
  role: string;
  yearsOfService: number;
  hasSpecialPermission: boolean;
}

// Retirement eligibility with exceptions
const retirementEligibleSpec = SpecificationFactory.or(
  // Standard retirement age
  SpecificationFactory.greaterThanOrEqual<Employee>('age', 65),
  
  // Early retirement for long service
  SpecificationFactory.and(
    SpecificationFactory.greaterThanOrEqual<Employee>('age', 60),
    SpecificationFactory.greaterThanOrEqual<Employee>('yearsOfService', 30)
  ),
  
  // Special permission override
  SpecificationFactory.equals<Employee>('hasSpecialPermission', true),
  
  // Department-specific rules
  SpecificationFactory.and(
    SpecificationFactory.equals<Employee>('department', 'hazardous'),
    SpecificationFactory.greaterThanOrEqual<Employee>('age', 55),
    SpecificationFactory.greaterThanOrEqual<Employee>('yearsOfService', 20)
  )
);
```

## 🧪 Testing Boolean Compositions

### Unit Tests

```typescript
describe('Boolean Compositions', () => {
  interface TestUser {
    name: string;
    age: number;
    isActive: boolean;
    roles: string[];
  }

  describe('AndSpecification', () => {
    it('should require all specifications to pass', () => {
      const spec = SpecificationFactory.and(
        SpecificationFactory.greaterThan<TestUser>('age', 18),
        SpecificationFactory.equals<TestUser>('isActive', true),
        SpecificationFactory.field<TestUser>('name', ComparisonOperator.IS_NOT_EMPTY, null)
      );

      // All conditions met
      expect(spec.isSatisfiedBy({
        name: 'John',
        age: 25,
        isActive: true,
        roles: ['user']
      })).toBe(true);

      // One condition fails
      expect(spec.isSatisfiedBy({
        name: 'John',
        age: 16, // Too young
        isActive: true,
        roles: ['user']
      })).toBe(false);
    });

    it('should export correct DSL', () => {
      const spec = SpecificationFactory.and(
        SpecificationFactory.equals<TestUser>('isActive', true),
        SpecificationFactory.greaterThan<TestUser>('age', 18)
      );

      expect(spec.toDSL()).toBe('isActive == true && age > 18');
    });
  });

  describe('OrSpecification', () => {
    it('should require at least one specification to pass', () => {
      const spec = SpecificationFactory.or(
        SpecificationFactory.equals<TestUser>('name', 'admin'),
        SpecificationFactory.isIn<TestUser>('roles', ['admin', 'moderator'])
      );

      // First condition met
      expect(spec.isSatisfiedBy({
        name: 'admin',
        age: 25,
        isActive: true,
        roles: ['user']
      })).toBe(true);

      // Second condition met
      expect(spec.isSatisfiedBy({
        name: 'John',
        age: 25,
        isActive: true,
        roles: ['admin']
      })).toBe(true);

      // No conditions met
      expect(spec.isSatisfiedBy({
        name: 'John',
        age: 25,
        isActive: true,
        roles: ['user']
      })).toBe(false);
    });
  });

  describe('NotSpecification', () => {
    it('should invert the child specification result', () => {
      const spec = SpecificationFactory.not(
        SpecificationFactory.equals<TestUser>('isActive', false)
      );

      expect(spec.isSatisfiedBy({ isActive: true })).toBe(true);
      expect(spec.isSatisfiedBy({ isActive: false })).toBe(false);
    });
  });

  describe('XorSpecification', () => {
    it('should require exactly one specification to pass', () => {
      const spec = SpecificationFactory.xor(
        SpecificationFactory.equals<TestUser>('name', 'admin'),
        SpecificationFactory.isIn<TestUser>('roles', ['admin'])
      );

      // Exactly one condition met
      expect(spec.isSatisfiedBy({
        name: 'admin',
        roles: ['user'] // Not admin role
      })).toBe(true);

      // Both conditions met - should fail
      expect(spec.isSatisfiedBy({
        name: 'admin',
        roles: ['admin']
      })).toBe(false);

      // No conditions met - should fail
      expect(spec.isSatisfiedBy({
        name: 'John',
        roles: ['user']
      })).toBe(false);
    });
  });
});
```

### Integration Tests

```typescript
describe('Complex Composition Integration', () => {
  interface Product {
    name: string;
    price: number;
    category: string;
    inStock: boolean;
    rating: number;
    tags: string[];
  }

  it('should handle complex nested compositions', () => {
    const premiumProductSpec = SpecificationFactory.and(
      // Must be in stock
      SpecificationFactory.equals<Product>('inStock', true),
      
      // Either expensive OR high-rated
      SpecificationFactory.or(
        SpecificationFactory.greaterThan<Product>('price', 1000),
        SpecificationFactory.greaterThanOrEqual<Product>('rating', 4.5)
      ),
      
      // Not in excluded categories
      SpecificationFactory.not(
        SpecificationFactory.isIn<Product>('category', ['clearance', 'discontinued'])
      ),
      
      // Premium tags XOR luxury category
      SpecificationFactory.xor(
        SpecificationFactory.isIn<Product>('tags', ['premium', 'exclusive']),
        SpecificationFactory.equals<Product>('category', 'luxury')
      )
    );

    const product1: Product = {
      name: 'Premium Widget',
      price: 1500,
      category: 'electronics',
      inStock: true,
      rating: 4.2,
      tags: ['premium']
    };

    const product2: Product = {
      name: 'Luxury Item',
      price: 500,
      category: 'luxury',
      inStock: true,
      rating: 4.8,
      tags: ['handcrafted']
    };

    expect(premiumProductSpec.isSatisfiedBy(product1)).toBe(true);
    expect(premiumProductSpec.isSatisfiedBy(product2)).toBe(true);
  });

  it('should serialize complex compositions correctly', () => {
    const spec = SpecificationFactory.and(
      SpecificationFactory.or(
        SpecificationFactory.equals<Product>('category', 'electronics'),
        SpecificationFactory.equals<Product>('category', 'books')
      ),
      SpecificationFactory.not(
        SpecificationFactory.equals<Product>('inStock', false)
      )
    );

    const json = spec.toJSON();
    const restored = SpecificationFactory.fromJSON<Product>(json);

    expect(restored.toDSL()).toBe(spec.toDSL());

    const testProduct: Product = {
      name: 'Test',
      price: 100,
      category: 'electronics',
      inStock: true,
      rating: 4.0,
      tags: []
    };

    expect(restored.isSatisfiedBy(testProduct)).toBe(spec.isSatisfiedBy(testProduct));
  });
});
```

## 🎯 Best Practices

### 1. **Optimize for Short-Circuit Evaluation**

```typescript
// ✅ Good: Fast checks first
const validation = SpecificationFactory.and(
  SpecificationFactory.equals<User>('isActive', true),    // Fast boolean
  SpecificationFactory.greaterThan<User>('age', 18),      // Simple numeric
  SpecificationFactory.matches<User>('email', emailRegex) // Expensive regex
);

// ❌ Avoid: Expensive operations first
const validation = SpecificationFactory.and(
  SpecificationFactory.matches<User>('email', emailRegex), // Expensive first
  SpecificationFactory.equals<User>('isActive', true)      // Fast check last
);
```

### 2. **Use Meaningful Variable Names**

```typescript
// ✅ Good: Descriptive names
const isAdultUser = SpecificationFactory.greaterThanOrEqual<User>('age', 18);
const isActiveUser = SpecificationFactory.equals<User>('isActive', true);
const hasValidEmail = SpecificationFactory.contains<User>('email', '@');

const validUserSpec = SpecificationFactory.and(isAdultUser, isActiveUser, hasValidEmail);

// ❌ Avoid: Generic names
const spec1 = SpecificationFactory.greaterThanOrEqual<User>('age', 18);
const spec2 = SpecificationFactory.equals<User>('isActive', true);
const combinedSpec = SpecificationFactory.and(spec1, spec2);
```

### 3. **Add Metadata to Complex Compositions**

```typescript
// ✅ Good: Metadata for complex rules
const userRegistrationSpec = SpecificationFactory.and(
  SpecificationFactory.fieldWithMetadata<User>('age', ComparisonOperator.GREATER_THAN_OR_EQUAL, 18, {
    message: 'User must be at least 18 years old',
    code: 'MIN_AGE_VIOLATION'
  }),
  SpecificationFactory.fieldWithMetadata<User>('email', ComparisonOperator.CONTAINS, '@', {
    message: 'Please provide a valid email address',
    code: 'INVALID_EMAIL_FORMAT'
  })
);
```

### 4. **Limit Nesting Depth**

```typescript
// ✅ Good: Flat structure with intermediate variables
const basicValidation = SpecificationFactory.and(spec1, spec2, spec3);
const advancedValidation = SpecificationFactory.and(spec4, spec5);
const combinedValidation = SpecificationFactory.or(basicValidation, advancedValidation);

// ❌ Avoid: Deep nesting
const validation = SpecificationFactory.and(
  SpecificationFactory.or(
    SpecificationFactory.and(
      SpecificationFactory.or(spec1, spec2),
      spec3
    ),
    spec4
  ),
  spec5
);
```

### 5. **Test Individual Components**

```typescript
// ✅ Good: Test building blocks separately
describe('User Validation Components', () => {
  const ageValidation = SpecificationFactory.greaterThanOrEqual<User>('age', 18);
  const emailValidation = SpecificationFactory.contains<User>('email', '@');
  
  it('should validate age correctly', () => {
    expect(ageValidation.isSatisfiedBy({ age: 25 })).toBe(true);
    expect(ageValidation.isSatisfiedBy({ age: 16 })).toBe(false);
  });
  
  it('should validate email correctly', () => {
    expect(emailValidation.isSatisfiedBy({ email: 'user@test.com' })).toBe(true);
    expect(emailValidation.isSatisfiedBy({ email: 'invalid' })).toBe(false);
  });
  
  it('should combine validations correctly', () => {
    const combined = SpecificationFactory.and(ageValidation, emailValidation);
    // Test combined logic...
  });
});
```

Boolean composition is the key to building flexible, maintainable validation systems. By combining simple specifications using logical operators, you can create sophisticated business rules that are easy to understand, test, and modify.