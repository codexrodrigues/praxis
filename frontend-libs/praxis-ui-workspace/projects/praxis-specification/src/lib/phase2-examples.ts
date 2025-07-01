/**
 * Phase 2 Examples - Advanced Validations, Collections, Metadata, and DSL Linting
 * Demonstrates all new features implemented in Phase 2
 */

import { SpecificationFactory } from './utils/specification-factory';
import { DslValidator, ValidationIssueType } from './dsl/dsl-validator';
import { DslExporter } from './dsl/exporter';
import { FunctionRegistry } from './registry/function-registry';
import { FormSpecification } from './specification/form-specification';
import { SpecificationMetadata } from './specification/specification-metadata';

// Example domain objects
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  role: string;
  addresses: Address[];
  phone?: string;
}

interface Address {
  id: number;
  street: string;
  city: string;
  zipCode: string;
  isPrimary: boolean;
}

interface FormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    age: number;
    email: string;
  };
  addresses: Address[];
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
  };
}

export class Phase2Examples {
  
  static runAllExamples(): void {
    console.log('=== Praxis Specification Phase 2 Examples ===\n');
    
    this.demonstrateConditionalValidators();
    this.demonstrateCollectionSpecifications();
    this.demonstrateOptionalFieldHandling();
    this.demonstrateMetadataSupport();
    this.demonstrateDSLValidation();
    this.demonstrateFormSpecifications();
    this.demonstrateAdvancedDSLExport();
  }

  private static demonstrateConditionalValidators(): void {
    console.log('1. Conditional Validators');
    console.log('=========================');

    const user: User = {
      id: 1,
      name: 'Alice Smith',
      email: 'alice@example.com',
      age: 25,
      isActive: true,
      role: 'admin',
      addresses: [],
      phone: '+1234567890'
    };

    // Required if condition
    const phoneRequiredForAdmins = SpecificationFactory.requiredIf<User>(
      'phone',
      SpecificationFactory.equals<User>('role', 'admin'),
      {
        message: 'Phone number is required for admin users',
        code: 'ADMIN_PHONE_REQUIRED'
      }
    );

    console.log(`Phone required for admins: ${phoneRequiredForAdmins.toDSL()}`);
    console.log(`Result: ${phoneRequiredForAdmins.isSatisfiedBy(user)}`);

    // Visible if condition
    const adminFieldsVisible = SpecificationFactory.visibleIf<User>(
      'role',
      SpecificationFactory.equals<User>('role', 'admin')
    );

    console.log(`Admin fields visible: ${adminFieldsVisible.toDSL()}`);
    console.log(`Should show admin fields: ${adminFieldsVisible.isSatisfiedBy(user)}`);

    console.log('');
  }

  private static demonstrateCollectionSpecifications(): void {
    console.log('2. Collection Specifications');
    console.log('============================');

    const user: User = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      age: 25,
      isActive: true,
      role: 'user',
      addresses: [
        { id: 1, street: '123 Main St', city: 'Boston', zipCode: '02101', isPrimary: true },
        { id: 2, street: '456 Oak Ave', city: 'Boston', zipCode: '02102', isPrimary: false },
        { id: 3, street: '789 Pine Rd', city: 'Boston', zipCode: '02101', isPrimary: false }
      ]
    };

    // forEach - all addresses must have valid zip codes
    const allAddressesValidZip = SpecificationFactory.forEach<User, Address>(
      'addresses',
      SpecificationFactory.greaterThan<Address>('zipCode', '00000' as any),
      {
        message: 'All addresses must have valid zip codes',
        code: 'INVALID_ADDRESSES'
      }
    );

    console.log(`All addresses valid: ${allAddressesValidZip.toDSL()}`);
    console.log(`Result: ${allAddressesValidZip.isSatisfiedBy(user)}`);

    // uniqueBy - addresses must have unique zip codes
    const uniqueZipCodes = SpecificationFactory.uniqueBy<User>(
      'addresses',
      'zipCode',
      {
        message: 'Address zip codes must be unique',
        code: 'DUPLICATE_ZIPCODES'
      }
    );

    console.log(`Unique zip codes: ${uniqueZipCodes.toDSL()}`);
    console.log(`Result: ${uniqueZipCodes.isSatisfiedBy(user)}`);
    
    if (!uniqueZipCodes.isSatisfiedBy(user)) {
      const duplicates = uniqueZipCodes.getDuplicates(user);
      console.log('Duplicate zip codes found:', duplicates);
    }

