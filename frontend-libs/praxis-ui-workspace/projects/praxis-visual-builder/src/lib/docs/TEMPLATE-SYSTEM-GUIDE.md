# Template System Guide

## Overview

The Template System in `praxis-visual-builder` provides a comprehensive solution for creating, managing, and reusing rule patterns. This system allows users to save complex rule configurations as templates, organize them in a searchable gallery, and apply them across different contexts.

## Architecture

The template system consists of several key components:

### Core Services
- **RuleTemplateService**: Manages template CRUD operations, search, and statistics
- **SpecificationBridgeService**: Handles conversion between visual rules and specification DSL

### UI Components
- **TemplateGalleryComponent**: Main interface for browsing, searching, and managing templates
- **TemplateEditorDialogComponent**: Multi-step dialog for creating and editing templates
- **TemplatePreviewDialogComponent**: Preview interface showing template structure and metadata

### Data Models
- **RuleTemplate**: Core template model with metadata and rule nodes
- **TemplateMetadata**: Extended metadata for tracking usage and authorship
- **TemplateSearchCriteria**: Search and filtering configuration

## Getting Started

### 1. Basic Setup

```typescript
import { 
  RuleTemplateService, 
  TemplateGalleryComponent,
  TemplateEditorDialogComponent
} from 'praxis-visual-builder';

@Component({
  selector: 'app-rule-builder',
  template: `
    <praxis-template-gallery
      [availableFields]="fieldNames"
      (templateApplied)="onTemplateApplied($event)"
      (templateCreated)="onTemplateCreated($event)">
    </praxis-template-gallery>
  `
})
export class RuleBuilderComponent {
  fieldNames = ['email', 'firstName', 'lastName', 'age'];
  
  onTemplateApplied(template: RuleTemplate) {
    console.log('Template applied:', template);
    // Apply template nodes to your rule builder
  }
  
  onTemplateCreated(template: RuleTemplate) {
    console.log('Template created:', template);
    // Handle new template creation
  }
}
```

### 2. Creating Templates

#### From Visual Rules
```typescript
// Convert existing rule nodes to a template
createTemplateFromRules(selectedNodes: RuleNode[]) {
  this.templateService.createTemplate(
    'My Custom Template',
    'Description of what this template does',
    'validation', // category
    selectedNodes,
    selectedNodes.map(n => n.id), // root nodes
    ['custom', 'validation'], // tags
    ['email', 'firstName'] // required fields
  ).subscribe(template => {
    console.log('Template created:', template);
  });
}
```

#### Using the Editor Dialog
```typescript
openTemplateEditor(nodes?: RuleNode[]) {
  const dialogData: TemplateEditorDialogData = {
    mode: 'create',
    selectedNodes: nodes || [],
    availableCategories: ['validation', 'business', 'custom']
  };

  const dialogRef = this.dialog.open(TemplateEditorDialogComponent, {
    width: '800px',
    data: dialogData
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.action === 'save') {
      console.log('Template saved:', result.template);
    }
  });
}
```

### 3. Template Categories

The system supports the following built-in categories:

- **validation**: Field validation and format checking
- **business**: Business logic and rules
- **collection**: Array and collection validation
- **conditional**: Conditional logic and branching
- **workflow**: Workflow and process validation
- **security**: Security and access control
- **custom**: User-created custom templates

### 4. Template Metadata

Templates include comprehensive metadata:

```typescript
interface TemplateMetadata {
  createdAt?: Date;
  updatedAt?: Date;
  lastUsed?: Date;
  version?: string;
  usageCount?: number;
  complexity?: 'simple' | 'medium' | 'complex';
  author?: {
    name?: string;
    email?: string;
    organization?: string;
  };
  metrics?: {
    nodeCount?: number;
    maxDepth?: number;
    fieldCount?: number;
  };
}
```

## Advanced Features

### 1. Template Search and Filtering

```typescript
// Search templates by various criteria
const searchCriteria: TemplateSearchCriteria = {
  query: 'email validation',
  category: 'validation',
  tags: ['email', 'required'],
  complexity: 'simple',
  dateRange: {
    from: new Date('2024-01-01'),
    to: new Date('2024-12-31')
  }
};

this.templateService.searchTemplates(searchCriteria).subscribe(results => {
  console.log('Search results:', results);
});
```

### 2. Template Variables

Templates support variables for dynamic field references:

