import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardActionsComponent, CardBodyComponent, CardComponent, CardHeaderComponent, CardSubtitleDirective, CardTitleDirective, TabContentDirective, TabStripComponent, TabStripTabComponent } from '@progress/kendo-angular-layout';
import { ButtonComponent } from '@progress/kendo-angular-buttons';
import { DialogComponent, DialogRef } from '@progress/kendo-angular-dialog';
import { Subscription } from 'rxjs';
import { DynamicFormGroupService } from '../../../services/dynamic-form-group.service';
import { FieldMetadata } from '../../../models/field-metadata.model';
import { DynamicFieldLoaderDirective } from '../../../directives/dynamic-field-loader.directive';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { FormContextService } from '../../services/form-context.service';
import { ConditionBuilderComponent } from '../../field-configurator/condition-builder/condition-builder.component';
import { KENDO_LABELS } from '@progress/kendo-angular-label';
import { KENDO_INPUTS } from '@progress/kendo-angular-inputs';
import { DynamicFieldDetailComponent } from '../../form/dynamic-field-detail/dynamic-field-detail.component';
import { UpdatedFieldSet } from '../../form/dynamic-field-detail/models/updated-fieldset';

// Interface to represent fieldset configuration
export interface FieldsetConfig {
  id: string;
  title: string;
  titleNew: string;
  titleView: string;
  titleEdit: string;
  orientation: 'horizontal' | 'vertical';
  rows: any[]; // Contains all rows in the fieldset
  hiddenCondition?: CompositeFilterDescriptor;
}

@Component({
  selector: 'fieldset-configurator',
  templateUrl: './fieldset-configurator.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Kendo Layout
    CardActionsComponent,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    CardSubtitleDirective,
    CardTitleDirective,
    TabContentDirective,
    TabStripComponent,
    TabStripTabComponent,
    // Kendo Buttons
    ButtonComponent,
    // Kendo Dialog
    DialogComponent,
    ConditionBuilderComponent,
    KENDO_LABELS,
    KENDO_INPUTS,
    FormsModule,
    DynamicFieldDetailComponent
  ],
  styleUrls: ['./fieldset-configurator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldsetConfiguratorComponent implements OnInit, OnChanges, OnDestroy {
  private _fieldsetConfig!: FieldsetConfig;

  generalConfigForm!: FormGroup;

  @Input() set fieldsetConfig(value: FieldsetConfig) {
    this._fieldsetConfig = value;
    if (value) {
      this.extractFieldsFromFieldset();
      this.initializeGeneralForm();
    }
  }

  get fieldsetConfig(): FieldsetConfig {
    return this._fieldsetConfig;
  }

  fieldsetSchema: any[] = []; // Schema for fieldset properties
  fieldsInFieldset: FieldMetadata[] = []; // Fields in this fieldset

  // For visibility conditions
  otherAvailableFields: FieldMetadata[] = [];
  private _allAvailableFields: FieldMetadata[] = [];
  private fieldsSubscription: Subscription | null = null;

  isFormValid = true;

  constructor(
    private fb: FormBuilder,
    private dynamicFormGroupService: DynamicFormGroupService,
    private dialogRef: DialogRef,
    private fieldMetadataSharingService: FormContextService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Subscribe to available fields for conditions
    this.fieldsSubscription = this.fieldMetadataSharingService.getAvailableFields$().subscribe(allFields => {
      this._allAvailableFields = allFields || [];
      this.updateAvailableFields();
      this.cdRef.markForCheck();
    });

    this.generalConfigForm = this.fb.group({
      title: [this.fieldsetConfig.title || '', [Validators.required, Validators.maxLength(200)]],
      titleNew: [this.fieldsetConfig.titleNew || '', [Validators.required, Validators.maxLength(200)]],
      titleView: [this.fieldsetConfig.titleView || '', [Validators.required, Validators.maxLength(200)]],
      titleEdit: [this.fieldsetConfig.titleEdit || '', [Validators.required, Validators.maxLength(200)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnDestroy(): void {
    this.fieldsSubscription?.unsubscribe();
  }

  private initializeGeneralForm(): void {

  }

  private extractFieldsFromFieldset(): void {
    this.fieldsInFieldset = [];

    if (!this.fieldsetConfig?.rows?.length) {
      console.log('No rows found in fieldset');
      return;
    }

    try {
      // Use flatMap to extract and flatten all fields from rows in one operation
      this.fieldsInFieldset = this.fieldsetConfig.rows
        .flatMap(row => row.fields || [])
        .filter(field => !!field)
        .map(field => {
          // Ensure each field has the required properties
          if (!field.name) {
            console.warn('Field missing name property:', field);
          }

          // Return the field with default properties if needed
          return {
            ...field,
            icon: field.icon || 'input-cursor',
            // Add other default properties as needed
          } as FieldMetadata;
        });

      // Sort fields if needed
      this.fieldsInFieldset.sort((a, b) =>
        (a.label || a.name).localeCompare(b.label || b.name)
      );

      console.log(`Extracted ${this.fieldsInFieldset.length} fields from fieldset`);
    } catch (error) {
      console.error('Error extracting fields from fieldset:', error);
      this.fieldsInFieldset = [];
    }

    this.cdRef.markForCheck();
  }

  private updateAvailableFields(): void {
    this.otherAvailableFields = this._allAvailableFields;
    this.cdRef.markForCheck();
  }

  onConditionsChange(filter: CompositeFilterDescriptor | null): void {
    console.log('Hidden condition changed:', filter);
    this.fieldsetConfig.hiddenCondition = filter ?? undefined;
  }

  save(): void {

    const updatedFieldsetConfig = {
      ...this.fieldsetConfig,
      title: this.generalConfigForm.get('title')?.value,
      titleNew: this.generalConfigForm.get('titleNew')?.value,
      titleView: this.generalConfigForm.get('titleView')?.value,
      titleEdit: this.generalConfigForm.get('titleEdit')?.value
    };

    console.log('Fieldset configuration updated:', updatedFieldsetConfig);
    this.dialogRef.close(updatedFieldsetConfig);
  }

  cancel(): void {
    console.log('Edição cancelada');
    this.dialogRef.close(null);
  }

  onFieldsetChange(event: UpdatedFieldSet): void {
    this.isFormValid = event.isValid;
    this._fieldsetConfig = event.updatedFieldset;
    this.cdRef.markForCheck();
  }
}
