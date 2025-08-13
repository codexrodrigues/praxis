import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilterSettingsComponent } from './filter-settings.component';
import { SettingsPanelComponent } from '@praxis/settings-panel';
import { SettingsPanelRef } from '@praxis/settings-panel';
import { FieldMetadata } from '@praxis/core';
import { FilterConfig } from '../services/filter-config.service';

class MockSettingsPanelRef {
  apply = jasmine.createSpy('apply');
  save = jasmine.createSpy('save');
  reset = jasmine.createSpy('reset');
  close = jasmine.createSpy('close');
}

describe('FilterSettingsComponent', () => {
  let fixture: ComponentFixture<SettingsPanelComponent>;
  let panel: SettingsPanelComponent;
  let ref: MockSettingsPanelRef;

  const metadata: FieldMetadata[] = [
    { name: 'name', label: 'Name', controlType: 'input' } as FieldMetadata,
    { name: 'status', label: 'Status', controlType: 'input' } as FieldMetadata,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SettingsPanelComponent,
        FilterSettingsComponent,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPanelComponent);
    panel = fixture.componentInstance;
    ref = new MockSettingsPanelRef();

    panel.attachContent(
      FilterSettingsComponent,
      TestBed.inject(Injector),
      ref as unknown as SettingsPanelRef,
    );
    const instance = panel.contentRef!.instance as FilterSettingsComponent;
    instance.metadata = metadata;
    fixture.detectChanges();
  });

  it('should render tabs', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('.mdc-tab__text-label'),
    ).map((el: Element) => el.textContent?.trim());
    expect(labels).toEqual(['Quick Field', 'Always Visible', 'Options']);
  });

  it('should emit settings value on save', () => {
    const instance = panel.contentRef!.instance as FilterSettingsComponent;
    instance.form.patchValue({ quickField: 'name', placeholder: 'Buscar' });
    fixture.detectChanges();

    panel.onSave();

    expect(ref.save).toHaveBeenCalledWith({
      quickField: 'name',
      alwaysVisibleFields: [],
      placeholder: 'Buscar',
      showAdvanced: false,
    } as FilterConfig);
  });

  it('should enable and disable save button based on canSave$', () => {
    const saveBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[color="primary"]',
    );
    expect(saveBtn.disabled).toBeTrue();

    const instance = panel.contentRef!.instance as FilterSettingsComponent;
    instance.form.patchValue({ placeholder: 'X' });
    fixture.detectChanges();
    expect(saveBtn.disabled).toBeFalse();
  });
});
