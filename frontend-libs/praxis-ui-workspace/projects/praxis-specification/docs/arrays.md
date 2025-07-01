# Array and Collection Validation

> Comprehensive validation for arrays, collections, and nested object structures

## 🎯 Overview

Phase 2 introduced powerful collection validation specifications that enable validation of arrays and collections with sophisticated rules. These specifications handle common scenarios like validating all items in an array, ensuring uniqueness, and enforcing size constraints.

## 🔧 Collection Specification Types

### `forEach` - Validate All Array Items

Applies a validation specification to every item in an array.

```typescript
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
    
    if (!Array.isArray(arrayValue)) {
      return false;
    }
    
    return arrayValue.every((item: TItem) => this.itemSpecification.isSatisfiedBy(item));
  }
}
```

#### Basic Usage

```typescript
interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  addresses: Address[];
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Address {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

// All order items must have valid prices
const validItemPricesSpec = SpecificationFactory.forEach<Order, OrderItem>(
  'items',
  SpecificationFactory.greaterThan<OrderItem>('price', 0),
  {
    message: 'All order items must have valid prices greater than zero',
    code: 'INVALID_ITEM_PRICES',
    tag: 'validation:order:items:price'
  }
);

// All addresses must have required fields
const validAddressesSpec = SpecificationFactory.forEach<Order, Address>(
  'addresses',
  SpecificationFactory.and(
    SpecificationFactory.field<Address>('street', ComparisonOperator.IS_NOT_EMPTY, null),
    SpecificationFactory.field<Address>('city', ComparisonOperator.IS_NOT_EMPTY, null),
    SpecificationFactory.field<Address>('zipCode', ComparisonOperator.IS_NOT_EMPTY, null)
  ),
  {
    message: 'All addresses must have street, city, and zip code',
    code: 'INCOMPLETE_ADDRESSES',
    tag: 'validation:order:addresses:required'
  }
);

// Test the specifications
const order: Order = {
  id: 'ORD-001',
  customerId: 'CUST-001',
  items: [
    { productId: 'PROD-001', name: 'Widget A', quantity: 2, price: 19.99 },
    { productId: 'PROD-002', name: 'Widget B', quantity: 1, price: 29.99 }
  ],
  addresses: [
    { street: '123 Main St', city: 'Boston', zipCode: '02101', country: 'USA' },
    { street: '456 Oak Ave', city: 'Cambridge', zipCode: '02138', country: 'USA' }
  ]
};

console.log(validItemPricesSpec.isSatisfiedBy(order)); // true
console.log(validAddressesSpec.isSatisfiedBy(order)); // true

console.log(validItemPricesSpec.toDSL());
// Output: "forEach(items, price > 0)"
```

#### Complex Item Validation

```typescript
interface User {
  id: string;
  contacts: Contact[];
  permissions: Permission[];
  auditLog: AuditEntry[];
}

interface Contact {
  type: 'email' | 'phone' | 'address';
  value: string;
  isPrimary: boolean;
  isVerified: boolean;
}

interface Permission {
  resource: string;
  actions: string[];
  grantedAt: Date;
  expiresAt?: Date;
}

// All contacts must be valid for their type
const validContactsSpec = SpecificationFactory.forEach<User, Contact>(
  'contacts',
  SpecificationFactory.or(
    // Email validation
    SpecificationFactory.and(
      SpecificationFactory.equals<Contact>('type', 'email'),
      SpecificationFactory.contains<Contact>('value', '@')
    ),
    // Phone validation
    SpecificationFactory.and(
      SpecificationFactory.equals<Contact>('type', 'phone'),
      SpecificationFactory.matches<Contact>('value', /^\+?[\d\s\-\(\)]+$/)
    ),
    // Address validation
    SpecificationFactory.and(
      SpecificationFactory.equals<Contact>('type', 'address'),
      SpecificationFactory.field<Contact>('value', ComparisonOperator.IS_NOT_EMPTY, null)
    )
  ),
  {
    message: 'All contacts must have valid values for their type',
    code: 'INVALID_CONTACT_VALUES',
    tag: 'validation:user:contacts'
  }
);

// All permissions must be current (not expired)
const currentPermissionsSpec = SpecificationFactory.forEach<User, Permission>(
  'permissions',
  SpecificationFactory.or(
    // No expiration date
    SpecificationFactory.field<Permission>('expiresAt', ComparisonOperator.IS_NULL, null),
    // Expiration date in the future
    SpecificationFactory.greaterThan<Permission>('expiresAt', new Date())
  ),
  {
    message: 'All permissions must be current and not expired',
    code: 'EXPIRED_PERMISSIONS',
    tag: 'validation:user:permissions:current'
  }
);
```