```typescript
// Template with variables
const templateNode: RuleNode = {
  id: 'dynamic-validation',
  type: 'fieldCondition',
  config: {
    fieldName: '{{fieldName}}', // Will be replaced when applied
    operator: 'isNotEmpty',
    value: '{{defaultValue}}' // Will be replaced when applied
  }
};
```

### 3. Import/Export

#### Export Templates
```typescript
exportTemplate(templateId: string) {
  this.templateService.exportTemplate(templateId, {
    format: 'json',
    prettyPrint: true,
    includeMetadata: true
  }).subscribe(jsonData => {
    // Download or save the JSON data
    this.downloadFile(jsonData, 'template.json');
  });
}
```

#### Import Templates
```typescript
importTemplate(jsonData: string) {
  this.templateService.importTemplate(jsonData).subscribe(
    template => {
      console.log('Template imported:', template);
    },
    error => {
      console.error('Import failed:', error);
    }
  );
}
```

### 4. Template Validation

```typescript
validateTemplate(template: RuleTemplate) {
  const availableFields = ['email', 'firstName', 'lastName'];
  const validation = this.templateService.validateTemplate(template, availableFields);
  
  if (!validation.isValid) {
    console.error('Template validation errors:', validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Template warnings:', validation.warnings);
  }
  
  if (validation.missingFields.length > 0) {
    console.warn('Missing required fields:', validation.missingFields);
  }
}
```

### 5. Template Application

```typescript
applyTemplate(templateId: string) {
  this.templateService.applyTemplate(templateId).subscribe(result => {
    if (result.success) {
      console.log('Applied nodes:', result.appliedNodes);
      console.log('Modified node IDs:', result.modifiedNodeIds);
      
      // Add nodes to your rule builder
      result.appliedNodes.forEach(node => {
        this.addNodeToBuilder(node);
      });
    } else {
      console.error('Application failed:', result.errors);
    }
  });
}
```

## Integration with Specification Bridge

The template system integrates seamlessly with the specification bridge service for DSL conversion:

### Converting Templates to DSL

```typescript
convertTemplateToSpecification(template: RuleTemplate) {
  template.nodes.forEach(node => {
    try {
      // Convert to specification
      const spec = this.bridgeService.ruleNodeToSpecification(node);
      
      // Export to DSL
      const dsl = this.bridgeService.exportToDsl(node);
      
      console.log('Node DSL:', dsl);
    } catch (error) {
      console.error('Conversion failed:', error);
    }
  });
}
```

### Round-trip Validation

```typescript
validateTemplateRoundTrip(template: RuleTemplate) {
  template.nodes.forEach(node => {
    const validation = this.bridgeService.validateRoundTrip(node);
    
    if (!validation.success) {
      console.error('Round-trip validation failed:', validation.errors);
    }
    
    if (validation.warnings.length > 0) {
      console.warn('Round-trip warnings:', validation.warnings);
    }
  });
}
```

## UI Components Usage

### Template Gallery Component

```typescript
<praxis-template-gallery
  [availableFields]="fieldNames"
  (templateApplied)="onTemplateApplied($event)"
  (templateCreated)="onTemplateCreated($event)"
  (templateDeleted)="onTemplateDeleted($event)">
</praxis-template-gallery>
```

**Properties:**
- `availableFields`: Array of field names available in the current context
- `templateApplied`: Event emitted when a template is applied
- `templateCreated`: Event emitted when a new template is created
- `templateDeleted`: Event emitted when a template is deleted

**Features:**
- Grid, list, and compact view modes
- Real-time search and filtering
- Tag-based categorization
- Template preview and editing
- Import/export functionality
- Usage statistics

### Template Editor Dialog

```typescript
const dialogData: TemplateEditorDialogData = {
  mode: 'create' | 'edit',
  template?: RuleTemplate, // Required for edit mode
  selectedNodes?: RuleNode[], // For create mode
  availableCategories?: string[]
};

const dialogRef = this.dialog.open(TemplateEditorDialogComponent, {
  width: '800px',
  data: dialogData
});
```

**Features:**
- Multi-step creation/editing wizard
- Basic information (name, description, category)
- Rule configuration and preview
- Advanced options (metadata, author info)
- Template variable detection
- Required fields specification

### Template Preview Dialog

```typescript
const dialogRef = this.dialog.open(TemplatePreviewDialogComponent, {
  width: '600px',
  data: { template: myTemplate }
});
```

**Features:**
- Template structure visualization
- Metadata display
- Node hierarchy tree
- Configuration preview
- Apply and export actions

## Best Practices

### 1. Template Design

