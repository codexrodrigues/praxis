/**
 * @fileoverview Comprehensive usage examples for Material Metadata interfaces
 * 
 * This file demonstrates practical applications of the metadata interface system
 * with real-world scenarios covering form creation, validation, and data binding.
 * 
 * Examples cover:
 * - Basic field definitions
 * - Advanced validation scenarios  
 * - Material Design integration
 * - Dynamic form generation
 * - Cross-field dependencies
 * - API integration patterns
 */

import {
  FieldMetadata,
  ValidatorOptions
} from '../models/component-metadata.interface';

import {
  MaterialInputMetadata,
  MaterialSelectMetadata,
  MaterialDatepickerMetadata,
  MaterialCheckboxMetadata,
  MaterialButtonMetadata,
  MaterialNumericMetadata,
  MaterialTextareaMetadata,
  MaterialTimepickerMetadata
} from '../models/material-field-metadata.interface';

// =============================================================================
// BASIC FIELD EXAMPLES
// =============================================================================

/**
 * Example: Simple text input with validation
 */
export const basicTextInput: MaterialInputMetadata = {
  name: 'firstName',
  label: 'First Name',
  controlType: 'input',
  inputType: 'text',
  required: true,
  placeholder: 'Enter your first name',
  maxLength: 50,
  validators: {
    required: true,
    minLength: 2,
    maxLength: 50,
    requiredMessage: 'First name is required',
    minLengthMessage: 'First name must be at least 2 characters',
    maxLengthMessage: 'First name cannot exceed 50 characters'
  },
  materialDesign: {
    appearance: 'outline',
    color: 'primary',
    floatLabel: 'auto'
  }
};

/**
 * Example: Email input with comprehensive validation
 */
export const emailInput: MaterialInputMetadata = {
  name: 'email',
  label: 'Email Address',
  controlType: 'input',
  inputType: 'email',
  required: true,
  placeholder: 'user@example.com',
  autocomplete: 'email',
  spellcheck: false,
  validators: {
    required: true,
    email: true,
    maxLength: 100,
    uniqueValidator: async (email: string) => {
      // Simulate API call to check email uniqueness
      const response = await fetch(`/api/users/check-email?email=${email}`);
      return response.ok;
    },
    requiredMessage: 'Email is required',
    emailMessage: 'Please enter a valid email address',
    uniqueMessage: 'This email is already registered'
  },
  materialDesign: {
    appearance: 'outline',
    color: 'primary'
  },
  suffixIcon: 'email'
};

/**
 * Example: Password input with strength validation
 */
export const passwordInput: MaterialInputMetadata = {
  name: 'password',
  label: 'Password',
  controlType: 'input',
  inputType: 'password',
  required: true,
  placeholder: 'Enter a strong password',
  validators: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    customValidator: (value: string) => {
      const score = calculatePasswordStrength(value);
      return score >= 3 ? true : 'Password is too weak';
    },
    requiredMessage: 'Password is required',
    minLengthMessage: 'Password must be at least 8 characters',
    patternMessage: 'Password must contain uppercase, lowercase, number and special character'
  },
  materialDesign: {
    appearance: 'outline',
    color: 'primary'
  },
  hint: 'Use at least 8 characters with mixed case, numbers and symbols'
};

/**
 * Example: Currency input with formatting
 */
export const salaryInput: MaterialNumericMetadata = {
  name: 'salary',
  label: 'Annual Salary',
  controlType: 'numericTextBox',
  inputType: 'number',
  required: true,
  min: 0,
  max: 1000000,
  thousandsSeparator: true,
  currencyCode: 'USD',
  currencyDisplay: 'symbol',
  validators: {
    required: true,
    min: 0,
    max: 1000000,
    requiredMessage: 'Salary is required',
    minMessage: 'Salary must be positive',
    maxMessage: 'Salary cannot exceed $1,000,000'
  },
  materialDesign: {
    appearance: 'outline',
    color: 'primary'
  },
  prefixIcon: 'attach_money'
};

// =============================================================================
// SELECTION FIELD EXAMPLES
// =============================================================================

/**
 * Example: Country selection with search
 */
export const countrySelect: MaterialSelectMetadata = {
  name: 'country',
  label: 'Country',
  controlType: 'select',
  required: true,
  searchable: true,
  searchPlaceholder: 'Search countries...',
  endpoint: '/api/countries',
  valueField: 'code',
  displayField: 'name',
  validators: {
    required: true,
    requiredMessage: 'Please select a country'
  },
  materialDesign: {
    appearance: 'outline',
    color: 'primary'
  }
};

