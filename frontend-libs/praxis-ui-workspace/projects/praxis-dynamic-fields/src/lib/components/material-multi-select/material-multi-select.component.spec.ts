import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  FieldControlType,
  MaterialSelectMetadata,
  API_URL,
} from '@praxis/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MaterialMultiSelectComponent } from './material-multi-select.component';

describe('MaterialMultiSelectComponent', () => {
  let component: MaterialMultiSelectComponent;
  let fixture: ComponentFixture<MaterialMultiSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialMultiSelectComponent,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [{ provide: API_URL, useValue: { default: {} } }],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialMultiSelectComponent);
    component = fixture.componentInstance;
    const metadata: MaterialSelectMetadata = {
      controlType: FieldControlType.MULTI_SELECT,
      name: 'tags',
      label: 'Tags',
      multiple: true,
      selectAll: true,
      maxSelections: 2,
      selectOptions: [
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
    component.selectOption(third); // should be ignored due to maxSelections

    expect(component.internalControl.value).toEqual(['one', 'two']);
  });

  it('should toggle select all', () => {
    component.toggleSelectAll();
    expect(component.isAllSelected()).toBeTrue();
    expect(component.internalControl.value).toEqual(['one', 'two']); // limited by maxSelections
    component.toggleSelectAll();
    expect(component.internalControl.value).toEqual([]);
  });
});
