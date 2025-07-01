# Conditional Validators

> Dynamic field validation based on contextual conditions

## 🎯 Overview

Phase 2 introduced powerful conditional validators that enable dynamic validation rules based on other field values or application state. These validators implement common UI patterns like conditional required fields, dynamic visibility, and state-dependent form controls.

## 🔧 Conditional Validator Types

### `requiredIf` - Conditional Required Fields

Makes a field required only when a specified condition is met.

```typescript
export class RequiredIfSpecification<T extends object = any> extends ConditionalSpecification<T> {
  isSatisfiedBy(obj: T): boolean {
    // If condition is not met, field is not required (validation passes)
    if (!this.condition.isSatisfiedBy(obj)) {
      return true;
    }
    
    // If condition is met, field must have a value
    const fieldValue = obj[this.field];
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
  }
}
```

#### Basic Usage

```typescript
interface UserRegistration {
  accountType: 'personal' | 'business';
  companyName?: string;
  taxId?: string;
  personalId: string;
  email: string;
}

// Company name required only for business accounts
const companyNameRequiredSpec = SpecificationFactory.requiredIf<UserRegistration>(
  'companyName',
  SpecificationFactory.equals<UserRegistration>('accountType', 'business'),
  {
    message: 'Company name is required for business accounts',
    code: 'COMPANY_NAME_REQUIRED',
    tag: 'validation:conditional:companyName'
  }
);

// Tax ID required only for business accounts
const taxIdRequiredSpec = SpecificationFactory.requiredIf<UserRegistration>(
  'taxId',
  SpecificationFactory.equals<UserRegistration>('accountType', 'business'),
  {
    message: 'Tax ID is required for business accounts',
    code: 'TAX_ID_REQUIRED',
    tag: 'validation:conditional:taxId'
  }
);

// Test the specifications
const personalAccount: UserRegistration = {
  accountType: 'personal',
  personalId: '123456789',
  email: 'user@example.com'
  // companyName and taxId not required
};

const businessAccount: UserRegistration = {
  accountType: 'business',
  companyName: 'Tech Corp Inc.',
  taxId: '98-7654321',
  personalId: '123456789',
  email: 'admin@techcorp.com'
};

console.log(companyNameRequiredSpec.isSatisfiedBy(personalAccount)); // true
console.log(companyNameRequiredSpec.isSatisfiedBy(businessAccount)); // true

console.log(companyNameRequiredSpec.toDSL());
// Output: "requiredIf(companyName, accountType == \"business\")"
```

#### Complex Conditions

```typescript
interface OrderForm {
  shippingMethod: 'pickup' | 'standard' | 'express' | 'overnight';
  shippingAddress?: string;
  phoneNumber?: string;
  orderTotal: number;
  customerType: 'regular' | 'premium' | 'vip';
}

// Address required for all shipping methods except pickup
const addressRequiredSpec = SpecificationFactory.requiredIf<OrderForm>(
  'shippingAddress',
  SpecificationFactory.not(
    SpecificationFactory.equals<OrderForm>('shippingMethod', 'pickup')
  ),
  {
    message: 'Shipping address is required for delivery orders',
    code: 'SHIPPING_ADDRESS_REQUIRED'
  }
);

// Phone required for express/overnight shipping OR high-value orders
const phoneRequiredSpec = SpecificationFactory.requiredIf<OrderForm>(
  'phoneNumber',
  SpecificationFactory.or(
    SpecificationFactory.isIn<OrderForm>('shippingMethod', ['express', 'overnight']),
    SpecificationFactory.greaterThan<OrderForm>('orderTotal', 500)
  ),
  {
    message: 'Phone number is required for express shipping or orders over $500',
    code: 'PHONE_NUMBER_REQUIRED'
  }
);
```

### `visibleIf` - Conditional Field Visibility

Determines if a field should be visible in the UI based on conditions.

