# Praxis Visual Builder

A comprehensive Angular library for building visual rule editors with support for mini-DSL expressions and contextual specifications.

## Features

### 🎯 **Core Components**
- **ExpressionEditorComponent**: Advanced DSL expression editor with syntax highlighting and autocomplete
- **ContextVariableManagerComponent**: Complete context variable management system
- **SpecificationBridgeService**: Bidirectional conversion between visual rules and DSL expressions

### ⚡ **Advanced Capabilities**
- **Mini-DSL Support**: Full DSL parsing, validation, and round-trip conversion
- **Context Variables**: Dynamic variable resolution with scoped contexts
- **Real-time Validation**: Live syntax checking with performance metrics
- **Autocomplete**: Intelligent suggestions for fields, functions, operators, and variables
- **Round-trip Integrity**: Seamless conversion between visual and textual representations

## Installation

```bash
npm install praxis-visual-builder
```

## Quick Start

### Basic Expression Editor

```typescript
import { ExpressionEditorComponent } from 'praxis-visual-builder';

@Component({
  template: `
    <praxis-expression-editor
      [fieldSchemas]="fieldSchemas"
      [contextVariables]="contextVariables"
      [(expression)]="expression"
      (validationChange)="onValidationChange($event)">
    </praxis-expression-editor>
  `
})
export class MyComponent {
  fieldSchemas = [
    { name: 'age', type: 'number', label: 'Age' },
    { name: 'name', type: 'string', label: 'Name' },
    { name: 'active', type: 'boolean', label: 'Active' }
  ];

  contextVariables = [
    { name: 'user.minAge', type: 'number', scope: 'user', example: '18' }
  ];

  expression = 'age > ${user.minAge} && active == true';

  onValidationChange(result: ExpressionValidationResult) {
    console.log('Expression valid:', result.isValid);
    console.log('Issues:', result.issues);
  }
}
```

### Context Variable Management

```typescript
import { ContextVariableManagerComponent } from 'praxis-visual-builder';

@Component({
  template: `
    <praxis-context-variable-manager
      [(contextVariables)]="contextVariables"
      [allowedScopes]="allowedScopes"
      (variableAdd)="onVariableAdd($event)"
      (variableUpdate)="onVariableUpdate($event)">
    </praxis-context-variable-manager>
  `
})
export class VariableManagementComponent {
  contextVariables: EnhancedContextVariable[] = [];
  allowedScopes = ['user', 'session', 'global'];

  onVariableAdd(variable: EnhancedContextVariable) {
    console.log('New variable added:', variable);
  }
}
```

## Mini-DSL Language Guide

### Basic Syntax

The mini-DSL supports a rich expression language for building validation rules and conditions.

#### Field References
```dsl
age > 18
name == "John Doe"
active == true
score >= 80
```

#### Context Variables
Context variables are referenced using `${scope.variable}` syntax:
```dsl
age > ${user.minAge}
department == "${user.department}"
level >= ${policy.requiredLevel}
```

#### Operators

**Comparison Operators:**
```dsl
age == 25        # Equality
age != 30        # Inequality
age > 18         # Greater than
age >= 21        # Greater than or equal
age < 65         # Less than
age <= 64        # Less than or equal
```

**Logical Operators:**
```dsl
age > 18 && active == true           # AND
priority == "high" || urgent == true # OR
!(deleted == true)                   # NOT
status == "A" ^ backup == true       # XOR (exclusive or)
qualified == true => approved == true # IMPLIES
```

**Membership Operators:**
```dsl
category in ["tech", "science", "math"]     # IN (array membership)
role not in ["guest", "anonymous"]          # NOT IN
```

**Null Checks:**
```dsl
description != null      # Not null
optional == null        # Is null
```

#### Functions

**String Functions:**
```dsl
contains(tags, "important")           # Check if string/array contains value
startsWith(email, "admin")           # Check if string starts with value
endsWith(filename, ".pdf")           # Check if string ends with value
length(description) > 10             # Get string/array length
upper(category) == "TECHNOLOGY"      # Convert to uppercase
lower(name) == "john"               # Convert to lowercase
```

