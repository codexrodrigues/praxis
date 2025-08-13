import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterSettingsComponent } from './filter-settings.component';
import { FieldMetadata } from '@praxis/core';
import { FilterConfig } from '../services/filter-config.service';

describe('FilterSettingsComponent', () => {
  let component: FilterSettingsComponent;
  let fixture: ComponentFixture<FilterSettingsComponent>;

  const metadata: FieldMetadata[] = [
    { name: 'name', label: 'Name', controlType: 'input' } as FieldMetadata,
    { name: 'status', label: 'Status', controlType: 'input' } as FieldMetadata,
  ];

  const settings: FilterConfig = {
    quickField: 'name',
    alwaysVisibleFields: ['status'],
    placeholder: 'Search',
    showAdvanced: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterSettingsComponent);
    component = fixture.componentInstance;
    component.metadata = metadata;
    component.settings = settings;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return settings from form', () => {
    const value = component.getSettingsValue();
    expect(value).toEqual(settings);
  });

  it('should reset to initial settings', () => {
    component.form.patchValue({ quickField: 'status', placeholder: 'X' });
    component.reset();
    const value = component.getSettingsValue();
    expect(value).toEqual(settings);
  });
});
