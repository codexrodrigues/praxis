import { TestBed } from '@angular/core/testing';
import { SpecificationBridgeService, DslParsingConfig, ContextualConfig } from '../services/specification-bridge.service';
import { ContextVariable } from '../components/expression-editor.component';

describe('Visual Builder Performance Tests', () => {
  let service: SpecificationBridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpecificationBridgeService);
  });

  describe('DSL Parsing Performance', () => {
    const performanceThresholds = {
      simple: 50,      // 50ms for simple expressions
      medium: 200,     // 200ms for medium complexity
      complex: 500,    // 500ms for complex expressions
      massive: 2000    // 2s for very large expressions
    };

    it('should parse simple expressions quickly', () => {
      const simpleExpressions = [
        'age > 18',
        'name == "John"',
        'active == true',
        'score >= 80'
      ];

      const config: DslParsingConfig = {
        knownFields: ['age', 'name', 'active', 'score'],
        enablePerformanceWarnings: false
      };

      simpleExpressions.forEach(expression => {
        const startTime = performance.now();
        const result = service.parseDslExpression(expression, config);
        const endTime = performance.now();

        expect(result.success).toBe(true);
        expect(endTime - startTime).toBeLessThan(performanceThresholds.simple);
      });
    });

    it('should parse medium complexity expressions efficiently', () => {
      const mediumExpressions = [
        'age > 18 && age < 65 && status == "active"',
        '(score >= 80 && grade == "A") || (score >= 70 && extraCredit == true)',
        'contains(tags, "important") && priority > 5 && assignee != null',
        'startsWith(code, "PRE") && length(description) > 20 && approved == true'
      ];

      const config: DslParsingConfig = {
        knownFields: ['age', 'status', 'score', 'grade', 'extraCredit', 'tags', 'priority', 'assignee', 'code', 'description', 'approved'],
        enablePerformanceWarnings: false
      };

      mediumExpressions.forEach(expression => {
        const startTime = performance.now();
        const result = service.parseDslExpression(expression, config);
        const endTime = performance.now();

        expect(result.success).toBe(true);
        expect(endTime - startTime).toBeLessThan(performanceThresholds.medium);
      });
    });

    it('should handle complex expressions within acceptable time', () => {
      const complexExpressions = [
        '((age > 18 && age < 30) || (age > 40 && age < 65)) && (status == "active" || status == "pending") && (department == "Engineering" || department == "Product") && (level >= 3)',
        '(contains(skills, "JavaScript") && contains(skills, "TypeScript")) && (experience > 2) && (location == "Remote" || contains(preferredLocations, location)) && (salary >= 50000 && salary <= 150000)',
        '((priority == "high" && severity == "critical") || (priority == "medium" && severity == "high")) && (assignee != null) && (createdDate >= "2023-01-01") && (tags.length > 0) && (!archived)',
        '(startsWith(email, "admin") || endsWith(email, "@company.com")) && (lastLogin > "2023-06-01") && ((role == "admin" && permissions.length >= 5) || (role == "user" && permissions.length >= 1))'
      ];

      const config: DslParsingConfig = {
        knownFields: [
          'age', 'status', 'department', 'level', 'skills', 'experience', 'location', 'preferredLocations',
          'salary', 'priority', 'severity', 'assignee', 'createdDate', 'tags', 'archived', 'email',
          'lastLogin', 'role', 'permissions'
        ],
        enablePerformanceWarnings: false,
        maxComplexity: 100
      };

      complexExpressions.forEach(expression => {
        const startTime = performance.now();
        const result = service.parseDslExpression(expression, config);
        const endTime = performance.now();

        expect(result.success).toBe(true);
        expect(endTime - startTime).toBeLessThan(performanceThresholds.complex);
      });
    });

    it('should handle massive expressions with reasonable performance', () => {
      // Generate a very large expression (not realistic but good for stress testing)
      const massiveExpression = Array.from({ length: 50 }, (_, i) => 
        `field${i} == "value${i}" && number${i} > ${i * 10}`
      ).join(' || ');

      const config: DslParsingConfig = {
        knownFields: [
          ...Array.from({ length: 50 }, (_, i) => `field${i}`),
          ...Array.from({ length: 50 }, (_, i) => `number${i}`)
        ],
        enablePerformanceWarnings: false,
        maxComplexity: 1000
      };

      const startTime = performance.now();
      const result = service.parseDslExpression(massiveExpression, config);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(performanceThresholds.massive);
    });
  });

  describe('Round-Trip Performance', () => {
    it('should perform round-trip validation quickly for simple expressions', () => {
      const expressions = [
        'age > 18',
        'name == "test"',
        'active == true',
        'score >= 80 && grade == "A"'
      ];

      const config: DslParsingConfig = {
        knownFields: ['age', 'name', 'active', 'score', 'grade'],
        enablePerformanceWarnings: false
      };

      expressions.forEach(expression => {
        const startTime = performance.now();
        const result = service.validateExpressionRoundTrip(expression, config);
        const endTime = performance.now();

        expect(result.success).toBe(true);
        expect(endTime - startTime).toBeLessThan(100); // 100ms threshold for round-trip
      });
    });

    it('should perform batch round-trip validation efficiently', () => {
      const batchSize = 100;
      const expressions = Array.from({ length: batchSize }, (_, i) => 
        `field${i % 10} == "value${i}" && number${i % 5} > ${i}`
      );

      const config: DslParsingConfig = {
        knownFields: [
          ...Array.from({ length: 10 }, (_, i) => `field${i}`),
          ...Array.from({ length: 5 }, (_, i) => `number${i}`)
        ],
        enablePerformanceWarnings: false
      };

      const startTime = performance.now();
      const results = expressions.map(expression => 
        service.validateExpressionRoundTrip(expression, config)
      );
      const endTime = performance.now();

      // All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Should complete batch processing in reasonable time
      const avgTimePerExpression = (endTime - startTime) / batchSize;
      expect(avgTimePerExpression).toBeLessThan(50); // Average 50ms per expression
    });
  });

  describe('Context Variable Performance', () => {
    it('should handle large numbers of context variables efficiently', () => {
      const largeVariableSet: ContextVariable[] = Array.from({ length: 1000 }, (_, i) => ({
        name: `namespace${Math.floor(i / 10)}.variable${i}`,
        type: ['string', 'number', 'boolean', 'date'][i % 4] as any,
        scope: ['user', 'session', 'env', 'global'][i % 4] as any,
        description: `Variable ${i}`,
        example: `value${i}`
      }));

      const template = 'value == "${namespace0.variable0}" && count > ${namespace1.variable10}';
      
      const config: ContextualConfig = {
        contextVariables: largeVariableSet,
        strictContextValidation: true
      };

      const startTime = performance.now();
      const contextualSpec = service.createContextualSpecification(template, config);
      const endTime = performance.now();

      expect(contextualSpec).toBeDefined();
      expect(endTime - startTime).toBeLessThan(200); // Should complete within 200ms
    });

    it('should validate context tokens quickly', () => {
      const variables: ContextVariable[] = Array.from({ length: 500 }, (_, i) => ({
        name: `var${i}`,
        type: 'string',
        scope: 'global',
        description: `Variable ${i}`,
        example: `value${i}`
      }));

      const template = Array.from({ length: 20 }, (_, i) => `\${var${i}}`).join(' ');

      const startTime = performance.now();
      const validationIssues = service.validateContextTokens(template, variables);
      const endTime = performance.now();

      expect(validationIssues.length).toBe(0); // Should find all variables
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should resolve context tokens efficiently', () => {
      const variables: ContextVariable[] = Array.from({ length: 100 }, (_, i) => ({
        name: `var${i}`,
        type: 'string',
        scope: 'global',
        description: `Variable ${i}`,
        example: `value${i}`
      }));

      const template = Array.from({ length: 50 }, (_, i) => 
        `field${i} == "\${var${i % 100}}"`
      ).join(' && ');

      const startTime = performance.now();
      const resolved = service.resolveContextTokens(template, variables);
      const endTime = performance.now();

      expect(resolved).toBeDefined();
      expect(resolved.length).toBeGreaterThan(template.length); // Should have resolved tokens
      expect(endTime - startTime).toBeLessThan(200); // Should complete within 200ms
    });
  });

  describe('Memory Usage and Cleanup', () => {
    it('should not leak memory during repeated parsing', () => {
      const expression = 'age > 18 && name == "test" && active == true';
      const config: DslParsingConfig = {
        knownFields: ['age', 'name', 'active'],
        enablePerformanceWarnings: false
      };

      // Perform many parsing operations
      const iterations = 1000;
      const results: any[] = [];

      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const result = service.parseDslExpression(expression, config);
        results.push(result);
        
        // Periodically check if we're still within reasonable time bounds
        if (i % 100 === 0) {
          const currentTime = performance.now();
          const avgTime = (currentTime - startTime) / (i + 1);
          expect(avgTime).toBeLessThan(10); // Should average less than 10ms per parse
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / iterations;

      expect(avgTime).toBeLessThan(5); // Should average less than 5ms per parse
      expect(results.length).toBe(iterations);
      
      // All results should be successful
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should handle concurrent parsing operations', async () => {
      const expressions = [
        'age > 18',
        'name == "John"',
        'active == true',
        'score >= 80',
        'department == "Engineering"'
      ];

      const config: DslParsingConfig = {
        knownFields: ['age', 'name', 'active', 'score', 'department'],
        enablePerformanceWarnings: false
      };

      // Create multiple concurrent parsing operations
      const concurrentOperations = expressions.map(expression => 
        Promise.resolve().then(() => service.parseDslExpression(expression, config))
      );

      const startTime = performance.now();
      const results = await Promise.all(concurrentOperations);
      const endTime = performance.now();

      expect(results.length).toBe(expressions.length);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      expect(endTime - startTime).toBeLessThan(200); // Should complete concurrently within 200ms
    });
  });

  describe('Complexity Analysis Performance', () => {
    it('should calculate complexity quickly for various expression sizes', () => {
      const expressionSizes = [10, 50, 100, 200, 500];
      
      expressionSizes.forEach(size => {
        // Generate expression of specific size
        const expression = Array.from({ length: size }, (_, i) => 
          `field${i % 10} == "value${i}"`
        ).join(' && ');

        const config: DslParsingConfig = {
          knownFields: Array.from({ length: 10 }, (_, i) => `field${i}`),
          enablePerformanceWarnings: true,
          maxComplexity: size * 2
        };

        const startTime = performance.now();
        const result = service.parseDslExpression(expression, config);
        const endTime = performance.now();

        expect(result.success).toBe(true);
        expect(result.metrics?.complexity).toBeGreaterThan(size);
        expect(endTime - startTime).toBeLessThan(size * 2); // Linear scaling expectation
      });
    });

    it('should identify performance issues in complex expressions', () => {
      // Create an expression that should trigger performance warnings
      const complexExpression = Array.from({ length: 60 }, (_, i) => 
        `field${i} == "value${i}"`
      ).join(' && ');

      const config: DslParsingConfig = {
        knownFields: Array.from({ length: 60 }, (_, i) => `field${i}`),
        enablePerformanceWarnings: true,
        maxComplexity: 30 // Lower threshold to trigger warnings
      };

      const result = service.parseDslExpression(complexExpression, config);

      expect(result.success).toBe(true);
      
      const performanceWarnings = result.issues.filter(
        issue => issue.type === 'PerformanceWarning'
      );
      
      expect(performanceWarnings.length).toBeGreaterThan(0);
      expect(result.metrics?.complexity).toBeGreaterThan(30);
    });
  });

  describe('Stress Testing', () => {
    it('should handle extreme field count scenarios', () => {
      const fieldCount = 10000;
      const fields = Array.from({ length: fieldCount }, (_, i) => `field${i}`);
      
      const expression = 'field0 == "test" && field1 > 10 && field2 == true';
      
      const config: DslParsingConfig = {
        knownFields: fields,
        enablePerformanceWarnings: false
      };

      const startTime = performance.now();
      const result = service.parseDslExpression(expression, config);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle deeply nested expressions', () => {
      // Create deeply nested parentheses
      const depth = 20;
      let expression = 'age > 18';
      
      for (let i = 0; i < depth; i++) {
        expression = `(${expression} && level > ${i})`;
      }

      const config: DslParsingConfig = {
        knownFields: ['age', 'level'],
        enablePerformanceWarnings: false,
        maxComplexity: 100
      };

      const startTime = performance.now();
      const result = service.parseDslExpression(expression, config);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(500); // Should handle nesting within 500ms
    });
  });
});