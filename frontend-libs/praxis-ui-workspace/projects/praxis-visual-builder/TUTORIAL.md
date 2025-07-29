# Praxis Visual Builder Tutorial

A step-by-step tutorial to get you started with the Praxis Visual Builder library and mini-DSL.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Expression Editor](#basic-expression-editor)
3. [Working with Context Variables](#working-with-context-variables)
4. [Building Complex Rules](#building-complex-rules)
5. [Integration Scenarios](#integration-scenarios)
6. [Advanced Features](#advanced-features)
7. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- Angular 15+ application
- Node.js 16+ and npm 8+
- Basic knowledge of TypeScript and Angular

### Installation

1. **Install the library:**
   ```bash
   npm install praxis-visual-builder praxis-specification
   ```

2. **Import required modules in your Angular module:**
   ```typescript
   import { NgModule } from '@angular/core';
   import { BrowserModule } from '@angular/platform-browser';
   import { ReactiveFormsModule } from '@angular/forms';
   import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

   // Import Praxis Visual Builder
   import { ExpressionEditorComponent, ContextVariableManagerComponent } from 'praxis-visual-builder';

   @NgModule({
     imports: [
       BrowserModule,
       ReactiveFormsModule,
       BrowserAnimationsModule,
       ExpressionEditorComponent,    // Standalone component
       ContextVariableManagerComponent  // Standalone component
     ],
     // ... rest of your module
   })
   export class AppModule { }
   ```

3. **Add Material Design theme (if not already added):**
   ```scss
   // In your styles.scss
   @import '~@angular/material/theming';
   @include mat-core();

   $primary: mat-palette($mat-indigo);
   $accent: mat-palette($mat-pink, A200, A100, A400);
   $warn: mat-palette($mat-red);

   $theme: mat-light-theme((
     color: (
       primary: $primary,
       accent: $accent,
       warn: $warn,
     )
   ));

   @include angular-material-theme($theme);
   ```

## Basic Expression Editor

### Step 1: Create Your First Expression Editor

Let's start with a simple component that uses the expression editor:

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { ExpressionValidationResult } from 'praxis-visual-builder';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>My First Rule Builder</h1>
      
      <praxis-expression-editor
        [fieldSchemas]="fieldSchemas"
        [(expression)]="expression"
        (validationChange)="onValidationChange($event)">
      </praxis-expression-editor>

      <div class="result-panel">
        <h3>Current Expression:</h3>
        <pre>{{ expression || 'No expression yet...' }}</pre>
        
        <h3>Validation Result:</h3>
        <div [class]="validationResult?.isValid ? 'valid' : 'invalid'">
          Status: {{ validationResult?.isValid ? 'Valid' : 'Invalid' }}
        </div>
        
        <div *ngIf="validationResult?.issues?.length">
          <h4>Issues:</h4>
          <ul>
            <li *ngFor="let issue of validationResult.issues" 
                [class]="'issue-' + issue.severity">
              {{ issue.message }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
    }
    
    .result-panel {
      margin-top: 2rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .valid {
      color: green;
      font-weight: bold;
    }
    
    .invalid {
      color: red;
      font-weight: bold;
    }
    
    .issue-error {
      color: red;
    }
    
    .issue-warning {
      color: orange;
    }
    
    .issue-info {
      color: blue;
    }
    
    pre {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
  `]
})
export class AppComponent {
  expression = '';
  validationResult: ExpressionValidationResult | null = null;

  // Define the fields available for use in expressions
  fieldSchemas = [
    { name: 'age', type: 'number', label: 'Age', description: 'User age in years' },
    { name: 'name', type: 'string', label: 'Full Name', description: 'User full name' },
    { name: 'email', type: 'string', label: 'Email', description: 'User email address' },
    { name: 'active', type: 'boolean', label: 'Active', description: 'Whether user is active' },
    { name: 'role', type: 'string', label: 'Role', description: 'User role in system' },
    { name: 'lastLogin', type: 'date', label: 'Last Login', description: 'Last login timestamp' },
    { name: 'score', type: 'number', label: 'Score', description: 'User score (0-100)' }
  ];

  onValidationChange(result: ExpressionValidationResult) {
    this.validationResult = result;
    console.log('Expression validation result:', result);
  }
}
```

### Step 2: Test Basic Expressions

Now try typing these expressions in the editor:

1. **Simple comparison:**
   ```dsl
   age > 18
   ```

2. **String comparison:**
   ```dsl
   name == "John Doe"
   ```

3. **Boolean check:**
   ```dsl
   active == true
   ```

4. **Multiple conditions:**
   ```dsl
   age >= 21 && active == true
   ```

5. **Complex logic:**
   ```dsl
   (age >= 18 && age <= 65) && (role == "admin" || role == "moderator")
   ```

### Step 3: Explore Autocomplete

The expression editor provides intelligent autocomplete. Try typing:

- `a` - You'll see field suggestions starting with 'a' (like 'age', 'active')
- `age >` - You'll see operator suggestions
- `contains(` - You'll see function parameter hints

## Working with Context Variables

### Step 4: Add Context Variable Management

Now let's add context variables to make our rules more dynamic:

```typescript
// Update your component
import { Component } from '@angular/core';
import { 
  ExpressionValidationResult, 
  ContextVariable, 
  EnhancedContextVariable 
} from 'praxis-visual-builder';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>Rule Builder with Context Variables</h1>
      
      <!-- Context Variable Manager -->
      <mat-card class="variable-manager">
        <mat-card-header>
          <mat-card-title>Context Variables</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <praxis-context-variable-manager
            [(contextVariables)]="contextVariables"
            [allowedScopes]="allowedScopes"
            (variableAdd)="onVariableAdd($event)"
            (variableUpdate)="onVariableUpdate($event)">
          </praxis-context-variable-manager>
        </mat-card-content>
      </mat-card>

      <!-- Expression Editor -->
      <mat-card class="expression-editor">
        <mat-card-header>
          <mat-card-title>Rule Expression</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <praxis-expression-editor
            [fieldSchemas]="fieldSchemas"
            [contextVariables]="contextVariables"
            [(expression)]="expression"
            (validationChange)="onValidationChange($event)">
          </praxis-expression-editor>
        </mat-card-content>
      </mat-card>

      <!-- Results -->
      <mat-card class="results">
        <mat-card-header>
          <mat-card-title>Results</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="result-section">
            <h3>Current Expression:</h3>
            <pre>{{ expression || 'No expression yet...' }}</pre>
          </div>
          
          <div class="result-section">
            <h3>Validation:</h3>
            <div [class]="validationResult?.isValid ? 'status-valid' : 'status-invalid'">
              {{ validationResult?.isValid ? '✓ Valid' : '✗ Invalid' }}
            </div>
            
            <div *ngIf="validationResult?.issues?.length" class="issues">
              <h4>Issues:</h4>
              <mat-list>
                <mat-list-item *ngFor="let issue of validationResult.issues"
                               [class]="'issue-' + issue.severity">
                  <mat-icon matListIcon>
                    {{ issue.severity === 'error' ? 'error' : 
                       issue.severity === 'warning' ? 'warning' : 'info' }}
                  </mat-icon>
                  <span matLine>{{ issue.message }}</span>
                  <span matLine *ngIf="issue.suggestion" class="suggestion">
                    {{ issue.suggestion }}
                  </span>
                </mat-list-item>
              </mat-list>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 1rem;
    }
    
    mat-card {
      margin-bottom: 2rem;
    }
    
    .result-section {
      margin-bottom: 1.5rem;
    }
    
    .status-valid {
      color: green;
      font-weight: bold;
      font-size: 1.1em;
    }
    
    .status-invalid {
      color: red;
      font-weight: bold;
      font-size: 1.1em;
    }
    
    .issues {
      margin-top: 1rem;
    }
    
    .issue-error {
      color: red;
    }
    
    .issue-warning {
      color: orange;
    }
    
    .issue-info {
      color: blue;
    }
    
    .suggestion {
      font-style: italic;
      color: #666;
    }
    
    pre {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
    }
  `]
})
export class AppComponent {
  expression = '';
  validationResult: ExpressionValidationResult | null = null;
  contextVariables: EnhancedContextVariable[] = [];

  allowedScopes = ['user', 'session', 'env', 'global'];

  fieldSchemas = [
    { name: 'age', type: 'number', label: 'Age' },
    { name: 'name', type: 'string', label: 'Full Name' },
    { name: 'email', type: 'string', label: 'Email' },
    { name: 'active', type: 'boolean', label: 'Active' },
    { name: 'role', type: 'string', label: 'Role' },
    { name: 'department', type: 'string', label: 'Department' },
    { name: 'score', type: 'number', label: 'Score' }
  ];

  constructor() {
    // Initialize with some example context variables
    this.contextVariables = [
      {
        id: '1',
        name: 'user.minAge',
        type: 'number',
        scope: 'user',
        description: 'Minimum age requirement for user',
        example: '18',
        category: 'User Validation'
      },
      {
        id: '2',
        name: 'user.department',
        type: 'string',
        scope: 'user',
        description: 'User department',
        example: 'Engineering',
        category: 'User Info'
      },
      {
        id: '3',
        name: 'policy.maxScore',
        type: 'number',
        scope: 'global',
        description: 'Maximum allowed score',
        example: '100',
        category: 'Business Rules'
      }
    ];
  }

  onValidationChange(result: ExpressionValidationResult) {
    this.validationResult = result;
  }

  onVariableAdd(variable: EnhancedContextVariable) {
    console.log('Variable added:', variable);
  }

  onVariableUpdate(variable: EnhancedContextVariable) {
    console.log('Variable updated:', variable);
  }
}
```

### Step 5: Test Context Variables

Now try expressions that use context variables:

1. **Simple context variable:**
   ```dsl
   age > ${user.minAge}
   ```

2. **String context variable:**
   ```dsl
   department == "${user.department}"
   ```

3. **Mixed context and fields:**
   ```dsl
   age >= ${user.minAge} && score <= ${policy.maxScore}
   ```

4. **Complex context logic:**
   ```dsl
   (department == "${user.department}" || role == "admin") && score > 50
   ```

## Building Complex Rules

### Step 6: Advanced Rule Building

Let's create a more sophisticated example with a real business scenario:

```typescript
@Component({
  selector: 'app-advanced-rules',
  template: `
    <div class="advanced-container">
      <h1>Employee Access Control Rules</h1>
      
      <mat-tab-group>
        <!-- Rule Builder Tab -->
        <mat-tab label="Rule Builder">
          <div class="tab-content">
            <praxis-expression-editor
              [fieldSchemas]="employeeFields"
              [contextVariables]="contextVariables"
              [(expression)]="accessRule"
              (validationChange)="onValidationChange($event)"
              placeholder="Build your employee access rule...">
            </praxis-expression-editor>
          </div>
        </mat-tab>

        <!-- Variables Tab -->
        <mat-tab label="Context Variables">
          <div class="tab-content">
            <praxis-context-variable-manager
              [(contextVariables)]="contextVariables"
              [allowedScopes]="['user', 'session', 'env', 'global']">
            </praxis-context-variable-manager>
          </div>
        </mat-tab>

        <!-- Test Data Tab -->
        <mat-tab label="Test Data">
          <div class="tab-content">
            <h3>Test Employee Data:</h3>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Employee JSON</mat-label>
              <textarea matInput 
                        [(ngModel)]="testEmployeeJson" 
                        rows="10"
                        placeholder="Enter employee data in JSON format...">
              </textarea>
            </mat-form-field>
            
            <button mat-raised-button color="primary" (click)="testRule()">
              Test Rule
            </button>
            
            <div *ngIf="testResult" class="test-result">
              <h4>Test Result:</h4>
              <div [class]="testResult.passed ? 'test-passed' : 'test-failed'">
                {{ testResult.passed ? '✓ Access Granted' : '✗ Access Denied' }}
              </div>
              <div *ngIf="testResult.details" class="test-details">
                {{ testResult.details }}
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- Examples Tab -->
        <mat-tab label="Examples">
          <div class="tab-content">
            <h3>Example Rules:</h3>
            <mat-list>
              <mat-list-item *ngFor="let example of exampleRules">
                <div matLine>
                  <strong>{{ example.name }}</strong>
                </div>
                <div matLine class="example-description">
                  {{ example.description }}
                </div>
                <div matLine class="example-rule">
                  <code>{{ example.rule }}</code>
                </div>
                <button mat-button (click)="loadExample(example.rule)">
                  Load Example
                </button>
              </mat-list-item>
            </mat-list>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Current Rule Display -->
      <mat-card class="current-rule">
        <mat-card-header>
          <mat-card-title>Current Access Rule</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <pre>{{ accessRule || 'No rule defined yet...' }}</pre>
          <div class="validation-status">
            <span [class]="validationResult?.isValid ? 'valid' : 'invalid'">
              {{ validationResult?.isValid ? '✓ Valid Rule' : '✗ Invalid Rule' }}
            </span>
            <span *ngIf="validationResult?.metrics" class="complexity">
              Complexity: {{ validationResult.metrics.complexity }}
            </span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .advanced-container {
      max-width: 1400px;
      margin: 2rem auto;
      padding: 1rem;
    }
    
    .tab-content {
      padding: 2rem;
    }
    
    .full-width {
      width: 100%;
    }
    
    .test-result {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    
    .test-passed {
      color: green;
      font-weight: bold;
    }
    
    .test-failed {
      color: red;
      font-weight: bold;
    }
    
    .test-details {
      margin-top: 0.5rem;
      font-size: 0.9em;
      color: #666;
    }
    
    .example-description {
      color: #666;
      font-size: 0.9em;
    }
    
    .example-rule {
      font-family: monospace;
      background: #f5f5f5;
      padding: 0.5rem;
      margin: 0.5rem 0;
      border-radius: 4px;
    }
    
    .current-rule {
      margin-top: 2rem;
    }
    
    .validation-status {
      margin-top: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .valid {
      color: green;
      font-weight: bold;
    }
    
    .invalid {
      color: red;
      font-weight: bold;
    }
    
    .complexity {
      font-size: 0.9em;
      color: #666;
    }
  `]
})
export class AdvancedRulesComponent {
  accessRule = '';
  validationResult: ExpressionValidationResult | null = null;
  testResult: any = null;

  testEmployeeJson = `{
  "name": "John Doe",
  "age": 28,
  "email": "john.doe@company.com",
  "active": true,
  "role": "developer",
  "department": "Engineering",
  "level": 3,
  "yearsOfService": 2,
  "clearanceLevel": "standard",
  "lastLogin": "2023-12-01T10:30:00Z"
}`;

  employeeFields = [
    { name: 'name', type: 'string', label: 'Full Name' },
    { name: 'age', type: 'number', label: 'Age' },
    { name: 'email', type: 'string', label: 'Email' },
    { name: 'active', type: 'boolean', label: 'Active Status' },
    { name: 'role', type: 'string', label: 'Job Role' },
    { name: 'department', type: 'string', label: 'Department' },
    { name: 'level', type: 'number', label: 'Job Level (1-5)' },
    { name: 'yearsOfService', type: 'number', label: 'Years of Service' },
    { name: 'clearanceLevel', type: 'string', label: 'Security Clearance' },
    { name: 'lastLogin', type: 'date', label: 'Last Login Date' }
  ];

  contextVariables: EnhancedContextVariable[] = [
    {
      id: '1',
      name: 'policy.minAge',
      type: 'number',
      scope: 'global',
      description: 'Minimum age for system access',
      example: '18',
      category: 'Security Policies'
    },
    {
      id: '2',
      name: 'policy.allowedDepartments',
      type: 'array',
      scope: 'global',
      description: 'Departments with system access',
      example: '["Engineering", "Product", "Design"]',
      category: 'Security Policies'
    },
    {
      id: '3',
      name: 'security.maxInactiveDays',
      type: 'number',
      scope: 'global',
      description: 'Maximum days since last login',
      example: '90',
      category: 'Security Policies'
    },
    {
      id: '4',
      name: 'user.permissions',
      type: 'array',
      scope: 'user',
      description: 'User-specific permissions',
      example: '["read", "write", "admin"]',
      category: 'User Access'
    }
  ];

  exampleRules = [
    {
      name: 'Basic Employee Access',
      description: 'Active employees over 18 with valid departments',
      rule: 'active == true && age >= ${policy.minAge} && department in ${policy.allowedDepartments}'
    },
    {
      name: 'Senior Developer Access',
      description: 'Senior developers with elevated privileges',
      rule: 'role == "developer" && level >= 3 && yearsOfService >= 2 && clearanceLevel in ["standard", "elevated"]'
    },
    {
      name: 'Admin Access Control',
      description: 'Admin access with strict requirements',
      rule: '(role == "admin" || "admin" in ${user.permissions}) && active == true && clearanceLevel == "elevated"'
    },
    {
      name: 'Temporary Access',
      description: 'Temporary access for contractors',
      rule: 'role == "contractor" && active == true && dateDiff(now(), lastLogin, "days") <= ${security.maxInactiveDays}'
    },
    {
      name: 'Department Manager Access',
      description: 'Department managers with team oversight',
      rule: 'role in ["manager", "director"] && department in ${policy.allowedDepartments} && level >= 4'
    }
  ];

  onValidationChange(result: ExpressionValidationResult) {
    this.validationResult = result;
  }

  loadExample(rule: string) {
    this.accessRule = rule;
  }

  testRule() {
    if (!this.accessRule || !this.validationResult?.isValid) {
      this.testResult = {
        passed: false,
        details: 'Cannot test invalid rule'
      };
      return;
    }

    try {
      const employee = JSON.parse(this.testEmployeeJson);
      
      // This is a simplified test - in a real implementation,
      // you would use the SpecificationBridgeService to evaluate the rule
      const result = this.evaluateRuleAgainstEmployee(this.accessRule, employee);
      
      this.testResult = {
        passed: result,
        details: result ? 
          'Employee meets all access criteria' : 
          'Employee does not meet access criteria'
      };
    } catch (error) {
      this.testResult = {
        passed: false,
        details: 'Invalid employee JSON data'
      };
    }
  }

  private evaluateRuleAgainstEmployee(rule: string, employee: any): boolean {
    // Simplified evaluation for demo purposes
    // In real implementation, use SpecificationBridgeService
    
    // Check some basic conditions
    if (rule.includes('active == true') && !employee.active) {
      return false;
    }
    
    if (rule.includes('age >= 18') && employee.age < 18) {
      return false;
    }
    
    // Add more evaluation logic as needed
    return true;
  }
}
```

## Integration Scenarios

### Step 7: Form Integration

Here's how to integrate the rule builder with reactive forms:

```typescript
@Component({
  selector: 'app-rule-form',
  template: `
    <form [formGroup]="ruleForm" (ngSubmit)="onSubmit()">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create Business Rule</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Rule Metadata -->
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Rule Name</mat-label>
              <input matInput formControlName="name" required>
              <mat-error *ngIf="ruleForm.get('name')?.hasError('required')">
                Rule name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="validation">Validation</mat-option>
                <mat-option value="access-control">Access Control</mat-option>
                <mat-option value="business-logic">Business Logic</mat-option>
                <mat-option value="compliance">Compliance</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <!-- Rule Expression -->
          <div class="rule-section">
            <h3>Rule Expression</h3>
            <praxis-expression-editor
              formControlName="expression"
              [fieldSchemas]="fieldSchemas"
              [contextVariables]="contextVariables"
              (validationChange)="onExpressionValidation($event)">
            </praxis-expression-editor>
          </div>

          <!-- Rule Settings -->
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Priority</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="low">Low</mat-option>
                <mat-option value="medium">Medium</mat-option>
                <mat-option value="high">High</mat-option>
                <mat-option value="critical">Critical</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-checkbox formControlName="enabled">
              Rule Enabled
            </mat-checkbox>
          </div>

          <!-- Generated Rule Preview -->
          <div class="preview-section">
            <h3>Generated Rule</h3>
            <pre>{{ generatedRule | json }}</pre>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <button mat-raised-button 
                  type="submit" 
                  color="primary"
                  [disabled]="!ruleForm.valid || !isExpressionValid">
            Save Rule
          </button>
          
          <button mat-button type="button" (click)="resetForm()">
            Reset
          </button>
          
          <button mat-button type="button" (click)="validateRule()">
            Validate
          </button>
        </mat-card-actions>
      </mat-card>
    </form>
  `,
  styles: [`
    .form-row {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .full-width {
      width: 100%;
    }
    
    .rule-section {
      margin: 2rem 0;
    }
    
    .preview-section {
      margin-top: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 4px;
    }
    
    pre {
      font-size: 0.9em;
      max-height: 300px;
      overflow-y: auto;
    }
  `]
})
export class RuleFormComponent {
  ruleForm: FormGroup;
  isExpressionValid = false;
  expressionValidation: ExpressionValidationResult | null = null;

  fieldSchemas = [
    // Your field schemas here
  ];

  contextVariables: EnhancedContextVariable[] = [
    // Your context variables here
  ];

  constructor(
    private fb: FormBuilder,
    private bridgeService: SpecificationBridgeService
  ) {
    this.ruleForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: ['validation', Validators.required],
      expression: ['', Validators.required],
      priority: ['medium'],
      enabled: [true]
    });
  }

  get generatedRule() {
    const formValue = this.ruleForm.value;
    if (!formValue.expression || !this.isExpressionValid) {
      return null;
    }

    const parseResult = this.bridgeService.parseDslExpression(
      formValue.expression,
      {
        knownFields: this.fieldSchemas.map(f => f.name),
        enablePerformanceWarnings: true
      }
    );

    return {
      metadata: {
        name: formValue.name,
        description: formValue.description,
        category: formValue.category,
        priority: formValue.priority,
        enabled: formValue.enabled,
        createdAt: new Date().toISOString()
      },
      expression: formValue.expression,
      specification: parseResult.specification?.toJSON(),
      metrics: parseResult.metrics
    };
  }

  onExpressionValidation(result: ExpressionValidationResult) {
    this.expressionValidation = result;
    this.isExpressionValid = result.isValid;
    
    // Update form validation
    const expressionControl = this.ruleForm.get('expression');
    if (result.isValid) {
      expressionControl?.setErrors(null);
    } else {
      expressionControl?.setErrors({ invalidExpression: true });
    }
  }

  validateRule() {
    const expression = this.ruleForm.get('expression')?.value;
    if (!expression) {
      return;
    }

    const roundTripResult = this.bridgeService.validateExpressionRoundTrip(
      expression,
      {
        knownFields: this.fieldSchemas.map(f => f.name),
        enablePerformanceWarnings: true
      }
    );

    console.log('Round-trip validation result:', roundTripResult);
  }

  onSubmit() {
    if (this.ruleForm.valid && this.isExpressionValid) {
      const rule = this.generatedRule;
      console.log('Saving rule:', rule);
      
      // Here you would save the rule to your backend
      // this.ruleService.saveRule(rule).subscribe(...)
    }
  }

  resetForm() {
    this.ruleForm.reset({
      priority: 'medium',
      enabled: true,
      category: 'validation'
    });
    this.isExpressionValid = false;
  }
}
```

### Step 8: Real-time Collaboration

For real-time collaboration scenarios:

```typescript
@Component({
  selector: 'app-collaborative-editor',
  template: `
    <div class="collaborative-container">
      <div class="collaboration-header">
        <h2>Collaborative Rule Editor</h2>
        <div class="collaborators">
          <mat-chip-list>
            <mat-chip *ngFor="let user of activeUsers" [color]="'primary'">
              <mat-icon matChipAvatar>person</mat-icon>
              {{ user.name }}
            </mat-chip>
          </mat-chip-list>
        </div>
      </div>

      <praxis-expression-editor
        [expression]="sharedExpression"
        [fieldSchemas]="fieldSchemas"
        [contextVariables]="contextVariables"
        (expressionChange)="onExpressionChange($event)"
        (cursorPositionChange)="onCursorChange($event)">
      </praxis-expression-editor>

      <div class="activity-feed">
        <h3>Recent Activity</h3>
        <mat-list>
          <mat-list-item *ngFor="let activity of recentActivity">
            <mat-icon matListIcon>{{ activity.icon }}</mat-icon>
            <div matLine>{{ activity.user }} {{ activity.action }}</div>
            <div matLine class="timestamp">{{ activity.timestamp | date:'short' }}</div>
          </mat-list-item>
        </mat-list>
      </div>
    </div>
  `,
  styles: [`
    .collaborative-container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 1rem;
    }
    
    .collaboration-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .activity-feed {
      margin-top: 2rem;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .timestamp {
      font-size: 0.8em;
      color: #666;
    }
  `]
})
export class CollaborativeEditorComponent implements OnInit, OnDestroy {
  sharedExpression = '';
  activeUsers: any[] = [];
  recentActivity: any[] = [];

  constructor(
    private websocketService: WebSocketService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Connect to collaborative session
    this.websocketService.connect('rule-editor-session-123');
    
    // Listen for expression changes from other users
    this.websocketService.onExpressionChange().subscribe(change => {
      if (change.userId !== this.authService.currentUser.id) {
        this.sharedExpression = change.expression;
        this.addActivity(change.userName, 'updated the expression', 'edit');
      }
    });

    // Listen for user presence updates
    this.websocketService.onUserPresence().subscribe(users => {
      this.activeUsers = users;
    });
  }

  onExpressionChange(expression: string) {
    // Debounce and broadcast changes
    this.debouncedBroadcast(expression);
  }

  private debouncedBroadcast = debounce((expression: string) => {
    this.websocketService.broadcastExpressionChange({
      expression,
      userId: this.authService.currentUser.id,
      userName: this.authService.currentUser.name,
      timestamp: new Date()
    });
  }, 500);

  private addActivity(user: string, action: string, icon: string) {
    this.recentActivity.unshift({
      user,
      action,
      icon,
      timestamp: new Date()
    });
    
    // Keep only last 10 activities
    this.recentActivity = this.recentActivity.slice(0, 10);
  }

  ngOnDestroy() {
    this.websocketService.disconnect();
  }
}
```

## Advanced Features

### Step 9: Custom Functions

Add custom functions for domain-specific logic:

```typescript
@Injectable()
export class CustomFunctionService {
  
  createBusinessFunctionRegistry(): FunctionRegistry<any> {
    const registry = new FunctionRegistry();

    // Email validation function
    registry.register('isValidEmail', {
      name: 'isValidEmail',
      arity: 1,
      implementation: (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      description: 'Validates email format'
    });

    // Business hours check
    registry.register('isBusinessHours', {
      name: 'isBusinessHours',
      arity: 1,
      implementation: (datetime: Date) => {
        const hour = datetime.getHours();
        const day = datetime.getDay();
        return day >= 1 && day <= 5 && hour >= 9 && hour <= 17;
      },
      description: 'Checks if datetime is within business hours (9-5, Mon-Fri)'
    });

    // Credit score validation
    registry.register('isGoodCreditScore', {
      name: 'isGoodCreditScore',
      arity: 1,
      implementation: (score: number) => {
        return score >= 650;
      },
      description: 'Checks if credit score is considered good (>=650)'
    });

    // Age group classification
    registry.register('getAgeGroup', {
      name: 'getAgeGroup',
      arity: 1,
      implementation: (age: number) => {
        if (age < 18) return 'minor';
        if (age < 30) return 'young-adult';
        if (age < 50) return 'adult';
        if (age < 65) return 'middle-aged';
        return 'senior';
      },
      description: 'Classifies age into groups'
    });

    return registry;
  }
}

// Usage in component
@Component({
  // ... component definition
})
export class CustomFunctionComponent {
  functionRegistry: FunctionRegistry<any>;

  constructor(private customFunctions: CustomFunctionService) {
    this.functionRegistry = this.customFunctions.createBusinessFunctionRegistry();
  }

  // Example expressions using custom functions:
  exampleExpressions = [
    'isValidEmail(email) && active == true',
    'isBusinessHours(lastLogin) && role == "employee"',
    'isGoodCreditScore(creditScore) && income > 50000',
    'getAgeGroup(age) in ["adult", "middle-aged"] && experience > 5'
  ];
}
```

### Step 10: Performance Monitoring

Add performance monitoring and optimization:

```typescript
@Component({
  selector: 'app-performance-monitor',
  template: `
    <div class="performance-container">
      <h2>Rule Performance Monitor</h2>
      
      <mat-card class="metrics-card">
        <mat-card-header>
          <mat-card-title>Performance Metrics</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="metrics-grid">
            <div class="metric">
              <span class="metric-label">Parse Time</span>
              <span class="metric-value">{{ performanceMetrics.parseTime | number:'1.2-2' }}ms</span>
            </div>
            <div class="metric">
              <span class="metric-label">Complexity</span>
              <span class="metric-value" [class]="getComplexityClass()">
                {{ performanceMetrics.complexity }}
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">Memory Usage</span>
              <span class="metric-value">{{ performanceMetrics.memoryUsage }}KB</span>
            </div>
            <div class="metric">
              <span class="metric-label">Validation Time</span>
              <span class="metric-value">{{ performanceMetrics.validationTime | number:'1.2-2' }}ms</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <praxis-expression-editor
        [expression]="monitoredExpression"
        [fieldSchemas]="fieldSchemas"
        [contextVariables]="contextVariables"
        (expressionChange)="onExpressionChange($event)"
        (validationChange)="onValidationChange($event)">
      </praxis-expression-editor>

      <mat-card class="optimization-suggestions" *ngIf="optimizationSuggestions.length">
        <mat-card-header>
          <mat-card-title>Optimization Suggestions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item *ngFor="let suggestion of optimizationSuggestions">
              <mat-icon matListIcon color="warn">lightbulb</mat-icon>
              <div matLine>{{ suggestion.message }}</div>
              <div matLine class="suggestion-detail">{{ suggestion.detail }}</div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .performance-container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 1rem;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .metric {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .metric-label {
      font-size: 0.9em;
      color: #666;
      margin-bottom: 0.5rem;
    }
    
    .metric-value {
      font-size: 1.5em;
      font-weight: bold;
    }
    
    .complexity-low {
      color: green;
    }
    
    .complexity-medium {
      color: orange;
    }
    
    .complexity-high {
      color: red;
    }
    
    .suggestion-detail {
      font-size: 0.9em;
      color: #666;
    }
    
    .optimization-suggestions {
      margin-top: 2rem;
    }
  `]
})
export class PerformanceMonitorComponent {
  monitoredExpression = '';
  
  performanceMetrics = {
    parseTime: 0,
    complexity: 0,
    memoryUsage: 0,
    validationTime: 0
  };

  optimizationSuggestions: any[] = [];

  constructor(private bridgeService: SpecificationBridgeService) {}

  onExpressionChange(expression: string) {
    this.monitoredExpression = expression;
    this.measurePerformance(expression);
  }

  onValidationChange(result: ExpressionValidationResult) {
    if (result.metrics) {
      this.performanceMetrics.parseTime = result.metrics.parseTime;
      this.performanceMetrics.complexity = result.metrics.complexity;
      this.performanceMetrics.validationTime = performance.now() - this.startTime;
    }

    this.generateOptimizationSuggestions(result);
  }

  private measurePerformance(expression: string) {
    this.startTime = performance.now();
    
    // Measure memory usage (simplified)
    const beforeMemory = this.getMemoryUsage();
    
    // Parse expression
    const parseResult = this.bridgeService.parseDslExpression(expression, {
      knownFields: this.fieldSchemas.map(f => f.name),
      enablePerformanceWarnings: true
    });

    const afterMemory = this.getMemoryUsage();
    this.performanceMetrics.memoryUsage = afterMemory - beforeMemory;
  }

  private getMemoryUsage(): number {
    // Simplified memory measurement
    if (performance.memory) {
      return performance.memory.usedJSHeapSize / 1024; // Convert to KB
    }
    return 0;
  }

  private generateOptimizationSuggestions(result: ExpressionValidationResult) {
    this.optimizationSuggestions = [];

    if (result.metrics?.complexity > 50) {
      this.optimizationSuggestions.push({
        message: 'High complexity detected',
        detail: 'Consider breaking this expression into smaller, reusable parts'
      });
    }

    if (this.performanceMetrics.parseTime > 100) {
      this.optimizationSuggestions.push({
        message: 'Slow parsing performance',
        detail: 'Simplify the expression or reduce nested operations'
      });
    }

    if (this.monitoredExpression.includes('forEach') && this.monitoredExpression.length > 200) {
      this.optimizationSuggestions.push({
        message: 'Potentially expensive forEach operation',
        detail: 'Consider using filter or other array operations for better performance'
      });
    }
  }

  getComplexityClass(): string {
    const complexity = this.performanceMetrics.complexity;
    if (complexity < 20) return 'complexity-low';
    if (complexity < 50) return 'complexity-medium';
    return 'complexity-high';
  }

  private startTime: number = 0;
  
  // Add your field schemas and context variables here
  fieldSchemas = [
    // ... your fields
  ];
  
  contextVariables = [
    // ... your variables
  ];
}
```

## Best Practices

### Guidelines for Effective Rule Building

1. **Start Simple**: Begin with basic expressions and gradually add complexity
2. **Use Descriptive Names**: Choose clear field names and context variable names
3. **Break Down Complex Logic**: Split complex rules into smaller, manageable parts
4. **Test Thoroughly**: Always test rules with real data before deployment
5. **Monitor Performance**: Keep an eye on expression complexity and parsing time
6. **Document Rules**: Add descriptions and comments to explain business logic
7. **Version Control**: Track changes to rules over time
8. **Use Context Variables**: Avoid hardcoding values; use context variables for flexibility

### Common Pitfalls to Avoid

1. **Over-complex Expressions**: Keep expressions readable and maintainable
2. **Hardcoded Values**: Use context variables instead of hardcoded constants
3. **Ignoring Performance**: Monitor complexity and optimize when needed
4. **Poor Testing**: Always validate rules with comprehensive test data
5. **Inconsistent Naming**: Use consistent naming conventions throughout
6. **Missing Documentation**: Document the business logic behind each rule

This tutorial covers the fundamental concepts and advanced features of the Praxis Visual Builder. Continue experimenting with different combinations of fields, operators, functions, and context variables to build powerful, flexible rules for your applications.