import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatRadioGroup } from '@angular/material/radio';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FieldControlType, MaterialRadioMetadata, API_URL } from '@praxis/core';

import { MaterialRadioGroupComponent } from './material-radio-group.component';

describe('MaterialRadioGroupComponent', () => {
  let component: MaterialRadioGroupComponent;
  let fixture: ComponentFixture<MaterialRadioGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialRadioGroupComponent,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [{ provide: API_URL, useValue: { default: {} } }],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialRadioGroupComponent);
    component = fixture.componentInstance;
    const metadata: MaterialRadioMetadata = {
      controlType: FieldControlType.RADIO,
      name: 'status',
      label: 'Status',
      radioOptions: [
        { label: 'Active', text: 'Active', value: 'active' },
        { label: 'Inactive', text: 'Inactive', value: 'inactive' },
      ],
    };
    component.setSelectMetadata(metadata as any);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select option and emit events', () => {
    const spySelection = jasmine.createSpy('selectionChange');
    const spyOption = jasmine.createSpy('optionSelected');
    component.selectionChange.subscribe(spySelection);
    component.optionSelected.subscribe(spyOption);

    const option = component.options()[1];
    component.selectOption(option);

    expect(component.internalControl.value).toBe('inactive');
    expect(spySelection).toHaveBeenCalledWith('inactive');
    expect(spyOption).toHaveBeenCalledWith(option);
  });

  it('should reflect disabled and required states', () => {
    const meta: MaterialRadioMetadata = {
      controlType: FieldControlType.RADIO,
      name: 'status',
      label: 'Status',
      required: true,
      disabled: true,
      radioOptions: [
        { label: 'A', text: 'A', value: 'a' },
        { label: 'B', text: 'B', value: 'b' },
      ],
    };
    component.setSelectMetadata(meta as any);
    fixture.detectChanges();
    const group = fixture.debugElement.query(By.css('mat-radio-group'))
      .componentInstance as MatRadioGroup;
    expect(group.required).toBeTrue();
    expect(group.disabled).toBeTrue();
  });
});