### `uniqueBy` - Ensure Collection Uniqueness

Validates that all items in an array are unique based on a specified key or function.

```typescript
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
    
    if (!Array.isArray(arrayValue)) {
      return false;
    }
    
    const seen = new Set();
    
    for (const item of arrayValue) {
      const key = typeof this.keySelector === 'string' 
        ? item[this.keySelector]
        : this.keySelector(item);
        
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
    }
    
    return true;
  }
  
  getDuplicates(obj: T): any[] {
    const arrayValue = obj[this.arrayField] as any[];
    const seen = new Map();
    const duplicates: any[] = [];
    
    for (const item of arrayValue) {
      const key = typeof this.keySelector === 'string' 
        ? item[this.keySelector]
        : this.keySelector(item);
        
      if (seen.has(key)) {
        duplicates.push(key);
      } else {
        seen.set(key, item);
      }
    }
    
    return duplicates;
  }
}
```

#### Basic Uniqueness Validation

```typescript
interface Team {
  name: string;
  members: TeamMember[];
  projects: Project[];
}

interface TeamMember {
  id: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  priority: number;
}

// Team members must have unique email addresses
const uniqueEmailsSpec = SpecificationFactory.uniqueBy<Team>(
  'members',
  'email',
  {
    message: 'Team members must have unique email addresses',
    code: 'DUPLICATE_MEMBER_EMAILS',
    tag: 'validation:team:members:email'
  }
);

// Projects must have unique names
const uniqueProjectNamesSpec = SpecificationFactory.uniqueBy<Team>(
  'projects',
  'name',
  {
    message: 'Project names must be unique within the team',
    code: 'DUPLICATE_PROJECT_NAMES',
    tag: 'validation:team:projects:name'
  }
);

const team: Team = {
  name: 'Development Team',
  members: [
    { id: '1', email: 'alice@company.com', role: 'developer' },
    { id: '2', email: 'bob@company.com', role: 'designer' },
    { id: '3', email: 'alice@company.com', role: 'tester' } // Duplicate email!
  ],
  projects: [
    { id: 'P1', name: 'Website Redesign', priority: 1 },
    { id: 'P2', name: 'Mobile App', priority: 2 }
  ]
};

console.log(uniqueEmailsSpec.isSatisfiedBy(team)); // false
console.log(uniqueProjectNamesSpec.isSatisfiedBy(team)); // true

// Get duplicate emails
console.log(uniqueEmailsSpec.getDuplicates(team)); // ['alice@company.com']

console.log(uniqueEmailsSpec.toDSL());
// Output: "uniqueBy(members, \"email\")"
```

#### Function-Based Uniqueness

```typescript
interface Inventory {
  items: InventoryItem[];
}

interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  location: {
    warehouse: string;
    aisle: string;
    shelf: number;
  };
}

// Items must be unique by SKU
const uniqueSKUsSpec = SpecificationFactory.uniqueBy<Inventory>(
  'items',
  'sku',
  {
    message: 'Inventory items must have unique SKU codes',
    code: 'DUPLICATE_SKUS'
  }
);

// Items must be unique by location (composite key)
const uniqueLocationsSpec = SpecificationFactory.uniqueBy<Inventory>(
  'items',
  (item: InventoryItem) => `${item.location.warehouse}-${item.location.aisle}-${item.location.shelf}`,
  {
    message: 'Items cannot share the same warehouse location',
    code: 'DUPLICATE_LOCATIONS',
    tag: 'validation:inventory:location'
  }
);
```

### `minLength` / `maxLength` - Array Size Constraints

Validates the minimum and maximum length of arrays.