**Collection Functions:**
```dsl
atLeast(2, [condition1, condition2, condition3])  # At least N conditions true
exactly(1, [optionA, optionB, optionC])          # Exactly N conditions true
forEach(items, itemCondition)                     # All items satisfy condition
uniqueBy(collection, ["field1", "field2"])       # Unique by specified fields
minLength(array, 3)                              # Minimum array length
maxLength(array, 10)                             # Maximum array length
```

**Conditional Functions:**
```dsl
requiredIf(field, condition)         # Field required if condition true
visibleIf(field, condition)          # Field visible if condition true
disabledIf(field, condition)         # Field disabled if condition true
readonlyIf(field, condition)         # Field readonly if condition true
```

**Optional Handling:**
```dsl
ifDefined(optionalField, condition)   # Apply condition only if field defined
ifNotNull(field, condition)          # Apply condition only if field not null
ifExists(field, condition)           # Apply condition only if field exists
withDefault(field, defaultValue, condition) # Use default if field undefined
```

### Complex Expressions

#### Nested Conditions
```dsl
((age >= 18 && age <= 65) || experience > 10) && 
(department == "Engineering" || department == "Product") && 
!(archived == true || deleted == true)
```

#### Mixed Context and Fields
```dsl
salary >= ${policy.minSalary} && 
salary <= ${policy.maxSalary} && 
location in ${user.allowedLocations} &&
startDate >= "${session.currentDate}"
```

#### Function Composition
```dsl
contains(upper(department), "ENG") && 
length(trim(description)) > ${config.minDescLength} &&
endsWith(lower(email), "@company.com")
```

### Context Variables

Context variables provide dynamic values that can be resolved at runtime based on different scopes.

#### Scopes

**User Scope** (`user.*`):
- User-specific values (preferences, profile data)
- Example: `${user.department}`, `${user.role}`, `${user.level}`

**Session Scope** (`session.*`):
- Session-specific values (temporary data, current state)
- Example: `${session.currentDate}`, `${session.userId}`, `${session.locale}`

**Environment Scope** (`env.*`):
- Environment configuration (debug flags, feature toggles)
- Example: `${env.debug}`, `${env.features.newUI}`, `${env.apiVersion}`

**Global Scope** (`global.*`):
- Application-wide constants (policies, configurations)
- Example: `${global.minAge}`, `${global.maxFileSize}`, `${global.supportedFormats}`

#### Variable Types

**String Variables:**
```dsl
name == "${user.fullName}"
department == "${user.department}"
```

**Number Variables:**
```dsl
age > ${user.minAge}
salary >= ${policy.baseSalary}
```

**Boolean Variables:**
```dsl
active == ${user.isActive}
debug == ${env.debugMode}
```

**Array Variables:**
```dsl
category in ${user.allowedCategories}
format in ${global.supportedFormats}
```

**Date Variables:**
```dsl
createdDate >= "${session.startDate}"
expirationDate <= "${policy.maxExpirationDate}"
```

### Validation and Error Handling

#### Syntax Errors
The DSL parser provides detailed error messages for syntax issues:

```typescript
// Invalid syntax examples and their error messages:

// "age >" -> "Missing operand after comparison operator"
// "age >> 18" -> "Unknown operator '>>'"
// "(age > 18" -> "Unclosed parentheses"
// "unknownFunc(age)" -> "Unknown function 'unknownFunc'"
```

#### Field Validation
```typescript
// Unknown field warnings:
// "unknownField == 'test'" -> "Unknown field: unknownField. Did you mean 'knownField'?"
```

#### Context Variable Validation
```typescript
// Missing context variable warnings:
// "age > ${missing.variable}" -> "Unknown context variable: missing.variable"
// With suggestions: "Did you mean 'existing.variable'?"
```

#### Performance Warnings
```typescript
// Complex expression warnings:
// For expressions with >50 operators: 
// "Expression complexity is high (67 operators). Consider breaking into smaller expressions."
```

## API Reference

