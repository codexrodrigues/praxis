import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MonthInputComponent } from './month-input.component';

describe('MonthInputComponent', () => {
  let component: MonthInputComponent;
  let fixture: ComponentFixture<MonthInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthInputComponent, FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthInputComponent);
    component = fixture.componentInstance;
    component.metadata.set({
      label: 'Month',
      required: true,
      inputType: 'month',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate month value changes', () => {
    const control = new FormControl('');
    component.registerOnChange(control.setValue.bind(control));
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '2024-05';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('2024-05');
  });

  it('should validate month format', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    input.value = '2024-13';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeFalse();

    input.value = '2024-05';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeTrue();
  });
});
