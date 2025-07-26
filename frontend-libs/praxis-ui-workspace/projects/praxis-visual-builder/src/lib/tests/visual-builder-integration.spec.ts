import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ExpressionEditorComponent, ContextVariable, DslSuggestion } from '../components/expression-editor.component';
import { ContextVariableManagerComponent, EnhancedContextVariable } from '../components/context-variable-manager.component';
import { SpecificationBridgeService, DslParsingConfig, ContextualConfig } from '../services/specification-bridge.service';

describe('Visual Builder Integration Tests', () => {
  let expressionComponent: ExpressionEditorComponent;
  let variableManagerComponent: ContextVariableManagerComponent;
  let expressionFixture: ComponentFixture<ExpressionEditorComponent>;
  let variableManagerFixture: ComponentFixture<ContextVariableManagerComponent>;
  let bridgeService: SpecificationBridgeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatTabsModule,
        MatExpansionModule,
        MatSnackBarModule,
        MatDialogModule,
        ExpressionEditorComponent,
        ContextVariableManagerComponent
      ],
      providers: [SpecificationBridgeService]
    }).compileComponents();

    expressionFixture = TestBed.createComponent(ExpressionEditorComponent);
    expressionComponent = expressionFixture.componentInstance;

    variableManagerFixture = TestBed.createComponent(ContextVariableManagerComponent);
    variableManagerComponent = variableManagerFixture.componentInstance;

    bridgeService = TestBed.inject(SpecificationBridgeService);
  });

  describe('Expression Editor Integration', () => {
    it('should create expression editor component', () => {
      expect(expressionComponent).toBeTruthy();
    });

    it('should initialize with default field schemas', () => {
      const mockFieldSchemas = [
        { name: 'name', type: 'string', label: 'Name' },
        { name: 'age', type: 'number', label: 'Age' },
        { name: 'active', type: 'boolean', label: 'Active' }
      ];

      expressionComponent.fieldSchemas = mockFieldSchemas;
      expressionFixture.detectChanges();

      expect(expressionComponent.fieldSchemas).toEqual(mockFieldSchemas);
    });

    it('should provide autocomplete suggestions for fields', async () => {
      const mockFieldSchemas = [
        { name: 'firstName', type: 'string', label: 'First Name' },
        { name: 'lastName', type: 'string', label: 'Last Name' },
        { name: 'age', type: 'number', label: 'Age' }
      ];

      expressionComponent.fieldSchemas = mockFieldSchemas;
      expressionComponent.expression = 'first';
      expressionFixture.detectChanges();

      // Trigger autocomplete
      const suggestions = await expressionComponent.getSuggestions('first', 5);
      
      expect(suggestions).toBeDefined();
      const fieldSuggestions = suggestions.filter(s => s.type === 'field');
      expect(fieldSuggestions.length).toBeGreaterThan(0);
      expect(fieldSuggestions.some(s => s.text === 'firstName')).toBe(true);
    });

    it('should validate expressions in real-time', async () => {
      expressionComponent.fieldSchemas = [
        { name: 'age', type: 'number', label: 'Age' }
      ];
      expressionComponent.expression = 'age > 18';
      expressionFixture.detectChanges();

      // Wait for validation
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(expressionComponent.validationResult).toBeDefined();
      expect(expressionComponent.validationResult.isValid).toBe(true);
    });

    it('should detect validation errors', async () => {
      expressionComponent.fieldSchemas = [
        { name: 'age', type: 'number', label: 'Age' }
      ];
      expressionComponent.expression = 'age >'; // Invalid expression
      expressionFixture.detectChanges();

      // Wait for validation
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(expressionComponent.validationResult).toBeDefined();
      expect(expressionComponent.validationResult.isValid).toBe(false);
      expect(expressionComponent.validationResult.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Context Variable Manager Integration', () => {
    it('should create context variable manager component', () => {
      expect(variableManagerComponent).toBeTruthy();
    });

    it('should manage context variables by scope', () => {
      const testVariables: EnhancedContextVariable[] = [
        {
          id: '1',
          name: 'user.name',
          type: 'string',
          scope: 'user',
          description: 'User name',
          example: 'John Doe'
        },
        {
          id: '2',
          name: 'session.id',
          type: 'string',
          scope: 'session',
          description: 'Session ID',
          example: 'sess_123'
        }
      ];

      variableManagerComponent.contextVariables = testVariables;
      variableManagerFixture.detectChanges();

      expect(variableManagerComponent.contextVariables).toEqual(testVariables);
      
      // Test scope filtering
      const userVariables = variableManagerComponent.getVariablesByScope('user');
      expect(userVariables.length).toBe(1);
      expect(userVariables[0].name).toBe('user.name');
    });

    it('should add new context variables', () => {
      const initialCount = variableManagerComponent.contextVariables.length;
      
      const newVariable: Partial<EnhancedContextVariable> = {
        name: 'global.version',
        type: 'string',
        scope: 'global',
        description: 'Application version',
        example: '1.0.0'
      };

      variableManagerComponent.addVariable(newVariable);
      variableManagerFixture.detectChanges();

      expect(variableManagerComponent.contextVariables.length).toBe(initialCount + 1);
      const addedVariable = variableManagerComponent.contextVariables.find(v => v.name === 'global.version');
      expect(addedVariable).toBeDefined();
      expect(addedVariable!.id).toBeDefined();
    });

    it('should validate variable names', () => {
      const validNames = ['user.name', 'session.id', 'env.debug', 'global.version'];
      const invalidNames = ['', 'invalid name', '123invalid', 'user.'];

      validNames.forEach(name => {
        expect(variableManagerComponent.isValidVariableName(name)).toBe(true);
      });

      invalidNames.forEach(name => {
        expect(variableManagerComponent.isValidVariableName(name)).toBe(false);
      });
    });
  });

  describe('Bridge Service Integration', () => {
    it('should integrate expression editor with bridge service', async () => {
      // Setup expression editor
      expressionComponent.fieldSchemas = [
        { name: 'age', type: 'number', label: 'Age' },
        { name: 'status', type: 'string', label: 'Status' }
      ];
      expressionComponent.expression = 'age > 18 && status == "active"';
      expressionFixture.detectChanges();

      // Wait for validation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Test bridge service integration
      const config: DslParsingConfig = {
        knownFields: ['age', 'status'],
        enablePerformanceWarnings: true
      };

      const parseResult = bridgeService.parseDslExpression(expressionComponent.expression, config);
      expect(parseResult.success).toBe(true);
      expect(parseResult.specification).toBeDefined();

      // Validate round-trip
      const roundTripResult = bridgeService.validateExpressionRoundTrip(expressionComponent.expression, config);
      expect(roundTripResult.success).toBe(true);
    });

    it('should integrate context variables with contextual specifications', () => {
      // Setup context variables
      const contextVariables: ContextVariable[] = [
        { name: 'user.age', type: 'number', scope: 'user', example: '25' },
        { name: 'user.role', type: 'string', scope: 'user', example: 'admin' }
      ];

      variableManagerComponent.contextVariables = contextVariables.map((cv, index) => ({
        ...cv,
        id: `${index + 1}`,
        description: `Test variable ${cv.name}`
      }));

      // Test contextual specification creation
      const template = 'age > ${user.age} && role == "${user.role}"';
      const config: ContextualConfig = {
        contextVariables,
        strictContextValidation: true
      };

      const contextualSpec = bridgeService.createContextualSpecification(template, config);
      expect(contextualSpec).toBeDefined();

      // Test token extraction and validation
      const tokens = bridgeService.extractContextTokens(template);
      expect(tokens).toContain('user.age');
      expect(tokens).toContain('user.role');

      const validationIssues = bridgeService.validateContextTokens(template, contextVariables);
      const errors = validationIssues.filter(issue => issue.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });

  describe('End-to-End Workflows', () => {
    it('should complete full expression creation workflow', async () => {
      // 1. Setup field schemas
      const fieldSchemas = [
        { name: 'firstName', type: 'string', label: 'First Name' },
        { name: 'lastName', type: 'string', label: 'Last Name' },
        { name: 'age', type: 'number', label: 'Age' },
        { name: 'department', type: 'string', label: 'Department' },
        { name: 'active', type: 'boolean', label: 'Active' }
      ];

      expressionComponent.fieldSchemas = fieldSchemas;
      expressionFixture.detectChanges();

      // 2. Create complex expression
      const expression = '(age >= 18 && age <= 65) && active == true && contains(department, "Engineering")';
      expressionComponent.expression = expression;
      expressionFixture.detectChanges();

      // 3. Wait for validation
      await new Promise(resolve => setTimeout(resolve, 200));

      // 4. Verify validation passed
      expect(expressionComponent.validationResult).toBeDefined();
      expect(expressionComponent.validationResult.isValid).toBe(true);

      // 5. Test autocomplete works
      const suggestions = await expressionComponent.getSuggestions('age', 0);
      expect(suggestions.some(s => s.text === 'age')).toBe(true);

      // 6. Convert to specification via bridge service
      const config: DslParsingConfig = {
        knownFields: fieldSchemas.map(fs => fs.name),
        enablePerformanceWarnings: true,
        maxComplexity: 30
      };

      const parseResult = bridgeService.parseDslExpression(expression, config);
      expect(parseResult.success).toBe(true);
      expect(parseResult.specification).toBeDefined();

      // 7. Validate round-trip integrity
      const roundTripResult = bridgeService.validateExpressionRoundTrip(expression, config);
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toEqual([]);
    });

    it('should complete full contextual specification workflow', async () => {
      // 1. Setup context variables
      const contextVariables: EnhancedContextVariable[] = [
        {
          id: '1',
          name: 'user.department',
          type: 'string',
          scope: 'user',
          description: 'User department',
          example: 'Engineering',
          category: 'User Info'
        },
        {
          id: '2',
          name: 'user.level',
          type: 'number',
          scope: 'user',
          description: 'User level',
          example: '5',
          category: 'User Info'
        },
        {
          id: '3',
          name: 'policy.minLevel',
          type: 'number',
          scope: 'global',
          description: 'Minimum required level',
          example: '3',
          category: 'Policies'
        }
      ];

      variableManagerComponent.contextVariables = contextVariables;
      variableManagerFixture.detectChanges();

      // 2. Create contextual expression
      const template = 'department == "${user.department}" && level >= ${user.level} && level >= ${policy.minLevel}';
      
      // 3. Setup expression editor with contextual support
      expressionComponent.contextVariables = contextVariables;
      expressionComponent.expression = template;
      expressionFixture.detectChanges();

      // 4. Test context variable suggestions
      const contextSuggestions = await expressionComponent.getContextVariableSuggestions('user');
      expect(contextSuggestions.length).toBeGreaterThan(0);
      expect(contextSuggestions.some(s => s.text === 'user.department')).toBe(true);

      // 5. Validate template with bridge service
      const plainContextVariables: ContextVariable[] = contextVariables.map(cv => ({
        name: cv.name,
        type: cv.type,
        scope: cv.scope,
        description: cv.description,
        example: cv.example
      }));

      const tokens = bridgeService.extractContextTokens(template);
      expect(tokens.length).toBe(3);

      const validationIssues = bridgeService.validateContextTokens(template, plainContextVariables);
      const errors = validationIssues.filter(issue => issue.severity === 'error');
      expect(errors.length).toBe(0);

      // 6. Create contextual specification
      const config: ContextualConfig = {
        contextVariables: plainContextVariables,
        strictContextValidation: true
      };

      const contextualSpec = bridgeService.createContextualSpecification(template, config);
      expect(contextualSpec).toBeDefined();

      // 7. Test token resolution
      const resolvedTemplate = bridgeService.resolveContextTokens(template, plainContextVariables);
      expect(resolvedTemplate).toContain('Engineering');
      expect(resolvedTemplate).toContain('5');
      expect(resolvedTemplate).toContain('3');

      // 8. Verify round-trip
      const reconstructedTemplate = bridgeService.contextualSpecificationToDsl(contextualSpec);
      expect(reconstructedTemplate).toBe(template);
    });

    it('should handle error scenarios gracefully', async () => {
      // 1. Test invalid expression
      expressionComponent.expression = 'invalid && expression >>';
      expressionFixture.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(expressionComponent.validationResult.isValid).toBe(false);
      expect(expressionComponent.validationResult.issues.length).toBeGreaterThan(0);

      // 2. Test missing context variables
      const templateWithMissingVars = 'name == "${missing.variable}"';
      const contextVariables: ContextVariable[] = [
        { name: 'existing.variable', type: 'string', scope: 'global', example: 'test' }
      ];

      const validationIssues = bridgeService.validateContextTokens(templateWithMissingVars, contextVariables);
      const warnings = validationIssues.filter(issue => issue.severity === 'warning');
      expect(warnings.length).toBeGreaterThan(0);

      // 3. Test bridge service error handling
      const config: DslParsingConfig = {
        knownFields: ['known'],
        enablePerformanceWarnings: true
      };

      const roundTripResult = bridgeService.validateExpressionRoundTrip('invalid >', config);
      expect(roundTripResult.success).toBe(false);
      expect(roundTripResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large numbers of field schemas efficiently', async () => {
      // Create a large number of field schemas
      const largeFieldSchemas = Array.from({ length: 1000 }, (_, i) => ({
        name: `field${i}`,
        type: 'string',
        label: `Field ${i}`
      }));

      expressionComponent.fieldSchemas = largeFieldSchemas;
      expressionFixture.detectChanges();

      const startTime = performance.now();
      const suggestions = await expressionComponent.getSuggestions('field1', 0);
      const endTime = performance.now();

      expect(suggestions.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle large numbers of context variables efficiently', () => {
      // Create a large number of context variables
      const largeContextVariables: EnhancedContextVariable[] = Array.from({ length: 500 }, (_, i) => ({
        id: `${i}`,
        name: `namespace${Math.floor(i / 10)}.variable${i}`,
        type: 'string',
        scope: ['user', 'session', 'env', 'global'][i % 4] as any,
        description: `Test variable ${i}`,
        example: `value${i}`
      }));

      variableManagerComponent.contextVariables = largeContextVariables;
      variableManagerFixture.detectChanges();

      const startTime = performance.now();
      const userVariables = variableManagerComponent.getVariablesByScope('user');
      const endTime = performance.now();

      expect(userVariables.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should validate complex expressions efficiently', async () => {
      // Create a moderately complex expression
      const complexExpression = Array.from({ length: 10 }, (_, i) => 
        `field${i} == "value${i}"`
      ).join(' && ');

      expressionComponent.fieldSchemas = Array.from({ length: 10 }, (_, i) => ({
        name: `field${i}`,
        type: 'string',
        label: `Field ${i}`
      }));

      const startTime = performance.now();
      expressionComponent.expression = complexExpression;
      expressionFixture.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 200));
      const endTime = performance.now();

      expect(expressionComponent.validationResult.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});