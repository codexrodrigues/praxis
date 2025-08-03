import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { WeekInputComponent } from './week-input.component';

describe('WeekInputComponent', () => {
  let component: WeekInputComponent;
  let fixture: ComponentFixture<WeekInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekInputComponent, FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(WeekInputComponent);
    component = fixture.componentInstance;
    component.metadata.set({
      label: 'Week',
      required: true,
      inputType: 'week',
      min: '2024-W01',
      max: '2024-W52',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate week value changes', () => {
    const control = new FormControl('');
    component.registerOnChange(control.setValue.bind(control));
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '2024-W10';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('2024-W10');
  });

  it('should validate week format', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');

    input.value = '2024-13';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeFalse();

    input.value = '2024-W10';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.valid).toBeTrue();
  });
});
