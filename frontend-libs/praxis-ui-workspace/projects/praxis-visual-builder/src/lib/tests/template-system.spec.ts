/**
 * Comprehensive test suite for the Template System
 * 
 * Tests all components of the template system including:
 * - RuleTemplateService
 * - TemplateGalleryComponent
 * - TemplateEditorDialogComponent
 * - TemplatePreviewDialogComponent
 * - Integration with SpecificationBridgeService
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { 
  RuleTemplate, 
  RuleNode, 
  TemplateMetadata,
  RuleNodeType 
} from '../models/rule-builder.model';
import { 
  RuleTemplateService, 
  TemplateSearchCriteria,
  TemplateApplicationResult,
  TemplateValidationResult 
} from '../services/rule-template.service';
import { SpecificationBridgeService } from '../services/specification-bridge.service';
import { TemplateGalleryComponent } from '../components/template-gallery.component';
import { 
  TemplateEditorDialogComponent,
  TemplateEditorDialogData 
} from '../components/template-editor-dialog.component';
import { TemplatePreviewDialogComponent } from '../components/template-preview-dialog.component';

describe('Template System', () => {
  
  // Test data
  const mockRuleNode: RuleNode = {
    id: 'test-node-1',
    type: RuleNodeType.FIELD_CONDITION,
    label: 'Test Field Condition',
    config: {
      type: 'fieldCondition',
      fieldName: 'email',
      operator: 'isNotEmpty',
      value: null,
      valueType: 'literal'
    }
  };

  const mockTemplate: RuleTemplate = {
    id: 'template-1',
    name: 'Email Validation Template',
    description: 'Validates email field is not empty and has correct format',
    category: 'validation',
    tags: ['email', 'validation', 'required'],
    nodes: [mockRuleNode],
    rootNodes: ['test-node-1'],
    requiredFields: ['email'],
    icon: 'email',
    metadata: {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      version: '1.0.0',
      usageCount: 5,
      complexity: 'simple',
      author: {
        name: 'Test Author',
        email: 'test@example.com'
      }
    }
  };

  describe('RuleTemplateService', () => {
    let service: RuleTemplateService;
    let bridgeService: jasmine.SpyObj<SpecificationBridgeService>;

    beforeEach(() => {
      const bridgeSpy = jasmine.createSpyObj('SpecificationBridgeService', [
        'ruleNodeToSpecification',
        'validateRoundTrip'
      ]);

      TestBed.configureTestingModule({
        providers: [
          RuleTemplateService,
          { provide: SpecificationBridgeService, useValue: bridgeSpy }
        ]
      });

      service = TestBed.inject(RuleTemplateService);
      bridgeService = TestBed.inject(SpecificationBridgeService) as jasmine.SpyObj<SpecificationBridgeService>;
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should create template successfully', (done) => {
      service.createTemplate(
        'Test Template',
        'Test Description',
        'validation',
        [mockRuleNode],
        ['test-node-1'],
        ['test'],
        ['email']
      ).subscribe(template => {
        expect(template).toBeTruthy();
        expect(template.name).toBe('Test Template');
        expect(template.description).toBe('Test Description');
        expect(template.category).toBe('validation');
        expect(template.nodes).toEqual([mockRuleNode]);
        expect(template.rootNodes).toEqual(['test-node-1']);
        expect(template.tags).toEqual(['test']);
        expect(template.requiredFields).toEqual(['email']);
        done();
      });
    });

    it('should search templates by criteria', (done) => {
      // First create a template
      service.createTemplate(
        'Email Template',
        'Email validation',
        'validation',
        [mockRuleNode],
        ['test-node-1'],
        ['email', 'validation'],
        ['email']
      ).subscribe(() => {
        const criteria: TemplateSearchCriteria = {
          query: 'email',
          category: 'validation',
          tags: ['email']
        };

        service.searchTemplates(criteria).subscribe(results => {
          expect(results.length).toBeGreaterThan(0);
          expect(results[0].name).toContain('Email');
          done();
        });
      });
    });

    it('should update template successfully', (done) => {
      service.createTemplate(
        'Original Template',
        'Original Description',
        'validation',
        [mockRuleNode],
        ['test-node-1']
      ).subscribe(template => {
        const updates = {
          name: 'Updated Template',
          description: 'Updated Description'
        };

        service.updateTemplate(template.id, updates).subscribe(updated => {
          expect(updated.name).toBe('Updated Template');
          expect(updated.description).toBe('Updated Description');
          expect(updated.metadata?.updatedAt).toBeTruthy();
          done();
        });
      });
    });

    it('should delete template successfully', (done) => {
      service.createTemplate(
        'Template to Delete',
        'Will be deleted',
        'validation',
        [mockRuleNode],
        ['test-node-1']
      ).subscribe(template => {
        service.deleteTemplate(template.id).subscribe(result => {
          expect(result).toBe(true);
          
          // Verify template is deleted
          service.getTemplate(template.id).subscribe(deletedTemplate => {
            expect(deletedTemplate).toBeNull();
            done();
          });
        });
      });
    });

    it('should duplicate template successfully', (done) => {
      service.createTemplate(
        'Original Template',
        'Original Description',
        'validation',
        [mockRuleNode],
        ['test-node-1']
      ).subscribe(template => {
        service.duplicateTemplate(template.id, 'Duplicated Template').subscribe(duplicate => {
          expect(duplicate.name).toBe('Duplicated Template');
          expect(duplicate.description).toBe('Original Description');
          expect(duplicate.id).not.toBe(template.id);
          expect(duplicate.metadata?.usageCount).toBe(0);
          done();
        });
      });
    });

    it('should validate template structure', () => {
      const validationResult = service.validateTemplate(mockTemplate, ['email']);
      
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toEqual([]);
      expect(validationResult.missingFields).toEqual([]);
    });

    it('should detect missing required fields', () => {
      const validationResult = service.validateTemplate(mockTemplate, ['firstName']);
      
      expect(validationResult.warnings.length).toBeGreaterThan(0);
      expect(validationResult.missingFields).toContain('email');
    });

    it('should export template to JSON', (done) => {
      service.createTemplate(
        'Export Template',
        'For export test',
        'validation',
        [mockRuleNode],
        ['test-node-1']
      ).subscribe(template => {
        service.exportTemplate(template.id, { prettyPrint: true }).subscribe(jsonData => {
          expect(jsonData).toBeTruthy();
          
          const exportData = JSON.parse(jsonData);
          expect(exportData.template).toBeTruthy();
          expect(exportData.template.name).toBe('Export Template');
          expect(exportData.exportedBy).toBe('praxis-visual-builder');
          done();
        });
      });
    });

    it('should import template from JSON', (done) => {
      const importData = {
        template: mockTemplate,
        exportedAt: new Date().toISOString(),
        exportedBy: 'praxis-visual-builder',
        version: '1.0.0'
      };

      const jsonData = JSON.stringify(importData);

      service.importTemplate(jsonData).subscribe(imported => {
        expect(imported.name).toBe(mockTemplate.name);
        expect(imported.description).toBe(mockTemplate.description);
        expect(imported.id).not.toBe(mockTemplate.id); // Should have new ID
        expect(imported.metadata?.importedAt).toBeTruthy();
        expect(imported.metadata?.originalId).toBe(mockTemplate.id);
        done();
      });
    });

    it('should handle import of invalid JSON', (done) => {
      const invalidJson = '{ invalid json }';

      service.importTemplate(invalidJson).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toContain('Import failed');
          done();
        }
      });
    });

    it('should apply template successfully', (done) => {
      service.createTemplate(
        'Apply Template',
        'For application test',
        'validation',
        [mockRuleNode],
        ['test-node-1']
      ).subscribe(template => {
        service.applyTemplate(template.id).subscribe(result => {
          expect(result.success).toBe(true);
          expect(result.appliedNodes.length).toBe(1);
          expect(result.appliedNodes[0].type).toBe('fieldCondition');
          expect(result.errors).toEqual([]);
          done();
        });
      });
    });

    it('should get template statistics', (done) => {
      // Create some templates first
      service.createTemplate('Template 1', 'Description 1', 'validation', [mockRuleNode], ['test-node-1'], ['tag1']).subscribe(() => {
        service.createTemplate('Template 2', 'Description 2', 'business', [mockRuleNode], ['test-node-1'], ['tag2']).subscribe(() => {
          service.getTemplateStats().subscribe(stats => {
            expect(stats.totalTemplates).toBeGreaterThanOrEqual(2);
            expect(stats.categoriesCount).toBeGreaterThanOrEqual(2);
            expect(stats.popularTags.length).toBeGreaterThan(0);
            done();
          });
        });
      });
    });
  });

  describe('TemplateGalleryComponent', () => {
    let component: TemplateGalleryComponent;
    let fixture: ComponentFixture<TemplateGalleryComponent>;
    let templateService: jasmine.SpyObj<RuleTemplateService>;
    let dialog: jasmine.SpyObj<MatDialog>;
    let snackBar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(async () => {
      const templateSpy = jasmine.createSpyObj('RuleTemplateService', [
        'getTemplates',
        'getCategories',
        'getTemplateStats',
        'applyTemplate',
        'duplicateTemplate',
        'deleteTemplate',
        'exportTemplate',
        'importTemplate'
      ]);
      const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
      const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

      // Setup service mocks
      templateSpy.getTemplates.and.returnValue(of([mockTemplate]));
      templateSpy.getCategories.and.returnValue(of([]));
      templateSpy.getTemplateStats.and.returnValue(of({
        totalTemplates: 1,
        categoriesCount: 1,
        recentlyUsed: [],
        popularTags: ['email', 'validation']
      }));

      await TestBed.configureTestingModule({
        imports: [
          TemplateGalleryComponent,
          NoopAnimationsModule,
          ReactiveFormsModule
        ],
        providers: [
          { provide: RuleTemplateService, useValue: templateSpy },
          { provide: MatDialog, useValue: dialogSpy },
          { provide: MatSnackBar, useValue: snackBarSpy }
        ]
      }).compileComponents();

      templateService = TestBed.inject(RuleTemplateService) as jasmine.SpyObj<RuleTemplateService>;
      dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
      snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

      fixture = TestBed.createComponent(TemplateGalleryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load templates on init', () => {
      expect(templateService.getTemplates).toHaveBeenCalled();
      expect(templateService.getTemplateStats).toHaveBeenCalled();
    });

    it('should filter templates by search query', (done) => {
      component.searchForm.patchValue({ query: 'email' });
      
      component.filteredTemplates$.subscribe(filtered => {
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toContain('Email');
        done();
      });
    });

    it('should toggle display mode', () => {
      expect(component.displayMode).toBe('grid');
      
      component.setDisplayMode('list');
      expect(component.displayMode).toBe('list');
      
      component.setDisplayMode('compact');
      expect(component.displayMode).toBe('compact');
    });

    it('should handle tag selection', () => {
      const tag = 'validation';
      
      expect(component.selectedTags.has(tag)).toBe(false);
      
      component.toggleTag(tag);
      expect(component.selectedTags.has(tag)).toBe(true);
      
      component.toggleTag(tag);
      expect(component.selectedTags.has(tag)).toBe(false);
    });

    it('should clear all filters', () => {
      component.searchForm.patchValue({
        query: 'test',
        category: 'validation',
        complexity: 'simple'
      });
      component.selectedTags.add('email');
      
      component.clearAllFilters();
      
      expect(component.searchForm.value.query).toBeFalsy();
      expect(component.searchForm.value.category).toBeFalsy();
      expect(component.searchForm.value.complexity).toBeFalsy();
      expect(component.selectedTags.size).toBe(0);
    });

    it('should apply template successfully', () => {
      const mockResult: TemplateApplicationResult = {
        success: true,
        appliedNodes: [mockRuleNode],
        errors: [],
        warnings: [],
        modifiedNodeIds: ['test-node-1']
      };
      
      templateService.applyTemplate.and.returnValue(of(mockResult));
      
      component.applyTemplate(mockTemplate);
      
      expect(templateService.applyTemplate).toHaveBeenCalledWith(mockTemplate.id);
      expect(snackBar.open).toHaveBeenCalledWith(
        jasmine.stringMatching('applied successfully'),
        'Close',
        jasmine.any(Object)
      );
    });

    it('should handle template application error', () => {
      const mockResult: TemplateApplicationResult = {
        success: false,
        appliedNodes: [],
        errors: ['Field not found'],
        warnings: [],
        modifiedNodeIds: []
      };
      
      templateService.applyTemplate.and.returnValue(of(mockResult));
      
      component.applyTemplate(mockTemplate);
      
      expect(snackBar.open).toHaveBeenCalledWith(
        jasmine.stringMatching('Failed to apply template'),
        'Close',
        jasmine.any(Object)
      );
    });

    it('should duplicate template', () => {
      const duplicatedTemplate = { ...mockTemplate, id: 'template-2', name: 'Email Validation Template (Copy)' };
      templateService.duplicateTemplate.and.returnValue(of(duplicatedTemplate));
      
      component.duplicateTemplate(mockTemplate);
      
      expect(templateService.duplicateTemplate).toHaveBeenCalledWith(mockTemplate.id);
      expect(snackBar.open).toHaveBeenCalledWith(
        jasmine.stringMatching('duplicated'),
        'Close',
        jasmine.any(Object)
      );
    });

    it('should export template', () => {
      const jsonData = JSON.stringify(mockTemplate, null, 2);
      templateService.exportTemplate.and.returnValue(of(jsonData));
      
      spyOn(component as any, 'downloadFile');
      
      component.exportTemplate(mockTemplate);
      
      expect(templateService.exportTemplate).toHaveBeenCalledWith(
        mockTemplate.id,
        { prettyPrint: true }
      );
      expect((component as any).downloadFile).toHaveBeenCalled();
    });

    it('should delete template with confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      templateService.deleteTemplate.and.returnValue(of(true));
      
      component.deleteTemplate(mockTemplate);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(templateService.deleteTemplate).toHaveBeenCalledWith(mockTemplate.id);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Template deleted successfully',
        'Close',
        jasmine.any(Object)
      );
    });

    it('should not delete template without confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.deleteTemplate(mockTemplate);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(templateService.deleteTemplate).not.toHaveBeenCalled();
    });

    it('should open create template dialog', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of({ action: 'save', template: mockTemplate }));
      dialog.open.and.returnValue(dialogRefSpy);
      
      component.showCreateTemplateDialog([mockRuleNode]);
      
      expect(dialog.open).toHaveBeenCalledWith(
        TemplateEditorDialogComponent,
        jasmine.objectContaining({
          width: '800px',
          data: jasmine.objectContaining({
            mode: 'create',
            selectedNodes: [mockRuleNode]
          })
        })
      );
    });

    it('should open edit template dialog', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of({ action: 'save', template: mockTemplate }));
      dialog.open.and.returnValue(dialogRefSpy);
      
      component.editTemplate(mockTemplate);
      
      expect(dialog.open).toHaveBeenCalledWith(
        TemplateEditorDialogComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            mode: 'edit',
            template: mockTemplate
          })
        })
      );
    });
  });

  describe('TemplateEditorDialogComponent', () => {
    let component: TemplateEditorDialogComponent;
    let fixture: ComponentFixture<TemplateEditorDialogComponent>;
    let dialogRef: jasmine.SpyObj<MatDialogRef<TemplateEditorDialogComponent>>;
    let templateService: jasmine.SpyObj<RuleTemplateService>;

    const mockDialogData: TemplateEditorDialogData = {
      mode: 'create',
      selectedNodes: [mockRuleNode],
      availableCategories: ['validation', 'business']
    };

    beforeEach(async () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
      const templateSpy = jasmine.createSpyObj('RuleTemplateService', [
        'createTemplate',
        'updateTemplate',
        'deleteTemplate'
      ]);
      const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
      const bridgeSpy = jasmine.createSpyObj('SpecificationBridgeService', ['ruleNodeToSpecification']);

      await TestBed.configureTestingModule({
        imports: [
          TemplateEditorDialogComponent,
          NoopAnimationsModule,
          ReactiveFormsModule
        ],
        providers: [
          { provide: MatDialogRef, useValue: dialogRefSpy },
          { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
          { provide: RuleTemplateService, useValue: templateSpy },
          { provide: MatSnackBar, useValue: snackBarSpy },
          { provide: SpecificationBridgeService, useValue: bridgeSpy }
        ]
      }).compileComponents();

      dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<TemplateEditorDialogComponent>>;
      templateService = TestBed.inject(RuleTemplateService) as jasmine.SpyObj<RuleTemplateService>;

      fixture = TestBed.createComponent(TemplateEditorDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize forms correctly', () => {
      expect(component.basicInfoForm).toBeTruthy();
      expect(component.rulesForm).toBeTruthy();
      expect(component.advancedForm).toBeTruthy();
    });

    it('should setup preview nodes from selected nodes', () => {
      expect(component.previewNodes).toEqual([mockRuleNode]);
      expect(component.nodeCount).toBe(1);
    });

    it('should detect template variables', () => {
      const nodeWithVariable: RuleNode = {
        id: 'test-var-node',
        type: 'fieldCondition',
        config: {
          type: 'fieldCondition',
          fieldName: '{{fieldName}}',
          operator: 'equals',
          value: '{{expectedValue}}',
          valueType: 'literal'
        }
      };

      component.previewNodes = [nodeWithVariable];
      component['detectTemplateVariables']();

      expect(component.detectedVariables).toContain('fieldName');
      expect(component.detectedVariables).toContain('expectedValue');
    });

    it('should add and remove tags', () => {
      const initialTagCount = component.tags.length;
      
      const mockChipInputEvent = {
        value: 'new-tag',
        chipInput: { clear: jasmine.createSpy('clear') }
      } as any;

      component.addTag(mockChipInputEvent);
      
      expect(component.tags.length).toBe(initialTagCount + 1);
      expect(component.tags).toContain('new-tag');
      expect(mockChipInputEvent.chipInput.clear).toHaveBeenCalled();

      component.removeTag('new-tag');
      expect(component.tags.length).toBe(initialTagCount);
      expect(component.tags).not.toContain('new-tag');
    });

    it('should validate save conditions', () => {
      // Initially should not be able to save (forms not valid)
      expect(component.canSave()).toBe(false);

      // Fill required fields
      component.basicInfoForm.patchValue({
        name: 'Test Template',
        description: 'Test Description',
        category: 'validation'
      });

      expect(component.canSave()).toBe(true);
    });

    it('should create template successfully', () => {
      templateService.createTemplate.and.returnValue(of(mockTemplate));
      templateService.updateTemplate.and.returnValue(of(mockTemplate));

      component.basicInfoForm.patchValue({
        name: 'Test Template',
        description: 'Test Description',
        category: 'validation'
      });

      component.saveTemplate();

      expect(templateService.createTemplate).toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalledWith({
        action: 'save',
        template: mockTemplate
      });
    });

    it('should cancel dialog', () => {
      component.cancel();
      
      expect(dialogRef.close).toHaveBeenCalledWith({
        action: 'cancel'
      });
    });
  });

  describe('TemplatePreviewDialogComponent', () => {
    let component: TemplatePreviewDialogComponent;
    let fixture: ComponentFixture<TemplatePreviewDialogComponent>;
    let dialogRef: jasmine.SpyObj<MatDialogRef<TemplatePreviewDialogComponent>>;

    beforeEach(async () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

      await TestBed.configureTestingModule({
        imports: [
          TemplatePreviewDialogComponent,
          NoopAnimationsModule
        ],
        providers: [
          { provide: MatDialogRef, useValue: dialogRefSpy },
          { provide: MAT_DIALOG_DATA, useValue: { template: mockTemplate } }
        ]
      }).compileComponents();

      dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<TemplatePreviewDialogComponent>>;

      fixture = TestBed.createComponent(TemplatePreviewDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display template information', () => {
      expect(component.data.template).toEqual(mockTemplate);
    });

    it('should get root node correctly', () => {
      const rootNode = component.getRootNode('test-node-1');
      expect(rootNode).toEqual(mockRuleNode);
    });

    it('should get node hierarchy', () => {
      const hierarchy = component.getNodeHierarchy('test-node-1');
      expect(hierarchy.length).toBe(1);
      expect(hierarchy[0].node).toEqual(mockRuleNode);
      expect(hierarchy[0].level).toBe(0);
    });

    it('should get appropriate node icons', () => {
      expect(component.getNodeIcon(mockRuleNode)).toBe('compare_arrows');
      expect(component.getNodeIcon()).toBe('help');
    });

    it('should format dates correctly', () => {
      const testDate = new Date('2024-01-01T12:00:00Z');
      const formatted = component.formatDate(testDate);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('Jan');
    });

    it('should format config for display', () => {
      const config = {
        type: 'fieldCondition',
        fieldName: 'email',
        operator: 'isNotEmpty',
        metadata: { code: 'EMAIL_REQUIRED' }
      };

      const formatted = component.formatConfig(config);
      const parsed = JSON.parse(formatted);
      
      expect(parsed.fieldName).toBe('email');
      expect(parsed.operator).toBe('isNotEmpty');
      expect(parsed.type).toBeUndefined(); // Should be removed
      expect(parsed.metadata).toBeUndefined(); // Should be removed
    });

    it('should apply template', () => {
      component.applyTemplate();
      expect(dialogRef.close).toHaveBeenCalledWith('apply');
    });

    it('should export template', () => {
      component.exportTemplate();
      expect(dialogRef.close).toHaveBeenCalledWith('export');
    });

    it('should cancel dialog', () => {
      component.cancel();
      expect(dialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('Template System Integration', () => {
    let templateService: RuleTemplateService;
    let bridgeService: jasmine.SpyObj<SpecificationBridgeService>;

    beforeEach(() => {
      const bridgeSpy = jasmine.createSpyObj('SpecificationBridgeService', [
        'ruleNodeToSpecification',
        'specificationToRuleNode',
        'exportToDsl',
        'validateRoundTrip'
      ]);

      TestBed.configureTestingModule({
        providers: [
          RuleTemplateService,
          { provide: SpecificationBridgeService, useValue: bridgeSpy }
        ]
      });

      templateService = TestBed.inject(RuleTemplateService);
      bridgeService = TestBed.inject(SpecificationBridgeService) as jasmine.SpyObj<SpecificationBridgeService>;
    });

    it('should integrate template creation with specification conversion', (done) => {
      // Mock specification conversion
      const mockSpec = { toJSON: () => ({ type: 'field', field: 'email' }) };
      bridgeService.ruleNodeToSpecification.and.returnValue(mockSpec as any);
      bridgeService.exportToDsl.and.returnValue('email IS_NOT_NULL');

      templateService.createTemplate(
        'Integration Test Template',
        'Testing template-specification integration',
        'validation',
        [mockRuleNode],
        ['test-node-1']
      ).subscribe(template => {
        expect(template).toBeTruthy();
        
        // Verify we can convert template nodes to specifications
        template.nodes.forEach(node => {
          const spec = bridgeService.ruleNodeToSpecification(node);
          expect(spec).toBeTruthy();
          
          const dsl = bridgeService.exportToDsl(node);
          expect(dsl).toBeTruthy();
        });
        
        done();
      });
    });

    it('should validate round-trip conversion for templates', (done) => {
      bridgeService.validateRoundTrip.and.returnValue({
        success: true,
        errors: [],
        warnings: []
      });

      templateService.createTemplate(
        'Round-trip Test Template',
        'Testing round-trip validation',
        'validation',
        [mockRuleNode],
        ['test-node-1']
      ).subscribe(template => {
        // Validate each node can be round-tripped
        template.nodes.forEach(node => {
          const validation = bridgeService.validateRoundTrip(node);
          expect(validation.success).toBe(true);
          expect(validation.errors.length).toBe(0);
        });
        
        done();
      });
    });

    it('should handle template application with specification validation', (done) => {
      templateService.createTemplate(
        'Application Test Template',
        'Testing template application',
        'validation',
        [mockRuleNode],
        ['test-node-1']
      ).subscribe(template => {
        templateService.applyTemplate(template.id).subscribe(result => {
          expect(result.success).toBe(true);
          expect(result.appliedNodes.length).toBe(1);
          
          // Verify applied nodes can be converted to specifications
          result.appliedNodes.forEach(node => {
            expect(() => bridgeService.ruleNodeToSpecification(node)).not.toThrow();
          });
          
          done();
        });
      });
    });
  });
});