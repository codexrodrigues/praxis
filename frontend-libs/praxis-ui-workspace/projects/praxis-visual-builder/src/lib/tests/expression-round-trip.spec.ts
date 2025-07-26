import { TestBed } from '@angular/core/testing';
import { SpecificationBridgeService, DslParsingConfig, ContextualConfig } from '../services/specification-bridge.service';
import { ContextVariable } from '../components/expression-editor.component';
import { FunctionRegistry, ContextProvider } from 'praxis-specification';

describe('Expression Round-Trip Tests', () => {
  let service: SpecificationBridgeService;
  let mockFunctionRegistry: FunctionRegistry<any>;
  let mockContextProvider: ContextProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpecificationBridgeService);

    // Create mock function registry
    mockFunctionRegistry = {
      register: jasmine.createSpy('register'),
      get: jasmine.createSpy('get'),
      getAll: jasmine.createSpy('getAll').and.returnValue(new Map([
        ['contains', { name: 'contains', arity: 2 }],
        ['startsWith', { name: 'startsWith', arity: 2 }],
        ['endsWith', { name: 'endsWith', arity: 2 }],
        ['length', { name: 'length', arity: 1 }],
        ['upper', { name: 'upper', arity: 1 }],
        ['lower', { name: 'lower', arity: 1 }]
      ])),
      has: jasmine.createSpy('has').and.returnValue(true),
      clear: jasmine.createSpy('clear')
    } as any;

    // Create mock context provider
    mockContextProvider = {
      hasValue: jasmine.createSpy('hasValue').and.returnValue(true),
      getValue: jasmine.createSpy('getValue').and.callFake((key: string) => {
        const values: Record<string, any> = {
          'user.name': 'John Doe',
          'user.age': 30,
          'user.active': true,
          'session.id': 'sess_123',
          'env.debug': false,
          'global.version': '1.0.0'
        };
        return values[key];
      }),
      setValue: jasmine.createSpy('setValue'),
      removeValue: jasmine.createSpy('removeValue'),
      getScope: jasmine.createSpy('getScope').and.returnValue('global'),
      getAllKeys: jasmine.createSpy('getAllKeys').and.returnValue(['user.name', 'user.age', 'user.active']),
      clear: jasmine.createSpy('clear')
    };
  });

  describe('Basic DSL Expression Round-Trip', () => {
    const basicExpressions = [
      'age > 18',
      'name == "John"',
      'active == true',
      'score >= 80 && grade == "A"',
      'status == "pending" || status == "approved"',
      '!(deleted == true)',
      'category in ["tech", "science", "math"]',
      'title != null && title != ""'
    ];

    basicExpressions.forEach(expression => {
      it(`should successfully round-trip basic expression: ${expression}`, () => {
        const config: DslParsingConfig = {
          knownFields: ['age', 'name', 'active', 'score', 'grade', 'status', 'deleted', 'category', 'title'],
          enablePerformanceWarnings: true,
          maxComplexity: 20
        };

        const result = service.validateExpressionRoundTrip(expression, config);

        expect(result.success).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.reconstructedExpression).toBeDefined();
        
        // The reconstructed expression should parse successfully
        if (result.reconstructedExpression) {
          const parseResult = service.parseDslExpression(result.reconstructedExpression, config);
          expect(parseResult.success).toBe(true);
        }
      });
    });
  });

  describe('Function Call Round-Trip', () => {
    const functionExpressions = [
      'contains(name, "John")',
      'startsWith(email, "admin")',
      'endsWith(filename, ".pdf")',
      'length(description) > 10',
      'upper(category) == "TECHNOLOGY"',
      'contains(tags, "important") && active == true'
    ];

    functionExpressions.forEach(expression => {
      it(`should successfully round-trip function expression: ${expression}`, () => {
        const config: DslParsingConfig = {
          functionRegistry: mockFunctionRegistry,
          knownFields: ['name', 'email', 'filename', 'description', 'category', 'tags', 'active'],
          enablePerformanceWarnings: true,
          maxComplexity: 25
        };

        const result = service.validateExpressionRoundTrip(expression, config);

        expect(result.success).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.reconstructedExpression).toBeDefined();
      });
    });
  });

  describe('Complex Expression Round-Trip', () => {
    const complexExpressions = [
      '(age > 18 && age < 65) && (status == "active" || status == "pending")',
      '(score >= 90 && grade == "A") || (score >= 80 && grade == "B" && extraCredit == true)',
      '!(deleted == true || archived == true) && (published == true)',
      'contains(tags, "urgent") && (priority > 5 || assignee == "admin")',
      '(startsWith(code, "PRE") && length(code) == 8) || (endsWith(code, "_TEMP") && temporary == true)'
    ];

    complexExpressions.forEach(expression => {
      it(`should successfully round-trip complex expression: ${expression}`, () => {
        const config: DslParsingConfig = {
          functionRegistry: mockFunctionRegistry,
          knownFields: [
            'age', 'status', 'score', 'grade', 'extraCredit', 'deleted', 'archived', 
            'published', 'tags', 'priority', 'assignee', 'code', 'temporary'
          ],
          enablePerformanceWarnings: true,
          maxComplexity: 50
        };

        const result = service.validateExpressionRoundTrip(expression, config);

        expect(result.success).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.reconstructedExpression).toBeDefined();

        // Verify complexity metrics
        const parseResult = service.parseDslExpression(expression, config);
        expect(parseResult.metrics?.complexity).toBeGreaterThan(1);
      });
    });
  });

  describe('Contextual Expression Round-Trip', () => {
    const contextualExpressions = [
      'age > ${user.age}',
      'name == "${user.name}"',
      'active == ${user.active} && version == "${global.version}"',
      'sessionId == "${session.id}" || debug == ${env.debug}'
    ];

    const contextVariables: ContextVariable[] = [
      { name: 'user.name', type: 'string', scope: 'user', example: 'John Doe' },
      { name: 'user.age', type: 'number', scope: 'user', example: '30' },
      { name: 'user.active', type: 'boolean', scope: 'user', example: 'true' },
      { name: 'session.id', type: 'string', scope: 'session', example: 'sess_123' },
      { name: 'env.debug', type: 'boolean', scope: 'env', example: 'false' },
      { name: 'global.version', type: 'string', scope: 'global', example: '1.0.0' }
    ];

    contextualExpressions.forEach(expression => {
      it(`should successfully round-trip contextual expression: ${expression}`, () => {
        const config: ContextualConfig = {
          contextVariables,
          contextProvider: mockContextProvider,
          strictContextValidation: true
        };

        // Test contextual specification creation
        const contextualSpec = service.createContextualSpecification(expression, config);
        expect(contextualSpec).toBeDefined();

        // Test token extraction
        const tokens = service.extractContextTokens(expression);
        expect(tokens.length).toBeGreaterThan(0);

        // Test token validation
        const validationIssues = service.validateContextTokens(expression, contextVariables);
        const errors = validationIssues.filter(issue => issue.severity === 'error');
        expect(errors.length).toBe(0);

        // Test template to DSL conversion
        const dslTemplate = service.contextualSpecificationToDsl(contextualSpec);
        expect(dslTemplate).toBe(expression);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed expressions gracefully', () => {
      const malformedExpressions = [
        'age >',           // Missing operand
        '&& name == "John"',  // Missing left operand
        'age > 18 &&',     // Missing right operand
        'age > 18)',       // Unbalanced parentheses
        '(age > 18',       // Unclosed parentheses
        'unknownFunc(age)', // Unknown function
        'age >> 18'        // Invalid operator
      ];

      malformedExpressions.forEach(expression => {
        const config: DslParsingConfig = {
          knownFields: ['age', 'name'],
          enablePerformanceWarnings: true
        };

        const result = service.validateExpressionRoundTrip(expression, config);
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should handle empty expressions', () => {
      const emptyExpressions = ['', '   ', '\n\t  '];

      emptyExpressions.forEach(expression => {
        const config: DslParsingConfig = {
          knownFields: ['test'],
          enablePerformanceWarnings: true
        };

        const result = service.validateExpressionRoundTrip(expression, config);
        expect(result.success).toBe(false);
        expect(result.errors).toContain(jasmine.stringMatching(/empty/i));
      });
    });

    it('should handle unknown fields with warnings', () => {
      const expression = 'unknownField == "test"';
      const config: DslParsingConfig = {
        knownFields: ['knownField'],
        enablePerformanceWarnings: true
      };

      const parseResult = service.parseDslExpression(expression, config);
      const warnings = parseResult.issues.filter(issue => issue.severity === 'warning');
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].message).toContain('unknownField');
    });

    it('should handle missing context variables', () => {
      const expression = 'name == "${missing.variable}"';
      const contextVariables: ContextVariable[] = [
        { name: 'existing.variable', type: 'string', scope: 'global', example: 'test' }
      ];

      const validationIssues = service.validateContextTokens(expression, contextVariables);
      const warnings = validationIssues.filter(issue => issue.severity === 'warning');
      
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].message).toContain('missing.variable');
    });
  });

  describe('Performance and Complexity', () => {
    it('should measure parsing performance', () => {
      const expression = 'age > 18 && name == "John" && active == true';
      const config: DslParsingConfig = {
        knownFields: ['age', 'name', 'active'],
        enablePerformanceWarnings: true
      };

      const parseResult = service.parseDslExpression(expression, config);
      
      expect(parseResult.metrics).toBeDefined();
      expect(parseResult.metrics!.parseTime).toBeGreaterThanOrEqual(0);
      expect(parseResult.metrics!.complexity).toBeGreaterThan(1);
    });

    it('should warn about high complexity expressions', () => {
      // Create a complex expression that exceeds the default complexity limit
      const complexExpression = Array.from({ length: 15 }, (_, i) => `field${i} == ${i}`).join(' && ');
      
      const config: DslParsingConfig = {
        knownFields: Array.from({ length: 15 }, (_, i) => `field${i}`),
        enablePerformanceWarnings: true,
        maxComplexity: 10
      };

      const parseResult = service.parseDslExpression(complexExpression, config);
      const performanceWarnings = parseResult.issues.filter(
        issue => issue.type === 'PerformanceWarning'
      );
      
      expect(performanceWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('Context Provider Integration', () => {
    it('should create context provider from variables', () => {
      const contextVariables: ContextVariable[] = [
        { name: 'stringVar', type: 'string', scope: 'global', example: 'test' },
        { name: 'numberVar', type: 'number', scope: 'global', example: '42' },
        { name: 'booleanVar', type: 'boolean', scope: 'global', example: 'true' },
        { name: 'dateVar', type: 'date', scope: 'global', example: '2023-01-01' },
        { name: 'objectVar', type: 'object', scope: 'global', example: '{"key": "value"}' },
        { name: 'arrayVar', type: 'array', scope: 'global', example: '[1, 2, 3]' }
      ];

      const template = 'test with ${stringVar} and ${numberVar}';
      const config: ContextualConfig = {
        contextVariables,
        strictContextValidation: false
      };

      const contextualSpec = service.createContextualSpecification(template, config);
      expect(contextualSpec).toBeDefined();
      
      const resolvedTemplate = service.resolveContextTokens(template, contextVariables);
      expect(resolvedTemplate).toContain('test');
      expect(resolvedTemplate).toContain('42'); // number should be converted
    });

    it('should handle context provider updates', () => {
      service.updateContextProvider(mockContextProvider);
      const provider = service.getContextProvider();
      
      expect(provider).toBe(mockContextProvider);
    });
  });

  describe('Specification Bridge Integration', () => {
    it('should integrate with rule node conversion', () => {
      // This test verifies that DSL expressions can be converted to rule nodes
      // and back through the specification bridge
      const expression = 'age > 18 && status == "active"';
      
      const config: DslParsingConfig = {
        knownFields: ['age', 'status'],
        enablePerformanceWarnings: true
      };

      // Parse to specification
      const parseResult = service.parseDslExpression(expression, config);
      expect(parseResult.success).toBe(true);
      expect(parseResult.specification).toBeDefined();

      // Convert specification to rule node
      const ruleNode = service.specificationToRuleNode(parseResult.specification!);
      expect(ruleNode).toBeDefined();
      expect(ruleNode.type).toBeDefined();

      // Convert rule node back to specification
      const reconstructedSpec = service.ruleNodeToSpecification(ruleNode);
      expect(reconstructedSpec).toBeDefined();

      // Export back to DSL
      const reconstructedDsl = reconstructedSpec.toDSL();
      expect(reconstructedDsl).toBeDefined();
      expect(reconstructedDsl.length).toBeGreaterThan(0);
    });

    it('should validate round-trip through rule nodes', () => {
      const expression = 'name == "test" || age > 25';
      
      const config: DslParsingConfig = {
        knownFields: ['name', 'age'],
        enablePerformanceWarnings: true
      };

      const roundTripResult = service.validateExpressionRoundTrip(expression, config);
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toEqual([]);
    });
  });
});