import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';
import { By } from '@angular/platform-browser';
import { MatDatepicker } from '@angular/material/datepicker';

import { MaterialDatepickerComponent } from './material-datepicker.component';

describe('MaterialDatepickerComponent', () => {
  let component: MaterialDatepickerComponent;
  let fixture: ComponentFixture<MaterialDatepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialDatepickerComponent,
        FormsModule,
        ReactiveFormsModule,
        MatNativeDateModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialDatepickerComponent);
    component = fixture.componentInstance;
    component.setDatepickerMetadata({
      name: 'date',
      label: 'Select date',
      controlType: 'date' as any,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate date value changes', () => {
    const control = new FormControl<Date | null>(null);
    component.registerOnChange(control.setValue.bind(control));
    const date = new Date('2024-05-01');
    component.onDateChange({ value: date } as any);
    expect(control.value).toEqual(date);
  });

  it('should respect min and max dates', () => {
    component.setDatepickerMetadata({
      name: 'range',
      label: 'Range',
      controlType: 'date' as any,
      minDate: new Date('2024-01-01'),
      maxDate: new Date('2024-12-31'),
    });
    fixture.detectChanges();

    component.onDateChange({ value: new Date('2023-12-31') } as any);
    expect(component.internalControl.valid).toBeFalse();

    component.onDateChange({ value: new Date('2024-06-01') } as any);
    expect(component.internalControl.valid).toBeTrue();
  });

  it('should respect custom date filter', () => {
    component.setDatepickerMetadata({
      name: 'filtered',
      label: 'Filtered',
      controlType: 'date' as any,
      dateFilter: (d: Date | null) => (d ? d.getDay() !== 0 : true),
    });
    fixture.detectChanges();

    component.onDateChange({ value: new Date('2024-05-05') } as any); // Sunday
    expect(component.internalControl.valid).toBeFalse();

    component.onDateChange({ value: new Date('2024-05-06') } as any); // Monday
    expect(component.internalControl.valid).toBeTrue();
  });

  it('should start calendar at provided date', () => {
    const start = new Date('2024-04-15');
    component.setDatepickerMetadata({
      name: 'start',
      label: 'Start',
      controlType: 'date' as any,
      startAt: start,
    });
    fixture.detectChanges();
    const datepicker = fixture.debugElement.query(By.directive(MatDatepicker))
      .componentInstance as MatDatepicker<Date>;
    expect(datepicker.startAt).toEqual(start);
  });
});
