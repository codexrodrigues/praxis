import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MaterialColorPickerComponent } from './material-colorpicker.component';

describe('MaterialColorPickerComponent', () => {
  let component: MaterialColorPickerComponent;
  let fixture: ComponentFixture<MaterialColorPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialColorPickerComponent, FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialColorPickerComponent);
    component = fixture.componentInstance;
    component.metadata.set({
      label: 'Favorite color',
      required: true,
    } as any);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate color value changes from native picker', () => {
    const control = new FormControl('');
    component.registerOnChange(control.setValue.bind(control));
    const nativeInput: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="color"]');
    nativeInput.value = '#123456';
    nativeInput.dispatchEvent(new Event('change'));
    expect(control.value).toBe('#123456');
  });
});
