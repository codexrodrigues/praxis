import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialTimepickerComponent } from './material-timepicker.component';
import { MaterialTimePickerMetadata } from '@praxis/core';

describe('MaterialTimepickerComponent', () => {
  let component: MaterialTimepickerComponent;
  let fixture: ComponentFixture<MaterialTimepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialTimepickerComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialTimepickerComponent);
    component = fixture.componentInstance;
    const metadata: MaterialTimePickerMetadata = {
      name: 'time',
      label: 'Time',
      controlType: 'timePicker'
    } as any;
    component.setMetadata(metadata);
    component.setFormControl(new FormControl());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close the picker', () => {
    component.openTimePicker();
    expect(component.isPickerOpen()).toBeTrue();

    component.closeTimePicker();
    expect(component.isPickerOpen()).toBeFalse();
  });

  it('should update value when confirming time', () => {
    component.openTimePicker();
    component.onTempInputChange({ target: { value: '08:30' } } as any);
    component.confirmTime();

    expect(component.formControl.value).toBe('08:30');
  });
});
