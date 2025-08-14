import { Injectable } from '@angular/core';
import { SpecificationBridgeService } from './specification-bridge.service';
import { RuleBuilderService } from './rule-builder.service';
import { DslParser, SpecificationFactory } from '@praxis/specification';
import { RuleNode, ValidationError } from '../models/rule-builder.model';

export interface RoundTripValidationResult {
  success: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  stages: {
    visualToSpecification: { success: boolean; error?: string };
    specificationToDsl: { success: boolean; error?: string; dsl?: string };
    dslToSpecification: { success: boolean; error?: string };
    specificationToVisual: { success: boolean; error?: string };
  };
  dataIntegrity: {
    nodeCountMatch: boolean;
    structureMatch: boolean;
    metadataPreserved: boolean;
    logicPreserved: boolean;
  };
  performance: {
    totalTime: number;
    stageTimings: Record<string, number>;
  };
}

export interface RoundTripTestCase {
  id: string;
  name: string;
  description: string;
  visualRule: RuleNode;
  expectedDsl?: string;
  expectedValidation?: {
    shouldSucceed: boolean;
    expectedErrors?: string[];
    expectedWarnings?: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class RoundTripValidatorService {
  private dslParser = new DslParser();

  constructor(
    private specificationBridge: SpecificationBridgeService,
    private ruleBuilderService: RuleBuilderService
  ) {}

  /**
   * Validates complete round-trip conversion: Visual → DSL → Visual
   */
  validateRoundTrip(visualRule: RuleNode): RoundTripValidationResult {
    const startTime = performance.now();
    const result: RoundTripValidationResult = {
      success: false,
      errors: [],
      warnings: [],
      stages: {
        visualToSpecification: { success: false },
        specificationToDsl: { success: false },
        dslToSpecification: { success: false },
        specificationToVisual: { success: false }
      },
      dataIntegrity: {
        nodeCountMatch: false,
        structureMatch: false,
        metadataPreserved: false,
        logicPreserved: false
      },
      performance: {
        totalTime: 0,
        stageTimings: {}
      }
    };

    try {
      // Stage 1: Visual → Specification
      const stage1Start = performance.now();
      let specification;
      try {
        specification = this.specificationBridge.ruleNodeToSpecification(visualRule);
        result.stages.visualToSpecification.success = true;
      } catch (error) {
        result.stages.visualToSpecification.error = `Failed to convert visual to specification: ${error}`;
        result.errors.push({
          id: this.generateErrorId(),
          message: result.stages.visualToSpecification.error,
          severity: 'error',
          code: 'VISUAL_TO_SPEC_ERROR'
        });
      }
      result.performance.stageTimings['visualToSpecification'] = performance.now() - stage1Start;

      if (!specification) {
        result.performance.totalTime = performance.now() - startTime;
        return result;
      }

      // Stage 2: Specification → DSL
      const stage2Start = performance.now();
      let dsl: string;
      try {
        dsl = this.specificationBridge.exportToDsl(visualRule);
        result.stages.specificationToDsl.success = true;
        result.stages.specificationToDsl.dsl = dsl;
      } catch (error) {
        result.stages.specificationToDsl.error = `Failed to convert specification to DSL: ${error}`;
        result.errors.push({
          id: this.generateErrorId(),
          message: result.stages.specificationToDsl.error,
          severity: 'error',
          code: 'SPEC_TO_DSL_ERROR'
        });
        result.performance.totalTime = performance.now() - startTime;
        return result;
      }
      result.performance.stageTimings['specificationToDsl'] = performance.now() - stage2Start;

      // Stage 3: DSL → Specification
      const stage3Start = performance.now();
      let parsedSpecification;
      try {
        parsedSpecification = this.dslParser.parse(dsl);
        result.stages.dslToSpecification.success = true;
      } catch (error) {
        result.stages.dslToSpecification.error = `Failed to parse DSL back to specification: ${error}`;
        result.errors.push({
          id: this.generateErrorId(),
          message: result.stages.dslToSpecification.error,
          severity: 'error',
          code: 'DSL_TO_SPEC_ERROR'
        });
        result.performance.totalTime = performance.now() - startTime;
        return result;
      }
      result.performance.stageTimings['dslToSpecification'] = performance.now() - stage3Start;

      // Stage 4: Specification → Visual
      const stage4Start = performance.now();
      let reconstructedVisual: RuleNode;
      try {
        reconstructedVisual = this.specificationBridge.specificationToRuleNode(parsedSpecification);
        result.stages.specificationToVisual.success = true;
      } catch (error) {
        result.stages.specificationToVisual.error = `Failed to convert specification back to visual: ${error}`;
        result.errors.push({
          id: this.generateErrorId(),
          message: result.stages.specificationToVisual.error,
          severity: 'error',
          code: 'SPEC_TO_VISUAL_ERROR'
        });
        result.performance.totalTime = performance.now() - startTime;
        return result;
      }
      result.performance.stageTimings['specificationToVisual'] = performance.now() - stage4Start;

      // Data Integrity Validation
      const integrityStart = performance.now();
      result.dataIntegrity = this.validateDataIntegrity(visualRule, reconstructedVisual, result);
      result.performance.stageTimings['dataIntegrityValidation'] = performance.now() - integrityStart;

      // Overall success determination
      result.success = Object.values(result.stages).every(stage => stage.success) && 
                      result.errors.length === 0;

      result.performance.totalTime = performance.now() - startTime;
      return result;

    } catch (error) {
      result.errors.push({
        id: this.generateErrorId(),
        message: `Unexpected error during round-trip validation: ${error}`,
        severity: 'error',
        code: 'ROUND_TRIP_UNEXPECTED_ERROR'
      });
      result.performance.totalTime = performance.now() - startTime;
      return result;
    }
  }

  /**
   * Validates data integrity between original and reconstructed visual rules
   */
  private validateDataIntegrity(
    original: RuleNode, 
    reconstructed: RuleNode, 
    result: RoundTripValidationResult
  ): RoundTripValidationResult['dataIntegrity'] {
    const integrity = {
      nodeCountMatch: false,
      structureMatch: false,
      metadataPreserved: false,
      logicPreserved: false
    };

    // Count nodes
    const originalNodeCount = this.countNodes(original);
    const reconstructedNodeCount = this.countNodes(reconstructed);
    integrity.nodeCountMatch = originalNodeCount === reconstructedNodeCount;

    if (!integrity.nodeCountMatch) {
      result.warnings.push({
        id: this.generateErrorId(),
        message: `Node count mismatch: original=${originalNodeCount}, reconstructed=${reconstructedNodeCount}`,
        severity: 'warning',
        code: 'NODE_COUNT_MISMATCH'
      });
    }

    // Validate structure
    integrity.structureMatch = this.validateStructureMatch(original, reconstructed, result);

    // Validate metadata preservation
    integrity.metadataPreserved = this.validateMetadataPreservation(original, reconstructed, result);

    // Validate logic preservation
    integrity.logicPreserved = this.validateLogicPreservation(original, reconstructed, result);

    return integrity;
  }

  /**
   * Validates that the logical structure is preserved
   */
  private validateStructureMatch(
    original: RuleNode, 
    reconstructed: RuleNode, 
    result: RoundTripValidationResult
  ): boolean {
    // Basic type and structure validation
    if (original.type !== reconstructed.type) {
      result.warnings.push({
        id: this.generateErrorId(),
        message: `Node type mismatch: original=${original.type}, reconstructed=${reconstructed.type}`,
        severity: 'warning',
        code: 'NODE_TYPE_MISMATCH'
      });
      return false;
    }

    // Validate children structure
    const originalChildCount = original.children?.length || 0;
    const reconstructedChildCount = reconstructed.children?.length || 0;

    if (originalChildCount !== reconstructedChildCount) {
      result.warnings.push({
        id: this.generateErrorId(),
        message: `Child count mismatch: original=${originalChildCount}, reconstructed=${reconstructedChildCount}`,
        severity: 'warning',
        code: 'CHILD_COUNT_MISMATCH'
      });
      return false;
    }

    // Recursively validate children
    if (original.children && reconstructed.children) {
      for (let i = 0; i < original.children.length; i++) {
        const originalChild = Array.isArray(original.children[i]) ? original.children[i] : original.children[i];
        const reconstructedChild = Array.isArray(reconstructed.children[i]) ? reconstructed.children[i] : reconstructed.children[i];
        
        if (typeof originalChild === 'object' && typeof reconstructedChild === 'object') {
          if (!this.validateStructureMatch(originalChild as RuleNode, reconstructedChild as RuleNode, result)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Validates that metadata is preserved through the round-trip
   */
  private validateMetadataPreservation(
    original: RuleNode, 
    reconstructed: RuleNode, 
    result: RoundTripValidationResult
  ): boolean {
    const originalMeta = original.metadata;
    const reconstructedMeta = reconstructed.metadata;

    // Both null/undefined
    if (!originalMeta && !reconstructedMeta) {
      return true;
    }

    // One null, one not
    if (!originalMeta || !reconstructedMeta) {
      result.warnings.push({
        id: this.generateErrorId(),
        message: `Metadata presence mismatch: original=${!!originalMeta}, reconstructed=${!!reconstructedMeta}`,
        severity: 'warning',
        code: 'METADATA_PRESENCE_MISMATCH'
      });
      return false;
    }

    // Compare metadata fields
    const metadataMatches = originalMeta.code === reconstructedMeta.code &&
                           originalMeta.message === reconstructedMeta.message &&
                           originalMeta['severity'] === reconstructedMeta['severity'];

    if (!metadataMatches) {
      result.warnings.push({
        id: this.generateErrorId(),
        message: 'Metadata values changed during round-trip',
        severity: 'warning',
        code: 'METADATA_VALUES_CHANGED'
      });
      return false;
    }

    // Recursively check children metadata
    if (original.children && reconstructed.children) {
      for (let i = 0; i < original.children.length; i++) {
        const originalChild = original.children[i];
        const reconstructedChild = reconstructed.children[i];
        
        if (typeof originalChild === 'object' && typeof reconstructedChild === 'object') {
          if (!this.validateMetadataPreservation(originalChild as RuleNode, reconstructedChild as RuleNode, result)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Validates that the logical meaning is preserved
   */
  private validateLogicPreservation(
    original: RuleNode, 
    reconstructed: RuleNode, 
    result: RoundTripValidationResult
  ): boolean {
    // Compare configuration objects for logical equivalence
    const originalConfig = original.config;
    const reconstructedConfig = reconstructed.config;

    if (!originalConfig && !reconstructedConfig) {
      return true;
    }

    if (!originalConfig || !reconstructedConfig) {
      result.warnings.push({
        id: this.generateErrorId(),
        message: `Configuration presence mismatch: original=${!!originalConfig}, reconstructed=${!!reconstructedConfig}`,
        severity: 'warning',
        code: 'CONFIG_PRESENCE_MISMATCH'
      });
      return false;
    }

    // Deep comparison of configuration
    try {
      const originalConfigJson = JSON.stringify(originalConfig, null, 2);
      const reconstructedConfigJson = JSON.stringify(reconstructedConfig, null, 2);

      if (originalConfigJson !== reconstructedConfigJson) {
        result.warnings.push({
          id: this.generateErrorId(),
          message: 'Configuration values changed during round-trip',
          severity: 'warning',
          code: 'CONFIG_VALUES_CHANGED'
        });
        return false;
      }
    } catch (error) {
      result.warnings.push({
        id: this.generateErrorId(),
        message: `Failed to compare configurations: ${error}`,
        severity: 'warning',
        code: 'CONFIG_COMPARISON_ERROR'
      });
      return false;
    }

    return true;
  }

  /**
   * Counts total number of nodes in a rule tree
   */
  private countNodes(node: RuleNode): number {
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        if (typeof child === 'object') {
          count += this.countNodes(child as RuleNode);
        }
      }
    }
    return count;
  }

  /**
   * Runs a comprehensive test suite for round-trip validation
   */
  runTestSuite(testCases: RoundTripTestCase[]): {
    totalTests: number;
    passed: number;
    failed: number;
    results: Array<{ testCase: RoundTripTestCase; result: RoundTripValidationResult }>;
  } {
    const results: Array<{ testCase: RoundTripTestCase; result: RoundTripValidationResult }> = [];
    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
      const result = this.validateRoundTrip(testCase.visualRule);
      
      // Apply expected validation if provided
      if (testCase.expectedValidation) {
        const meetsExpectations = this.validateExpectations(result, testCase.expectedValidation);
        if (meetsExpectations) {
          passed++;
        } else {
          failed++;
          result.errors.push({
            id: this.generateErrorId(),
            message: 'Test case did not meet expected validation criteria',
            severity: 'error',
            code: 'TEST_EXPECTATIONS_NOT_MET'
          });
        }
      } else {
        if (result.success) {
          passed++;
        } else {
          failed++;
        }
      }

      results.push({ testCase, result });
    }

    return {
      totalTests: testCases.length,
      passed,
      failed,
      results
    };
  }

  /**
   * Validates test expectations against results
   */
  private validateExpectations(
    result: RoundTripValidationResult, 
    expectations: RoundTripTestCase['expectedValidation']
  ): boolean {
    if (!expectations) return result.success;

    // Check if success matches expectation
    if (result.success !== expectations.shouldSucceed) {
      return false;
    }

    // Check expected errors
    if (expectations.expectedErrors) {
      const errorMessages = result.errors.map(e => e.message);
      for (const expectedError of expectations.expectedErrors) {
        if (!errorMessages.some(msg => msg.includes(expectedError))) {
          return false;
        }
      }
    }

    // Check expected warnings
    if (expectations.expectedWarnings) {
      const warningMessages = result.warnings.map(w => w.message);
      for (const expectedWarning of expectations.expectedWarnings) {
        if (!warningMessages.some(msg => msg.includes(expectedWarning))) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Creates default test cases for common rule patterns
   */
  createDefaultTestCases(): RoundTripTestCase[] {
    return [
      {
        id: 'simple-field-condition',
        name: 'Simple Field Condition',
        description: 'Tests a basic field equals condition',
        visualRule: {
          id: 'test-1',
          type: 'fieldCondition',
          label: 'Name equals "Test"',
          config: {
            type: 'fieldCondition',
            fieldName: 'name',
            operator: 'equals',
            value: 'Test',
            valueType: 'literal'
          } as any
        },
        expectedValidation: {
          shouldSucceed: true
        }
      },
      {
        id: 'and-group',
        name: 'AND Group',
        description: 'Tests an AND group with multiple conditions',
        visualRule: {
          id: 'test-2',
          type: 'andGroup',
          label: 'AND Group',
          config: {
            type: 'booleanGroup',
            operator: 'and'
          } as any,
          children: [
            {
              id: 'test-2-1',
              type: 'fieldCondition',
              label: 'Age > 18',
              config: {
                type: 'fieldCondition',
                fieldName: 'age',
                operator: 'greaterThan',
                value: 18,
                valueType: 'literal'
              } as any
            },
            {
              id: 'test-2-2',
              type: 'fieldCondition',
              label: 'Active = true',
              config: {
                type: 'fieldCondition',
                fieldName: 'active',
                operator: 'equals',
                value: true,
                valueType: 'literal'
              } as any
            }
          ] as any
        },
        expectedValidation: {
          shouldSucceed: true
        }
      },
      {
        id: 'function-condition',
        name: 'Function Condition',
        description: 'Tests a function call condition',
        visualRule: {
          id: 'test-3',
          type: 'functionCall',
          label: 'contains(name, "test")',
          config: {
            type: 'functionCall',
            functionName: 'contains',
            parameters: [
              { name: 'field', value: 'name', valueType: 'field' },
              { name: 'value', value: 'test', valueType: 'literal' }
            ]
          } as any
        },
        expectedValidation: {
          shouldSucceed: true
        }
      }
    ];
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}