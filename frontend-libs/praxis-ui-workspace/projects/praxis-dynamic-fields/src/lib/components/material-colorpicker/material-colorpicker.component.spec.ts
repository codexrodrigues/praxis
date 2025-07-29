import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialColorPickerComponent } from './material-colorpicker.component';
import { MaterialColorPickerMetadata } from '@praxis/core';

describe('MaterialColorPickerComponent', () => {
  let component: MaterialColorPickerComponent;
  let fixture: ComponentFixture<MaterialColorPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialColorPickerComponent,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialColorPickerComponent);
    component = fixture.componentInstance;
    const metadata: MaterialColorPickerMetadata = {
      name: 'color',
      label: 'Color',
      controlType: 'colorPicker'
    } as any;
    component.setMetadata(metadata);
    component.setFormControl(new FormControl('#000000'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close the picker', () => {
    component.openColorPicker();
    expect(component.isPickerOpen()).toBeTrue();
    component.closeColorPicker();
    expect(component.isPickerOpen()).toBeFalse();
  });

  it('should update value when confirming color', () => {
    component.openColorPicker();
    component.selectPresetColor('#ff0000');
    component.confirmColor();
    expect(component.formControl.value).toBe('#ff0000');
  });
});