/**
 * Example: Multi-select with chips
 */
export const skillsSelect: MaterialSelectMetadata = {
  name: 'skills',
  label: 'Skills',
  controlType: 'multiSelect',
  multiple: true,
  searchable: true,
  maxSelections: 10,
  multipleDisplay: 'chips',
  chipRemovable: true,
  options: [
    { value: 'angular', text: 'Angular' },
    { value: 'react', text: 'React' },
    { value: 'vue', text: 'Vue.js' },
    { value: 'typescript', text: 'TypeScript' },
    { value: 'nodejs', text: 'Node.js' },
    { value: 'python', text: 'Python' },
    { value: 'java', text: 'Java' },
    { value: 'csharp', text: 'C#' }
  ],
  validators: {
    customValidator: (skills: string[]) => {
      return skills?.length >= 3 ? true : 'Please select at least 3 skills';
    }
  },
  materialDesign: {
    appearance: 'outline',
    color: 'primary'
  }
};

// =============================================================================
// DATE/TIME FIELD EXAMPLES
// =============================================================================

/**
 * Example: Birth date with age validation
 */
export const birthDatePicker: MaterialDatepickerMetadata = {
  name: 'birthDate',
  label: 'Date of Birth',
  controlType: 'date',
  required: true,
  maxDate: new Date(), // Cannot be in the future
  minDate: new Date(1900, 0, 1), // Reasonable minimum
  dateFormat: 'MM/dd/yyyy',
  validators: {
    required: true,
    customValidator: (date: Date) => {
      if (!date) return true;
      const age = calculateAge(date);
      return age >= 18 ? true : 'Must be at least 18 years old';
    },
    requiredMessage: 'Date of birth is required'
  },
  materialDesign: {
    appearance: 'outline',
    color: 'primary'
  },
  prefixIcon: 'cake'
};

/**
 * Example: Date range picker for vacation requests
 */
export const vacationDates: MaterialDatepickerMetadata = {
  name: 'vacationDates',
  label: 'Vacation Period',
  controlType: 'dateRange',
  required: true,
  rangeSelection: true,
  minDate: new Date(), // Cannot select past dates
  startPlaceholder: 'Start date',
  endPlaceholder: 'End date',
  disableWeekends: false,
  validators: {
    required: true,
    customValidator: (dateRange: { start: Date; end: Date }) => {
      if (!dateRange?.start || !dateRange?.end) return true;
      const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 30 ? true : 'Vacation period cannot exceed 30 days';
    },
    requiredMessage: 'Please select vacation dates'
  },
  materialDesign: {
    appearance: 'outline',
    color: 'primary'
  }
};

/**
 * Example: Timepicker for meeting scheduling
 */
export const meetingTimePicker: MaterialTimepickerMetadata = {
  name: 'meetingTime',
  label: 'Meeting Time',
  controlType: 'timePicker',
  interval: 900, // 15 minutes
  min: '08:00',
  max: '18:00',
  format: '24h',
  stepMinute: 15,
  openOnClick: true,
  materialDesign: {
    appearance: 'outline',
    color: 'primary'
  }
};

// =============================================================================
// COMPLEX FORM EXAMPLES
// =============================================================================

/**
 * Example: User registration form with dependencies
 */
