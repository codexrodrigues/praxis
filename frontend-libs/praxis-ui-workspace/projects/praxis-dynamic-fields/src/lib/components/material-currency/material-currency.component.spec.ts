import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';

import { MaterialCurrencyComponent } from './material-currency.component';
import { MaterialCurrencyMetadata } from '@praxis/core';

describe('MaterialCurrencyComponent', () => {
  let component: MaterialCurrencyComponent;
  let fixture: ComponentFixture<MaterialCurrencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialCurrencyComponent, FormsModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialCurrencyComponent);
    component = fixture.componentInstance;
    component.metadata.set({
      label: 'Price',
      currency: 'USD',
      controlType: 'currency',
    } as MaterialCurrencyMetadata);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display currency symbol', () => {
    const symbolEl = fixture.nativeElement.querySelector('.currency-symbol');
    expect(symbolEl.textContent.trim()).toContain('$');
  });

  it('should propagate numeric value changes', () => {
    const control = new FormControl(0);
    component.registerOnChange(control.setValue.bind(control));
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '123.45';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe(123.45);
  });

  it('should format value on blur but keep numeric control value', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '1234.5';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(input.value).toBe('$1,234.50');
    expect(component.internalControl.value).toBe(1234.5);
  });

  it('should respect locale when parsing and formatting', () => {
    component.metadata.set({
      label: 'Preço',
      currency: 'BRL',
      locale: 'pt-BR',
      controlType: 'currency',
    } as MaterialCurrencyMetadata);
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '1.234,56';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.value).toBe(1234.56);
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(input.value).toContain('R$');
    expect(input.value).toContain('1.234,56');
  });

  it('should allow negative numbers when configured', () => {
    component.metadata.set({
      label: 'Price',
      currency: 'USD',
      allowNegative: true,
      controlType: 'currency',
    } as MaterialCurrencyMetadata);
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '-5';
    input.dispatchEvent(new Event('input'));
    expect(component.internalControl.value).toBe(-5);
    expect(component.internalControl.valid).toBeTrue();
  });

  it('should mark control invalid for negative numbers when not allowed', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.value = '-5';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.internalControl.valid).toBeFalse();
  });

  it('should place symbol after input when position is after', () => {
    component.metadata.set({
      label: 'Price',
      currency: 'USD',
      currencyPosition: 'after',
      controlType: 'currency',
    } as MaterialCurrencyMetadata);
    fixture.detectChanges();
    const prefix = fixture.nativeElement.querySelector(
      '.mat-mdc-form-field-prefix .currency-symbol',
    );
    const suffix = fixture.nativeElement.querySelector(
      '.mat-mdc-form-field-suffix .currency-symbol',
    );
    expect(prefix).toBeNull();
    expect(suffix).not.toBeNull();
  });
});
