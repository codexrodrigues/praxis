import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { 
  RuleTemplate, 
  RuleNode, 
  RuleBuilderState,
  ExportOptions,
  ImportOptions 
} from '../models/rule-builder.model';
import { SpecificationBridgeService } from './specification-bridge.service';

/**
 * Template category for organization
 */
export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  templates: RuleTemplate[];
}

/**
 * Template search criteria
 */
export interface TemplateSearchCriteria {
  query?: string;
  category?: string;
  tags?: string[];
  nodeTypes?: string[];
  complexity?: 'simple' | 'medium' | 'complex';
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

/**
 * Template validation result
 */
export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFields?: string[];
  incompatibleFeatures?: string[];
}

/**
 * Template application result
 */
export interface TemplateApplicationResult {
  success: boolean;
  appliedNodes: RuleNode[];
  errors: string[];
  warnings: string[];
  modifiedNodeIds: string[];
}

/**
 * Template statistics
 */
export interface TemplateStats {
  totalTemplates: number;
  categoriesCount: number;
  mostUsedTemplate?: RuleTemplate;
  recentlyUsed: RuleTemplate[];
  popularTags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RuleTemplateService {
  private readonly STORAGE_KEY = 'praxis-rule-templates';
  private readonly VERSION_KEY = 'praxis-template-version';
  private readonly CURRENT_VERSION = '1.0.0';

  private templatesSubject = new BehaviorSubject<RuleTemplate[]>([]);
  private categoriesSubject = new BehaviorSubject<TemplateCategory[]>([]);
  private recentlyUsedSubject = new BehaviorSubject<RuleTemplate[]>([]);

  templates$ = this.templatesSubject.asObservable();
  categories$ = this.categoriesSubject.asObservable();
  recentlyUsed$ = this.recentlyUsedSubject.asObservable();

  constructor(private bridgeService: SpecificationBridgeService) {
    this.loadTemplatesFromStorage();
    this.initializeDefaultTemplates();
  }

  /**
   * Get all templates
   */
  getTemplates(): Observable<RuleTemplate[]> {
    return this.templates$;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(categoryId: string): Observable<RuleTemplate[]> {
    return this.templates$.pipe(
      map(templates => templates.filter(t => t.category === categoryId))
    );
  }

  /**
   * Search templates
   */
  searchTemplates(criteria: TemplateSearchCriteria): Observable<RuleTemplate[]> {
    return this.templates$.pipe(
      map(templates => {
        let filtered = templates;

        // Text search
        if (criteria.query) {
          const query = criteria.query.toLowerCase();
          filtered = filtered.filter(t => 
            t.name.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }

        // Category filter
        if (criteria.category) {
          filtered = filtered.filter(t => t.category === criteria.category);
        }

        // Tags filter
        if (criteria.tags && criteria.tags.length > 0) {
          filtered = filtered.filter(t => 
            criteria.tags!.some(tag => t.tags.includes(tag))
          );
        }

        // Node types filter
        if (criteria.nodeTypes && criteria.nodeTypes.length > 0) {
          filtered = filtered.filter(t => 
            t.nodes.some(node => criteria.nodeTypes!.includes(node.type))
          );
        }

        // Complexity filter
        if (criteria.complexity) {
          filtered = filtered.filter(t => 
            this.getTemplateComplexity(t) === criteria.complexity
          );
        }

        return filtered;
      })
    );
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): Observable<RuleTemplate | null> {
    return this.templates$.pipe(
      map(templates => templates.find(t => t.id === id) || null)
    );
  }

  /**
   * Create new template
   */
  createTemplate(
    name: string, 
    description: string, 
    category: string,
    nodes: RuleNode[],
    rootNodes: string[],
    tags: string[] = [],
    requiredFields: string[] = []
  ): Observable<RuleTemplate> {
    const template: RuleTemplate = {
      id: this.generateTemplateId(),
      name,
      description,
      category,
      tags,
      nodes,
      rootNodes,
      requiredFields,
      icon: this.getDefaultIconForCategory(category),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        usageCount: 0,
        complexity: this.calculateComplexity(nodes)
      }
    };

    const templates = [...this.templatesSubject.value, template];
    this.templatesSubject.next(templates);
    this.saveTemplatesToStorage();
    this.updateCategories();

    return of(template);
  }

  /**
   * Update template
   */
  updateTemplate(id: string, updates: Partial<RuleTemplate>): Observable<RuleTemplate> {
    const templates = this.templatesSubject.value;
    const index = templates.findIndex(t => t.id === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Template with id ${id} not found`));
    }

    const updatedTemplate = {
      ...templates[index],
      ...updates,
      metadata: {
        ...templates[index].metadata,
        updatedAt: new Date(),
        version: this.incrementVersion(templates[index].metadata?.version || '1.0.0')
      }
    };

    templates[index] = updatedTemplate;
    this.templatesSubject.next([...templates]);
    this.saveTemplatesToStorage();

    return of(updatedTemplate);
  }

  /**
   * Delete template
   */
  deleteTemplate(id: string): Observable<boolean> {
    const templates = this.templatesSubject.value;
    const filteredTemplates = templates.filter(t => t.id !== id);
    
    if (filteredTemplates.length === templates.length) {
      return throwError(() => new Error(`Template with id ${id} not found`));
    }

    this.templatesSubject.next(filteredTemplates);
    this.saveTemplatesToStorage();
    this.updateCategories();

    return of(true);
  }

  /**
   * Duplicate template
   */
  duplicateTemplate(id: string, newName?: string): Observable<RuleTemplate> {
    return this.getTemplate(id).pipe(
      map(template => {
        if (!template) {
          throw new Error(`Template with id ${id} not found`);
        }

        const duplicated: RuleTemplate = {
          ...template,
          id: this.generateTemplateId(),
          name: newName || `${template.name} (Copy)`,
          metadata: {
            ...template.metadata,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.0.0',
            usageCount: 0
          }
        };

        const templates = [...this.templatesSubject.value, duplicated];
        this.templatesSubject.next(templates);
        this.saveTemplatesToStorage();

        return duplicated;
      })
    );
  }

  /**
   * Apply template to current builder state
   */
  applyTemplate(templateId: string, targetBuilderState?: RuleBuilderState): Observable<TemplateApplicationResult> {
    return this.getTemplate(templateId).pipe(
      map(template => {
        if (!template) {
          throw new Error(`Template with id ${templateId} not found`);
        }

        try {
          // Clone template nodes with new IDs
          const appliedNodes = this.cloneTemplateNodes(template.nodes);
          const modifiedNodeIds = appliedNodes.map(n => n.id);

          // Track usage
          this.incrementTemplateUsage(templateId);
          this.addToRecentlyUsed(template);

          return {
            success: true,
            appliedNodes,
            errors: [],
            warnings: [],
            modifiedNodeIds
          };
        } catch (error) {
          return {
            success: false,
            appliedNodes: [],
            errors: [error instanceof Error ? error.message : 'Unknown error'],
            warnings: [],
            modifiedNodeIds: []
          };
        }
      }),
      catchError(error => of({
        success: false,
        appliedNodes: [],
        errors: [error.message],
        warnings: [],
        modifiedNodeIds: []
      }))
    );
  }

  /**
   * Validate template compatibility
   */
  validateTemplate(template: RuleTemplate, availableFields?: string[]): TemplateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];

    // Check required structure
    if (!template.nodes || template.nodes.length === 0) {
      errors.push('Template must contain at least one rule node');
    }

    if (!template.rootNodes || template.rootNodes.length === 0) {
      errors.push('Template must specify root nodes');
    }

    // Check node references
    if (template.nodes && template.rootNodes) {
      const nodeIds = new Set(template.nodes.map(n => n.id));
      const invalidRootNodes = template.rootNodes.filter(id => !nodeIds.has(id));
      
      if (invalidRootNodes.length > 0) {
        errors.push(`Invalid root node references: ${invalidRootNodes.join(', ')}`);
      }
    }

    // Check field availability
    if (availableFields && template.requiredFields) {
      const missing = template.requiredFields.filter(field => !availableFields.includes(field));
      missingFields.push(...missing);
      
      if (missing.length > 0) {
        warnings.push(`Missing required fields: ${missing.join(', ')}`);
      }
    }

    // Check for complex features
    const complexFeatures = this.detectComplexFeatures(template);
    if (complexFeatures.length > 0) {
      warnings.push(`Template uses advanced features: ${complexFeatures.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingFields,
      incompatibleFeatures: complexFeatures
    };
  }

  /**
   * Export template to JSON
   */
  exportTemplate(id: string, options?: ExportOptions): Observable<string> {
    return this.getTemplate(id).pipe(
      map(template => {
        if (!template) {
          throw new Error(`Template with id ${id} not found`);
        }

        const exportData = {
          template,
          exportedAt: new Date().toISOString(),
          exportedBy: 'praxis-visual-builder',
          version: this.CURRENT_VERSION,
          metadata: {
            includeMetadata: options?.includeMetadata !== false,
            format: options?.format || 'json'
          }
        };

        return options?.prettyPrint !== false 
          ? JSON.stringify(exportData, null, 2)
          : JSON.stringify(exportData);
      })
    );
  }

  /**
   * Import template from JSON
   */
  importTemplate(jsonData: string, options?: ImportOptions): Observable<RuleTemplate> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.template) {
        throw new Error('Invalid template format: missing template data');
      }

      const template = importData.template as RuleTemplate;
      
      // Validate template
      const validation = this.validateTemplate(template);
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate new ID to avoid conflicts
      const importedTemplate: RuleTemplate = {
        ...template,
        id: this.generateTemplateId(),
        metadata: {
          ...template.metadata,
          importedAt: new Date(),
          originalId: template.id
        }
      };

      // Add to templates
      const templates = [...this.templatesSubject.value, importedTemplate];
      this.templatesSubject.next(templates);
      this.saveTemplatesToStorage();
      this.updateCategories();

      return of(importedTemplate);
    } catch (error) {
      return throwError(() => new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  /**
   * Get template statistics
   */
  getTemplateStats(): Observable<TemplateStats> {
    return this.templates$.pipe(
      map(templates => {
        const categories = new Set(templates.map(t => t.category));
        const allTags = templates.flatMap(t => t.tags);
        const tagCounts = allTags.reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const popularTags = Object.entries(tagCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([tag]) => tag);

        const mostUsed = templates
          .sort((a, b) => (b.metadata?.usageCount || 0) - (a.metadata?.usageCount || 0))[0];

        return {
          totalTemplates: templates.length,
          categoriesCount: categories.size,
          mostUsedTemplate: mostUsed,
          recentlyUsed: this.recentlyUsedSubject.value,
          popularTags
        };
      })
    );
  }

  /**
   * Get categories with template counts
   */
  getCategories(): Observable<TemplateCategory[]> {
    return this.categories$;
  }

  // Private methods

  private loadTemplatesFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const templates = JSON.parse(stored) as RuleTemplate[];
        this.templatesSubject.next(templates);
        this.updateCategories();
      }

      const recentlyUsed = localStorage.getItem(`${this.STORAGE_KEY}-recent`);
      if (recentlyUsed) {
        this.recentlyUsedSubject.next(JSON.parse(recentlyUsed));
      }
    } catch (error) {
      console.warn('Failed to load templates from storage:', error);
    }
  }