export const userRegistrationForm: FieldMetadata[] = [
  {
    name: 'accountType',
    label: 'Account Type',
    controlType: 'radio',
    required: true,
    options: [
      { value: 'personal', text: 'Personal' },
      { value: 'business', text: 'Business' }
    ],
    order: 1,
    materialDesign: {
      color: 'primary'
    }
  },
  {
    name: 'firstName',
    label: 'First Name',
    controlType: 'input',
    required: true,
    order: 2,
    visibleIn: ['form'],
    dependencyFields: ['accountType'],
    materialDesign: {
      appearance: 'outline'
    }
  },
  {
    name: 'lastName',
    label: 'Last Name',
    controlType: 'input',
    required: true,
    order: 3,
    visibleIn: ['form'],
    dependencyFields: ['accountType'],
    materialDesign: {
      appearance: 'outline'
    }
  },
  {
    name: 'companyName',
    label: 'Company Name',
    controlType: 'input',
    order: 4,
    conditionalRequired: (formValue: any) => formValue.accountType === 'business',
    conditionalDisplay: (formValue: any) => formValue.accountType === 'business',
    validators: {
      conditionalValidation: [{
        condition: (formValue: any) => formValue.accountType === 'business',
        validators: {
          required: true,
          minLength: 2,
          requiredMessage: 'Company name is required for business accounts'
        }
      }]
    },
    materialDesign: {
      appearance: 'outline'
    }
  },
  {
    name: 'email',
    label: 'Email Address',
    controlType: 'input',
    inputType: 'email',
    required: true,
    order: 5,
    validators: {
      required: true,
      email: true,
      uniqueValidator: async (email: string) => {
        const response = await fetch(`/api/users/check-email?email=${email}`);
        return response.ok;
      }
    },
    materialDesign: {
      appearance: 'outline'
    }
  },
  {
    name: 'agreeToTerms',
    label: 'I agree to the Terms of Service',
    controlType: 'checkbox',
    required: true,
    order: 6,
    validators: {
      requiredChecked: true,
      customValidator: (checked: boolean) => {
        return checked ? true : 'You must agree to the Terms of Service';
      }
    },
    materialDesign: {
      color: 'primary'
    }
  }
];

/**
 * Example: Product form with advanced features
 */
export const productForm: FieldMetadata[] = [
  {
    name: 'name',
    label: 'Product Name',
    controlType: 'input',
    required: true,
    order: 1,
    maxLength: 100,
    materialDesign: {
      appearance: 'outline'
    }
  },
  {
    name: 'description',
    label: 'Description',
    controlType: 'textarea',
    order: 2,
    rows: 4,
    maxLength: 500,
    showCharacterCount: true,
    materialDesign: {
      appearance: 'outline'
    }
  } as MaterialTextareaMetadata,
  {
    name: 'category',
    label: 'Category',
    controlType: 'select',
    required: true,
    order: 3,
    endpoint: '/api/categories',
    valueField: 'id',
    displayField: 'name',
    materialDesign: {
      appearance: 'outline'
    }
  },
  {
    name: 'price',
    label: 'Price',
    controlType: 'numericTextBox',
    inputType: 'number',
    required: true,
    order: 4,
    min: 0,
    step: 0.01,
    currencyCode: 'USD',
    validators: {
      required: true,
      min: 0,
      customValidator: (price: number) => {
        return price > 0 ? true : 'Price must be greater than zero';
      }
    },
    materialDesign: {
      appearance: 'outline'
    }
  } as MaterialNumericMetadata,
  {
    name: 'tags',
    label: 'Tags',
    controlType: 'chipList',
    order: 5,
    maxChips: 10,
    separatorKeys: [',', ';'],
    autocomplete: {
      enabled: true,
      source: ['electronics', 'clothing', 'books', 'sports', 'home'],
      minSearchLength: 1
    },
    materialDesign: {
      appearance: 'outline'
    }
  },
  {
    name: 'available',
    label: 'Available for Sale',
    controlType: 'toggle',
    order: 6,
    defaultValue: true,
    materialDesign: {
      color: 'primary'
    }
  }
];

// =============================================================================
// HELPER FUNCTIONS FOR EXAMPLES
// =============================================================================

/**
 * Calculate password strength score (0-4)
 */
function calculatePasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  return score;
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// =============================================================================
// FORM CONFIGURATION EXAMPLES
// =============================================================================

/**
 * Example: Form configuration with metadata
 */
export interface FormConfiguration {
  name: string;
  title: string;
  description?: string;
  fields: FieldMetadata[];
  layout?: {
    columns: number;
    spacing: string;
    groupSpacing: string;
  };
  validation?: {
    mode: 'immediate' | 'blur' | 'submit';
    showErrorSummary: boolean;
    scrollToFirstError: boolean;
  };
  submission?: {
    endpoint: string;
    method: 'POST' | 'PUT';
    successMessage: string;
    errorMessage: string;
  };
}

/**
 * Example: Complete form configuration
 */