```typescript
interface FormConfiguration {
  userRole: 'user' | 'admin' | 'moderator';
  features: string[];
  showAdvanced: boolean;
  debugMode: boolean;
}

// Admin panel visible only to admins
const adminPanelVisibleSpec = SpecificationFactory.visibleIf<FormConfiguration>(
  'adminPanel',
  SpecificationFactory.equals<FormConfiguration>('userRole', 'admin'),
  {
    message: 'Admin panel is only visible to administrators',
    code: 'ADMIN_PANEL_VISIBILITY',
    tag: 'ui:visibility:adminPanel'
  }
);

// Debug options visible when debug mode is enabled
const debugOptionsVisibleSpec = SpecificationFactory.visibleIf<FormConfiguration>(
  'debugOptions',
  SpecificationFactory.equals<FormConfiguration>('debugMode', true),
  {
    message: 'Debug options are only visible in debug mode',
    code: 'DEBUG_OPTIONS_VISIBILITY',
    tag: 'ui:visibility:debugOptions'
  }
);

// Advanced settings visible to moderators+ AND when showAdvanced is true
const advancedSettingsVisibleSpec = SpecificationFactory.visibleIf<FormConfiguration>(
  'advancedSettings',
  SpecificationFactory.and(
    SpecificationFactory.isIn<FormConfiguration>('userRole', ['admin', 'moderator']),
    SpecificationFactory.equals<FormConfiguration>('showAdvanced', true)
  ),
  {
    message: 'Advanced settings require moderator+ role and advanced mode enabled',
    code: 'ADVANCED_SETTINGS_VISIBILITY'
  }
);

// Usage in UI components
const config = {
  userRole: 'admin' as const,
  features: ['analytics', 'reporting'],
  showAdvanced: true,
  debugMode: false
};

console.log(adminPanelVisibleSpec.isSatisfiedBy(config)); // true
console.log(debugOptionsVisibleSpec.isSatisfiedBy(config)); // false
console.log(advancedSettingsVisibleSpec.isSatisfiedBy(config)); // true
```

### `disabledIf` - Conditional Field Disabling

Determines if a field should be disabled based on conditions.

```typescript
interface PaymentForm {
  paymentMethod: 'credit' | 'debit' | 'paypal' | 'crypto';
  savePaymentMethod: boolean;
  isGuest: boolean;
  accountBalance: number;
  hasActiveSubscription: boolean;
}

// Save payment method disabled for guest users
const saveDisabledForGuestSpec = SpecificationFactory.disabledIf<PaymentForm>(
  'savePaymentMethod',
  SpecificationFactory.equals<PaymentForm>('isGuest', true),
  {
    message: 'Payment methods can only be saved for registered users',
    code: 'SAVE_DISABLED_GUEST',
    tag: 'ui:disabled:savePaymentMethod'
  }
);

// Credit/debit options disabled if insufficient balance
const creditDisabledSpec = SpecificationFactory.disabledIf<PaymentForm>(
  'creditOption',
  SpecificationFactory.and(
    SpecificationFactory.not(
      SpecificationFactory.equals<PaymentForm>('hasActiveSubscription', true)
    ),
    SpecificationFactory.lessThan<PaymentForm>('accountBalance', 25)
  ),
  {
    message: 'Credit payment requires active subscription or minimum $25 balance',
    code: 'CREDIT_PAYMENT_DISABLED'
  }
);

const paymentForm = {
  paymentMethod: 'credit' as const,
  savePaymentMethod: false,
  isGuest: true,
  accountBalance: 15,
  hasActiveSubscription: false
};

console.log(saveDisabledForGuestSpec.isSatisfiedBy(paymentForm)); // true (disabled)
console.log(creditDisabledSpec.isSatisfiedBy(paymentForm)); // true (disabled)
```

### `readonlyIf` - Conditional Read-Only Fields

Makes fields read-only based on conditions.

