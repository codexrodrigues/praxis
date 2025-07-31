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

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GenericCrudService, FieldMetadata, mapFieldDefinitionsToMetadata, EndpointConfig } from '@praxis/core';
import { DynamicFieldLoaderDirective } from '@praxis/dynamic-fields';
import { FormConfig, FormLayout, FormSubmitEvent, FormReadyEvent, FormValueChangeEvent, FormSection, FormRow, FormColumn, PraxisResizableWindowService } from '@praxis/core';
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

  form!: FormGroup;
  private fieldMetadata: FieldMetadata[] = [];
  private pendingEntityId: string | number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private crud: GenericCrudService<any>,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private layoutService: FormLayoutService,
    private contextService: FormContextService
  ) {
    this.form = this.fb.group({});
  }

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
    this.crud.getSchema().pipe(takeUntil(this.destroy$)).subscribe(defs => {
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
    this.crud.getById(this.pendingEntityId).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
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

    // Auto-generate layout if config is empty and we have metadata
    this.generateDefaultLayoutIfNeeded();

    this.contextService.setAvailableFields(this.fieldMetadata);
    if (this.layout?.formRules) {
      this.contextService.setFormRules(this.layout.formRules);
    }

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
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

  /**
   * Generates a default layout if the current config has no sections
   * and we have field metadata available
   */
  private generateDefaultLayoutIfNeeded(): void {
    if (this.config.sections.length === 0 && this.fieldMetadata.length > 0) {
      this.config = this.generateFormConfigFromMetadata(this.fieldMetadata);
    }
  }

  /**
   * Generates a FormConfig from FieldMetadata array
   * Groups fields by their 'group' property or creates a single default section
   */
  private generateFormConfigFromMetadata(fields: FieldMetadata[], options?: {
    fieldsPerRow?: number;
    defaultSectionTitle?: string;
  }): FormConfig {
    const fieldsPerRow = options?.fieldsPerRow ?? 2;
    const defaultSectionTitle = options?.defaultSectionTitle ?? 'Informações';

    // Group fields by their 'group' property
    const groupedFields = new Map<string, FieldMetadata[]>();
    
    for (const field of fields) {
      const groupName = field.group || 'default';
      if (!groupedFields.has(groupName)) {
        groupedFields.set(groupName, []);
      }
      groupedFields.get(groupName)!.push(field);
    }

    // Sort fields within each group by order property
    groupedFields.forEach((fieldList) => {
      fieldList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });

    // Create sections from grouped fields
    const sections: FormSection[] = [];
    
    groupedFields.forEach((groupFields, groupName) => {
      const sectionTitle = groupName === 'default' 
        ? defaultSectionTitle 
        : this.capitalizeFirstLetter(groupName);

      sections.push({
        id: groupName,
        title: sectionTitle,
        rows: this.createRowsFromFields(groupFields, fieldsPerRow)
      });
    });

    return { sections };
  }

  /**
   * Creates rows from a list of fields, organizing them into columns
   */
  private createRowsFromFields(fields: FieldMetadata[], fieldsPerRow: number = 2): FormRow[] {
    const rows: FormRow[] = [];
    
    for (let i = 0; i < fields.length; i += fieldsPerRow) {
      const rowFields = fields.slice(i, i + fieldsPerRow);
      const columns: FormColumn[] = rowFields.map(field => ({
        fields: [field.name]
      }));
      
      rows.push({ columns });
    }
    
    return rows;
  }

  /**
   * Utility method to capitalize first letter of a string
   */
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
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

    req$.pipe(takeUntil(this.destroy$)).subscribe({
      next: result => {
        this.formSubmit.emit({ stage: 'after', formData, isValid: true, operation, entityId: this.resourceId ?? undefined, result });
      },
      error: error => {
        this.formSubmit.emit({ stage: 'error', formData, isValid: false, operation, entityId: this.resourceId ?? undefined, error });
      }
    });
  }

  openConfigEditor(): void {
    this.configChange.emit(this.config);
    if (this.formId && this.layout) {
      this.layoutService.saveLayout(this.formId, this.layout);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
