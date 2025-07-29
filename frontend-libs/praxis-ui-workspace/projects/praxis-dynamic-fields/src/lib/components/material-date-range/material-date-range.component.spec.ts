import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { MaterialDateRangeComponent } from './material-date-range.component';
import { MaterialDatepickerMetadata } from '@praxis/core';

describe('MaterialDateRangeComponent', () => {
  let component: MaterialDateRangeComponent;
  let fixture: ComponentFixture<MaterialDateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialDateRangeComponent,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply preset', () => {
    const metadata: MaterialDatepickerMetadata = {
      name: 'range',
      controlType: 'dateRange' as any,
      rangePresets: { enabled: true, presets: ['thisMonth'] }
    } as any;

    component.setMetadata(metadata);
    component.setFormControl(new FormControl());
    component.ngAfterViewInit?.();

    component.applyPreset('thisMonth');
    expect(component.activePreset()).toBe('thisMonth');
    expect(component.selectedRange()?.startDate).toBeTruthy();
  });
});
