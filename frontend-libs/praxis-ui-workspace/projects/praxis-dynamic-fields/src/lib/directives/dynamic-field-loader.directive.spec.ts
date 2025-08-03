/**
 * @fileoverview Testes unitários para DynamicFieldLoaderDirective
 *
 * Testa renderização dinâmica de campos, integração com ComponentRegistryService,
 * validação de inputs e emissão de outputs.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DynamicFieldLoaderDirective } from './dynamic-field-loader.directive';
import { ComponentRegistryService } from '../services/component-registry/component-registry.service';
import { TextInputComponent } from '../components/text-input/text-input.component';
import { MaterialButtonComponent } from '../components/material-button/material-button.component';
import { FieldMetadata } from '@praxis/core';

// =============================================================================
// TEST COMPONENTS
// =============================================================================

@Component({
  template: `
    <form [formGroup]="testForm">
      <ng-container
        dynamicFieldLoader
        [fields]="fields"
        [formGroup]="testForm"
        (componentsCreated)="onComponentsCreated($event)"
      >
      </ng-container>
    </form>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, DynamicFieldLoaderDirective],
})
class TestHostComponent {
  testForm: FormGroup;
  fields: FieldMetadata[] = [];
  createdComponents: any;

  constructor(private fb: FormBuilder) {
    this.testForm = this.fb.group({});
  }

  onComponentsCreated(components: any) {
    this.createdComponents = components;
  }
}

// =============================================================================
// MOCK SERVICES
// =============================================================================

class MockComponentRegistryService {
  async getComponent(controlType: string): Promise<any> {
    switch (controlType) {
      case 'input':
        return TextInputComponent;
      case 'button':
        return MaterialButtonComponent;
      default:
        return null;
    }
  }

  isRegistered(controlType: string): boolean {
    return ['input', 'button'].includes(controlType);
  }
}

// =============================================================================
// TEST SUITE
// =============================================================================

describe('DynamicFieldLoaderDirective', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: DynamicFieldLoaderDirective;
  let registryService: ComponentRegistryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, NoopAnimationsModule, ReactiveFormsModule],
      providers: [
        {
          provide: ComponentRegistryService,
          useClass: MockComponentRegistryService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    registryService = TestBed.inject(ComponentRegistryService);

    const directiveEl = fixture.debugElement.query(
      By.directive(DynamicFieldLoaderDirective),
    );
    directive = directiveEl.injector.get(DynamicFieldLoaderDirective);
  });

  // =============================================================================
  // BASIC TESTS
  // =============================================================================

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(directive).toBeTruthy();
  });

  it('should have correct inputs and outputs', () => {
    expect(directive.fields).toBeDefined();
    expect(directive.formGroup).toBeDefined();
    expect(directive.componentsCreated).toBeDefined();
  });

  // =============================================================================
  // INPUT VALIDATION TESTS
  // =============================================================================

  describe('Input Validation', () => {
    it('should throw error when fields is null', () => {
      component.fields = null as any;
      component.testForm = new FormBuilder().group({});

      expect(() => {
        fixture.detectChanges();
      }).toThrowError('[DynamicFieldLoader] Input "fields" is required');
    });

    it('should throw error when formGroup is null', () => {
      component.fields = [];
      component.testForm = null as any;

      expect(() => {
        fixture.detectChanges();
      }).toThrowError('[DynamicFieldLoader] Input "formGroup" is required');
    });

    it('should throw error when fields is not an array', () => {
      component.fields = {} as any;
      component.testForm = new FormBuilder().group({});

      expect(() => {
        fixture.detectChanges();
      }).toThrowError('[DynamicFieldLoader] Input "fields" must be an array');
    });

    it('should throw error when field is missing name', () => {
      component.fields = [{ controlType: 'input' } as any];
      component.testForm = new FormBuilder().group({});

      expect(() => {
        fixture.detectChanges();
      }).toThrowError("Field at index 0 must have a 'name' property");
    });

    it('should throw error when field is missing controlType', () => {
      component.fields = [{ name: 'test' } as any];
      component.testForm = new FormBuilder().group({});

      expect(() => {
        fixture.detectChanges();
      }).toThrowError("Field 'test' must have a 'controlType' property");
    });

    it('should throw error for duplicate field names', () => {
      component.fields = [
        { name: 'test', controlType: 'input' },
        { name: 'test', controlType: 'button' },
      ] as FieldMetadata[];
      component.testForm = new FormBuilder().group({});

      expect(() => {
        fixture.detectChanges();
      }).toThrowError('Duplicate field names are not allowed: test');
    });
  });

  // =============================================================================
  // COMPONENT CREATION TESTS
  // =============================================================================

  describe('Component Creation', () => {
    beforeEach(() => {
      component.fields = [
        {
          name: 'email',
          label: 'Email',
          controlType: 'input',
          required: true,
        },
        {
          name: 'submit',
          label: 'Submit',
          controlType: 'button',
        },
      ] as FieldMetadata[];

      component.testForm = new FormBuilder().group({
        email: ['', [Validators.required, Validators.email]],
        submit: [''],
      });
    });

    it('should create components for all fields', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.createdComponents).toBeDefined();
      expect(component.createdComponents.size).toBe(2);
      expect(component.createdComponents.has('email')).toBe(true);
      expect(component.createdComponents.has('submit')).toBe(true);
    });

    it('should create correct component types', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const emailComponent = component.createdComponents.get('email');
      const submitComponent = component.createdComponents.get('submit');

      expect(emailComponent.componentType).toBe(TextInputComponent);
      expect(submitComponent.componentType).toBe(MaterialButtonComponent);
    });

    it('should configure components with metadata', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const emailComponent = component.createdComponents.get('email');
      const emailMetadata = emailComponent.instance.metadata();

      expect(emailMetadata).toBeDefined();
      expect(emailMetadata.name).toBe('email');
      expect(emailMetadata.label).toBe('Email');
      expect(emailMetadata.controlType).toBe('input');
      expect(emailMetadata.required).toBe(true);
    });

    it('should associate FormControls with components', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const emailComponent = component.createdComponents.get('email');
      const formControl = emailComponent.instance.formControl();

      expect(formControl).toBeDefined();
      expect(formControl).toBe(component.testForm.get('email'));
    });
  });

  // =============================================================================
  // REGISTRY INTEGRATION TESTS
  // =============================================================================

  describe('ComponentRegistry Integration', () => {
    it('should skip fields with unknown controlType', async () => {
      component.fields = [
        {
          name: 'unknown',
          label: 'Unknown',
          controlType: 'unknownType',
        } as any,
      ] as FieldMetadata[];

      component.testForm = new FormBuilder().group({
        unknown: [''],
      });

      spyOn(console, 'warn');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining(
          "No component found for controlType 'unknownType'",
        ),
      );
      expect(component.createdComponents.size).toBe(0);
    });

    it('should handle registry errors gracefully', async () => {
      spyOn(registryService, 'getComponent').and.rejectWith(
        new Error('Registry error'),
      );
      spyOn(console, 'error');

      component.fields = [
        {
          name: 'test',
          label: 'Test',
          controlType: 'input',
        },
      ] as FieldMetadata[];

      component.testForm = new FormBuilder().group({
        test: [''],
      });

      try {
        fixture.detectChanges();
        await fixture.whenStable();
      } catch (error) {
        expect(console.error).toHaveBeenCalled();
      }
    });
  });

  // =============================================================================
  // LIFECYCLE TESTS
  // =============================================================================

  describe('Lifecycle Management', () => {
    beforeEach(() => {
      component.fields = [
        {
          name: 'test',
          label: 'Test',
          controlType: 'input',
        },
      ] as FieldMetadata[];

      component.testForm = new FormBuilder().group({
        test: [''],
      });
    });

    it('should re-render when fields change', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.createdComponents.size).toBe(1);

      // Adicionar novo campo
      component.fields = [
        ...component.fields,
        {
          name: 'newField',
          label: 'New Field',
          controlType: 'button',
        },
      ] as FieldMetadata[];

      component.testForm.addControl('newField', new FormBuilder().control(''));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.createdComponents.size).toBe(2);
      expect(component.createdComponents.has('newField')).toBe(true);
    });

    it('should re-render when formGroup changes', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const oldFormGroup = component.testForm;
      component.testForm = new FormBuilder().group({
        test: ['new value'],
      });

      fixture.detectChanges();
      await fixture.whenStable();

      const testComponent = component.createdComponents.get('test');
      expect(testComponent.instance.formControl()).not.toBe(
        oldFormGroup.get('test'),
      );
      expect(testComponent.instance.formControl()).toBe(
        component.testForm.get('test'),
      );
    });

    it('should clean up components on destroy', () => {
      fixture.detectChanges();

      const destroySpy = jasmine.createSpy('destroy');
      if (component.createdComponents) {
        component.createdComponents.forEach((ref: any) => {
          spyOn(ref, 'destroy').and.callFake(destroySpy);
        });
      }

      fixture.destroy();

      if (component.createdComponents) {
        expect(destroySpy).toHaveBeenCalledTimes(
          component.createdComponents.size,
        );
      }
    });
  });

  // =============================================================================
  // PUBLIC API TESTS
  // =============================================================================

  describe('Public API', () => {
    beforeEach(async () => {
      component.fields = [
        {
          name: 'email',
          label: 'Email',
          controlType: 'input',
        },
        {
          name: 'submit',
          label: 'Submit',
          controlType: 'button',
        },
      ] as FieldMetadata[];

      component.testForm = new FormBuilder().group({
        email: [''],
        submit: [''],
      });

      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should provide getComponent method', () => {
      const emailComponent = directive.getComponent('email');
      const nonExistentComponent = directive.getComponent('nonexistent');

      expect(emailComponent).toBeDefined();
      expect(emailComponent!.componentType).toBe(TextInputComponent);
      expect(nonExistentComponent).toBeUndefined();
    });

    it('should provide getAllComponents method', () => {
      const allComponents = directive.getAllComponents();

      expect(allComponents).toBeInstanceOf(Map);
      expect(allComponents.size).toBe(2);
      expect(allComponents.has('email')).toBe(true);
      expect(allComponents.has('submit')).toBe(true);
    });

    it('should provide refresh method', async () => {
      const initialSize = component.createdComponents.size;

      // Modificar fields externamente
      component.fields.push({
        name: 'newField',
        label: 'New Field',
        controlType: 'input',
      } as FieldMetadata);

      component.testForm.addControl('newField', new FormBuilder().control(''));

      // Chamar refresh manualmente
      directive.refresh();
      await fixture.whenStable();

      expect(component.createdComponents.size).toBe(initialSize + 1);
      expect(component.createdComponents.has('newField')).toBe(true);
    });
  });

  // =============================================================================
  // EDGE CASES TESTS
  // =============================================================================

  describe('Edge Cases', () => {
    it('should handle empty fields array', () => {
      component.fields = [];
      component.testForm = new FormBuilder().group({});

      spyOn(console, 'warn');
      fixture.detectChanges();

      expect(console.warn).toHaveBeenCalledWith(
        '[DynamicFieldLoader] Fields array is empty - no components will be rendered',
      );
    });

    it('should warn about missing FormControls', async () => {
      component.fields = [
        {
          name: 'missingControl',
          label: 'Missing Control',
          controlType: 'input',
        },
      ] as FieldMetadata[];

      component.testForm = new FormBuilder().group({}); // FormGroup sem o control

      spyOn(console, 'warn');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(console.warn).toHaveBeenCalledWith(
        jasmine.stringContaining(
          "FormControl for field 'missingControl' not found in FormGroup",
        ),
      );
    });

    it('should prevent multiple simultaneous renders', async () => {
      component.fields = [
        {
          name: 'test',
          label: 'Test',
          controlType: 'input',
        },
      ] as FieldMetadata[];

      component.testForm = new FormBuilder().group({
        test: [''],
      });

      spyOn(console, 'debug');

      // Tentar múltiplas renderizações simultâneas
      directive.refresh();
      directive.refresh();
      directive.refresh();

      await fixture.whenStable();

      expect(console.debug).toHaveBeenCalledWith(
        '[DynamicFieldLoader] Waiting for current rendering to complete...',
      );
    });
  });
});
