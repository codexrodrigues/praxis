/**
 * Metadata that can be attached to any specification for enhanced functionality
 */
export interface SpecificationMetadata {
  /**
   * Human-readable error message for validation failures
   */
  message?: string;

  /**
   * Error code for programmatic handling (e.g., 'INVALID_CPF', 'REQUIRED_FIELD')
   */
  code?: string;

  /**
   * Semantic tag for categorization (e.g., 'form:section1', 'validation:business')
   */
  tag?: string;

  /**
   * UI configuration for visual representation
   */
  uiConfig?: {
    highlight?: boolean;
    color?: string;
    icon?: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
    tooltip?: string;
    [key: string]: any;
  };

  /**
   * Additional custom metadata
   */
  [key: string]: any;
}

/**
 * Options for creating specifications with metadata
 */
export interface SpecificationOptions {
  metadata?: SpecificationMetadata;
}