import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GenericCrudService, FieldMetadata, mapFieldDefinitionsToMetadata, EndpointConfig } from '@praxis/core';
import { DynamicFieldLoaderDirective } from '@praxis/dynamic-fields';
import { FormConfig, FormLayout, FormSubmitEvent, FormReadyEvent, FormValueChangeEvent, PraxisResizableWindowService } from '@praxis/core';
import { FormLayoutService } from './services/form-layout.service';
import { FormContextService } from './services/form-context.service';
import { PraxisDynamicFormConfigEditor } from './praxis-dynamic-form-config-editor';

@Component({
  selector: 'praxis-dynamic-form',
  standalone: true,
  providers: [GenericCrudService],
  imports: [CommonModule, ReactiveFormsModule, DynamicFieldLoaderDirective, MatIconModule, MatButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="praxis-dynamic-form">
      <ng-container *ngFor="let section of config.sections">
        <div class="form-section">
          <h3 *ngIf="section.title">{{ section.title }}</h3>
          <div *ngFor="let row of section.rows" class="form-row">
            <div *ngFor="let column of row.columns" class="form-column">
              <ng-container
                dynamicFieldLoader
                [fields]="getColumnFields(column)"
                [formGroup]="form">
              </ng-container>
            </div>
          </div>
        </div>
      </ng-container>
      <div class="form-actions">
        <button type="submit" mat-raised-button color="primary" [disabled]="form.invalid">
          {{ mode === 'edit' ? 'Atualizar' : 'Criar' }}
        </button>

        <button *ngIf="editModeEnabled" type="button" mat-icon-button (click)="openConfigEditor()">
          <mat-icon>settings</mat-icon>
        </button>
      </div>
    </form>
  `,
  styles: [`:host{display:block;}`]
})
export class PraxisDynamicForm implements OnInit, OnChanges, OnDestroy {
  @Input() resourcePath?: string;
  @Input() resourceId?: string | number;
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() config: FormConfig = { sections: [] };
  /** Shows the configuration editor button */
  @Input() editModeEnabled = false;
  /** Identifier for persisting layouts */
  @Input() formId?: string;
  /** Optional layout to use instead of generated one */
  @Input() layout?: FormLayout;

  /** Custom endpoints for CRUD operations */
  private _customEndpoints: EndpointConfig = {};
  @Input()
  get customEndpoints(): EndpointConfig {
    return this._customEndpoints;
  }
  set customEndpoints(value: EndpointConfig) {
    this._customEndpoints = value;
    if (value && Object.keys(value).length > 0) {
      this.crud.configureEndpoints(value);
    }
  }

  @Output() formSubmit = new EventEmitter<FormSubmitEvent>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() formReset = new EventEmitter<void>();
  @Output() configChange = new EventEmitter<FormConfig>();
  @Output() formReady = new EventEmitter<FormReadyEvent>();
  @Output() valueChange = new EventEmitter<FormValueChangeEvent>();

  form: FormGroup = this.fb.group({});
  private fieldMetadata: FieldMetadata[] = [];
  private pendingEntityId: string | number | null = null;

  constructor(
    private crud: GenericCrudService<any>,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private layoutService: FormLayoutService,
    private contextService: FormContextService,
    private windowService: PraxisResizableWindowService
  ) {}

  ngOnInit(): void {
    if (!this.layout && this.formId) {
      this.layout = this.layoutService.loadLayout(this.formId) || undefined;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resourcePath'] && this.resourcePath) {
      this.crud.configure(this.resourcePath);
      this.loadSchema();
    }
    if (changes['resourceId']) {
      this.pendingEntityId = this.resourceId ?? null;
      if (this.fieldMetadata.length > 0 && this.pendingEntityId != null) {
        this.loadEntity();
      }
    }
  }

  private loadSchema(): void {
    this.crud.getSchema().pipe(takeUntilDestroyed()).subscribe(defs => {
      this.fieldMetadata = mapFieldDefinitionsToMetadata(defs);
      this.buildForm();
      if (this.pendingEntityId != null) {
        this.loadEntity();
      }
      this.cdr.detectChanges();
    });
  }

  private loadEntity(): void {
    if (this.pendingEntityId == null) { return; }
    this.crud.get(this.pendingEntityId).pipe(takeUntilDestroyed()).subscribe(data => {
      this.form.patchValue(data);
    });
  }

  private buildForm(): void {
    const controls: any = {};
    for (const field of this.fieldMetadata) {
      const validators = [];
      if (field.required) { validators.push(Validators.required); }
      if (field.validators?.minLength) { validators.push(Validators.minLength(field.validators.minLength)); }
      if (field.validators?.maxLength) { validators.push(Validators.maxLength(field.validators.maxLength)); }
      if (field.validators?.pattern) { validators.push(Validators.pattern(field.validators.pattern)); }
      controls[field.name] = [field.defaultValue ?? null, validators];
    }
    this.form = this.fb.group(controls);

    this.contextService.setAvailableFields(this.fieldMetadata);
    if (this.layout?.formRules) {
      this.contextService.setFormRules(this.layout.formRules);
    }

    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(values => {
        this.valueChange.emit({
          formData: values,
          changedFields: Object.keys(values),
          isValid: this.form.valid,
          entityId: this.resourceId ?? undefined
        });
      });

    this.formReady.emit({
      formGroup: this.form,
      fieldsMetadata: this.fieldMetadata,
      layout: this.layout,
      hasEntity: this.resourceId != null,
      entityId: this.resourceId ?? undefined
    });
  }

  getColumnFields(column: { fields: string[] }): FieldMetadata[] {
    return this.fieldMetadata.filter(f => column.fields.includes(f.name));
  }

  onSubmit(): void {
    if (this.form.invalid) { return; }
    const formData = this.form.value;
    const operation: 'create' | 'update' = this.mode === 'edit' && this.resourceId != null ? 'update' : 'create';

    this.formSubmit.emit({ stage: 'before', formData, isValid: true, operation, entityId: this.resourceId ?? undefined });

    const req$ = operation === 'update'
      ? this.crud.update(this.resourceId!, formData)
      : this.crud.create(formData);

    req$.pipe(takeUntilDestroyed()).subscribe({
      next: result => {
        this.formSubmit.emit({ stage: 'after', formData, isValid: true, operation, entityId: this.resourceId ?? undefined, result });
      },
      error: error => {
        this.formSubmit.emit({ stage: 'error', formData, isValid: false, operation, entityId: this.resourceId ?? undefined, error });
      }
    });
  }

  openConfigEditor(): void {
    try {
      const configCopy = JSON.parse(JSON.stringify(this.config)) as FormConfig;

      const ref = this.windowService.open({
        title: 'Configurações do Formulário Dinâmico',
        contentComponent: PraxisDynamicFormConfigEditor,
        data: configCopy,
        initialWidth: '90vw',
        initialHeight: '90vh',
        minWidth: '320px',
        minHeight: '600px',
        disableResize: false,
        disableMaximize: false,
        enableTouch: true,
        minDragDistance: 5,
        enableInertia: true,
        inertiaFriction: 0.95,
        inertiaMultiplier: 10,
        bounceFactor: 0.5,
        autoCenterAfterResize: false
      });

      ref.closed.pipe(takeUntilDestroyed()).subscribe(result => {
        if (result) {
          this.config = { ...result };
          this.configChange.emit(this.config);
          if (this.formId && this.layout) {
            this.layoutService.saveLayout(this.formId, this.layout);
          }
          this.cdr.detectChanges();
        }
      });
    } catch {
      // TODO: Implement proper error logging service
    }
  }

  ngOnDestroy(): void {
    // cleanup via takeUntilDestroyed
  }
}
