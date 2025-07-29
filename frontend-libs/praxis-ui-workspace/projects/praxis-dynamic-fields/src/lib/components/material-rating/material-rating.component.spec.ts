import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialRatingComponent } from './material-rating.component';
import { MaterialRatingMetadata } from '@praxis/core';

describe('MaterialRatingComponent', () => {
  let component: MaterialRatingComponent;
  let fixture: ComponentFixture<MaterialRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialRatingComponent,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialRatingComponent);
    component = fixture.componentInstance;
    const metadata: MaterialRatingMetadata = {
      name: 'rating',
      label: 'Rating',
      controlType: 'rating'
    } as any;
    component.setMetadata(metadata);
    component.setFormControl(new FormControl(0));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update value when selecting rating', () => {
    component.selectRating(3);
    expect(component.formControl.value).toBe(3);
  });

  it('should handle half-star selection', () => {
    component.setMetadata({ ...(component.metadata() as any), allowHalf: true } as any);
    component.selectRating(2);
    component.selectRating(2);
    expect(component.formControl.value).toBe(1.5);
  });
});
