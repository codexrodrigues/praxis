import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterSettingsComponent } from './filter-settings.component';
import { FieldMetadata } from '@praxis/core';
import { FilterConfig } from '../services/filter-config.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import {
  SettingsPanelComponent,
  SettingsPanelRef,
} from '@praxis/settings-panel';
import {
  Injector,
  Component,
  ChangeDetectionStrategy,
  SimpleChange,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    { name: 'name', label: 'Name', controlType: 'input' } as FieldMetadata,
    { name: 'status', label: 'Status', controlType: 'input' } as FieldMetadata,
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
});
