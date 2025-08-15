/**
 * Represents a single rule that can be evaluated.
 */
export interface Rule {
  /**
   * The name of the field that this rule targets.
   */
  targetField: string;
  /**
   * The specification object used for evaluation.
   * This should follow the JSON structure defined by the @praxis/specification library.
   */
  spec: any;
}

/**
 * Defines a rule for controlling the visibility of a form field.
 */
export interface VisibilityRule extends Rule {}

/**
 * Defines a rule for controlling the required status of a form field.
 */
export interface RequiredRule extends Rule {}

/**
 * A container for all form-level rules.
 */
export interface FormRules {
  /**
   * An array of rules that determine field visibility.
   * If a rule's specification evaluates to true, the target field will be visible.
   * If it evaluates to false, the field will be hidden.
   */
  visibility?: VisibilityRule[];
  /**
   * An array of rules that determine if a field is required.
   * If a rule's specification evaluates to true, the target field will be required.
   * If it evaluates to false, the field will not be required.
   */
  required?: RequiredRule[];
}