    // minLength - must have at least 1 address
    const minAddresses = SpecificationFactory.minLength<User>('addresses', 1);
    console.log(`Min addresses: ${minAddresses.toDSL()}`);
    console.log(`Result: ${minAddresses.isSatisfiedBy(user)}`);

    console.log('');
  }

  private static demonstrateOptionalFieldHandling(): void {
    console.log('3. Optional Field Handling');
    console.log('==========================');

    const userWithPhone: User = {
      id: 1,
      name: 'Bob',
      email: 'bob@example.com',
      age: 30,
      isActive: true,
      role: 'user',
      addresses: [],
      phone: '+1234567890'
    };

    const userWithoutPhone: User = {
      id: 2,
      name: 'Carol',
      email: 'carol@example.com',
      age: 28,
      isActive: true,
      role: 'user',
      addresses: []
    };

    // ifDefined - only validate phone format if phone is provided
    const phoneFormatValidation = SpecificationFactory.ifDefined<User>(
      'phone',
      SpecificationFactory.startsWith<User>('phone', '+'),
      {
        message: 'Phone number must start with country code (+)',
        code: 'INVALID_PHONE_FORMAT'
      }
    );

    console.log(`Phone format validation: ${phoneFormatValidation.toDSL()}`);
    console.log(`User with phone: ${phoneFormatValidation.isSatisfiedBy(userWithPhone)}`);
    console.log(`User without phone: ${phoneFormatValidation.isSatisfiedBy(userWithoutPhone)}`);

    // withDefault - provide default value and then validate
    const ageWithDefault = SpecificationFactory.withDefault<User>(
      'age',
      18,
      SpecificationFactory.greaterThanOrEqual<User>('age', 18)
    );

    console.log(`Age with default: ${ageWithDefault.toDSL()}`);

    console.log('');
  }

  private static demonstrateMetadataSupport(): void {
    console.log('4. Metadata Support');
    console.log('===================');

    const metadata: SpecificationMetadata = {
      message: 'User must be at least 18 years old',
      code: 'MINIMUM_AGE',
      tag: 'validation:age',
      uiConfig: {
        highlight: true,
        color: 'red',
        severity: 'error',
        icon: 'warning'
      }
    };

    const ageSpec = SpecificationFactory.fieldWithMetadata<User>(
      'age',
      SpecificationFactory.greaterThanOrEqual('age', 18).getOperator(),
      18,
      metadata
    );

    console.log('Specification metadata:');
    console.log('- Message:', ageSpec.getMetadata()?.message);
    console.log('- Code:', ageSpec.getMetadata()?.code);
    console.log('- Tag:', ageSpec.getMetadata()?.tag);
    console.log('- UI Config:', JSON.stringify(ageSpec.getMetadata()?.uiConfig));

    // Export with metadata comments
    const exporter = new DslExporter({
      includeMetadata: true,
      metadataPosition: 'before',
      prettyPrint: true
    });

    console.log('\nDSL with metadata comments:');
    console.log(exporter.exportWithMetadata(ageSpec));

    console.log('');
  }

  private static demonstrateDSLValidation(): void {
    console.log('5. DSL Validation and Linting');
    console.log('==============================');

    const validator = new DslValidator({
      knownFields: ['name', 'age', 'email', 'isActive', 'role'],
      knownFunctions: ['isValidEmail', 'isAdult'],
      maxComplexity: 10,
      enablePerformanceWarnings: true
    });

    const testCases = [
      'age > 18',                          // Valid
      'age >> 18',                         // Invalid operator
      'unknownField == "test"',            // Unknown field
      'age > 18 &&',                       // Incomplete expression
      'startsWith(name, "A") && age > 18', // Valid function
      'invalidFunction(name)',             // Unknown function
      'age > 18 && (name == "test"',       // Unbalanced parentheses
      '${age} > 18',                       // Valid field reference
      '"unterminated string',              // Unterminated string
      ''                                   // Empty expression
    ];

    testCases.forEach((dsl, index) => {
      console.log(`\nTest ${index + 1}: "${dsl}"`);
      const issues = validator.validate(dsl);
      
      if (issues.length === 0) {
        console.log('✅ Valid DSL');
      } else {
        issues.forEach(issue => {
          const severity = issue.severity.toUpperCase();
          console.log(`${severity}: ${issue.message}`);
          if (issue.suggestion) {
            console.log(`   Suggestion: ${issue.suggestion}`);
          }
        });
      }
    });

    console.log('');
  }

  private static demonstrateFormSpecifications(): void {
    console.log('6. Form Specifications');
    console.log('======================');

    const formData: FormData = {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        email: 'john@example.com'
      },
      addresses: [
        { id: 1, street: '123 Main St', city: 'Boston', zipCode: '02101', isPrimary: true }
      ],
      preferences: {
        newsletter: true,
        smsNotifications: false
      }
    };

    // Create form specification
    const formSpec = SpecificationFactory.form<FormData>({
      message: 'User registration form validation',
      tag: 'form:registration'
    });

    // Add field rules
    formSpec
      .setRequired('personalInfo', true)
      .setVisible('preferences', 
        SpecificationFactory.greaterThan<FormData>('personalInfo' as any, 0 as any) // Simplified
      )
      .addGlobalValidation(
        SpecificationFactory.minLength<FormData>('addresses', 1, {
          message: 'At least one address is required',
          code: 'MIN_ADDRESSES'
        })
      );

    // Validate form
    const validationResult = formSpec.validateForm(formData);
    
    console.log('Form validation result:');
    console.log('- Is valid:', validationResult.isValid);
    console.log('- Global errors:', validationResult.globalErrors);
    console.log('- Field validations:', Object.keys(validationResult.fields).length);

    console.log('');
  }

  private static demonstrateAdvancedDSLExport(): void {
    console.log('7. Advanced DSL Export');
    console.log('======================');

    // Create complex specification with metadata
    const complexSpec = SpecificationFactory.and(
      SpecificationFactory.equalsWithMetadata<User>('isActive', true, {
        message: 'User must be active',
        code: 'USER_INACTIVE'
      }),
      SpecificationFactory.or(
        SpecificationFactory.greaterThanWithMetadata<User>('age', 18, {
          message: 'User must be an adult',
          code: 'UNDERAGE'
        }),
        SpecificationFactory.equals<User>('role', 'admin')
      ),
      SpecificationFactory.forEach<User, Address>(
        'addresses',
        SpecificationFactory.equals<Address>('city', 'Boston'),
        {
          message: 'All addresses must be in Boston',
          code: 'INVALID_CITY',
          tag: 'location:restriction'
        }
      )
    );

    // Export with different metadata positions
    const exportOptions = [
      { position: 'before', description: 'Metadata before expressions' },
      { position: 'after', description: 'Metadata after expressions' },
      { position: 'inline', description: 'Inline metadata comments' }
    ] as const;

    exportOptions.forEach(({ position, description }) => {
      console.log(`${description}:`);
      console.log('---');
      
      const exporter = new DslExporter({
        includeMetadata: true,
        metadataPosition: position,
        prettyPrint: true,
        indentSize: 2
      });

      console.log(exporter.exportWithMetadata(complexSpec));
      console.log('');
    });
  }
}

