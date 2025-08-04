import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  FieldControlType,
  MaterialCheckboxMetadata,
  API_URL,
} from '@praxis/core';

import { MaterialCheckboxGroupComponent } from './material-checkbox-group.component';

describe('MaterialCheckboxGroupComponent', () => {
  let component: MaterialCheckboxGroupComponent;
  let fixture: ComponentFixture<MaterialCheckboxGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialCheckboxGroupComponent,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [{ provide: API_URL, useValue: { default: {} } }],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialCheckboxGroupComponent);
    component = fixture.componentInstance;
    const metadata: MaterialCheckboxMetadata = {
      controlType: FieldControlType.CHECKBOX,
      name: 'tags',
      label: 'Tags',
      selectAll: true,
      maxSelections: 2,
      checkboxOptions: [
        { label: 'One', text: 'One', value: 'one' },
        { label: 'Two', text: 'Two', value: 'two' },
        { label: 'Three', text: 'Three', value: 'three' },
      ],
    };
    component.setSelectMetadata(metadata as any);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select multiple options respecting maxSelections', () => {
    const first = component.options()[0];
    const second = component.options()[1];
    const third = component.options()[2];

    component.selectOption(first);
    component.selectOption(second);
    component.selectOption(third); // ignored due to maxSelections

    expect(component.internalControl.value).toEqual(['one', 'two']);
  });

  it('should toggle select all', () => {
    component.toggleSelectAll();
    expect(component.isAllSelected()).toBeTrue();
    expect(component.internalControl.value).toEqual(['one', 'two']);
    component.toggleSelectAll();
    expect(component.internalControl.value).toEqual([]);
  });
});
