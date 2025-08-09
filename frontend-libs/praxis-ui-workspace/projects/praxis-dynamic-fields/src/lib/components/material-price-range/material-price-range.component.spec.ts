import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialPriceRangeComponent } from './material-price-range.component';
import { MaterialPriceRangeMetadata, PriceRangeValue } from '@praxis/core';

describe('MaterialPriceRangeComponent', () => {
  let component: MaterialPriceRangeComponent;
  let fixture: ComponentFixture<MaterialPriceRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialPriceRangeComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialPriceRangeComponent);
    component = fixture.componentInstance;
    component.setPriceRangeMetadata({
      name: 'price',
      label: 'Price',
      controlType: 'rangeSlider' as any,
      currency: 'USD',
    } as MaterialPriceRangeMetadata);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should propagate value changes', () => {
    const control = new FormControl<PriceRangeValue | null>(null);
    component.registerOnChange(control.setValue.bind(control));
    component.rangeGroup.setValue({ minPrice: 100, maxPrice: 200 });
    expect(control.value).toEqual({ minPrice: 100, maxPrice: 200 });
  });

  it('should validate range boundaries', () => {
    component.setPriceRangeMetadata({
      name: 'price',
      label: 'Price',
      controlType: 'rangeSlider' as any,
      currency: 'USD',
      min: 0,
      max: 500,
    });
    fixture.detectChanges();

    component.rangeGroup.setValue({ minPrice: -10, maxPrice: 100 });
    expect(component.rangeGroup.valid).toBeFalse();

    component.rangeGroup.setValue({ minPrice: 100, maxPrice: 600 });
    expect(component.rangeGroup.valid).toBeFalse();

    component.rangeGroup.setValue({ minPrice: 100, maxPrice: 200 });
    expect(component.rangeGroup.valid).toBeTrue();
  });

  it('should provide custom error messages', () => {
    component.setPriceRangeMetadata({
      name: 'price',
      label: 'Price',
      controlType: 'rangeSlider' as any,
      currency: 'USD',
      min: 0,
      max: 500,
    });
    fixture.detectChanges();

    component.rangeGroup.setValue({ minPrice: 400, maxPrice: 100 });
    component.rangeGroup.updateValueAndValidity();
    expect(component.errorMessage()).toBe(
      'O valor inicial deve ser menor ou igual ao final',
    );
  });
});
