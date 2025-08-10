import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import {
  FieldControlType,
  MaterialSelectMetadata,
  API_URL,
} from '@praxis/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MaterialSelectComponent } from './material-select.component';

describe('MaterialSelectComponent', () => {
  let component: MaterialSelectComponent;
  let fixture: ComponentFixture<MaterialSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialSelectComponent,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [{ provide: API_URL, useValue: { default: {} } }],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialSelectComponent);
    component = fixture.componentInstance;
    const metadata: MaterialSelectMetadata = {
      controlType: FieldControlType.SELECT,
      name: 'status',
      label: 'Status',
      selectOptions: [
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
    const meta: MaterialSelectMetadata = {
      controlType: FieldControlType.SELECT,
      name: 'status',
      label: 'Status',
      required: true,
      disabled: true,
      selectOptions: [
        { label: 'A', text: 'A', value: 'a' },
        { label: 'B', text: 'B', value: 'b' },
      ],
    };
    component.setSelectMetadata(meta as any);
    fixture.detectChanges();
    const matSelect = fixture.debugElement.query(By.css('mat-select'))
      .componentInstance as MatSelect;
    expect(matSelect.required).toBeTrue();
    expect(matSelect.disabled).toBeTrue();
  });

  it('should render an empty option when emptyOptionText is provided', () => {
    const meta: MaterialSelectMetadata = {
      controlType: FieldControlType.SELECT,
      name: 'status',
      label: 'Status',
      emptyOptionText: 'None',
      selectOptions: [{ label: 'A', text: 'A', value: 'a' }],
    } as any;
    component.setSelectMetadata(meta as any);
    fixture.detectChanges();
    const options = fixture.debugElement.queryAll(By.css('mat-option'));
    expect(options[0].nativeElement.textContent.trim()).toBe('None');
    options[0].triggerEventHandler('click', {});
    expect(component.internalControl.value).toBeNull();
  });
});