```typescript
interface DocumentEditor {
  documentStatus: 'draft' | 'review' | 'approved' | 'published';
  userRole: 'author' | 'editor' | 'reviewer' | 'admin';
  isLocked: boolean;
  lastModified: Date;
}

// Document content readonly once published
const contentReadonlySpec = SpecificationFactory.readonlyIf<DocumentEditor>(
  'content',
  SpecificationFactory.equals<DocumentEditor>('documentStatus', 'published'),
  {
    message: 'Published documents cannot be edited',
    code: 'PUBLISHED_DOCUMENT_READONLY',
    tag: 'ui:readonly:content'
  }
);

// Title readonly for non-admins when document is in review or approved
const titleReadonlySpec = SpecificationFactory.readonlyIf<DocumentEditor>(
  'title',
  SpecificationFactory.and(
    SpecificationFactory.isIn<DocumentEditor>('documentStatus', ['review', 'approved']),
    SpecificationFactory.not(
      SpecificationFactory.equals<DocumentEditor>('userRole', 'admin')
    )
  ),
  {
    message: 'Title cannot be changed during review process (admin override available)',
    code: 'TITLE_READONLY_REVIEW'
  }
);

// All fields readonly if document is locked
const allFieldsReadonlySpec = SpecificationFactory.readonlyIf<DocumentEditor>(
  'allFields',
  SpecificationFactory.equals<DocumentEditor>('isLocked', true),
  {
    message: 'Document is locked and cannot be edited',
    code: 'DOCUMENT_LOCKED_READONLY'
  }
);
```

## 🎨 Advanced Conditional Patterns

### Cascading Conditions

```typescript
interface MultiStepForm {
  step1Complete: boolean;
  step2Complete: boolean;
  selectedPlan: 'basic' | 'premium' | 'enterprise';
  addOns: string[];
  paymentInfo?: PaymentInfo;
  billingAddress?: Address;
}

// Step 2 fields required only if step 1 is complete
const step2RequiredSpec = SpecificationFactory.requiredIf<MultiStepForm>(
  'selectedPlan',
  SpecificationFactory.equals<MultiStepForm>('step1Complete', true),
  {
    message: 'Please select a plan to continue',
    code: 'PLAN_SELECTION_REQUIRED'
  }
);

// Payment info required if step 2 is complete AND premium+ plan selected
const paymentRequiredSpec = SpecificationFactory.requiredIf<MultiStepForm>(
  'paymentInfo',
  SpecificationFactory.and(
    SpecificationFactory.equals<MultiStepForm>('step2Complete', true),
    SpecificationFactory.isIn<MultiStepForm>('selectedPlan', ['premium', 'enterprise'])
  ),
  {
    message: 'Payment information is required for premium plans',
    code: 'PAYMENT_INFO_REQUIRED'
  }
);

// Billing address required if payment info is provided
const billingAddressRequiredSpec = SpecificationFactory.requiredIf<MultiStepForm>(
  'billingAddress',
  SpecificationFactory.field<MultiStepForm>('paymentInfo', ComparisonOperator.IS_NOT_NULL, null),
  {
    message: 'Billing address is required when payment information is provided',
    code: 'BILLING_ADDRESS_REQUIRED'
  }
);
```

### Role-Based Conditional Validation

```typescript
interface ContentManagement {
  contentType: 'article' | 'video' | 'podcast' | 'document';
  userRole: 'contributor' | 'editor' | 'admin';
  department: string;
  publishDate?: Date;
  approvalRequired: boolean;
}

// Create role-based validation factory
const createRoleBasedValidation = (userRole: string) => {
  const isEditor = userRole === 'editor';
  const isAdmin = userRole === 'admin';
  
  return {
    // Publish date required for editors and admins
    publishDateRequired: SpecificationFactory.requiredIf<ContentManagement>(
      'publishDate',
      SpecificationFactory.isIn<ContentManagement>('userRole', ['editor', 'admin']),
      {
        message: 'Publish date must be set by editors or admins',
        code: 'PUBLISH_DATE_REQUIRED',
        tag: `validation:role:${userRole}`
      }
    ),
    
    // Approval not required for admins
    approvalOptionalForAdmins: SpecificationFactory.disabledIf<ContentManagement>(
      'approvalRequired',
      SpecificationFactory.equals<ContentManagement>('userRole', 'admin'),
      {
        message: 'Admins can publish without approval',
        code: 'APPROVAL_OPTIONAL_ADMIN'
      }
    )
  };
};

const editorValidation = createRoleBasedValidation('editor');
const adminValidation = createRoleBasedValidation('admin');
```

### Time-Based Conditions