```typescript
interface ShoppingCart {
  items: CartItem[];
  discountCodes: string[];
  notes: string[];
}

// Cart must have at least one item
const minItemsSpec = SpecificationFactory.minLength<ShoppingCart>(
  'items',
  1,
  {
    message: 'Shopping cart must contain at least one item',
    code: 'EMPTY_CART',
    tag: 'validation:cart:minItems'
  }
);

// Cart cannot have more than 50 items
const maxItemsSpec = SpecificationFactory.maxLength<ShoppingCart>(
  'items',
  50,
  {
    message: 'Shopping cart cannot contain more than 50 items',
    code: 'CART_TOO_LARGE',
    tag: 'validation:cart:maxItems'
  }
);

// Maximum 3 discount codes
const maxDiscountCodesSpec = SpecificationFactory.maxLength<ShoppingCart>(
  'discountCodes',
  3,
  {
    message: 'Maximum 3 discount codes can be applied',
    code: 'TOO_MANY_DISCOUNTS',
    tag: 'validation:cart:discounts'
  }
);

const cart: ShoppingCart = {
  items: [/* ... */],
  discountCodes: ['SAVE10', 'FREESHIP'],
  notes: ['Gift wrapping', 'Leave at door']
};

console.log(minItemsSpec.toDSL()); // "minLength(items, 1)"
console.log(maxItemsSpec.toDSL()); // "maxLength(items, 50)"
```

## 🎨 Advanced Collection Patterns

### Nested Collection Validation

```typescript
interface Department {
  name: string;
  teams: Team[];
}

interface Team {
  name: string;
  members: TeamMember[];
  projects: Project[];
}

interface TeamMember {
  id: string;
  name: string;
  skills: string[];
}

// All teams must have at least 2 members
const teamsMinMembersSpec = SpecificationFactory.forEach<Department, Team>(
  'teams',
  SpecificationFactory.minLength<Team>('members', 2),
  {
    message: 'All teams must have at least 2 members',
    code: 'UNDERSIZED_TEAMS',
    tag: 'validation:department:teams:size'
  }
);

// All team members must have at least one skill
const membersHaveSkillsSpec = SpecificationFactory.forEach<Department, Team>(
  'teams',
  SpecificationFactory.forEach<Team, TeamMember>(
    'members',
    SpecificationFactory.minLength<TeamMember>('skills', 1),
    {
      message: 'Team members must have at least one skill listed',
      code: 'MEMBER_NO_SKILLS'
    }
  ),
  {
    message: 'All teams must have members with defined skills',
    code: 'TEAMS_MISSING_SKILLS',
    tag: 'validation:department:teams:skills'
  }
);

// Teams must have unique names within department
const uniqueTeamNamesSpec = SpecificationFactory.uniqueBy<Department>(
  'teams',
  'name',
  {
    message: 'Team names must be unique within the department',
    code: 'DUPLICATE_TEAM_NAMES'
  }
);
```

### Conditional Collection Validation

```typescript
interface Order {
  type: 'standard' | 'express' | 'bulk';
  items: OrderItem[];
  priority: 'low' | 'medium' | 'high';
  customerId: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  category: string;
}

// Bulk orders must have at least 10 items
const bulkOrderMinItemsSpec = SpecificationFactory.and(
  SpecificationFactory.implies<Order>(
    SpecificationFactory.equals<Order>('type', 'bulk'),
    SpecificationFactory.minLength<Order>('items', 10)
  )
);

// Express orders cannot have more than 5 items
const expressOrderMaxItemsSpec = SpecificationFactory.implies<Order>(
  SpecificationFactory.equals<Order>('type', 'express'),
  SpecificationFactory.maxLength<Order>('items', 5)
);

// High-priority orders must have items all from same category
const highPriorityCategeorySpec = SpecificationFactory.implies<Order>(
  SpecificationFactory.equals<Order>('priority', 'high'),
  SpecificationFactory.uniqueBy<Order>(
    'items',
    'category',
    {
      message: 'High-priority orders must contain items from a single category',
      code: 'MIXED_CATEGORY_HIGH_PRIORITY'
    }
  )
);
```

### Collection Validation with Aggregations