- **Keep templates focused**: Each template should solve a specific validation or business rule pattern
- **Use descriptive names**: Template names should clearly indicate their purpose
- **Add comprehensive descriptions**: Include use cases and examples
- **Categorize appropriately**: Use appropriate categories for better organization

### 2. Template Variables

- **Use meaningful variable names**: `{{fieldName}}` is better than `{{field1}}`
- **Document required variables**: Include variable documentation in the template description
- **Provide examples**: Show how variables should be replaced

### 3. Metadata Management

- **Include authorship information**: Help users understand template provenance
- **Version your templates**: Use semantic versioning for template updates
- **Add usage examples**: Include code snippets or configuration examples

### 4. Performance Considerations

- **Limit template size**: Large templates with many nodes may impact performance
- **Use caching**: The service includes built-in caching for better performance
- **Batch operations**: When applying multiple templates, consider batching

## Error Handling

### Common Errors and Solutions

#### Template Validation Errors

```typescript
// Missing required fields
{
  isValid: false,
  errors: ['Template must contain at least one rule node'],
  warnings: ['Missing required fields: email, firstName'],
  missingFields: ['email', 'firstName']
}
```

**Solution**: Ensure all required fields are available in the target context.

#### Import/Export Errors

```typescript
// Invalid JSON format
{
  error: 'Import failed: Invalid template format: missing template data'
}
```

**Solution**: Verify the JSON structure matches the expected template export format.

#### Application Errors

```typescript
// Template application failure
{
  success: false,
  appliedNodes: [],
  errors: ['Field "email" not found in available fields'],
  warnings: [],
  modifiedNodeIds: []
}
```

**Solution**: Ensure all template dependencies are satisfied in the target context.

## Migration Guide

### From Manual Rule Creation

If you're currently creating rules manually and want to migrate to templates:

1. **Identify Common Patterns**: Look for recurring rule patterns in your application
2. **Create Base Templates**: Convert these patterns into templates
3. **Categorize Templates**: Organize templates by purpose and complexity
4. **Train Users**: Provide training on template usage and benefits

### Version Compatibility

When upgrading the template system:

1. **Export Existing Templates**: Always export templates before upgrading
2. **Test Import**: Verify templates import correctly after upgrade
3. **Update Code**: Review breaking changes in component APIs
4. **Validate Functionality**: Test template application and conversion

## Troubleshooting

### Common Issues

#### Templates Not Loading
- Check service injection and dependencies
- Verify localStorage permissions
- Review browser console for errors

#### Template Application Fails
- Validate required fields are available
- Check template node structure
- Verify specification bridge service is working

#### Export/Import Issues
- Confirm JSON format is correct
- Check for circular references in template data
- Verify metadata structure

### Debug Mode

Enable debug logging for detailed information:

```typescript
// Enable template service debugging
localStorage.setItem('praxis-template-debug', 'true');
```

## API Reference

### RuleTemplateService

```typescript
class RuleTemplateService {
  // Template CRUD
  createTemplate(name, description, category, nodes, rootNodes, tags?, requiredFields?): Observable<RuleTemplate>
  updateTemplate(id, updates): Observable<RuleTemplate>
  deleteTemplate(id): Observable<boolean>
  getTemplate(id): Observable<RuleTemplate | null>
  getTemplates(): Observable<RuleTemplate[]>
  
  // Search and filtering
  searchTemplates(criteria): Observable<RuleTemplate[]>
  getTemplatesByCategory(categoryId): Observable<RuleTemplate[]>
  
  // Template operations
  duplicateTemplate(id, newName?): Observable<RuleTemplate>
  applyTemplate(templateId, targetBuilderState?): Observable<TemplateApplicationResult>
  validateTemplate(template, availableFields?): TemplateValidationResult
  
  // Import/export
  exportTemplate(id, options?): Observable<string>
  importTemplate(jsonData, options?): Observable<RuleTemplate>
  
  // Statistics and categories
  getTemplateStats(): Observable<TemplateStats>
  getCategories(): Observable<TemplateCategory[]>
}
```

### Component Events

```typescript
// TemplateGalleryComponent
@Output() templateApplied = new EventEmitter<RuleTemplate>();
@Output() templateCreated = new EventEmitter<RuleTemplate>();
@Output() templateDeleted = new EventEmitter<string>();

// Template editor result
interface TemplateEditorResult {
  action: 'save' | 'cancel';
  template?: RuleTemplate;
}
```

This comprehensive template system provides a powerful foundation for creating reusable rule patterns that can significantly improve development efficiency and consistency across your applications.