import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';
import { By } from '@angular/platform-browser';
import { MatDateRangePicker } from '@angular/material/datepicker';

import { MaterialDateRangeComponent } from './material-date-range.component';
import { DateRangeValue } from '@praxis/core';

describe('MaterialDateRangeComponent', () => {
  let component: MaterialDateRangeComponent;
  let fixture: ComponentFixture<MaterialDateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialDateRangeComponent,
        FormsModule,
        ReactiveFormsModule,
        MatNativeDateModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialDateRangeComponent);
    component = fixture.componentInstance;
    component.setDateRangeMetadata({
      name: 'range',
      label: 'Select range',
      controlType: 'dateRange' as any,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate range value changes', () => {
    const control = new FormControl<DateRangeValue | null>(null);
    component.registerOnChange(control.setValue.bind(control));
    const start = new Date('2024-05-01');
    const end = new Date('2024-05-10');
    component.rangeGroup.setValue({ start, end });
    expect(control.value).toEqual({ startDate: start, endDate: end });
  });

  it('should respect min and max dates', () => {
    component.setDateRangeMetadata({
      name: 'range',
      label: 'Range',
      controlType: 'dateRange' as any,
      minDate: new Date('2024-01-01'),
      maxDate: new Date('2024-12-31'),
    });
    fixture.detectChanges();

    component.rangeGroup.setValue({
      start: new Date('2023-12-31'),
      end: new Date('2024-01-05'),
    });
    expect(component.rangeGroup.valid).toBeFalse();

    component.rangeGroup.setValue({
      start: new Date('2024-01-02'),
      end: new Date('2024-01-05'),
    });
    expect(component.rangeGroup.valid).toBeTrue();
  });

  it('should respect custom date filter', () => {
    component.setDateRangeMetadata({
      name: 'filtered',
      label: 'Filtered',
      controlType: 'dateRange' as any,
      dateFilter: (d: Date | null) => (d ? d.getDay() !== 0 : true),
    });
    fixture.detectChanges();

    component.rangeGroup.setValue({
      start: new Date('2024-05-05'), // Sunday
      end: new Date('2024-05-06'),
    });
    expect(component.rangeGroup.valid).toBeFalse();

    component.rangeGroup.setValue({
      start: new Date('2024-05-06'),
      end: new Date('2024-05-07'),
    });
    expect(component.rangeGroup.valid).toBeTrue();
  });

  it('should start calendar at provided date', () => {
    const start = new Date('2024-04-15');
    component.setDateRangeMetadata({
      name: 'start',
      label: 'Start',
      controlType: 'dateRange' as any,
      startAt: start,
    });
    fixture.detectChanges();
    const picker = fixture.debugElement.query(By.directive(MatDateRangePicker))
      .componentInstance as MatDateRangePicker<Date>;
    expect(picker.startAt).toEqual(start);
  });
});