```typescript
interface Invoice {
  items: InvoiceItem[];
  discounts: Discount[];
  taxes: TaxItem[];
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  applicableItems?: string[];
}

// Custom specification for total calculation validation
class InvoiceTotalValidationSpec<T extends object = any> extends Specification<T> {
  constructor(private tolerance: number = 0.01) {
    super();
  }
  
  isSatisfiedBy(obj: T): boolean {
    const invoice = obj as unknown as Invoice;
    
    // Calculate expected total from items
    const itemsTotal = invoice.items.reduce((sum, item) => {
      const expectedItemTotal = item.quantity * item.unitPrice;
      const itemTotalDiff = Math.abs(item.total - expectedItemTotal);
      
      if (itemTotalDiff > this.tolerance) {
        return NaN; // Invalid item total
      }
      
      return sum + item.total;
    }, 0);
    
    if (isNaN(itemsTotal)) {
      return false;
    }
    
    // Apply discounts
    const discountTotal = invoice.discounts.reduce((sum, discount) => {
      if (discount.type === 'percentage') {
        return sum + (itemsTotal * discount.value / 100);
      } else {
        return sum + discount.value;
      }
    }, 0);
    
    // Calculate final expected total
    const expectedTotal = itemsTotal - discountTotal;
    
    return Math.abs(expectedTotal - this.getInvoiceTotal(invoice)) <= this.tolerance;
  }
  
  private getInvoiceTotal(invoice: Invoice): number {
    // This would typically come from a total field on the invoice
    return invoice.items.reduce((sum, item) => sum + item.total, 0);
  }
  
  toJSON(): any {
    return {
      type: 'invoiceTotalValidation',
      tolerance: this.tolerance
    };
  }
  
  toDSL(): string {
    return `validateInvoiceTotal(tolerance: ${this.tolerance})`;
  }
  
  clone(): InvoiceTotalValidationSpec<T> {
    return new InvoiceTotalValidationSpec<T>(this.tolerance);
  }
}

// Complete invoice validation
const invoiceValidationSpec = SpecificationFactory.and(
  // All items must have positive quantities and prices
  SpecificationFactory.forEach<Invoice, InvoiceItem>(
    'items',
    SpecificationFactory.and(
      SpecificationFactory.greaterThan<InvoiceItem>('quantity', 0),
      SpecificationFactory.greaterThan<InvoiceItem>('unitPrice', 0),
      SpecificationFactory.greaterThan<InvoiceItem>('total', 0)
    )
  ),
  
  // Must have at least one item
  SpecificationFactory.minLength<Invoice>('items', 1),
  
  // Discounts must be valid
  SpecificationFactory.forEach<Invoice, Discount>(
    'discounts',
    SpecificationFactory.and(
      SpecificationFactory.greaterThanOrEqual<Discount>('value', 0),
      SpecificationFactory.implies<Discount>(
        SpecificationFactory.equals<Discount>('type', 'percentage'),
        SpecificationFactory.lessThanOrEqual<Discount>('value', 100)
      )
    )
  ),
  
  // Total calculation must be correct
  new InvoiceTotalValidationSpec()
);
```

## 🧪 Testing Collection Validation

### Unit Tests