### ExpressionEditorComponent

#### Inputs
```typescript
@Input() expression: string = '';                    // Current DSL expression
@Input() fieldSchemas: FieldSchema[] = [];          // Available fields for autocomplete
@Input() contextVariables: ContextVariable[] = [];   // Available context variables
@Input() functionRegistry?: FunctionRegistry;        // Custom function registry
@Input() validationConfig?: ValidationConfig;        // Validation configuration
@Input() editorOptions?: EditorOptions;             // Editor display options
```

#### Outputs
```typescript
@Output() expressionChange = new EventEmitter<string>();              // Expression changes
@Output() validationChange = new EventEmitter<ExpressionValidationResult>(); // Validation updates
@Output() suggestionRequest = new EventEmitter<SuggestionContext>();  // Autocomplete requests
@Output() focusChange = new EventEmitter<boolean>();                  // Focus state changes
```

#### Methods
```typescript
// Get autocomplete suggestions
getSuggestions(text: string, position: number): Promise<DslSuggestion[]>

// Validate current expression
validateExpression(): Promise<ExpressionValidationResult>

// Insert text at cursor position
insertTextAtCursor(text: string): void

// Format expression
formatExpression(): void

// Clear expression
clearExpression(): void
```

### ContextVariableManagerComponent

#### Inputs
```typescript
@Input() contextVariables: EnhancedContextVariable[] = [];  // Current variables
@Input() allowedScopes: ContextScope[] = [];               // Allowed variable scopes
@Input() readOnly: boolean = false;                        // Read-only mode
@Input() showCategories: boolean = true;                   // Show category grouping
@Input() allowImportExport: boolean = true;               // Enable import/export
```

#### Outputs
```typescript
@Output() contextVariablesChange = new EventEmitter<EnhancedContextVariable[]>(); // Variables updated
@Output() variableAdd = new EventEmitter<EnhancedContextVariable>();             // Variable added
@Output() variableUpdate = new EventEmitter<EnhancedContextVariable>();          // Variable updated
@Output() variableDelete = new EventEmitter<string>();                          // Variable deleted
@Output() importComplete = new EventEmitter<ImportResult>();                    // Import completed
```

#### Methods
```typescript
// Add new variable
addVariable(variable: Partial<EnhancedContextVariable>): void

// Update existing variable
updateVariable(id: string, updates: Partial<EnhancedContextVariable>): void

// Delete variable
deleteVariable(id: string): void

// Get variables by scope
getVariablesByScope(scope: string): EnhancedContextVariable[]

// Export variables
exportVariables(format: 'json' | 'csv'): string

// Import variables
importVariables(data: string, format: 'json' | 'csv'): Promise<ImportResult>

// Validate variable name
isValidVariableName(name: string): boolean
```

### SpecificationBridgeService

#### DSL Expression Methods
```typescript
// Parse DSL expression to specification
parseDslExpression<T>(expression: string, config?: DslParsingConfig): DslParsingResult<T>

// Validate expression round-trip integrity
validateExpressionRoundTrip<T>(expression: string, config?: DslParsingConfig): RoundTripResult

// Create contextual specification
createContextualSpecification<T>(template: string, config?: ContextualConfig): ContextualSpecification<T>

// Resolve context tokens in template
resolveContextTokens(template: string, variables: ContextVariable[]): string

// Extract context tokens from template
extractContextTokens(template: string): string[]

// Validate context tokens
validateContextTokens(template: string, variables: ContextVariable[]): ValidationIssue[]
```

#### Rule Node Conversion Methods
```typescript
// Convert rule node to specification
ruleNodeToSpecification<T>(node: RuleNode): Specification<T>

// Convert specification to rule node
specificationToRuleNode<T>(spec: Specification<T>): RuleNode

// Export rule node to DSL
exportToDsl<T>(node: RuleNode, options?: ExportOptions): string

// Validate round-trip through rule nodes
validateRoundTrip<T>(node: RuleNode): RoundTripValidationResult
```

