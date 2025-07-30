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
import { GenericCrudService, FieldMetadata, mapFieldDefinitionsToMetadata } from '@praxis/core';
import { DynamicFieldLoaderDirective } from '@praxis/dynamic-fields';
import { FormConfig } from './models/form-config.model';
import { FormLayout } from './models/form-layout.model';
import { FormSubmitEvent, FormReadyEvent, FormValueChangeEvent } from './models/form-events.model';
import { FormLayoutService } from './services/form-layout.service';
import { FormContextService } from './services/form-context.service';

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


  @Output() formSubmit = new EventEmitter<FormSubmitEvent>();
  @Output() formCancel = new EventEmitter<void>();
  @Output() formReset = new EventEmitter<void>();
  @Output() configChange = new EventEmitter<FormConfig>();
  @Output() formReady = new EventEmitter<FormReadyEvent>();
  @Output() valueChange = new EventEmitter<FormValueChangeEvent>();

  form: FormGroup = this.fb.group({});
  private fieldMetadata: FieldMetadata[] = [];

  constructor(
    private crud: GenericCrudService<any>,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private layoutService: FormLayoutService,
    private contextService: FormContextService
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
    if (changes['resourceId'] && this.resourceId != null) {
      this.loadEntity();
    }
  }

  private loadSchema(): void {
    this.crud.getSchema().pipe(takeUntilDestroyed()).subscribe(defs => {
      this.fieldMetadata = mapFieldDefinitionsToMetadata(defs);
      this.buildForm();
      this.cdr.detectChanges();
    });
  }

  private loadEntity(): void {
    if (!this.resourceId) { return; }
    this.crud.get(this.resourceId).pipe(takeUntilDestroyed()).subscribe(data => {
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
    const value = this.form.value;
    const req$ = this.mode === 'edit' && this.resourceId != null
      ? this.crud.update(this.resourceId, value)
      : this.crud.create(value);
    req$.pipe(takeUntilDestroyed()).subscribe(data => {
      this.formSubmit.emit({ mode: this.mode === 'edit' ? 'edit' : 'create', data, formValue: value });
    });
  }

  openConfigEditor(): void {
    this.configChange.emit(this.config);
    if (this.formId && this.layout) {
      this.layoutService.saveLayout(this.formId, this.layout);
    }
  }

  ngOnDestroy(): void {
    // cleanup via takeUntilDestroyed
  }
}
