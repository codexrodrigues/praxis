import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormLayoutRule } from '@praxis/core';
import { DslParser } from '@praxis/specification';

/**
 * The result of applying a set of rules against a form's data.
 */
export interface RuleEvaluationResult {
  /**
   * A map where the key is the field name and the value is a boolean
   * indicating if the field should be visible.
   */
  visibility: { [fieldName: string]: boolean };
  /**
   * A map where the key is the field name and the value is a boolean
   * indicating if the field should be required.
   */
  required: { [fieldName: string]: boolean };
}

@Injectable({
  providedIn: 'root',
})
export class FormRulesService {
  /**
   * Evaluates a set of form rules against the current value of a FormGroup.
   *
   * @param formGroup The Angular FormGroup to evaluate against.
   * @param formRules The array of rules to process.
   * @returns A RuleEvaluationResult object containing the visibility and required states for the fields.
   */
  public applyRules(
    formGroup: FormGroup,
    formRules: FormLayoutRule[]
  ): RuleEvaluationResult {
    const evaluationResult: RuleEvaluationResult = {
      visibility: {},
      required: {},
    };

    if (!formRules || formRules.length === 0) {
      return evaluationResult;
    }

    const formData = formGroup.value;

    for (const rule of formRules) {
      if (!rule.effect?.condition || !rule.targetFields?.length) {
        continue;
      }

      try {
        let isSatisfied: boolean;
        
        if (typeof rule.effect.condition === 'string') {
          // Parse DSL string
          const parser = new DslParser<any>();
          const spec = parser.parse(rule.effect.condition);
          isSatisfied = spec.isSatisfiedBy(formData);
        } else if (rule.effect.condition && typeof rule.effect.condition === 'object') {
          // Already a Specification object
          isSatisfied = rule.effect.condition.isSatisfiedBy(formData);
        } else {
          // Skip if condition is null or invalid
          continue;
        }

        for (const fieldName of rule.targetFields) {
          if (rule.context === 'visibility') {
            evaluationResult.visibility[fieldName] = isSatisfied;
          } else if (rule.context === 'validation') {
            // For now, we'll assume 'validation' context means 'required'
            evaluationResult.required[fieldName] = isSatisfied;
          }
        }
      } catch (error) {
        console.error(
          `[FormRulesService] Error evaluating rule "${rule.name || rule.id}":`,
          error
        );
        // If a rule fails, we don't apply any effect for it.
      }
    }

    return evaluationResult;
  }
}