```typescript
interface ScheduledTask {
  taskType: 'backup' | 'maintenance' | 'report';
  scheduledTime: Date;
  timezone: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  endDate?: Date;
}

// End date required for recurring tasks
const endDateRequiredForRecurringSpec = SpecificationFactory.requiredIf<ScheduledTask>(
  'endDate',
  SpecificationFactory.not(
    SpecificationFactory.equals<ScheduledTask>('frequency', 'once')
  ),
  {
    message: 'End date is required for recurring tasks',
    code: 'END_DATE_REQUIRED_RECURRING'
  }
);

// Create time-based conditions
const createTimeBasedValidation = () => {
  const now = new Date();
  const businessHoursStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0); // 9 AM
  const businessHoursEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0);   // 5 PM
  
  return SpecificationFactory.disabledIf<ScheduledTask>(
    'maintenanceTask',
    SpecificationFactory.and(
      SpecificationFactory.equals<ScheduledTask>('taskType', 'maintenance'),
      SpecificationFactory.greaterThan<ScheduledTask>('scheduledTime', businessHoursStart),
      SpecificationFactory.lessThan<ScheduledTask>('scheduledTime', businessHoursEnd)
    ),
    {
      message: 'Maintenance tasks cannot be scheduled during business hours (9 AM - 5 PM)',
      code: 'MAINTENANCE_BUSINESS_HOURS_DISABLED'
    }
  );
};
```

## 🧪 Testing Conditional Validators

### Unit Tests

```typescript
describe('Conditional Validators', () => {
  interface TestForm {
    userType: 'regular' | 'premium';
    email: string;
    phone?: string;
    proFeatures?: string[];
  }

  describe('RequiredIfSpecification', () => {
    it('should require field when condition is met', () => {
      const spec = SpecificationFactory.requiredIf<TestForm>(
        'phone',
        SpecificationFactory.equals<TestForm>('userType', 'premium')
      );

      // Premium user without phone - should fail
      expect(spec.isSatisfiedBy({
        userType: 'premium',
        email: 'user@example.com'
      })).toBe(false);

      // Premium user with phone - should pass
      expect(spec.isSatisfiedBy({
        userType: 'premium',
        email: 'user@example.com',
        phone: '+1234567890'
      })).toBe(true);

      // Regular user without phone - should pass (not required)
      expect(spec.isSatisfiedBy({
        userType: 'regular',
        email: 'user@example.com'
      })).toBe(true);
    });

    it('should handle empty string as missing value', () => {
      const spec = SpecificationFactory.requiredIf<TestForm>(
        'phone',
        SpecificationFactory.equals<TestForm>('userType', 'premium')
      );

      expect(spec.isSatisfiedBy({
        userType: 'premium',
        email: 'user@example.com',
        phone: '' // Empty string should be treated as missing
      })).toBe(false);
    });

    it('should export correct DSL', () => {
      const spec = SpecificationFactory.requiredIf<TestForm>(
        'phone',
        SpecificationFactory.equals<TestForm>('userType', 'premium')
      );

      expect(spec.toDSL()).toBe('requiredIf(phone, userType == "premium")');
    });
  });

  describe('VisibleIfSpecification', () => {
    it('should return visibility based on condition', () => {
      const spec = SpecificationFactory.visibleIf<TestForm>(
        'proFeatures',
        SpecificationFactory.equals<TestForm>('userType', 'premium')
      );

      expect(spec.isSatisfiedBy({ userType: 'premium', email: 'test@example.com' })).toBe(true);
      expect(spec.isSatisfiedBy({ userType: 'regular', email: 'test@example.com' })).toBe(false);
      expect(spec.toDSL()).toBe('visibleIf(proFeatures, userType == "premium")');
    });
  });

  describe('DisabledIfSpecification', () => {
    it('should return disabled state based on condition', () => {
      const spec = SpecificationFactory.disabledIf<TestForm>(
        'email',
        SpecificationFactory.equals<TestForm>('userType', 'premium')
      );

      expect(spec.isSatisfiedBy({ userType: 'premium', email: 'test@example.com' })).toBe(true); // Disabled
      expect(spec.isSatisfiedBy({ userType: 'regular', email: 'test@example.com' })).toBe(false); // Not disabled
    });
  });
});
```

### Integration Tests

