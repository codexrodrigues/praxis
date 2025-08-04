import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTimepicker } from '@angular/material/timepicker';
import { MaterialTimepickerComponent } from './material-timepicker.component';

describe('MaterialTimepickerComponent', () => {
  let component: MaterialTimepickerComponent;
  let fixture: ComponentFixture<MaterialTimepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialTimepickerComponent,
        FormsModule,
        ReactiveFormsModule,
        MatNativeDateModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialTimepickerComponent);
    component = fixture.componentInstance;
    component.metadata.set({
      name: 'meetingTime',
      label: 'Meeting time',
      controlType: 'timePicker',
      interval: '30m',
      required: true,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate time value changes', () => {
    const control = new FormControl<string | null>(null);
    component.registerOnChange(control.setValue.bind(control));
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '12:30';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('12:30');
  });

  it('should update UI when value set programmatically', () => {
    component.writeValue('10:15');
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('10:15');
  });

  it('should validate required field', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeFalse();

    input.value = '09:00';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeTrue();
  });

  it('should validate min and max constraints', () => {
    component.metadata.update((m) => ({ ...m, min: '09:00', max: '17:00' }));
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    input.value = '08:00';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeFalse();

    input.value = '10:00';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeTrue();
  });

  it('should validate step and timeFilter rules', () => {
    (component as any).evenHours = (time: string) =>
      parseInt(time.split(':')[0], 10) % 2 === 0;
    component.metadata.update((m) => ({
      ...m,
      stepMinute: 15,
      timeFilter: 'evenHours',
    }));
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    input.value = '10:10';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeFalse();

    input.value = '10:15';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeTrue();

    input.value = '11:15';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeFalse();
  });

  it('should respect 12h and 24h formats', () => {
    component.metadata.update((m) => ({ ...m, format: '12h' }));
    fixture.detectChanges();
    const picker = fixture.debugElement.query(By.css('mat-timepicker'))
      .componentInstance as any;
    expect(picker.format).toBe('12h');

    component.metadata.update((m) => ({ ...m, format: '24h' }));
    fixture.detectChanges();
    expect(picker.format).toBe('24h');
  });

  it('should emit validationChange on status updates', () => {
    const spy = jasmine.createSpy('validationChange');
    component.validationChange.subscribe(spy);
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalled();
  });

  it('should set accessibility attributes', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('aria-label')).toBe('Meeting time');
    expect(input.getAttribute('aria-required')).toBe('true');
  });
});
