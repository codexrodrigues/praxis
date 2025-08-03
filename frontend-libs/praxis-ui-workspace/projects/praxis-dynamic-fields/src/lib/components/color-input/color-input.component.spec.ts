import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ColorInputComponent } from './color-input.component';

describe('ColorInputComponent', () => {
  let component: ColorInputComponent;
  let fixture: ComponentFixture<ColorInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorInputComponent, FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorInputComponent);
    component = fixture.componentInstance;
    component.metadata.set({
      label: 'Favorite color',
      required: true,
      inputType: 'color',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate color value changes', () => {
    const control = new FormControl('');
    component.registerOnChange(control.setValue.bind(control));
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '#ff0000';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('#ff0000');
  });
});