```typescript
describe('Conditional Validators Integration', () => {
  interface UserProfile {
    accountType: 'personal' | 'business';
    companyName?: string;
    industry?: string;
    employeeCount?: number;
    firstName: string;
    lastName: string;
  }

  it('should work together in complex forms', () => {
    const profileValidation = SpecificationFactory.and(
      // Basic fields always required
      SpecificationFactory.field<UserProfile>('firstName', ComparisonOperator.IS_NOT_EMPTY, null),
      SpecificationFactory.field<UserProfile>('lastName', ComparisonOperator.IS_NOT_EMPTY, null),
      
      // Business-specific required fields
      SpecificationFactory.requiredIf<UserProfile>(
        'companyName',
        SpecificationFactory.equals<UserProfile>('accountType', 'business')
      ),
      SpecificationFactory.requiredIf<UserProfile>(
        'industry',
        SpecificationFactory.equals<UserProfile>('accountType', 'business')
      ),
      SpecificationFactory.requiredIf<UserProfile>(
        'employeeCount',
        SpecificationFactory.equals<UserProfile>('accountType', 'business')
      )
    );

    const validPersonalProfile: UserProfile = {
      accountType: 'personal',
      firstName: 'John',
      lastName: 'Doe'
    };

    const validBusinessProfile: UserProfile = {
      accountType: 'business',
      companyName: 'Tech Corp',
      industry: 'Software',
      employeeCount: 50,
      firstName: 'Jane',
      lastName: 'Smith'
    };

    const invalidBusinessProfile: UserProfile = {
      accountType: 'business',
      firstName: 'Bob',
      lastName: 'Wilson'
      // Missing required business fields
    };

    expect(profileValidation.isSatisfiedBy(validPersonalProfile)).toBe(true);
    expect(profileValidation.isSatisfiedBy(validBusinessProfile)).toBe(true);
    expect(profileValidation.isSatisfiedBy(invalidBusinessProfile)).toBe(false);
  });

  it('should preserve metadata through complex conditions', () => {
    const spec = SpecificationFactory.requiredIf<UserProfile>(
      'companyName',
      SpecificationFactory.equals<UserProfile>('accountType', 'business'),
      {
        message: 'Company name is required for business accounts',
        code: 'COMPANY_NAME_REQUIRED',
        tag: 'validation:business:companyName'
      }
    );

    const metadata = spec.getMetadata();
    expect(metadata?.message).toBe('Company name is required for business accounts');
    expect(metadata?.code).toBe('COMPANY_NAME_REQUIRED');
    expect(metadata?.tag).toBe('validation:business:companyName');
  });
});
```

## 🎯 UI Framework Integration

### Angular Reactive Forms

```typescript
import { FormBuilder, FormGroup, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  template: `
    <form [formGroup]="userForm">
      <select formControlName="accountType">
        <option value="personal">Personal</option>
        <option value="business">Business</option>
      </select>
      
      <input 
        formControlName="companyName"
        [class.required]="isCompanyNameRequired"
        placeholder="Company Name"
      />
      <div *ngIf="userForm.get('companyName')?.errors?.['required']" class="error">
        {{ companyNameRequiredSpec.getMetadata()?.message }}
      </div>
    </form>
  `
})
export class UserFormComponent {
  userForm: FormGroup;
  companyNameRequiredSpec: RequiredIfSpecification<any>;
  
  constructor(private fb: FormBuilder) {
    this.companyNameRequiredSpec = SpecificationFactory.requiredIf(
      'companyName',
      SpecificationFactory.equals('accountType', 'business'),
      {
        message: 'Company name is required for business accounts',
        code: 'COMPANY_NAME_REQUIRED'
      }
    );
    
    this.userForm = this.fb.group({
      accountType: ['personal'],
      companyName: ['']
    });
    
    // Dynamic validation based on account type
    this.userForm.get('accountType')?.valueChanges.subscribe(accountType => {
      const companyNameControl = this.userForm.get('companyName');
      
      if (accountType === 'business') {
        companyNameControl?.setValidators([this.createConditionalValidator()]);
      } else {
        companyNameControl?.clearValidators();
      }
      
      companyNameControl?.updateValueAndValidity();
    });
  }
  
  get isCompanyNameRequired(): boolean {
    return this.companyNameRequiredSpec.isSatisfiedBy({
      accountType: this.userForm.get('accountType')?.value
    });
  }
  
  private createConditionalValidator(): ValidatorFn {
    return (control) => {
      if (!control.value || control.value.trim() === '') {
        return { required: true };
      }
      return null;
    };
  }
}
```

