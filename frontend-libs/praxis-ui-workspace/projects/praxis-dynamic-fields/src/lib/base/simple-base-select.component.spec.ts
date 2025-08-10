import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentMetadata } from '@praxis/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SimpleBaseSelectComponent } from './simple-base-select.component';

@Component({
  template: `
    <mat-form-field>
      @if (multiple()) {
        <mat-select multiple>
          <mat-option value="one">One</mat-option>
        </mat-select>
      } @else {
        <mat-select>
          <mat-option value="one">One</mat-option>
        </mat-select>
      }
    </mat-form-field>
  `,
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, NoopAnimationsModule],
})
class TestSelectComponent extends SimpleBaseSelectComponent<string> {
  apply(meta: ComponentMetadata): void {
    this.setSelectMetadata(meta as any);
  }
}

describe('SimpleBaseSelectComponent', () => {
  let fixture: ComponentFixture<TestSelectComponent>;
  let component: TestSelectComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestSelectComponent],
    });
    fixture = TestBed.createComponent(TestSelectComponent);
    component = fixture.componentInstance;
    component.apply({
      id: 'sel-id',
      name: 'sel',
      ariaLabel: 'Select field',
      placeholder: 'Choose',
      required: true,
      multiple: true,
    });
    fixture.detectChanges();
  });

  it('should apply id and aria attributes', () => {
    const selectEl: HTMLElement =
      fixture.nativeElement.querySelector('mat-select');
    expect(selectEl.getAttribute('id')).toBe('sel-id');
    expect(selectEl.getAttribute('aria-label')).toBe('Select field');
  });

  it('should forward basic select inputs', () => {
    const matSelect = (component as any).matSelect as any;
    const host: HTMLElement = fixture.nativeElement.querySelector('mat-select');
    expect(host.getAttribute('name')).toBe('sel');
    expect(matSelect.placeholder).toBe('Choose');
    expect(matSelect.required).toBeTrue();
    expect(matSelect.multiple).toBeTrue();
  });

  it('should emit openedChange events', () => {
    const spy = jasmine.createSpy('opened');
    component.openedChange.subscribe(spy);
    (component as any).matSelect.openedChange.emit(true);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should expose empty option text from metadata', () => {
    component.apply({ name: 'test', emptyOptionText: 'None' });
    fixture.detectChanges();
    expect(component.emptyOptionText()).toBe('None');
  });

  it('should ignore empty option text when multiple is true', () => {
    component.apply({ name: 'multi', emptyOptionText: 'None', multiple: true });
    fixture.detectChanges();
    expect(component.emptyOptionText()).toBeNull();
  });
});
