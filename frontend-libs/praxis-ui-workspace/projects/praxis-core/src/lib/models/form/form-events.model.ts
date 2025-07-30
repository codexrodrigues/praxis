import { FormGroup } from '@angular/forms';
import type { FieldMetadata } from '../component-metadata.interface';
import { FormLayout } from './form-layout.model';

export interface FormValueChangeEvent {
  formData: any;
  changedField?: string;
  previousValue?: any;
  currentValue?: any;
  changedFields: string[];
  isValid: boolean;
  entityId?: string | number;
}

export interface ValidationError {
  field: string;
  type: 'required' | 'pattern' | 'min' | 'max' | 'email' | 'custom';
  message: string;
  currentValue?: any;
  expectedValue?: any;
}

export interface FormSubmitEvent {
  stage: 'before' | 'after' | 'error';
  formData: any;
  isValid: boolean;
  validationErrors?: ValidationError[];
  entityId?: string | number;
  operation: 'create' | 'update';
  result?: any;
  error?: any;
}

export interface FormValidationEvent {
  isValid: boolean;
  errors: { [fieldName: string]: ValidationError[] };
  validatedFields: string[];
  invalidFields: string[];
  formStatus: 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED';
}

export interface FormEntityEvent {
  operation: 'load' | 'create' | 'update' | 'delete';
  entityId?: string | number;
  entityData?: any;
  success: boolean;
  result?: any;
  error?: any;
  timestamp: Date;
}

export interface FormReadyEvent {
  formGroup: FormGroup;
  fieldsMetadata: FieldMetadata[];
  layout?: FormLayout;
  hasEntity: boolean;
  entityId?: string | number;
}
