import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component,
  ChangeDetectionStrategy,
  Injector,
  SimpleChange,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { BehaviorSubject } from 'rxjs';

import { FilterSettingsComponent } from './filter-settings.component';
import {
  SettingsPanelComponent,
  SettingsPanelRef,
} from '@praxis/settings-panel';
import { FieldMetadata, FieldControlType } from '@praxis/core';
import { FilterConfig } from '../services/filter-config.service';

class MockSettingsPanelRef {
  apply = jasmine.createSpy('apply');
  save = jasmine.createSpy('save');
  reset = jasmine.createSpy('reset');
  close = jasmine.createSpy('close');
}

@Component({
  selector: 'test-filter-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-settings.component.html',
  styleUrls: ['./filter-settings.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
  ],
})
class TestFilterSettingsComponent extends FilterSettingsComponent {
  canSave$ = new BehaviorSubject<boolean>(false);

  constructor(fb: FormBuilder) {
    super(fb);
  }
}

describe('FilterSettingsComponent', () => {
  const metadata: FieldMetadata[] = [
    {
      name: 'name',
      label: 'Name',
      controlType: FieldControlType.INPUT,
    },
    {
      name: 'status',
      label: 'Status',
      controlType: FieldControlType.INPUT,
    },
  ];

  const settings: FilterConfig = {
    quickField: 'name',
    alwaysVisibleFields: ['status'],
    placeholder: 'Search',
    showAdvanced: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FilterSettingsComponent,
        TestFilterSettingsComponent,
        SettingsPanelComponent,

        NoopAnimationsModule,
      ],
    }).compileComponents();
  });

  it('should render all tabs', () => {
    const fixture = TestBed.createComponent(FilterSettingsComponent);
    const component = fixture.componentInstance;
    component.metadata = metadata;
    component.settings = settings;
    component.ngOnChanges({
      settings: new SimpleChange(null, settings, true),
    });

    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Quick Field');
    expect(text).toContain('Always Visible');
    expect(text).toContain('Options');
  });

  it('should emit settings value on apply', () => {
    const fixture = TestBed.createComponent(SettingsPanelComponent);
    const panel = fixture.componentInstance;
    const ref = new MockSettingsPanelRef();
    panel.attachContent(
      TestFilterSettingsComponent,
      TestBed.inject(Injector),
      ref as unknown as SettingsPanelRef,
    );
    const content = panel.contentRef!.instance as TestFilterSettingsComponent;
    content.metadata = metadata;
    content.settings = settings;
    content.ngOnChanges({
      settings: new SimpleChange(null, settings, true),
    });
    content.form.patchValue({ placeholder: 'Buscar' });
    panel.onApply();
    expect(ref.apply).toHaveBeenCalledWith({
      quickField: 'name',
      alwaysVisibleFields: ['status'],
      placeholder: 'Buscar',
      showAdvanced: false,
    });
  });

  it('should toggle save button based on canSave$', () => {
    const fixture = TestBed.createComponent(SettingsPanelComponent);
    const panel = fixture.componentInstance;
    const ref = new MockSettingsPanelRef();
    panel.attachContent(
      TestFilterSettingsComponent,
      TestBed.inject(Injector),
      ref as unknown as SettingsPanelRef,
    );
    fixture.detectChanges();
    const content = panel.contentRef!.instance as TestFilterSettingsComponent;
    const saveBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      'footer button[color="primary"]',
    );
    expect(saveBtn.disabled).toBeTrue();
    content.canSave$.next(true);

    fixture.detectChanges();
    expect(saveBtn.disabled).toBeFalse();
  });

  it('should validate fields against metadata before saving', () => {
    const fixture = TestBed.createComponent(FilterSettingsComponent);
    const component = fixture.componentInstance;
    component.metadata = metadata;
    component.settings = {};
    component.ngOnChanges({
      settings: new SimpleChange(null, {}, true),
    });

    component.form.patchValue({
      quickField: 'invalid',
      alwaysVisibleFields: ['status', 'other'],
    });

    const result = component.getSettingsValue();
    expect(result.quickField).toBeUndefined();
    expect(result.alwaysVisibleFields).toEqual(['status']);
  });
});
