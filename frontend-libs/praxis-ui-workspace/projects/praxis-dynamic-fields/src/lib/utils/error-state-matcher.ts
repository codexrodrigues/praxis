/**
 * @fileoverview Custom Error State Matcher for Praxis Dynamic Fields
 * 
 * Implements configurable error state matching strategies for Material Design
 * components based on field metadata configuration.
 * 
 * This resolves CRITICAL ISSUE #8: ErrorStateMatcher not implemented
 */

import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';

// =============================================================================
// ERROR STATE MATCHING STRATEGIES
// =============================================================================

export type ErrorStateStrategy = 
  | 'default' 
  | 'showOnDirtyAndInvalid' 
  | 'showOnSubmitted' 
  | 'showImmediately';

// =============================================================================
// CUSTOM ERROR STATE MATCHER IMPLEMENTATION
// =============================================================================

/**
 * Custom Error State Matcher that implements configurable strategies
 * for when to show validation errors in Material components.
 */
export class PraxisErrorStateMatcher implements ErrorStateMatcher {
  
  constructor(private strategy: ErrorStateStrategy = 'default') {}

  /**
   * Determines if a control should be considered to be in an error state.
   * 
   * @param control - The form control to check
   * @param form - The parent form (if any)
   * @returns true if the control should show errors
   */
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (!control) {
      return false;
    }

    const isInvalid = control.invalid;
    const hasErrors = control.errors !== null;

    // Early return if valid or no errors
    if (!isInvalid || !hasErrors) {
      return false;
    }

    switch (this.strategy) {
      case 'showImmediately':
        // Show errors as soon as the control becomes invalid
        return true;

      case 'showOnDirtyAndInvalid':
        // Show errors only when the field has been modified and is invalid
        return control.dirty && isInvalid;

      case 'showOnSubmitted':
        // Show errors only after form submission attempt
        return !!(form && form.submitted && isInvalid);

      case 'default':
      default:
        // Material Design default: show when invalid and (dirty or touched)
        return isInvalid && (control.dirty || control.touched);
    }
  }
}

// =============================================================================
// ERROR STATE MATCHER FACTORY
// =============================================================================

/**
 * Factory function to create ErrorStateMatcher instances based on strategy
 */
export function createErrorStateMatcher(strategy?: ErrorStateStrategy): ErrorStateMatcher {
  return new PraxisErrorStateMatcher(strategy || 'default');
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Determines the appropriate error state strategy based on component context
 */
export function inferErrorStateStrategy(
  fieldType: string,
  isLongForm: boolean = false,
  userPreference?: ErrorStateStrategy
): ErrorStateStrategy {
  
  // Use explicit user preference if provided
  if (userPreference) {
    return userPreference;
  }

  // Context-based inference
  switch (fieldType) {
    case 'password':
      // Passwords should show errors only after user stops typing
      return 'showOnDirtyAndInvalid';
      
    case 'email':
    case 'tel':
    case 'url':
      // Formatted inputs should show errors after user interaction
      return 'showOnDirtyAndInvalid';
      
    case 'textarea':
      // Long text fields should be less aggressive
      return isLongForm ? 'showOnSubmitted' : 'showOnDirtyAndInvalid';
      
    case 'number':
    case 'date':
      // Structured inputs can show errors immediately for better UX
      return 'default';
      
    default:
      // Conservative default for unknown field types
      return 'default';
  }
}

// =============================================================================
// INTEGRATION HELPER
// =============================================================================

/**
 * Helper function to get ErrorStateMatcher for a dynamic field component
 */
export function getErrorStateMatcherForField(
  metadata: any
): ErrorStateMatcher {
  const strategy = metadata?.errorStateMatcher || 'default';
  return createErrorStateMatcher(strategy);
}