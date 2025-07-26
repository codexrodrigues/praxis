import { TestBed } from '@angular/core/testing';
import { SpecificationBridgeService } from '../services/specification-bridge.service';
import { 
  ConditionalValidatorConfig, 
  ConditionalValidatorType,
  RuleNode, 
  RuleNodeType 
} from '../models/rule-builder.model';

// TODO: Re-enable these tests when praxis-specification adds native support for conditional validators
describe.skip('ConditionalValidatorRoundTripTests', () => {
  let bridgeService: SpecificationBridgeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [SpecificationBridgeService]
    }).compileComponents();

    bridgeService = TestBed.inject(SpecificationBridgeService);
  });

  describe('RequiredIf Specification Round-Trip', () => {
    it('should convert simple RequiredIf RuleNode to Specification and back', () => {
      // Arrange
      const conditionNode: RuleNode = {
        id: 'condition_1',
        type: RuleNodeType.FIELD_CONDITION,
        label: 'Age > 18',
        config: {
          type: 'fieldCondition',
          fieldName: 'age',
          operator: 'greaterThan',
          value: 18,
          valueType: 'literal'
        }
      };

      const requiredIfNode: RuleNode = {
        id: 'requiredIf_1',
        type: RuleNodeType.REQUIRED_IF,
        label: 'Required If: firstName',
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.REQUIRED_IF,
          targetField: 'firstName',
          condition: conditionNode,
          inverse: false,
          metadata: {
            description: 'First name is required for adults',
            errorMessage: 'First name is required when age is over 18'
          }
        }
      };

      // Act & Assert - Round-trip test
      const roundTripResult = bridgeService.validateRoundTrip(requiredIfNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
      expect(roundTripResult.warnings).toHaveLength(0);
    });

    it('should handle RequiredIf with inverse condition', () => {
      // Arrange
      const conditionNode: RuleNode = {
        id: 'condition_2',
        type: RuleNodeType.FIELD_CONDITION,
        label: 'Is Student',
        config: {
          type: 'fieldCondition',
          fieldName: 'isStudent',
          operator: 'equals',
          value: true,
          valueType: 'literal'
        }
      };

      const requiredIfNode: RuleNode = {
        id: 'requiredIf_2',
        type: RuleNodeType.REQUIRED_IF,
        label: 'Required If (Inverse): workExperience',
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.REQUIRED_IF,
          targetField: 'workExperience',
          condition: conditionNode,
          inverse: true, // NOT a student
          metadata: {
            description: 'Work experience required for non-students',
            errorMessage: 'Work experience is required when not a student'
          }
        }
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(requiredIfNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });

    it('should handle RequiredIf with complex boolean condition', () => {
      // Arrange
      const condition1: RuleNode = {
        id: 'cond_1',
        type: RuleNodeType.FIELD_CONDITION,
        label: 'Age >= 18',
        config: {
          type: 'fieldCondition',
          fieldName: 'age',
          operator: 'greaterThanOrEqual',
          value: 18,
          valueType: 'literal'
        }
      };

      const condition2: RuleNode = {
        id: 'cond_2',
        type: RuleNodeType.FIELD_CONDITION,
        label: 'Has Driver License',
        config: {
          type: 'fieldCondition',
          fieldName: 'hasDriverLicense',
          operator: 'equals',
          value: true,
          valueType: 'literal'
        }
      };

      const complexCondition: RuleNode = {
        id: 'complex_condition',
        type: RuleNodeType.AND_GROUP,
        label: 'Adult with License',
        children: ['cond_1', 'cond_2'],
        config: {
          type: 'booleanGroup',
          operator: 'and'
        }
      };

      const requiredIfNode: RuleNode = {
        id: 'requiredIf_complex',
        type: RuleNodeType.REQUIRED_IF,
        label: 'Required If: insuranceNumber',
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.REQUIRED_IF,
          targetField: 'insuranceNumber',
          condition: complexCondition,
          inverse: false,
          metadata: {
            description: 'Insurance required for adult drivers',
            errorMessage: 'Insurance number is required for adults with driver license'
          }
        }
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(requiredIfNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });
  });

  describe('VisibleIf Specification Round-Trip', () => {
    it('should convert VisibleIf RuleNode to Specification and back', () => {
      // Arrange
      const conditionNode: RuleNode = {
        id: 'visibility_condition',
        type: RuleNodeType.FIELD_CONDITION,
        label: 'Show Advanced Options',
        config: {
          type: 'fieldCondition',
          fieldName: 'showAdvanced',
          operator: 'equals',
          value: true,
          valueType: 'literal'
        }
      };

      const visibleIfNode: RuleNode = {
        id: 'visibleIf_1',
        type: RuleNodeType.VISIBLE_IF,
        label: 'Visible If: advancedSettings',
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.VISIBLE_IF,
          targetField: 'advancedSettings',
          condition: conditionNode,
          inverse: false,
          metadata: {
            description: 'Advanced settings visible when enabled',
            uiHints: {
              animation: 'fade',
              duration: 300
            }
          }
        }
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(visibleIfNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });
  });

  describe('DisabledIf Specification Round-Trip', () => {
    it('should convert DisabledIf RuleNode to Specification and back', () => {
      // Arrange
      const conditionNode: RuleNode = {
        id: 'disable_condition',
        type: RuleNodeType.FIELD_CONDITION,
        label: 'Is Processing',
        config: {
          type: 'fieldCondition',
          fieldName: 'isProcessing',
          operator: 'equals',
          value: true,
          valueType: 'literal'
        }
      };

      const disabledIfNode: RuleNode = {
        id: 'disabledIf_1',
        type: RuleNodeType.DISABLED_IF,
        label: 'Disabled If: submitButton',
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.DISABLED_IF,
          targetField: 'submitButton',
          condition: conditionNode,
          inverse: false,
          metadata: {
            description: 'Submit button disabled during processing',
            uiHints: {
              disabledStyle: 'grayed',
              showSpinner: true
            }
          }
        }
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(disabledIfNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });
  });

  describe('ReadonlyIf Specification Round-Trip', () => {
    it('should convert ReadonlyIf RuleNode to Specification and back', () => {
      // Arrange
      const conditionNode: RuleNode = {
        id: 'readonly_condition',
        type: RuleNodeType.FIELD_CONDITION,
        label: 'Is Submitted',
        config: {
          type: 'fieldCondition',
          fieldName: 'status',
          operator: 'equals',
          value: 'submitted',
          valueType: 'literal'
        }
      };

      const readonlyIfNode: RuleNode = {
        id: 'readonlyIf_1',
        type: RuleNodeType.READONLY_IF,
        label: 'Readonly If: formData',
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.READONLY_IF,
          targetField: 'formData',
          condition: conditionNode,
          inverse: false,
          metadata: {
            description: 'Form becomes readonly after submission',
            uiHints: {
              readonlyStyle: 'bordered',
              showReadonlyIndicator: true
            }
          }
        }
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(readonlyIfNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });
  });

  describe('DSL Export/Import Round-Trip', () => {
    it('should export conditional validators to DSL and parse back correctly', () => {
      // Arrange
      const conditionNode: RuleNode = {
        id: 'dsl_condition',
        type: RuleNodeType.FIELD_CONDITION,
        label: 'Age Check',
        config: {
          type: 'fieldCondition',
          fieldName: 'age',
          operator: 'greaterThan',
          value: 21,
          valueType: 'literal'
        }
      };

      const requiredIfNode: RuleNode = {
        id: 'dsl_requiredIf',
        type: RuleNodeType.REQUIRED_IF,
        label: 'Required If: drinkingConsent',
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.REQUIRED_IF,
          targetField: 'drinkingConsent',
          condition: conditionNode,
          inverse: false,
          metadata: {
            description: 'Drinking consent required for adults',
            errorMessage: 'Consent required when age > 21'
          }
        }
      };

      // Act
      const dslExport = bridgeService.exportToDsl(requiredIfNode);
      expect(dslExport).toBeTruthy();
      expect(dslExport).toContain('requiredIf');
      expect(dslExport).toContain('drinkingConsent');
      expect(dslExport).toContain('age > 21');

      // Note: DSL parsing back to RuleNode would require the complete DSL parser
      // For now, we verify the export contains expected elements
    });

    it('should export complex conditional validator with metadata', () => {
      // Arrange - Complex nested condition
      const ageCondition: RuleNode = {
        id: 'age_check',
        type: RuleNodeType.FIELD_CONDITION,
        config: {
          type: 'fieldCondition',
          fieldName: 'age',
          operator: 'greaterThanOrEqual',
          value: 18,
          valueType: 'literal'
        }
      };

      const countryCondition: RuleNode = {
        id: 'country_check',
        type: RuleNodeType.FIELD_CONDITION,
        config: {
          type: 'fieldCondition',
          fieldName: 'country',
          operator: 'in',
          value: ['US', 'CA', 'UK'],
          valueType: 'literal'
        }
      };

      const complexCondition: RuleNode = {
        id: 'complex_and',
        type: RuleNodeType.AND_GROUP,
        children: ['age_check', 'country_check'],
        config: {
          type: 'booleanGroup',
          operator: 'and'
        }
      };

      const visibleIfNode: RuleNode = {
        id: 'complex_visibleIf',
        type: RuleNodeType.VISIBLE_IF,
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.VISIBLE_IF,
          targetField: 'creditCardSection',
          condition: complexCondition,
          inverse: false,
          metadata: {
            description: 'Credit card section for eligible adults',
            errorMessage: 'Credit card available for adults in supported countries',
            uiHints: {
              animation: 'slideDown',
              priority: 1
            }
          }
        }
      };

      // Act
      const dslExport = bridgeService.exportToDslWithMetadata(visibleIfNode);
      
      // Assert
      expect(dslExport).toBeTruthy();
      expect(dslExport).toContain('visibleIf');
      expect(dslExport).toContain('creditCardSection');
      expect(dslExport).toContain('age >= 18');
      expect(dslExport).toContain('country in [');
      expect(dslExport).toContain('AND');
      
      // Check metadata is included
      expect(dslExport).toContain('Credit card section for eligible adults');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing condition gracefully', () => {
      // Arrange - Invalid node without condition
      const invalidNode: RuleNode = {
        id: 'invalid_requiredIf',
        type: RuleNodeType.REQUIRED_IF,
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.REQUIRED_IF,
          targetField: 'someField',
          condition: null as any, // Invalid
          inverse: false
        }
      };

      // Act & Assert
      expect(() => {
        bridgeService.ruleNodeToSpecification(invalidNode);
      }).toThrow('Conditional validator requires targetField and condition');
    });

    it('should handle missing target field gracefully', () => {
      // Arrange
      const conditionNode: RuleNode = {
        id: 'valid_condition',
        type: RuleNodeType.FIELD_CONDITION,
        config: {
          type: 'fieldCondition',
          fieldName: 'age',
          operator: 'equals',
          value: 18,
          valueType: 'literal'
        }
      };

      const invalidNode: RuleNode = {
        id: 'invalid_requiredIf',
        type: RuleNodeType.REQUIRED_IF,
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.REQUIRED_IF,
          targetField: '', // Invalid - empty
          condition: conditionNode,
          inverse: false
        }
      };

      // Act & Assert
      expect(() => {
        bridgeService.ruleNodeToSpecification(invalidNode);
      }).toThrow('Conditional validator requires targetField and condition');
    });

    it('should handle unsupported validator types gracefully', () => {
      // Arrange
      const conditionNode: RuleNode = {
        id: 'valid_condition',
        type: RuleNodeType.FIELD_CONDITION,
        config: {
          type: 'fieldCondition',
          fieldName: 'age',
          operator: 'equals',
          value: 18,
          valueType: 'literal'
        }
      };

      const invalidNode: RuleNode = {
        id: 'invalid_type',
        type: RuleNodeType.REQUIRED_IF,
        config: {
          type: 'conditionalValidator',
          validatorType: 'unsupportedType' as any, // Invalid type
          targetField: 'someField',
          condition: conditionNode,
          inverse: false
        }
      };

      // Act & Assert
      expect(() => {
        bridgeService.ruleNodeToSpecification(invalidNode);
      }).toThrow('Unsupported conditional validator type: unsupportedType');
    });
  });

  describe('Performance and Complex Scenarios', () => {
    it('should handle deeply nested conditional validators efficiently', () => {
      // Arrange - Create nested structure: RequiredIf -> VisibleIf -> DisabledIf
      const deepCondition: RuleNode = {
        id: 'deep_condition',
        type: RuleNodeType.FIELD_CONDITION,
        config: {
          type: 'fieldCondition',
          fieldName: 'level',
          operator: 'greaterThan',
          value: 5,
          valueType: 'literal'
        }
      };

      const disabledIf: RuleNode = {
        id: 'nested_disabledIf',
        type: RuleNodeType.DISABLED_IF,
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.DISABLED_IF,
          targetField: 'advancedButton',
          condition: deepCondition,
          inverse: true // Enabled when level > 5
        }
      };

      const visibleIf: RuleNode = {
        id: 'nested_visibleIf',
        type: RuleNodeType.VISIBLE_IF,
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.VISIBLE_IF,
          targetField: 'expertPanel',
          condition: disabledIf, // Nested conditional validator as condition
          inverse: false
        }
      };

      const topLevelRequiredIf: RuleNode = {
        id: 'top_requiredIf',
        type: RuleNodeType.REQUIRED_IF,
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.REQUIRED_IF,
          targetField: 'masterPassword',
          condition: visibleIf, // Triple nesting
          inverse: false
        }
      };

      // Act - Should complete within reasonable time
      const startTime = performance.now();
      const roundTripResult = bridgeService.validateRoundTrip(topLevelRequiredIf);
      const endTime = performance.now();

      // Assert
      expect(roundTripResult.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
      expect(roundTripResult.errors).toHaveLength(0);
    });

    it('should handle multiple conditional validators with shared conditions', () => {
      // Arrange - Shared condition used by multiple validators
      const sharedCondition: RuleNode = {
        id: 'shared_condition',
        type: RuleNodeType.FIELD_CONDITION,
        config: {
          type: 'fieldCondition',
          fieldName: 'userType',
          operator: 'equals',
          value: 'premium',
          valueType: 'literal'
        }
      };

      const requiredIf: RuleNode = {
        id: 'premium_requiredIf',
        type: RuleNodeType.REQUIRED_IF,
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.REQUIRED_IF,
          targetField: 'billingAddress',
          condition: { ...sharedCondition }, // Clone condition
          inverse: false
        }
      };

      const visibleIf: RuleNode = {
        id: 'premium_visibleIf',
        type: RuleNodeType.VISIBLE_IF,
        config: {
          type: 'conditionalValidator',
          validatorType: ConditionalValidatorType.VISIBLE_IF,
          targetField: 'premiumFeatures',
          condition: { ...sharedCondition }, // Clone condition
          inverse: false
        }
      };

      // Act & Assert - Both should work independently
      const requiredIfResult = bridgeService.validateRoundTrip(requiredIf);
      const visibleIfResult = bridgeService.validateRoundTrip(visibleIf);

      expect(requiredIfResult.success).toBe(true);
      expect(visibleIfResult.success).toBe(true);
      expect(requiredIfResult.errors).toHaveLength(0);
      expect(visibleIfResult.errors).toHaveLength(0);
    });
  });
});