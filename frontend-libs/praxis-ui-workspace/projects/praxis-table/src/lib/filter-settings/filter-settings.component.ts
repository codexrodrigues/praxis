import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FieldMetadata } from '@praxis/core';
import { FilterConfig } from '../services/filter-config.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'filter-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './filter-settings.component.html',
  styleUrls: ['./filter-settings.component.scss'],
})
export class FilterSettingsComponent implements OnChanges {
  @Input() metadata: FieldMetadata[] = [];
  @Input() settings: FilterConfig | undefined;

  form: FormGroup<{
    quickField: FormControl<string | null>;
    alwaysVisibleFields: FormControl<string[]>;
    placeholder: FormControl<string>;
    showAdvanced: FormControl<boolean>;
  }>;

  /**
   * Emits true when form has changes and is valid, enabling the save button
   */
  canSave$: Observable<boolean>;

  private initialSettings: FilterConfig = {};

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      quickField: this.fb.control<string | null>(null),
      alwaysVisibleFields: this.fb.nonNullable.control<string[]>([]),
      placeholder: this.fb.nonNullable.control(''),
      showAdvanced: this.fb.nonNullable.control(false),
    });

    this.canSave$ = this.form.valueChanges.pipe(
      map(() => this.form.dirty && this.form.valid),
      startWith(false),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['settings'] && this.settings) {
      this.initialSettings = { ...this.settings };
      this.form.reset({
        quickField: this.settings.quickField ?? null,
        alwaysVisibleFields: this.settings.alwaysVisibleFields ?? [],
        placeholder: this.settings.placeholder ?? '',
        showAdvanced: this.settings.showAdvanced ?? false,
      });
    }
  }

  getSettingsValue(): FilterConfig {
    const value = this.form.getRawValue();
    const names = new Set(this.metadata.map((m) => m.name));
    const quickField =
      value.quickField && names.has(value.quickField)
        ? value.quickField
        : undefined;
    const alwaysVisibleFields = value.alwaysVisibleFields.filter((f) =>
      names.has(f),
    );
    return {
      quickField,
      alwaysVisibleFields: alwaysVisibleFields.length
        ? alwaysVisibleFields
        : undefined,
      placeholder: value.placeholder || undefined,
      showAdvanced: value.showAdvanced ?? undefined,
    };
  }

  reset(): void {
    this.form.reset({
      quickField: this.initialSettings.quickField ?? null,
      alwaysVisibleFields: this.initialSettings.alwaysVisibleFields ?? [],
      placeholder: this.initialSettings.placeholder ?? '',
      showAdvanced: this.initialSettings.showAdvanced ?? false,
    });
  }
}