```typescript
describe('Collection Specifications', () => {
  interface TestData {
    items: TestItem[];
    tags: string[];
  }
  
  interface TestItem {
    id: string;
    name: string;
    value: number;
  }

  describe('ForEachSpecification', () => {
    it('should validate all items in array', () => {
      const spec = SpecificationFactory.forEach<TestData, TestItem>(
        'items',
        SpecificationFactory.greaterThan<TestItem>('value', 0)
      );

      const validData: TestData = {
        items: [
          { id: '1', name: 'Item 1', value: 10 },
          { id: '2', name: 'Item 2', value: 20 }
        ],
        tags: []
      };

      const invalidData: TestData = {
        items: [
          { id: '1', name: 'Item 1', value: 10 },
          { id: '2', name: 'Item 2', value: -5 } // Invalid value
        ],
        tags: []
      };

      expect(spec.isSatisfiedBy(validData)).toBe(true);
      expect(spec.isSatisfiedBy(invalidData)).toBe(false);
    });

    it('should handle empty arrays', () => {
      const spec = SpecificationFactory.forEach<TestData, TestItem>(
        'items',
        SpecificationFactory.greaterThan<TestItem>('value', 0)
      );

      expect(spec.isSatisfiedBy({ items: [], tags: [] })).toBe(true);
    });

    it('should export correct DSL', () => {
      const spec = SpecificationFactory.forEach<TestData, TestItem>(
        'items',
        SpecificationFactory.equals<TestItem>('name', 'test')
      );

      expect(spec.toDSL()).toBe('forEach(items, name == "test")');
    });
  });

  describe('UniqueBySpecification', () => {
    it('should validate uniqueness by field', () => {
      const spec = SpecificationFactory.uniqueBy<TestData>('items', 'id');

      const uniqueData: TestData = {
        items: [
          { id: '1', name: 'Item 1', value: 10 },
          { id: '2', name: 'Item 2', value: 20 }
        ],
        tags: []
      };

      const duplicateData: TestData = {
        items: [
          { id: '1', name: 'Item 1', value: 10 },
          { id: '1', name: 'Item 2', value: 20 } // Duplicate ID
        ],
        tags: []
      };

      expect(spec.isSatisfiedBy(uniqueData)).toBe(true);
      expect(spec.isSatisfiedBy(duplicateData)).toBe(false);
    });

    it('should return duplicate values', () => {
      const spec = SpecificationFactory.uniqueBy<TestData>('items', 'id');

      const duplicateData: TestData = {
        items: [
          { id: '1', name: 'Item 1', value: 10 },
          { id: '2', name: 'Item 2', value: 20 },
          { id: '1', name: 'Item 3', value: 30 }
        ],
        tags: []
      };

      const duplicates = spec.getDuplicates(duplicateData);
      expect(duplicates).toContain('1');
    });
  });

  describe('Length Specifications', () => {
    it('should validate minimum length', () => {
      const spec = SpecificationFactory.minLength<TestData>('tags', 2);

      expect(spec.isSatisfiedBy({ items: [], tags: ['a', 'b', 'c'] })).toBe(true);
      expect(spec.isSatisfiedBy({ items: [], tags: ['a'] })).toBe(false);
      expect(spec.isSatisfiedBy({ items: [], tags: [] })).toBe(false);
    });

    it('should validate maximum length', () => {
      const spec = SpecificationFactory.maxLength<TestData>('tags', 3);

      expect(spec.isSatisfiedBy({ items: [], tags: ['a', 'b'] })).toBe(true);
      expect(spec.isSatisfiedBy({ items: [], tags: ['a', 'b', 'c'] })).toBe(true);
      expect(spec.isSatisfiedBy({ items: [], tags: ['a', 'b', 'c', 'd'] })).toBe(false);
    });
  });
});
```

### Integration Tests

```typescript
describe('Collection Validation Integration', () => {
  interface Order {
    id: string;
    items: OrderItem[];
    addresses: Address[];
  }

  interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
  }

  interface Address {
    type: 'billing' | 'shipping';
    street: string;
    city: string;
    zipCode: string;
  }

  it('should validate complex order structure', () => {
    const orderValidation = SpecificationFactory.and(
      // Must have items
      SpecificationFactory.minLength<Order>('items', 1),
      
      // All items must be valid
      SpecificationFactory.forEach<Order, OrderItem>(
        'items',
        SpecificationFactory.and(
          SpecificationFactory.field<OrderItem>('productId', ComparisonOperator.IS_NOT_EMPTY, null),
          SpecificationFactory.greaterThan<OrderItem>('quantity', 0),
          SpecificationFactory.greaterThan<OrderItem>('price', 0)
        )
      ),
      
      // Must have at least one address
      SpecificationFactory.minLength<Order>('addresses', 1),
      
      // All addresses must be complete
      SpecificationFactory.forEach<Order, Address>(
        'addresses',
        SpecificationFactory.and(
          SpecificationFactory.field<Address>('street', ComparisonOperator.IS_NOT_EMPTY, null),
          SpecificationFactory.field<Address>('city', ComparisonOperator.IS_NOT_EMPTY, null),
          SpecificationFactory.matches<Address>('zipCode', /^\d{5}(-\d{4})?$/)
        )
      ),
      
      // Addresses must have unique types
      SpecificationFactory.uniqueBy<Order>('addresses', 'type')
    );

    const validOrder: Order = {
      id: 'ORD-001',
      items: [
        { productId: 'PROD-001', quantity: 2, price: 19.99 },
        { productId: 'PROD-002', quantity: 1, price: 29.99 }
      ],
      addresses: [
        { type: 'billing', street: '123 Main St', city: 'Boston', zipCode: '02101' },
        { type: 'shipping', street: '456 Oak Ave', city: 'Cambridge', zipCode: '02138' }
      ]
    };

    const invalidOrder: Order = {
      id: 'ORD-002',
      items: [], // No items
      addresses: [
        { type: 'billing', street: '', city: 'Boston', zipCode: 'invalid' } // Invalid address
      ]
    };

    expect(orderValidation.isSatisfiedBy(validOrder)).toBe(true);
    expect(orderValidation.isSatisfiedBy(invalidOrder)).toBe(false);
  });
});
```

