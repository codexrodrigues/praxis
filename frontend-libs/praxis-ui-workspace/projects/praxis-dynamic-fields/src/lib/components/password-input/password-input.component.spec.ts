import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { PasswordInputComponent } from './password-input.component';

describe('PasswordInputComponent', () => {
  let component: PasswordInputComponent;
  let fixture: ComponentFixture<PasswordInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordInputComponent, FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordInputComponent);
    component = fixture.componentInstance;
    component.metadata.set({
      label: 'Password',
      required: true,
      inputType: 'password',
      controlType: 'password',
    } as any);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate password value changes', () => {
    const control = new FormControl('');
    component.registerOnChange(control.setValue.bind(control));
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = 'secret';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('secret');
  });

  it('should render input type password', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('password');
  });
});
