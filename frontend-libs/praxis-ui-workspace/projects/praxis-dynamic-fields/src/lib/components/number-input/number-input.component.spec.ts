import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { NumberInputComponent } from './number-input.component';

describe('NumberInputComponent', () => {
  let component: NumberInputComponent;
  let fixture: ComponentFixture<NumberInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumberInputComponent, FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NumberInputComponent);
    component = fixture.componentInstance;
    component.metadata.set({
      label: 'Age',
      required: true,
      inputType: 'number',
      min: 0,
      max: 120,
      step: 1,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate numeric value changes', () => {
    const control = new FormControl('');
    component.registerOnChange(control.setValue.bind(control));
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '42';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('42');
  });

  it('should enforce min and max validators', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    input.value = '-1';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeFalse();

    input.value = '121';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeFalse();

    input.value = '50';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeTrue();
  });
});
