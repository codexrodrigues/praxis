import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentMetadata } from '@praxis/core';
import { SimpleBaseInputComponent } from './simple-base-input.component';

@Component({
  template: `<input />`,
  standalone: true,
})
class TestInputComponent extends SimpleBaseInputComponent {
  apply(meta: ComponentMetadata): void {
    this.setMetadata(meta);
  }

  protected override getSpecificCssClasses(): string[] {
    return [];
  }
}

describe('SimpleBaseInputComponent', () => {
  let fixture: ComponentFixture<TestInputComponent>;
  let component: TestInputComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestInputComponent],
    });
    fixture = TestBed.createComponent(TestInputComponent);
    component = fixture.componentInstance;
    component.apply({
      name: 'email',
      id: 'email-id',
      placeholder: 'Email',
      ariaLabel: 'Email field',
      dataAttributes: { testid: 'email-input' },
      spellcheck: false,
      textTransform: 'uppercase',
      autoFocus: true,
    });
    fixture.detectChanges();
  });

  it('should apply basic attributes and aria metadata', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input.getAttribute('name')).toBe('email');
    expect(input.id).toBe('email-id');
    expect(input.getAttribute('placeholder')).toBe('Email');
    expect(input.getAttribute('aria-label')).toBe('Email field');
    expect(input.getAttribute('data-testid')).toBe('email-input');
    expect(input.getAttribute('spellcheck')).toBe('false');
    expect(input.style.textTransform).toBe('uppercase');
    expect(input.hasAttribute('autofocus')).toBeTrue();
  });

  it('should emit native events', () => {
    const blurSpy = jasmine.createSpy('blur');
    const changeSpy = jasmine.createSpy('change');
    component.nativeBlur.subscribe(blurSpy);
    component.nativeChange.subscribe(changeSpy);
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new Event('blur'));
    input.dispatchEvent(new Event('change'));
    expect(blurSpy).toHaveBeenCalled();
    expect(changeSpy).toHaveBeenCalled();
  });
});
