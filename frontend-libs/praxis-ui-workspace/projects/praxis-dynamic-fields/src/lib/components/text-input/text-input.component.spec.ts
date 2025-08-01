import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { TextInputComponent } from './text-input.component';

describe('TextInputComponent', () => {
  let component: TextInputComponent;
  let fixture: ComponentFixture<TextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputComponent, FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TextInputComponent);
    component = fixture.componentInstance;
    component.metadata.set({ label: 'Name', required: true });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate value changes', () => {
    const control = new FormControl('');
    component.registerOnChange(control.setValue.bind(control));
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('test');
  });
});