  private saveTemplatesToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.templatesSubject.value));
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
    } catch (error) {
      console.warn('Failed to save templates to storage:', error);
    }
  }

  private updateCategories(): void {
    const templates = this.templatesSubject.value;
    const categoryMap = new Map<string, TemplateCategory>();

    templates.forEach(template => {
      if (!categoryMap.has(template.category)) {
        categoryMap.set(template.category, {
          id: template.category,
          name: this.getCategoryDisplayName(template.category),
          description: this.getCategoryDescription(template.category),
          icon: this.getDefaultIconForCategory(template.category),
          templates: []
        });
      }
      categoryMap.get(template.category)!.templates.push(template);
    });

    this.categoriesSubject.next(Array.from(categoryMap.values()));
  }

  private initializeDefaultTemplates(): void {
    if (this.templatesSubject.value.length === 0) {
      this.createDefaultTemplates();
    }
  }

  private createDefaultTemplates(): void {
    // Basic Field Validation Template
    this.createTemplate(
      'Basic Field Validation',
      'Simple field validation with required and format checks',
      'validation',
      [
        {
          id: 'field_required',
          type: 'fieldCondition',
          label: 'Field is required',
          config: {
            type: 'fieldCondition',
            fieldName: '{{fieldName}}',
            operator: 'isNotEmpty',
            value: null,
            valueType: 'literal'
          }
        }
      ],
      ['field_required'],
      ['required', 'validation', 'basic'],
      ['{{fieldName}}']
    ).subscribe();

    // Email Validation Template
    this.createTemplate(
      'Email Validation',
      'Complete email field validation with format and required checks',
      'validation',
      [
        {
          id: 'email_required',
          type: 'fieldCondition',
          label: 'Email is required',
          config: {
            type: 'fieldCondition',
            fieldName: 'email',
            operator: 'isNotEmpty',
            value: null,
            valueType: 'literal'
          }
        },
        {
          id: 'email_format',
          type: 'fieldCondition',
          label: 'Email format validation',
          config: {
            type: 'fieldCondition',
            fieldName: 'email',
            operator: 'matches',
            value: '^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$',
            valueType: 'literal'
          }
        },
        {
          id: 'email_and_group',
          type: 'andGroup',
          label: 'Email validation group',
          children: ['email_required', 'email_format'],
          config: {
            type: 'booleanGroup',
            operator: 'and'
          }
        }
      ],
      ['email_and_group'],
      ['email', 'validation', 'format', 'required'],
      ['email']
    ).subscribe();
  }

  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cloneTemplateNodes(nodes: RuleNode[]): RuleNode[] {
    const idMap = new Map<string, string>();
    
    // First pass: generate new IDs
    nodes.forEach(node => {
      idMap.set(node.id, this.generateNodeId());
    });

    // Second pass: clone nodes with new IDs
    return nodes.map(node => {
      const cloned: RuleNode = {
        ...node,
        id: idMap.get(node.id)!,
        children: node.children?.map(childId => idMap.get(childId) || childId)
      };

      // Replace template variables in config
      if (cloned.config) {
        cloned.config = this.replaceTemplateVariables(cloned.config);
      }

      return cloned;
    });
  }

  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private replaceTemplateVariables(config: any): any {
    // Deep clone and replace variables like {{fieldName}}
    const configStr = JSON.stringify(config);
    // For now, return as-is. In real implementation, would replace template variables
    return JSON.parse(configStr);
  }

  private incrementTemplateUsage(templateId: string): void {
    const templates = this.templatesSubject.value;
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      template.metadata = {
        ...template.metadata,
        usageCount: (template.metadata?.usageCount || 0) + 1,
        lastUsed: new Date()
      };
      this.saveTemplatesToStorage();
    }
  }

  private addToRecentlyUsed(template: RuleTemplate): void {
    const recent = this.recentlyUsedSubject.value;
    const filtered = recent.filter(t => t.id !== template.id);
    const updated = [template, ...filtered].slice(0, 10);
    
    this.recentlyUsedSubject.next(updated);
    localStorage.setItem(`${this.STORAGE_KEY}-recent`, JSON.stringify(updated));
  }

  private getTemplateComplexity(template: RuleTemplate): 'simple' | 'medium' | 'complex' {
    return this.calculateComplexity(template.nodes);
  }

  private calculateComplexity(nodes: RuleNode[]): 'simple' | 'medium' | 'complex' {
    if (nodes.length <= 2) return 'simple';
    if (nodes.length <= 5) return 'medium';
    return 'complex';
  }

  private detectComplexFeatures(template: RuleTemplate): string[] {
    const features: string[] = [];
    
    template.nodes.forEach(node => {
      if (node.type.includes('Group')) {
        features.push('Boolean Logic');
      }
      if (node.type === 'functionCall') {
        features.push('Custom Functions');
      }
      if (node.type.includes('If')) {
        features.push('Conditional Validation');
      }
      if (['forEach', 'uniqueBy', 'minLength', 'maxLength'].includes(node.type)) {
        features.push('Collection Validation');
      }
    });

    return [...new Set(features)];
  }

  private getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
      'validation': 'Field Validation',
      'business': 'Business Rules',
      'collection': 'Collection Validation',
      'conditional': 'Conditional Logic',
      'workflow': 'Workflow Rules',
      'security': 'Security Validation',
      'custom': 'Custom Templates'
    };
    
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'validation': 'Templates for field validation and format checking',
      'business': 'Templates for business logic and rules',
      'collection': 'Templates for array and collection validation',
      'conditional': 'Templates with conditional logic and branching',
      'workflow': 'Templates for workflow and process validation',
      'security': 'Templates for security and access control',
      'custom': 'User-created custom templates'
    };
    
    return descriptions[category] || `Templates in ${category} category`;
  }

  private getDefaultIconForCategory(category: string): string {
    const icons: Record<string, string> = {
      'validation': 'check_circle',
      'business': 'business',
      'collection': 'list',
      'conditional': 'alt_route',
      'workflow': 'workflow',
      'security': 'security',
      'custom': 'extension'
    };
    
    return icons[category] || 'folder';
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }
}