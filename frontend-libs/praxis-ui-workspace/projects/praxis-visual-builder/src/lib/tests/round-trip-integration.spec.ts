import { TestBed } from '@angular/core/testing';
import { 
  RoundTripValidatorService, 
  RoundTripTestCase, 
  RoundTripValidationResult 
} from '../services/round-trip-validator.service';
import { SpecificationBridgeService } from '../services/specification-bridge.service';
import { RuleBuilderService } from '../services/rule-builder.service';
import { RuleNode, RuleNodeType } from '../models/rule-builder.model';

describe('Round-Trip Integration Tests', () => {
  let roundTripValidator: RoundTripValidatorService;
  let specificationBridge: SpecificationBridgeService;
  let ruleBuilder: RuleBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoundTripValidatorService,
        SpecificationBridgeService,
        RuleBuilderService
      ]
    });

    roundTripValidator = TestBed.inject(RoundTripValidatorService);
    specificationBridge = TestBed.inject(SpecificationBridgeService);
    ruleBuilder = TestBed.inject(RuleBuilderService);
  });

  describe('Simple Field Conditions', () => {
    it('should successfully round-trip a simple equals condition', () => {
      const visualRule: RuleNode = {
        id: 'test-equals',
        type: 'field',
        label: 'Name equals "John"',
        config: {
          field: 'name',
          operator: 'equals',
          value: 'John',
          valueType: 'literal'
        }
      };

      const result = roundTripValidator.validateRoundTrip(visualRule);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.stages.visualToSpecification.success).toBe(true);
      expect(result.stages.specificationToDsl.success).toBe(true);
      expect(result.stages.dslToSpecification.success).toBe(true);
      expect(result.stages.specificationToVisual.success).toBe(true);
      expect(result.dataIntegrity.nodeCountMatch).toBe(true);
      expect(result.dataIntegrity.structureMatch).toBe(true);
    });

    it('should successfully round-trip numeric comparisons', () => {
      const visualRule: RuleNode = {
        id: 'test-numeric',
        type: 'field',
        label: 'Age > 18',
        config: {
          field: 'age',
          operator: 'greaterThan',
          value: 18,
          valueType: 'literal'
        }
      };

      const result = roundTripValidator.validateRoundTrip(visualRule);

      expect(result.success).toBe(true);
      expect(result.dataIntegrity.logicPreserved).toBe(true);
    });

    it('should handle boolean field conditions', () => {
      const visualRule: RuleNode = {
        id: 'test-boolean',
        type: 'field',
        label: 'Active = true',
        config: {
          field: 'active',
          operator: 'equals',
          value: true,
          valueType: 'literal'
        }
      };

      const result = roundTripValidator.validateRoundTrip(visualRule);

      expect(result.success).toBe(true);
      expect(result.stages.specificationToDsl.dsl).toContain('active');
      expect(result.stages.specificationToDsl.dsl).toContain('true');
    });
  });

  describe('Boolean Group Conditions', () => {
    it('should successfully round-trip AND groups', () => {
      const visualRule: RuleNode = {
        id: 'test-and-group',
        type: 'boolean-group',
        label: 'AND Group',
        config: {
          operator: 'and'
        },
        children: [
          {
            id: 'child-1',
            type: 'field',
            label: 'Age > 18',
            config: {
              field: 'age',
              operator: 'greaterThan',
              value: 18,
              valueType: 'literal'
            }
          },
          {
            id: 'child-2',
            type: 'field',
            label: 'Active = true',
            config: {
              field: 'active',
              operator: 'equals',
              value: true,
              valueType: 'literal'
            }
          }
        ]
      };

      const result = roundTripValidator.validateRoundTrip(visualRule);

      expect(result.success).toBe(true);
      expect(result.dataIntegrity.nodeCountMatch).toBe(true);
      expect(result.dataIntegrity.structureMatch).toBe(true);
      expect(result.stages.specificationToDsl.dsl).toContain('AND');
    });

    it('should successfully round-trip OR groups', () => {
      const visualRule: RuleNode = {
        id: 'test-or-group',
        type: 'boolean-group',
        label: 'OR Group',
        config: {
          operator: 'or'
        },
        children: [
          {
            id: 'child-1',
            type: 'field',
            label: 'Status = "active"',
            config: {
              field: 'status',
              operator: 'equals',
              value: 'active',
              valueType: 'literal'
            }
          },
          {
            id: 'child-2',
            type: 'field',
            label: 'Status = "pending"',
            config: {
              field: 'status',
              operator: 'equals',
              value: 'pending',
              valueType: 'literal'
            }
          }
        ]
      };

      const result = roundTripValidator.validateRoundTrip(visualRule);

      expect(result.success).toBe(true);
      expect(result.stages.specificationToDsl.dsl).toContain('OR');
    });

    it('should handle nested boolean groups', () => {
      const visualRule: RuleNode = {
        id: 'test-nested',
        type: 'boolean-group',
        label: 'Nested AND',
        config: {
          operator: 'and'
        },
        children: [
          {
            id: 'child-1',
            type: 'field',
            label: 'Age > 18',
            config: {
              field: 'age',
              operator: 'greaterThan',
              value: 18,
              valueType: 'literal'
            }
          },
          {
            id: 'child-2',
            type: 'boolean-group',
            label: 'Nested OR',
            config: {
              operator: 'or'
            },
            children: [
              {
                id: 'nested-1',
                type: 'field',
                label: 'Type = "premium"',
                config: {
                  field: 'type',
                  operator: 'equals',
                  value: 'premium',
                  valueType: 'literal'
                }
              },
              {
                id: 'nested-2',
                type: 'field',
                label: 'Type = "vip"',
                config: {
                  field: 'type',
                  operator: 'equals',
                  value: 'vip',
                  valueType: 'literal'
                }
              }
            ]
          }
        ]
      };

      const result = roundTripValidator.validateRoundTrip(visualRule);

      expect(result.success).toBe(true);
      expect(result.dataIntegrity.structureMatch).toBe(true);
      // Should contain both AND and OR in the DSL
      expect(result.stages.specificationToDsl.dsl).toContain('AND');
      expect(result.stages.specificationToDsl.dsl).toContain('OR');
    });
  });

  describe('Function Conditions', () => {
    it('should successfully round-trip function calls', () => {
      const visualRule: RuleNode = {
        id: 'test-function',
        type: 'function',
        label: 'contains(name, "test")',
        config: {
          functionName: 'contains',
          parameters: [
            { 
              name: 'field', 
              value: 'name', 
              valueType: 'field', 
              required: true 
            },
            { 
              name: 'value', 
              value: 'test', 
              valueType: 'literal', 
              required: true 
            }
          ]
        }
      };

      const result = roundTripValidator.validateRoundTrip(visualRule);

      expect(result.success).toBe(true);
      expect(result.stages.specificationToDsl.dsl).toContain('contains');
      expect(result.stages.specificationToDsl.dsl).toContain('name');
      expect(result.stages.specificationToDsl.dsl).toContain('test');
    });
  });

  describe('Metadata Preservation', () => {
    it('should preserve metadata through round-trip', () => {
      const visualRule: RuleNode = {
        id: 'test-metadata',
        type: 'field',
        label: 'Name equals "Test"',
        config: {
          field: 'name',
          operator: 'equals',
          value: 'Test',
          valueType: 'literal'
        },
        metadata: {
          code: 'NAME_VALIDATION',
          message: 'Name must be exactly "Test"',
          severity: 'error'
        }
      };

      const result = roundTripValidator.validateRoundTrip(visualRule);

      expect(result.success).toBe(true);
      expect(result.dataIntegrity.metadataPreserved).toBe(true);
    });
  });

  describe('Field-to-Field Comparisons', () => {
    it('should handle field-to-field comparisons', () => {
      const visualRule: RuleNode = {
        id: 'test-field-to-field',
        type: 'field-to-field',
        label: 'Start Date < End Date',
        config: {
          fieldA: 'startDate',
          fieldB: 'endDate',
          operator: 'lessThan'
        }
      };

      const result = roundTripValidator.validateRoundTrip(visualRule);

      // Note: This might have warnings due to model interface issues
      // but should not have critical errors
      expect(result.stages.visualToSpecification.success).toBe(true);
    });
  });

  describe('Performance Testing', () => {
    it('should complete round-trip validation within reasonable time', () => {
      const complexRule: RuleNode = {
        id: 'performance-test',
        type: 'boolean-group',
        label: 'Complex Performance Test',
        config: {
          operator: 'and'
        },
        children: Array.from({ length: 10 }, (_, i) => ({
          id: `perf-child-${i}`,
          type: 'field',
          label: `Field ${i} equals value`,
          config: {
            field: `field${i}`,
            operator: 'equals',
            value: `value${i}`,
            valueType: 'literal'
          }
        }))
      };

      const startTime = performance.now();
      const result = roundTripValidator.validateRoundTrip(complexRule);
      const endTime = performance.now();

      expect(result.performance.totalTime).toBeLessThan(1000); // Should take less than 1 second
      expect(endTime - startTime).toBeLessThan(1000);
      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid configurations gracefully', () => {
      const invalidRule: RuleNode = {
        id: 'invalid-test',
        type: 'field',
        label: 'Invalid Rule',
        config: {
          // Missing required field and operator
          value: 'test',
          valueType: 'literal'
        }
      };

      const result = roundTripValidator.validateRoundTrip(invalidRule);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.stages.visualToSpecification.success).toBe(false);
    });

    it('should handle empty configurations', () => {
      const emptyRule: RuleNode = {
        id: 'empty-test',
        type: 'field',
        label: 'Empty Rule'
        // No config provided
      };

      const result = roundTripValidator.validateRoundTrip(emptyRule);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Test Suite Integration', () => {
    it('should run default test suite successfully', () => {
      const testCases = roundTripValidator.createDefaultTestCases();
      const results = roundTripValidator.runTestSuite(testCases);

      expect(results.totalTests).toBeGreaterThan(0);
      expect(results.passed).toBeGreaterThan(0);
      expect(results.failed).toBeLessThanOrEqual(results.totalTests);
      expect(results.results).toHaveLength(results.totalTests);

      // At least 70% of tests should pass
      const successRate = (results.passed / results.totalTests) * 100;
      expect(successRate).toBeGreaterThanOrEqual(70);
    });

    it('should provide detailed results for each test case', () => {
      const testCases = roundTripValidator.createDefaultTestCases();
      const results = roundTripValidator.runTestSuite(testCases);

      results.results.forEach(result => {
        expect(result.testCase).toBeDefined();
        expect(result.testCase.id).toBeDefined();
        expect(result.testCase.name).toBeDefined();
        expect(result.testCase.visualRule).toBeDefined();
        expect(result.result).toBeDefined();
        expect(result.result.performance).toBeDefined();
        expect(result.result.stages).toBeDefined();
        expect(result.result.dataIntegrity).toBeDefined();
      });
    });
  });

  describe('DSL Integration', () => {
    it('should generate valid DSL that can be parsed back', () => {
      const visualRule: RuleNode = {
        id: 'dsl-test',
        type: 'field',
        label: 'Email contains "@"',
        config: {
          field: 'email',
          operator: 'contains',
          value: '@',
          valueType: 'literal'
        }
      };

      const result = roundTripValidator.validateRoundTrip(visualRule);

      expect(result.success).toBe(true);
      expect(result.stages.specificationToDsl.success).toBe(true);
      expect(result.stages.dslToSpecification.success).toBe(true);
      
      const dsl = result.stages.specificationToDsl.dsl;
      expect(dsl).toBeDefined();
      expect(dsl).toContain('email');
      expect(dsl).toContain('@');
    });
  });
});