## 🎯 Best Practices

### 1. **Appropriate Item Types**

```typescript
// ✅ Good: Strongly typed item validation
const validItemsSpec = SpecificationFactory.forEach<Order, OrderItem>(
  'items',
  SpecificationFactory.greaterThan<OrderItem>('price', 0)
);

// ❌ Avoid: Weak typing
const validItemsSpec = SpecificationFactory.forEach<Order, any>(
  'items',
  SpecificationFactory.greaterThan<any>('price', 0)
);
```

### 2. **Meaningful Error Messages**

```typescript
// ✅ Good: Specific error context
const validItemsSpec = SpecificationFactory.forEach<Order, OrderItem>(
  'items',
  SpecificationFactory.greaterThan<OrderItem>('price', 0),
  {
    message: 'All order items must have a price greater than zero',
    code: 'INVALID_ITEM_PRICE',
    tag: 'validation:order:items:price'
  }
);

// ❌ Avoid: Generic messages
const validItemsSpec = SpecificationFactory.forEach<Order, OrderItem>(
  'items',
  someSpec,
  { message: 'Invalid items' }
);
```

### 3. **Performance Considerations**

```typescript
// ✅ Good: Simple validations first
const orderValidation = SpecificationFactory.and(
  SpecificationFactory.minLength<Order>('items', 1),           // Fast array length check
  SpecificationFactory.uniqueBy<Order>('items', 'productId'), // Medium - O(n) uniqueness
  SpecificationFactory.forEach<Order, OrderItem>(             // Expensive - O(n) with complex validation
    'items',
    complexItemValidation
  )
);

// ❌ Avoid: Expensive operations first
const orderValidation = SpecificationFactory.and(
  SpecificationFactory.forEach<Order, OrderItem>('items', complexValidation), // Expensive first
  SpecificationFactory.minLength<Order>('items', 1)                           // Simple check last
);
```

### 4. **Modular Collection Validation**

```typescript
// ✅ Good: Modular, reusable validations
const ItemValidations = {
  hasValidPrice: SpecificationFactory.greaterThan<OrderItem>('price', 0),
  hasValidQuantity: SpecificationFactory.greaterThan<OrderItem>('quantity', 0),
  hasProductId: SpecificationFactory.field<OrderItem>('productId', ComparisonOperator.IS_NOT_EMPTY, null)
};

const validItemsSpec = SpecificationFactory.forEach<Order, OrderItem>(
  'items',
  SpecificationFactory.and(
    ItemValidations.hasValidPrice,
    ItemValidations.hasValidQuantity,
    ItemValidations.hasProductId
  )
);

// ❌ Avoid: Monolithic validation definitions
const validItemsSpec = SpecificationFactory.forEach<Order, OrderItem>(
  'items',
  SpecificationFactory.and(
    // Inline all validation logic here...
  )
);
```

Collection validation specifications provide powerful tools for ensuring data integrity across arrays and nested structures, enabling comprehensive validation of complex object hierarchies with clear, maintainable rules.