#### Context Provider Methods
```typescript
// Update context provider
updateContextProvider(provider: ContextProvider): void

// Get current context provider
getContextProvider(): ContextProvider | undefined
```

## Advanced Usage

### Custom Function Registry

```typescript
import { FunctionRegistry } from 'praxis-specification';

// Create custom function registry
const customRegistry = new FunctionRegistry();

// Register custom functions
customRegistry.register('isEmail', {
  name: 'isEmail',
  arity: 1,
  implementation: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  description: 'Validates email format'
});

customRegistry.register('dateAdd', {
  name: 'dateAdd',
  arity: 3,
  implementation: (date: Date, amount: number, unit: string) => {
    // Implementation for date arithmetic
  },
  description: 'Adds time to a date'
});

// Use in expression editor
<praxis-expression-editor
  [functionRegistry]="customRegistry"
  expression="isEmail(userEmail) && dateAdd(startDate, 30, 'days') > now()">
</praxis-expression-editor>
```

### Custom Context Provider

```typescript
import { ContextProvider } from 'praxis-specification';

class DatabaseContextProvider implements ContextProvider {
  private cache = new Map<string, any>();

  async getValue(key: string): Promise<any> {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Fetch from database or API
    const value = await this.fetchFromDatabase(key);
    this.cache.set(key, value);
    return value;
  }

  hasValue(key: string): boolean {
    return this.cache.has(key) || this.isValidKey(key);
  }

  setValue(key: string, value: any): void {
    this.cache.set(key, value);
  }

  // ... other methods
}

// Use custom provider
const provider = new DatabaseContextProvider();
this.bridgeService.updateContextProvider(provider);
```

### Integration with Form Builders

```typescript
@Component({
  template: `
    <form [formGroup]="ruleForm">
      <!-- Visual Rule Builder -->
      <praxis-expression-editor
        formControlName="expression"
        [fieldSchemas]="formFieldSchemas"
        [contextVariables]="availableVariables">
      </praxis-expression-editor>

      <!-- Context Variable Management -->
      <praxis-context-variable-manager
        [(contextVariables)]="availableVariables"
        [allowedScopes]="['user', 'session']">
      </praxis-context-variable-manager>

      <!-- Generated Rule Preview -->
      <pre>{{ generatedRule | json }}</pre>
    </form>
  `
})
export class RuleBuilderFormComponent {
  ruleForm = this.fb.group({
    expression: ['', Validators.required],
    metadata: this.fb.group({
      name: ['', Validators.required],
      description: [''],
      priority: [1]
    })
  });

  get generatedRule() {
    const expression = this.ruleForm.get('expression')?.value;
    if (!expression) return null;

    const parseResult = this.bridgeService.parseDslExpression(expression, {
      knownFields: this.formFieldSchemas.map(f => f.name)
    });

    return parseResult.success ? parseResult.specification?.toJSON() : null;
  }
}
```

## Performance Guidelines

### Optimization Tips

1. **Field Schema Management**:
   ```typescript
   // ✅ Good: Reuse field schema objects
   const fieldSchemas = useMemo(() => 
     fields.map(f => ({ name: f.name, type: f.type, label: f.label })), 
     [fields]
   );

   // ❌ Avoid: Creating new objects on every render
   const fieldSchemas = fields.map(f => ({ name: f.name, type: f.type }));
   ```

2. **Expression Validation**:
   ```typescript
   // ✅ Good: Debounce validation
   const debouncedValidation = useMemo(
     () => debounce(validateExpression, 300),
     []
   );

   // ❌ Avoid: Validating on every keystroke
   onChange={(expr) => validateExpression(expr)}
   ```

## Building

To build the library, run:

```bash
ng build praxis-visual-builder
```

This command will compile your project, and the build artifacts will be placed in the `dist/` directory.

### Publishing the Library

Once the project is built, you can publish your library by following these steps:

1. Navigate to the `dist` directory:
   ```bash
   cd dist/praxis-visual-builder
   ```

2. Run the `npm publish` command to publish your library to the npm registry:
   ```bash
   npm publish
   ```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test praxis-visual-builder
```

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.