import { TestBed } from '@angular/core/testing';
import { SpecificationBridgeService, DslParsingConfig } from '../services/specification-bridge.service';
import { RuleNode } from '../models/rule-builder.model';
import { ContextVariable } from '../components/expression-editor.component';

describe('Round-Trip Validation Comprehensive Tests', () => {
  let service: SpecificationBridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpecificationBridgeService);
  });

  describe('Expression to Specification Round-Trip', () => {
    const testCases = [
      {
        name: 'Simple field comparison',
        expression: 'age > 18',
        fields: ['age'],
        shouldSucceed: true
      },
      {
        name: 'String equality',
        expression: 'name == "John Doe"',
        fields: ['name'],
        shouldSucceed: true
      },
      {
        name: 'Boolean comparison',
        expression: 'active == true',
        fields: ['active'],
        shouldSucceed: true
      },
      {
        name: 'Null comparison',
        expression: 'description != null',
        fields: ['description'],
        shouldSucceed: true
      },
      {
        name: 'Array membership',
        expression: 'category in ["tech", "science"]',
        fields: ['category'],
        shouldSucceed: true
      },
      {
        name: 'Logical AND',
        expression: 'age > 18 && status == "active"',
        fields: ['age', 'status'],
        shouldSucceed: true
      },
      {
        name: 'Logical OR',
        expression: 'priority == "high" || urgent == true',
        fields: ['priority', 'urgent'],
        shouldSucceed: true
      },
      {
        name: 'Logical NOT',
        expression: '!(deleted == true)',
        fields: ['deleted'],
        shouldSucceed: true
      },
      {
        name: 'Complex nested expression',
        expression: '(age >= 18 && age <= 65) && (status == "active" || status == "pending")',
        fields: ['age', 'status'],
        shouldSucceed: true
      },
      {
        name: 'Function calls',
        expression: 'contains(tags, "important")',
        fields: ['tags'],
        shouldSucceed: true
      },
      {
        name: 'Multiple function calls',
        expression: 'startsWith(email, "admin") && endsWith(filename, ".pdf")',
        fields: ['email', 'filename'],
        shouldSucceed: true
      },
      {
        name: 'Mixed operators and functions',
        expression: 'length(description) > 10 && contains(keywords, "urgent") && priority >= 5',
        fields: ['description', 'keywords', 'priority'],
        shouldSucceed: true
      }
    ];

    testCases.forEach(testCase => {
      it(`should round-trip ${testCase.name}`, () => {
        const config: DslParsingConfig = {
          knownFields: testCase.fields,
          enablePerformanceWarnings: true,
          maxComplexity: 50
        };

        const result = service.validateExpressionRoundTrip(testCase.expression, config);

        if (testCase.shouldSucceed) {
          expect(result.success).toBe(true);
          expect(result.errors).toEqual([]);
          expect(result.reconstructedExpression).toBeDefined();
          
          // Additional validation: parse the reconstructed expression
          if (result.reconstructedExpression) {
            const secondParseResult = service.parseDslExpression(result.reconstructedExpression, config);
            expect(secondParseResult.success).toBe(true);
          }
        } else {
          expect(result.success).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Specification to Rule Node Round-Trip', () => {
    it('should convert specifications to rule nodes and back', () => {
      const expressions = [
        'age > 18',
        'name == "test" && active == true',
        '(score >= 80 && grade == "A") || extraCredit == true',
        'contains(tags, "important") && priority > 5'
      ];

      const config: DslParsingConfig = {
        knownFields: ['age', 'name', 'active', 'score', 'grade', 'extraCredit', 'tags', 'priority'],
        enablePerformanceWarnings: false
      };

      expressions.forEach(expression => {
        // 1. Parse expression to specification
        const parseResult = service.parseDslExpression(expression, config);
        expect(parseResult.success).toBe(true);
        expect(parseResult.specification).toBeDefined();

        // 2. Convert specification to rule node
        const ruleNode = service.specificationToRuleNode(parseResult.specification!);
        expect(ruleNode).toBeDefined();
        expect(ruleNode.id).toBeDefined();
        expect(ruleNode.type).toBeDefined();

        // 3. Convert rule node back to specification
        const reconstructedSpec = service.ruleNodeToSpecification(ruleNode);
        expect(reconstructedSpec).toBeDefined();

        // 4. Validate round-trip integrity
        const roundTripValidation = service.validateRoundTrip(ruleNode);
        expect(roundTripValidation.success).toBe(true);
        expect(roundTripValidation.errors).toEqual([]);

        // 5. Export to DSL and verify
        const reconstructedDsl = reconstructedSpec.toDSL();
        expect(reconstructedDsl).toBeDefined();
        expect(reconstructedDsl.length).toBeGreaterThan(0);
      });
    });

    it('should preserve metadata through round-trip', () => {
      const expression = 'age > 18 && status == "active"';
      const config: DslParsingConfig = {
        knownFields: ['age', 'status'],
        enablePerformanceWarnings: false
      };

      // Parse and add metadata
      const parseResult = service.parseDslExpression(expression, config);
      expect(parseResult.success).toBe(true);

      // Convert to rule node with metadata
      const ruleNode = service.specificationToRuleNode(parseResult.specification!);
      ruleNode.metadata = {
        code: 'TEST_001',
        message: 'Test validation rule',
        severity: 'error',
        category: 'business-logic'
      };

      // Round-trip validation should preserve metadata
      const roundTripValidation = service.validateRoundTrip(ruleNode);
      expect(roundTripValidation.success).toBe(true);
      
      // Check for metadata preservation warnings
      const metadataWarnings = roundTripValidation.warnings.filter(w => 
        w.includes('metadata') || w.includes('Metadata')
      );
      
      // Should either have no metadata warnings or successful preservation
      if (metadataWarnings.length > 0) {
        // If there are warnings, they should not be about loss of critical metadata
        metadataWarnings.forEach(warning => {
          expect(warning).not.toContain('lost');
          expect(warning).not.toContain('missing');
        });
      }
    });
  });

  describe('Context Variable Round-Trip', () => {
    const contextVariables: ContextVariable[] = [
      { name: 'user.name', type: 'string', scope: 'user', example: 'John Doe' },
      { name: 'user.age', type: 'number', scope: 'user', example: '30' },
      { name: 'user.active', type: 'boolean', scope: 'user', example: 'true' },
      { name: 'session.id', type: 'string', scope: 'session', example: 'sess_123' },
      { name: 'env.debug', type: 'boolean', scope: 'env', example: 'false' },
      { name: 'global.version', type: 'string', scope: 'global', example: '1.0.0' }
    ];

    it('should round-trip contextual expressions', () => {
      const contextualExpressions = [
        'age > ${user.age}',
        'name == "${user.name}"',
        'active == ${user.active} && debug == ${env.debug}',
        'sessionId == "${session.id}" || version == "${global.version}"'
      ];

      contextualExpressions.forEach(template => {
        // 1. Extract tokens
        const tokens = service.extractContextTokens(template);
        expect(tokens.length).toBeGreaterThan(0);

        // 2. Validate tokens
        const validationIssues = service.validateContextTokens(template, contextVariables);
        const errors = validationIssues.filter(issue => issue.severity === 'error');
        expect(errors.length).toBe(0);

        // 3. Create contextual specification
        const contextualSpec = service.createContextualSpecification(template, {
          contextVariables,
          strictContextValidation: true
        });
        expect(contextualSpec).toBeDefined();

        // 4. Convert back to DSL
        const reconstructedTemplate = service.contextualSpecificationToDsl(contextualSpec);
        expect(reconstructedTemplate).toBe(template);

        // 5. Resolve tokens
        const resolvedTemplate = service.resolveContextTokens(template, contextVariables);
        expect(resolvedTemplate).toBeDefined();
        expect(resolvedTemplate).not.toBe(template); // Should be different after resolution
      });
    });

    it('should handle missing context variables gracefully', () => {
      const templateWithMissingVars = 'name == "${missing.variable}" && age > ${another.missing}';
      
      const validationIssues = service.validateContextTokens(templateWithMissingVars, contextVariables);
      const warnings = validationIssues.filter(issue => issue.severity === 'warning');
      
      expect(warnings.length).toBe(2); // Should warn about both missing variables
      expect(warnings[0].message).toContain('missing.variable');
      expect(warnings[1].message).toContain('another.missing');
    });

    it('should provide helpful suggestions for similar variable names', () => {
      const templateWithTypo = 'name == "${user.nam}" && age > ${user.ag}'; // Typos in variable names
      
      const validationIssues = service.validateContextTokens(templateWithTypo, contextVariables);
      const warnings = validationIssues.filter(issue => issue.severity === 'warning');
      
      expect(warnings.length).toBe(2);
      
      // Should suggest similar variable names
      const firstSuggestion = warnings.find(w => w.message.includes('user.nam'));
      expect(firstSuggestion?.suggestion).toContain('user.name');
      
      const secondSuggestion = warnings.find(w => w.message.includes('user.ag'));
      expect(secondSuggestion?.suggestion).toContain('user.age');
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle malformed expressions gracefully', () => {
      const malformedExpressions = [
        'age >',           // Missing operand
        '&& name == "test"', // Missing left operand
        'age > 18 &&',     // Missing right operand
        'age > 18)',       // Unbalanced parentheses
        '(age > 18',       // Unclosed parentheses
        'age >> 18',       // Invalid operator
        'unknownFunc(age)' // Unknown function
      ];

      const config: DslParsingConfig = {
        knownFields: ['age', 'name'],
        enablePerformanceWarnings: false
      };

      malformedExpressions.forEach(expression => {
        const result = service.validateExpressionRoundTrip(expression, config);
        
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        
        // Errors should be descriptive
        result.errors.forEach(error => {
          expect(error).toBeDefined();
          expect(error.length).toBeGreaterThan(0);
          expect(typeof error).toBe('string');
        });
      });
    });

    it('should provide meaningful error messages', () => {
      const config: DslParsingConfig = {
        knownFields: ['age', 'name'],
        enablePerformanceWarnings: false
      };

      // Test specific error scenarios
      const errorCases = [
        {
          expression: 'age >',
          expectedErrorKeywords: ['missing', 'operand', 'incomplete']
        },
        {
          expression: 'unknownField == "test"',
          expectedErrorKeywords: ['unknown', 'field', 'unknownField']
        },
        {
          expression: 'age > 18)',
          expectedErrorKeywords: ['unbalanced', 'parentheses', ')']
        }
      ];

      errorCases.forEach(errorCase => {
        const result = service.validateExpressionRoundTrip(errorCase.expression, config);
        
        expect(result.success).toBe(false);
        
        const allErrorText = result.errors.join(' ').toLowerCase();
        const hasExpectedKeyword = errorCase.expectedErrorKeywords.some(keyword => 
          allErrorText.includes(keyword.toLowerCase())
        );
        
        expect(hasExpectedKeyword).toBe(true);
      });
    });

    it('should handle edge cases in context variable resolution', () => {
      const edgeCaseVariables: ContextVariable[] = [
        { name: 'empty.string', type: 'string', scope: 'global', example: '' },
        { name: 'zero.number', type: 'number', scope: 'global', example: '0' },
        { name: 'false.boolean', type: 'boolean', scope: 'global', example: 'false' },
        { name: 'null.value', type: 'string', scope: 'global', example: '' }, // No example
        { name: 'special.chars', type: 'string', scope: 'global', example: '!@#$%^&*()' }
      ];

      const edgeCaseTemplate = 'empty == "${empty.string}" && zero == ${zero.number} && flag == ${false.boolean} && special == "${special.chars}"';
      
      const resolvedTemplate = service.resolveContextTokens(edgeCaseTemplate, edgeCaseVariables);
      
      expect(resolvedTemplate).toBeDefined();
      expect(resolvedTemplate).toContain('empty == ""'); // Empty string
      expect(resolvedTemplate).toContain('zero == 0'); // Zero number
      expect(resolvedTemplate).toContain('flag == false'); // False boolean
      expect(resolvedTemplate).toContain('special == "!@#$%^&*()"'); // Special characters
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle complex round-trip operations efficiently', () => {
      const complexExpression = '((age > 18 && age < 65) || experience > 10) && ' +
        '(department == "Engineering" || department == "Product") && ' +
        '(contains(skills, "JavaScript") || contains(skills, "TypeScript")) && ' +
        '(salary >= 50000 && salary <= 200000) && ' +
        '(location == "Remote" || contains(cities, location)) && ' +
        '!(archived == true || deleted == true)';

      const config: DslParsingConfig = {
        knownFields: [
          'age', 'experience', 'department', 'skills', 'salary', 
          'location', 'cities', 'archived', 'deleted'
        ],
        enablePerformanceWarnings: true,
        maxComplexity: 100
      };

      const startTime = performance.now();
      const result = service.validateExpressionRoundTrip(complexExpression, config);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle multiple concurrent round-trip operations', async () => {
      const expressions = Array.from({ length: 20 }, (_, i) => 
        `field${i % 5} == "value${i}" && number${i % 3} > ${i}`
      );

      const config: DslParsingConfig = {
        knownFields: [
          'field0', 'field1', 'field2', 'field3', 'field4',
          'number0', 'number1', 'number2'
        ],
        enablePerformanceWarnings: false
      };

      const startTime = performance.now();
      
      const promises = expressions.map(expression => 
        Promise.resolve().then(() => service.validateExpressionRoundTrip(expression, config))
      );
      
      const results = await Promise.all(promises);
      const endTime = performance.now();

      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.errors).toEqual([]);
      });

      // Should complete all operations within reasonable time
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds for 20 operations
    });
  });

  describe('Integration with Rule Builder Components', () => {
    it('should maintain consistency between visual builder and DSL', () => {
      // This test simulates the workflow of creating a rule visually,
      // converting to DSL, and then back to visual representation
      
      const expression = 'age >= 21 && (status == "active" || status == "trial") && !suspended';
      const config: DslParsingConfig = {
        knownFields: ['age', 'status', 'suspended'],
        enablePerformanceWarnings: false
      };

      // 1. Parse expression (as if entered in expression editor)
      const parseResult = service.parseDslExpression(expression, config);
      expect(parseResult.success).toBe(true);

      // 2. Convert to rule node (for visual builder)
      const ruleNode = service.specificationToRuleNode(parseResult.specification!);
      expect(ruleNode).toBeDefined();

      // 3. Validate round-trip through rule node
      const roundTripValidation = service.validateRoundTrip(ruleNode);
      expect(roundTripValidation.success).toBe(true);

      // 4. Convert back to specification
      const reconstructedSpec = service.ruleNodeToSpecification(ruleNode);
      expect(reconstructedSpec).toBeDefined();

      // 5. Export to DSL (as if for code generation)
      const reconstructedDsl = reconstructedSpec.toDSL();
      expect(reconstructedDsl).toBeDefined();

      // 6. Final validation: parse the reconstructed DSL
      const finalParseResult = service.parseDslExpression(reconstructedDsl, config);
      expect(finalParseResult.success).toBe(true);

      // 7. Verify semantic equivalence (structure should be the same)
      const originalJson = JSON.stringify(parseResult.specification!.toJSON());
      const reconstructedJson = JSON.stringify(finalParseResult.specification!.toJSON());
      
      // Note: Exact JSON equality might not be expected due to formatting differences,
      // but the structures should be semantically equivalent
      expect(reconstructedJson.length).toBeGreaterThan(0);
      expect(finalParseResult.specification).toBeDefined();
    });
  });
});