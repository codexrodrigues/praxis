import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialDatePickerComponent } from './material-date-picker.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

describe('MaterialDatePickerComponent', () => {
  let component: MaterialDatePickerComponent;
  let fixture: ComponentFixture<MaterialDatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialDatePickerComponent,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should parse and emit selected date', () => {
    const date = new Date(2024, 0, 1);
    component.onDateChange(date);
    expect(component.selectedDate()).toEqual(date);
  });
});
