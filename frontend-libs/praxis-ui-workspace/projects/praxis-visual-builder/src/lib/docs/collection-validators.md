# Collection Validators - Visual Builder Phase 2

## Overview

The Collection Validators feature provides comprehensive visual support for array and collection-based validations. This implementation allows users to create complex validation rules for arrays, lists, and collections through an intuitive visual interface.

## Supported Collection Validators

### 1. For Each Validator

**Purpose**: Apply validation rules to each item in a collection.

**Use Cases**:
- Validate each contact in a contact list
- Ensure each product in an order has required fields
- Apply business rules to all array items

**Configuration Options**:
- Item Variable Name: Name to reference each item (default: 'item')
- Index Variable Name: Name to reference item index (default: 'index')
- Validation Rules: List of rules to apply to each item
- Error Handling: How to display and manage validation errors

**Example Usage**:
```typescript
// Contact list validation
const contactsValidation = {
  type: 'forEach',
  targetCollection: 'contacts',
  itemVariable: 'contact',
  itemValidationRules: [
    {
      ruleType: 'required',
      fieldPath: 'contact.email',
      errorMessage: 'Email is required for each contact'
    },
    {
      ruleType: 'format',
      fieldPath: 'contact.phone',
      errorMessage: 'Phone number must be valid'
    }
  ]
};
```

**Visual Preview**:
```
For Each: contacts
├── contact.email (required)
├── contact.phone (format validation)
└── Error Strategy: Show inline with items
```

### 2. Unique By Validator

**Purpose**: Ensure items in a collection are unique based on specified fields.

**Use Cases**:
- Unique email addresses in user list
- Unique product codes in inventory
- Unique combinations of fields (e.g., firstName + lastName + dateOfBirth)

**Configuration Options**:
- Unique Fields: List of field paths to check for uniqueness
- Case Sensitivity: Whether comparison is case-sensitive
- Ignore Empty: Whether to ignore empty/null values
- Duplicate Error Message: Custom message for duplicates

**Example Usage**:
```typescript
// User email uniqueness
const uniqueEmailValidation = {
  type: 'uniqueBy',
  targetCollection: 'users',
  uniqueByFields: ['email'],
  caseSensitive: false,
  ignoreEmpty: true,
  duplicateErrorMessage: 'Email address must be unique'
};

// Complex uniqueness (multiple fields)
const uniquePersonValidation = {
  type: 'uniqueBy',
  targetCollection: 'people',
  uniqueByFields: ['firstName', 'lastName', 'dateOfBirth'],
  caseSensitive: true,
  duplicateErrorMessage: 'Person with same name and birth date already exists'
};
```

**Visual Preview**:
```
Unique By: email, username
├── Case Sensitive: No
├── Ignore Empty: Yes
└── Error: "Account with same email or username already exists"
```

### 3. Minimum Length Validator

**Purpose**: Ensure a collection has at least a minimum number of items.

**Use Cases**:
- Require at least 3 skills for job application
- Minimum 2 references for loan application
- At least 1 attachment for support ticket

**Configuration Options**:
- Minimum Items: Required minimum count
- Length Error Message: Custom message when minimum not met
- Show Item Count: Display current count to user
- Validation Timing: When to validate (add/remove/change/submit)

**Example Usage**:
```typescript
// Minimum skills requirement
const minSkillsValidation = {
  type: 'minLength',
  targetCollection: 'skills',
  minItems: 3,
  lengthErrorMessage: 'At least 3 skills are required',
  showItemCount: true
};
```

**Visual Preview**:
```
Min Length: 3 items
├── Target: skills
├── Show Count: Yes
└── Message: "At least 3 skills are required"
```

### 4. Maximum Length Validator

**Purpose**: Ensure a collection does not exceed a maximum number of items.

**Use Cases**:
- Maximum 10 attachments per email
- Limit to 5 emergency contacts
- Cap at 100 items for performance reasons

**Configuration Options**:
- Maximum Items: Maximum allowed count
- Length Error Message: Custom message when maximum exceeded
- Show Item Count: Display current count to user
- Prevent Excess: Block adding items beyond limit