// Example usage and integration points
export const PHASE_2_DSL_EXAMPLES = {
  // Conditional validation DSL
  conditionalValidation: [
    'requiredIf(phone, role == "admin")',
    'visibleIf(adminPanel, role == "admin")',
    'disabledIf(submitButton, !isFormValid)',
    'readonlyIf(userId, isExistingUser)'
  ],

  // Collection validation DSL  
  collectionValidation: [
    'forEach(addresses, city != null)',
    'uniqueBy(emails, "email")',
    'minLength(addresses, 1)',
    'maxLength(tags, 10)'
  ],

  // Optional field handling DSL
  optionalFields: [
    'ifDefined(phone, startsWith(phone, "+"))',
    'ifNotNull(profilePicture, contains(profilePicture, ".jpg"))',
    'ifExists(preferences, preferences.newsletter == true)',
    'withDefault(age, 18, age >= 18)'
  ],

  // Complex form validation DSL
  complexForm: `
    // code: FORM_VALIDATION
    // message: Complete user registration form validation
    requiredIf(phone, role == "admin") &&
    forEach(addresses, city != null) &&
    uniqueBy(addresses, "zipCode") &&
    ifDefined(email, contains(email, "@")) &&
    minLength(addresses, 1)
  `.trim()
};

// Run examples if in appropriate environment
if (typeof window !== 'undefined') {
  (window as any).Phase2Examples = Phase2Examples;
  (window as any).PHASE_2_DSL_EXAMPLES = PHASE_2_DSL_EXAMPLES;
}