export const contactFormConfig: FormConfiguration = {
  name: 'contactForm',
  title: 'Contact Us',
  description: 'Send us a message and we\'ll get back to you soon.',
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      controlType: 'input',
      required: true,
      order: 1,
      width: '50%',
      validators: {
        required: true,
        minLength: 2,
        requiredMessage: 'Name is required',
        minLengthMessage: 'Name must be at least 2 characters'
      },
      materialDesign: {
        appearance: 'outline',
        color: 'primary'
      }
    },
    {
      name: 'email',
      label: 'Email',
      controlType: 'input',
      inputType: 'email',
      required: true,
      order: 2,
      width: '50%',
      validators: {
        required: true,
        email: true,
        requiredMessage: 'Email is required',
        emailMessage: 'Please enter a valid email'
      },
      materialDesign: {
        appearance: 'outline',
        color: 'primary'
      }
    },
    {
      name: 'subject',
      label: 'Subject',
      controlType: 'select',
      required: true,
      order: 3,
      width: '100%',
      options: [
        { value: 'general', text: 'General Inquiry' },
        { value: 'support', text: 'Technical Support' },
        { value: 'billing', text: 'Billing Question' },
        { value: 'feedback', text: 'Feedback' }
      ],
      validators: {
        required: true,
        requiredMessage: 'Please select a subject'
      },
      materialDesign: {
        appearance: 'outline',
        color: 'primary'
      }
    },
    {
      name: 'message',
      label: 'Message',
      controlType: 'textarea',
      required: true,
      order: 4,
      width: '100%',
      rows: 5,
      maxLength: 1000,
      showCharacterCount: true,
      validators: {
        required: true,
        minLength: 10,
        maxLength: 1000,
        requiredMessage: 'Message is required',
        minLengthMessage: 'Message must be at least 10 characters'
      },
      materialDesign: {
        appearance: 'outline',
        color: 'primary'
      }
    } as MaterialTextareaMetadata,
    {
      name: 'newsletter',
      label: 'Subscribe to newsletter',
      controlType: 'checkbox',
      order: 5,
      defaultValue: false,
      materialDesign: {
        color: 'primary'
      }
    },
    {
      name: 'submit',
      label: 'Send Message',
      controlType: 'button',
      buttonType: 'submit',
      order: 6,
      variant: 'raised',
      materialDesign: {
        color: 'primary'
      }
    } as MaterialButtonMetadata
  ],
  layout: {
    columns: 2,
    spacing: '16px',
    groupSpacing: '24px'
  },
  validation: {
    mode: 'blur',
    showErrorSummary: true,
    scrollToFirstError: true
  },
  submission: {
    endpoint: '/api/contact',
    method: 'POST',
    successMessage: 'Thank you! Your message has been sent.',
    errorMessage: 'Sorry, there was an error sending your message. Please try again.'
  }
};

// =============================================================================
// MIGRATION UTILITIES
// =============================================================================

/**
 * Migrate from legacy FieldDefinition to new FieldMetadata
 */
export function migrateLegacyFieldDefinition(legacy: any): FieldMetadata {
  return {
    name: legacy.name,
    label: legacy.label || legacy.name,
    controlType: mapLegacyControlType(legacy.controlType || legacy.type),
    required: legacy.required || false,
    disabled: legacy.disabled || false,
    readOnly: legacy.readOnly || false,
    hidden: legacy.hidden || false,
    defaultValue: legacy.defaultValue,
    placeholder: legacy.placeholder,
    hint: legacy.hint || legacy.helpText,
    tooltip: legacy.tooltip,
    order: legacy.order,
    group: legacy.group,
    width: legacy.width,
    options: legacy.options,
    endpoint: legacy.endpoint,
    valueField: legacy.valueField,
    displayField: legacy.displayField,
    validators: migrateLegacyValidators(legacy),
    materialDesign: {
      appearance: 'outline',
      color: 'primary'
    }
  };
}

function mapLegacyControlType(legacyType: string): any {
  const typeMap: Record<string, any> = {
    'text': 'input',
    'number': 'input',
    'dropdown': 'select',
    'multiselect': 'multiSelect',
    'date': 'date',
    'checkbox': 'checkbox',
    'radio': 'radio',
    'textarea': 'textarea'
  };
  
  return typeMap[legacyType] || 'input';
}

function migrateLegacyValidators(legacy: any): ValidatorOptions {
  return {
    required: legacy.required,
    minLength: legacy.minLength,
    maxLength: legacy.maxLength,
    min: legacy.min,
    max: legacy.max,
    pattern: legacy.pattern,
    email: legacy.type === 'email',
    requiredMessage: legacy.requiredMessage,
    minLengthMessage: legacy.minLengthMessage,
    maxLengthMessage: legacy.maxLengthMessage,
    patternMessage: legacy.patternMessage
  };
}