**Example Usage**:
```typescript
// Maximum attachments limit
const maxAttachmentsValidation = {
  type: 'maxLength',
  targetCollection: 'attachments',
  maxItems: 10,
  lengthErrorMessage: 'Maximum 10 attachments allowed',
  preventExcess: true,
  showItemCount: true
};
```

**Visual Preview**:
```
Max Length: 10 items
├── Target: attachments
├── Prevent Excess: Yes
├── Show Count: Yes
└── Message: "Maximum 10 attachments allowed"
```

## Advanced Configuration Options

### Performance Settings

For large collections, several performance options are available:

```typescript
const performanceConfig = {
  batchSize: 50,              // Process items in batches
  debounceValidation: true,   // Reduce validation frequency
  debounceDelay: 300,         // Delay in milliseconds
  stopOnFirstError: false,    // Continue validation after errors
};
```

### Error Handling Strategies

Choose how validation errors are displayed:

- **Summary**: Show errors at collection level
- **Inline**: Show errors with individual items
- **Both**: Show both summary and inline errors

### Validation Timing

Control when validation occurs:

- **On Add**: Validate when items are added
- **On Remove**: Validate when items are removed
- **On Change**: Validate when items are modified
- **On Submit**: Validate only on form submission

## Complex Examples

### E-commerce Order Validation

```typescript
// Order items validation
const orderItemsValidation = {
  type: 'forEach',
  targetCollection: 'orderItems',
  itemVariable: 'orderItem',
  itemValidationRules: [
    {
      ruleType: 'required',
      fieldPath: 'orderItem.productId',
      errorMessage: 'Product ID is required'
    },
    {
      ruleType: 'condition',
      fieldPath: 'orderItem.quantity',
      errorMessage: 'Quantity must be at least 1'
    },
    {
      ruleType: 'format',
      fieldPath: 'orderItem.price',
      errorMessage: 'Price must be a valid currency amount'
    }
  ],
  validateOnAdd: true,
  validateOnChange: true,
  errorStrategy: 'both',
  batchSize: 20
};

// Unique product constraint
const uniqueProductsValidation = {
  type: 'uniqueBy',
  targetCollection: 'orderItems',
  uniqueByFields: ['productId'],
  duplicateErrorMessage: 'Cannot add the same product twice'
};

// Minimum order requirement
const minOrderValidation = {
  type: 'minLength',
  targetCollection: 'orderItems',
  minItems: 1,
  lengthErrorMessage: 'Order must contain at least one item'
};
```

### Employee Management System

```typescript
// Employee validation
const employeeValidation = {
  type: 'forEach',
  targetCollection: 'employees',
  itemVariable: 'employee',
  itemValidationRules: [
    {
      ruleType: 'required',
      fieldPath: 'employee.personalInfo.firstName',
      errorMessage: 'First name is required'
    },
    {
      ruleType: 'required',
      fieldPath: 'employee.personalInfo.lastName',
      errorMessage: 'Last name is required'
    },
    {
      ruleType: 'format',
      fieldPath: 'employee.email',
      errorMessage: 'Valid email address required'
    },
    {
      ruleType: 'condition',
      fieldPath: 'employee.salary',
      errorMessage: 'Salary must be greater than minimum wage'
    }
  ]
};

// Unique employee ID
const uniqueEmployeeIdValidation = {
  type: 'uniqueBy',
  targetCollection: 'employees',
  uniqueByFields: ['employeeId'],
  duplicateErrorMessage: 'Employee ID must be unique'
};

// Team size limits
const maxTeamSizeValidation = {
  type: 'maxLength',
  targetCollection: 'employees',
  maxItems: 50,
  lengthErrorMessage: 'Team cannot exceed 50 members'
};
```

## Best Practices

### 1. Performance Optimization

- Use batch processing for large collections (500+ items)
- Enable debouncing for real-time validation
- Consider stopping on first error for better UX
- Use appropriate batch sizes (20-100 items)

