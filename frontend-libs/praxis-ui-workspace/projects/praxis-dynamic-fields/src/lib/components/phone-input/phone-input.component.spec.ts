import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { PhoneInputComponent } from './phone-input.component';

describe('PhoneInputComponent', () => {
  let component: PhoneInputComponent;
  let fixture: ComponentFixture<PhoneInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneInputComponent, FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneInputComponent);
    component = fixture.componentInstance;
    component.metadata.set({
      label: 'Phone',
      required: true,
      inputType: 'tel',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate phone value changes', () => {
    const control = new FormControl('');
    component.registerOnChange(control.setValue.bind(control));
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '1234567890';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('1234567890');
  });

  it('should validate required field', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeFalse();

    input.value = '5551234567';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeTrue();
  });

  it('should validate phone format', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    input.value = 'invalid!';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeFalse();

    input.value = '+55 (11) 99999-8888';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeTrue();
  });
});
