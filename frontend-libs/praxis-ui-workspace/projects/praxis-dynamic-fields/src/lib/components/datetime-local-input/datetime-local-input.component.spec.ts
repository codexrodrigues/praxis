import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { DatetimeLocalInputComponent } from './datetime-local-input.component';

describe('DatetimeLocalInputComponent', () => {
  let component: DatetimeLocalInputComponent;
  let fixture: ComponentFixture<DatetimeLocalInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatetimeLocalInputComponent, FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DatetimeLocalInputComponent);
    component = fixture.componentInstance;
    component.metadata.set({
      label: 'Meeting time',
      required: true,
      inputType: 'datetime-local',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate datetime value changes', () => {
    const control = new FormControl('');
    component.registerOnChange(control.setValue.bind(control));
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '2024-05-01T12:30';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('2024-05-01T12:30');
  });

  it('should validate datetime format', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    input.value = 'invalid';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeFalse();

    input.value = '2024-05-01T12:30';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeTrue();
  });
});