### 2. Error Messages

- Provide clear, actionable error messages
- Include context (which item, which field)
- Use consistent language across validators
- Consider internationalization

### 3. Validation Strategy

- Validate on appropriate events (add/change/submit)
- Use summary errors for collection-level issues
- Use inline errors for item-specific issues
- Balance between immediate feedback and performance

### 4. User Experience

- Show item counts when helpful
- Prevent actions that would violate constraints
- Highlight problematic items clearly
- Provide easy ways to fix validation errors

## API Reference

### CollectionValidatorConfig Interface

```typescript
interface CollectionValidatorConfig {
  type: 'forEach' | 'uniqueBy' | 'minLength' | 'maxLength';
  targetCollection: string;
  
  // For Each specific
  itemVariable?: string;
  indexVariable?: string;
  itemValidationRules?: ValidationRule[];
  
  // Unique By specific
  uniqueByFields?: string[];
  caseSensitive?: boolean;
  ignoreEmpty?: boolean;
  duplicateErrorMessage?: string;
  
  // Length specific
  minItems?: number;
  maxItems?: number;
  lengthErrorMessage?: string;
  showItemCount?: boolean;
  preventExcess?: boolean;
  
  // Advanced options
  validateOnAdd?: boolean;
  validateOnRemove?: boolean;
  validateOnChange?: boolean;
  validateOnSubmit?: boolean;
  errorStrategy?: 'summary' | 'inline' | 'both';
  stopOnFirstError?: boolean;
  highlightErrorItems?: boolean;
  batchSize?: number;
  debounceValidation?: boolean;
  debounceDelay?: number;
}
```

### ArrayFieldSchema Interface

```typescript
interface ArrayFieldSchema extends FieldSchema {
  type: FieldType.ARRAY;
  itemSchema?: FieldSchema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  uniqueBy?: string[];
  defaultItem?: any;
  allowAdd?: boolean;
  allowRemove?: boolean;
  allowReorder?: boolean;
  arrayValidation?: {
    forEach?: { rules: any[]; stopOnFirstError?: boolean; };
    uniqueBy?: { fields: string[]; caseSensitive?: boolean; };
    length?: { min?: number; max?: number; errorMessage?: string; };
  };
}
```

## Integration Examples

### Form Integration

```typescript
// Angular Reactive Forms
const formGroup = this.fb.group({
  contacts: this.fb.array([]),
  // ... other form controls
});

// Apply collection validators
const validators = [
  createForEachValidator(forEachConfig),
  createUniqueByValidator(uniqueByConfig),
  createMinLengthValidator(minLengthConfig)
];

formGroup.get('contacts')?.setValidators(validators);
```

### DSL Export

```typescript
// Generated DSL for collection validators
`
forEach(contacts, contact => {
  required(contact.email, "Email is required");
  format(contact.phone, /^[0-9-+()s]+$/, "Valid phone required");
})

uniqueBy(users, [email], {
  caseSensitive: false,
  message: "Email must be unique"
})

minLength(skills, 3, "At least 3 skills required")
maxLength(attachments, 10, "Maximum 10 attachments")
`
```

## Troubleshooting

### Common Issues

1. **Performance with Large Arrays**
   - Use batch processing
   - Enable debouncing
   - Consider pagination

2. **Memory Usage**
   - Limit validation scope
   - Use lazy validation
   - Clean up unused validators

3. **Validation Conflicts**
   - Check validator order
   - Ensure field paths are correct
   - Validate configuration

### Migration from Phase 1

If upgrading from Phase 1 (conditional validators only):

1. Update imports to include collection types
2. Add array field schemas to configuration
3. Replace custom array validation with new validators
4. Update tests to include collection scenarios

## Future Enhancements

Planned for future phases:

- **Custom Collection Validators**: User-defined validation logic
- **Cross-Collection Validation**: Validate relationships between collections
- **Advanced Performance**: Virtual scrolling for large collections
- **Visual Designer**: Drag-and-drop collection rule builder
- **Export Templates**: Pre-built collection validation templates