### React Hook Form

```tsx
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';

interface FormData {
  accountType: 'personal' | 'business';
  companyName?: string;
  industry?: string;
}

const UserForm: React.FC = () => {
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  const accountType = useWatch({ control, name: 'accountType' });
  
  const companyNameRequiredSpec = SpecificationFactory.requiredIf<FormData>(
    'companyName',
    SpecificationFactory.equals<FormData>('accountType', 'business'),
    {
      message: 'Company name is required for business accounts',
      code: 'COMPANY_NAME_REQUIRED'
    }
  );
  
  const isCompanyNameRequired = companyNameRequiredSpec.condition.isSatisfiedBy({ accountType } as FormData);
  
  const validateCompanyName = (value: string) => {
    if (!isCompanyNameRequired) return true;
    
    const isValid = companyNameRequiredSpec.isSatisfiedBy({ 
      accountType, 
      companyName: value 
    } as FormData);
    
    if (isValid) return true;
    
    return companyNameRequiredSpec.getMetadata()?.message || 'Required field';
  };
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <select {...register('accountType')}>
        <option value="personal">Personal</option>
        <option value="business">Business</option>
      </select>
      
      {isCompanyNameRequired && (
        <div>
          <input
            {...register('companyName', { validate: validateCompanyName })}
            placeholder="Company Name"
            className={errors.companyName ? 'error' : ''}
          />
          {errors.companyName && (
            <span className="error-message">{errors.companyName.message}</span>
          )}
        </div>
      )}
    </form>
  );
};
```

## 🎨 Best Practices

### 1. **Clear Condition Logic**

```typescript
// ✅ Good: Clear, readable conditions
const phoneRequiredForPremium = SpecificationFactory.requiredIf(
  'phone',
  SpecificationFactory.equals('userType', 'premium'),
  { message: 'Phone required for premium users' }
);

// ❌ Avoid: Complex nested conditions in validator creation
const phoneRequired = SpecificationFactory.requiredIf(
  'phone',
  SpecificationFactory.and(
    SpecificationFactory.or(
      SpecificationFactory.equals('type', 'premium'),
      SpecificationFactory.greaterThan('value', 100)
    ),
    SpecificationFactory.not(SpecificationFactory.equals('guest', true))
  )
);
```

### 2. **Meaningful Error Messages**

```typescript
// ✅ Good: Context-specific messages
const addressRequired = SpecificationFactory.requiredIf(
  'shippingAddress',
  SpecificationFactory.not(SpecificationFactory.equals('shipping', 'pickup')),
  {
    message: 'Shipping address is required for delivery orders',
    code: 'SHIPPING_ADDRESS_REQUIRED'
  }
);

// ❌ Avoid: Generic messages
const addressRequired = SpecificationFactory.requiredIf(
  'address',
  someCondition,
  { message: 'This field is required' }
);
```

### 3. **Consistent Naming Conventions**

```typescript
// ✅ Good: Consistent naming pattern
const phoneRequiredForAdmin = SpecificationFactory.requiredIf(/* ... */);
const emailVisibleToModerators = SpecificationFactory.visibleIf(/* ... */);
const fieldsDisabledWhenLocked = SpecificationFactory.disabledIf(/* ... */);
const contentReadonlyWhenPublished = SpecificationFactory.readonlyIf(/* ... */);
```

### 4. **Reusable Condition Functions**

```typescript
// ✅ Good: Reusable condition builders
const Conditions = {
  isBusinessAccount: <T>() => SpecificationFactory.equals<T>('accountType', 'business'),
  isPremiumUser: <T>() => SpecificationFactory.equals<T>('userType', 'premium'),
  isAdminRole: <T>() => SpecificationFactory.equals<T>('role', 'admin')
};

const companyNameRequired = SpecificationFactory.requiredIf(
  'companyName',
  Conditions.isBusinessAccount<UserForm>()
);

const adminPanelVisible = SpecificationFactory.visibleIf(
  'adminPanel',
  Conditions.isAdminRole<UIConfig>()
);
```

Conditional validators enable sophisticated, context-aware form validation that adapts to user input and application state, providing a dynamic and intuitive user experience.