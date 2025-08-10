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

@Component({
  template: `
    <ng-template
      #item
      let-field="field"
      let-index="index"
      let-content="content"
    >
      <div class="wrapper" [attr.data-index]="index">
        <span class="label">{{ field.name }}</span>
        <ng-container [ngTemplateOutlet]="content"></ng-container>
      </div>
    </ng-template>
    <form [formGroup]="testForm">
      <ng-container
        dynamicFieldLoader
        [fields]="fields"
        [formGroup]="testForm"
        [itemTemplate]="item"
        (fieldCreated)="onFieldCreated($event)"
        (fieldDestroyed)="onFieldDestroyed($event)"
      ></ng-container>
    </form>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, DynamicFieldLoaderDirective],
})
class ItemTemplateHostComponent {
  testForm: FormGroup;
  fields: FieldMetadata[] = [];
  created: any[] = [];
  destroyed: any[] = [];

  constructor(private fb: FormBuilder) {
    this.testForm = this.fb.group({});
  }

  onFieldCreated(e: any) {
    this.created.push(e);
  }

  onFieldDestroyed(e: any) {
    this.destroyed.push(e);
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

      fixture.detectChanges();
      await fixture.whenStable();

      expect(console.error).toHaveBeenCalledWith(
        jasmine.stringContaining(
          "[DynamicFieldLoader] Error resolving component type 'input'",
        ),
        jasmine.any(Error),
      );
      expect(component.createdComponents.size).toBe(0);
    });

    it('should continue rendering other fields if component creation fails', async () => {
      @Component({ selector: 'fail-comp', standalone: true, template: '' })
      class FailingComponent {
        constructor() {
          throw new Error('boom');
        }
      }

      spyOn(registryService, 'getComponent').and.callFake(
        async (type: string): Promise<any> => {
          return type === 'fail' ? FailingComponent : TextInputComponent;
        },
      );

      component.fields = [
        { name: 'failField', controlType: 'fail' },
        { name: 'okField', controlType: 'input' },
      ] as FieldMetadata[];

      component.testForm = new FormBuilder().group({
        failField: [''],
        okField: [''],
      });

      spyOn(console, 'error');

      fixture.detectChanges();
      await fixture.whenStable();

      expect(console.error).toHaveBeenCalledWith(
        jasmine.stringContaining(
          "[DynamicFieldLoader] Failed to create component for field 'failField'",
        ),
        jasmine.any(Error),
      );
      expect(component.createdComponents.size).toBe(1);
      expect(component.createdComponents.has('okField')).toBeTrue();
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
  });

  // =============================================================================
  // KEYED RECONCILIATION TESTS
  // =============================================================================

  describe('Keyed Reconciliation', () => {
    it('should preserve components on reorder', async () => {
      component.fields = [
        { name: 'a', controlType: 'input' },
        { name: 'b', controlType: 'input' },
        { name: 'c', controlType: 'input' },
      ] as FieldMetadata[];
      component.testForm = new FormBuilder().group({
        a: [''],
        b: [''],
        c: [''],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const compA = directive.getComponent('a');
      const compB = directive.getComponent('b');
      const compC = directive.getComponent('c');

      const moveSpy = spyOn(
        (directive as any).viewContainer,
        'move',
      ).and.callThrough();

      component.fields = [
        { name: 'b', controlType: 'input' },
        { name: 'a', controlType: 'input' },
        { name: 'c', controlType: 'input' },
      ] as FieldMetadata[];
      fixture.detectChanges();
      await fixture.whenStable();

      expect(directive.getComponent('a')).toBe(compA);
      expect(directive.getComponent('b')).toBe(compB);
      expect(directive.getComponent('c')).toBe(compC);
      expect(moveSpy.calls.count()).toBe(2);

      const shellA = (directive as any).shellRefs.get('a');
      const shellB = (directive as any).shellRefs.get('b');
      const shellC = (directive as any).shellRefs.get('c');
      expect(shellB.instance.index).toBe(0);
      expect(shellA.instance.index).toBe(1);
      expect(shellC.instance.index).toBe(2);
    });

    it('should insert new fields without recreating existing ones', async () => {
      component.fields = [
        { name: 'a', controlType: 'input' },
        { name: 'c', controlType: 'input' },
      ] as FieldMetadata[];
      component.testForm = new FormBuilder().group({
        a: [''],
        c: [''],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const compA = directive.getComponent('a');
      const compC = directive.getComponent('c');

      component.fields = [
        { name: 'a', controlType: 'input' },
        { name: 'b', controlType: 'input' },
        { name: 'c', controlType: 'input' },
      ] as FieldMetadata[];
      component.testForm.addControl('b', new FormBuilder().control(''));
      fixture.detectChanges();
      await fixture.whenStable();

      expect(directive.getComponent('a')).toBe(compA);
      expect(directive.getComponent('c')).toBe(compC);
      expect(directive.getComponent('b')).toBeDefined();

      const shellA = (directive as any).shellRefs.get('a');
      const shellB = (directive as any).shellRefs.get('b');
      const shellC = (directive as any).shellRefs.get('c');
      expect(shellA.instance.index).toBe(0);
      expect(shellB.instance.index).toBe(1);
      expect(shellC.instance.index).toBe(2);
    });

    it('should remove fields individually', async () => {
      component.fields = [
        { name: 'a', controlType: 'input' },
        { name: 'b', controlType: 'input' },
        { name: 'c', controlType: 'input' },
      ] as FieldMetadata[];
      component.testForm = new FormBuilder().group({
        a: [''],
        b: [''],
        c: [''],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const compA = directive.getComponent('a');
      const compC = directive.getComponent('c');

      component.fields = [
        { name: 'a', controlType: 'input' },
        { name: 'c', controlType: 'input' },
      ] as FieldMetadata[];
      component.testForm.removeControl('b');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(directive.getComponent('a')).toBe(compA);
      expect(directive.getComponent('c')).toBe(compC);
      expect(directive.getComponent('b')).toBeUndefined();
    });

    it('should recreate field when controlType changes', async () => {
      component.fields = [
        { name: 'a', controlType: 'input' },
      ] as FieldMetadata[];
      component.testForm = new FormBuilder().group({ a: [''] });
      fixture.detectChanges();
      await fixture.whenStable();

      const original = directive.getComponent('a');

      component.fields = [
        { name: 'a', controlType: 'button' },
      ] as FieldMetadata[];
      fixture.detectChanges();
      await fixture.whenStable();

      expect(directive.getComponent('a')).not.toBe(original);
    });

    it('should detect mutated controlType without array replacement', async () => {
      component.fields = [
        { name: 'a', controlType: 'input' },
      ] as FieldMetadata[];
      component.testForm = new FormBuilder().group({ a: [''] });
      fixture.detectChanges();
      await fixture.whenStable();

      const original = directive.getComponent('a');

      component.fields[0].controlType = 'button';
      directive.refresh();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(directive.getComponent('a')).not.toBe(original);
    });
  });

  // =============================================================================
  // ITEM TEMPLATE & EVENTS TESTS
  // =============================================================================

  describe('Item Template and Events', () => {
    let itemFixture: ComponentFixture<ItemTemplateHostComponent>;
    let itemComponent: ItemTemplateHostComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          ItemTemplateHostComponent,
          NoopAnimationsModule,
          ReactiveFormsModule,
        ],
        providers: [
          {
            provide: ComponentRegistryService,
            useClass: MockComponentRegistryService,
          },
        ],
      }).compileComponents();

      itemFixture = TestBed.createComponent(ItemTemplateHostComponent);
      itemComponent = itemFixture.componentInstance;
    });

    it('should wrap each field with the itemTemplate', async () => {
      itemComponent.fields = [
        { name: 'email', controlType: 'input' },
        { name: 'submit', controlType: 'button' },
      ] as FieldMetadata[];
      itemComponent.testForm = new FormBuilder().group({
        email: [''],
        submit: [''],
      });
      itemFixture.detectChanges();
      await itemFixture.whenStable();

      const wrappers = itemFixture.debugElement.queryAll(By.css('.wrapper'));
      expect(wrappers.length).toBe(2);
      expect(
        wrappers[0].nativeElement.querySelector('input') instanceof
          HTMLInputElement,
      ).toBeTrue();
      expect(wrappers[1].nativeElement.getAttribute('data-index')).toBe('1');
    });

    it('should emit fieldCreated with correct order', async () => {
      itemComponent.fields = [
        { name: 'first', controlType: 'input' },
        { name: 'second', controlType: 'button' },
      ] as FieldMetadata[];
      itemComponent.testForm = new FormBuilder().group({
        first: [''],
        second: [''],
      });
      itemFixture.detectChanges();
      await itemFixture.whenStable();

      expect(itemComponent.created.length).toBe(2);
      expect(itemComponent.created[0].field.name).toBe('first');
      expect(itemComponent.created[0].index).toBe(0);
      expect(itemComponent.created[1].field.name).toBe('second');
      expect(itemComponent.created[1].index).toBe(1);
    });

    it('should emit fieldDestroyed on re-render and on destroy', async () => {
      itemComponent.fields = [
        { name: 'a', controlType: 'input' },
        { name: 'b', controlType: 'button' },
      ] as FieldMetadata[];
      itemComponent.testForm = new FormBuilder().group({
        a: [''],
        b: [''],
      });
      itemFixture.detectChanges();
      await itemFixture.whenStable();

      // remove field b
      itemComponent.fields = [
        { name: 'a', controlType: 'input' },
      ] as FieldMetadata[];
      itemComponent.testForm.removeControl('b');
      itemFixture.detectChanges();
      await itemFixture.whenStable();
      expect(
        itemComponent.destroyed.some((e) => e.fieldName === 'b'),
      ).toBeTrue();

      // destroy fixture
      itemFixture.destroy();
      expect(
        itemComponent.destroyed.some((e) => e.fieldName === 'a'),
      ).toBeTrue();
    });

    it('should keep FormControl state intact', async () => {
      itemComponent.fields = [
        { name: 'x', controlType: 'input' },
      ] as FieldMetadata[];
      itemComponent.testForm = new FormBuilder().group({ x: [''] });
      itemFixture.detectChanges();
      await itemFixture.whenStable();

      const control = itemComponent.testForm.get('x');
      control?.setValue('test');
      control?.markAsTouched();
      control?.markAsDirty();

      const created = itemComponent.created[0];
      const fieldControl = created.componentRef.instance.formControl();
      expect(fieldControl.value).toBe('test');
      expect(fieldControl.touched).toBeTrue();
      expect(fieldControl.dirty).toBeTrue();
    });
  });
});
