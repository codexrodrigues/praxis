import { FieldMetadata } from '@praxis/core';

export const complexFormMetadata: FieldMetadata[] = [
  // =============================================================================
  // Basic Input Types
  // =============================================================================
  {
    name: 'username',
    label: 'Username',
    controlType: 'input',
    required: true,
    validators: {
      minLength: 5,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
    },
    hint: 'Only letters, numbers, and underscores are allowed.',
  },
  {
    name: 'password',
    label: 'Password',
    controlType: 'password',
    required: true,
    validators: {
      minLength: 8,
    },
    // Inconsistent metadata: using 'inputType' which is not a standard property
    inputType: 'password',
  },
  {
    name: 'email',
    label: 'Email Address',
    controlType: 'email_input', // Using a non-standard but mapped controlType
    required: true,
    validators: {
      email: true,
    },
  },
  {
    name: 'bio',
    label: 'Biography',
    controlType: 'textarea',
    rows: 5,
    validators: {
      maxLength: 500,
    },
  },
  {
    name: 'age',
    label: 'Age',
    controlType: 'numeric_text_box',
    required: true,
    validators: {
      min: 18,
      max: 99,
    },
  },
  {
    name: 'website',
    label: 'Personal Website',
    controlType: 'input',
    inputType: 'url',
    validators: {
      // Missing a pattern for URL validation
    },
  },

  // =============================================================================
  // Selection and Choice
  // =============================================================================
  {
    name: 'country',
    label: 'Country',
    controlType: 'select',
    required: true,
    options: [
      { label: 'USA', value: 'us' },
      { label: 'Canada', value: 'ca' },
      { label: 'Mexico', value: 'mx' },
    ],
  },
  {
    name: 'interests',
    label: 'Interests',
    controlType: 'multi_select',
    options: [
      { label: 'Programming', value: 'prog' },
      { label: 'Design', value: 'design' },
      { label: 'Music', value: 'music' },
      { label: 'Sports', value: 'sports' },
    ],
  },
  {
    name: 'gender',
    label: 'Gender',
    controlType: 'radio',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    name: 'subscribe',
    label: 'Subscribe to newsletter',
    controlType: 'checkbox',
  },
  {
    name: 'theme',
    label: 'UI Theme',
    controlType: 'toggle',
  },
  {
    name: 'rating',
    label: 'Satisfaction Rating',
    controlType: 'slider',
    min: 1,
    max: 10,
    step: 1,
  },

  // =============================================================================
  // Date and Time
  // =============================================================================
  {
    name: 'birthdate',
    label: 'Date of Birth',
    controlType: 'date_picker',
    required: true,
  },
  {
    name: 'appointment',
    label: 'Appointment Time',
    controlType: 'date_time_picker',
  },
  {
    name: 'vacation',
    label: 'Vacation Period',
    controlType: 'date_range',
  },

  // =============================================================================
  // Specialized Inputs
  // =============================================================================
  {
    name: 'price',
    label: 'Price',
    controlType: 'currency_input',
    currency: 'BRL',
    // Missing validators for currency
  },
  {
    name: 'avatar',
    label: 'Upload Avatar',
    controlType: 'file_upload',
  },
  {
    name: 'submit',
    label: 'Submit Form',
    controlType: 'button',
    buttonType: 'submit',
  },

  // =============================================================================
  // Edge Cases and Potential Issues
  // =============================================================================
  {
    name: 'unregistered',
    label: 'Unregistered Component',
    controlType: 'unregistered_type', // This should fail gracefully
  },
  {
    name: 'no_label',
    controlType: 'input',
    // Missing 'label' property, should still render
  },
  {
    name: 'duplicate_name',
    label: 'Duplicate Field 1',
    controlType: 'input',
  },
  {
    name: 'duplicate_name',
    label: 'Duplicate Field 2',
    controlType: 'input',
    // The directive should throw an error for duplicate names
  },
  {
    name: 'with_default',
    label: 'With Default Value',
    controlType: 'input',
    defaultValue: 'This is a default value',
  },
  {
    // Missing 'name' property, should throw an error
    label: 'Missing Name',
    controlType: 'input',
  },
  {
    name: 'custom_transform',
    label: 'Custom Transform',
    controlType: 'input',
    transformSaveValue: (value: string) => value.toUpperCase(),
    transformDisplayValue: (value: string) => value.toLowerCase(),
  },
  {
    name: 'field_with_endpoint',
    label: 'Data from Endpoint',
    controlType: 'select',
    endpoint: '/api/options', // The component should handle this
  },
  {
    name: 'field_with_security',
    label: 'Secure Field',
    controlType: 'input',
    security: {
      level: 'high',
    },
  },
];
