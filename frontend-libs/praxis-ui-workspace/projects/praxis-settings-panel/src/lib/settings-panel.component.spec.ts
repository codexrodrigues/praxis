import { Component, Injector } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { SettingsPanelComponent } from './settings-panel.component';
import { SettingsPanelRef } from './settings-panel.ref';
import { SettingsValueProvider } from './settings-panel.types';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class MockSettingsPanelRef {
  apply = jasmine.createSpy('apply');
  save = jasmine.createSpy('save');
  reset = jasmine.createSpy('reset');
  close = jasmine.createSpy('close');
}

@Component({
  standalone: true,
  template: '',
})
class DummyProvider implements SettingsValueProvider {
  canSave$ = new BehaviorSubject<boolean>(false);
  onSaveCalled = false;
  getSettingsValue() {
    return { foo: 'bar' };
  }
  onSave() {
    this.onSaveCalled = true;
    return { foo: 'baz' };
  }
}

@Component({
  standalone: true,
  template: '',
})
class AsyncProvider implements SettingsValueProvider {
  getSettingsValue() {
    return { foo: 'sync' };
  }

  onSave() {
    return Promise.resolve({ foo: 'async' });
  }
}

describe('SettingsPanelComponent', () => {
  let component: SettingsPanelComponent;
  let fixture: ComponentFixture<SettingsPanelComponent>;
  let ref: MockSettingsPanelRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SettingsPanelComponent,
        DummyProvider,
        AsyncProvider,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPanelComponent);
    component = fixture.componentInstance;
    ref = new MockSettingsPanelRef();
  });

  it('should toggle save button based on canSave$', () => {
    component.attachContent(
      DummyProvider,
      TestBed.inject(Injector),
      ref as unknown as SettingsPanelRef,
    );
    const instance = component.contentRef!.instance as DummyProvider;
    expect(component.disableSaveButton).toBeTrue();

    instance.canSave$.next(true);
    expect(component.disableSaveButton).toBeFalse();
  });

  it('should call child onSave before saving value', () => {
    component.attachContent(
      DummyProvider,
      TestBed.inject(Injector),
      ref as unknown as SettingsPanelRef,
    );
    const instance = component.contentRef!.instance as DummyProvider;
    spyOn(instance, 'onSave').and.callThrough();

    component.onSave();

    expect(instance.onSave).toHaveBeenCalled();
    expect(ref.save).toHaveBeenCalledWith({ foo: 'baz' });
  });

  it('should handle async onSave result', fakeAsync(() => {
    component.attachContent(
      AsyncProvider,
      TestBed.inject(Injector),
      ref as unknown as SettingsPanelRef,
    );

    component.onSave();
    tick();

    expect(ref.save).toHaveBeenCalledWith({ foo: 'async' });
  }));

  it('should toggle expanded state and class', () => {
    fixture.detectChanges();
    const panel: HTMLElement =
      fixture.nativeElement.querySelector('.settings-panel');
    const icon: HTMLElement = fixture.nativeElement.querySelector(
      'header button mat-icon',
    );
    const toggleButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('header button');
    expect(panel.classList.contains('expanded')).toBeFalse();
    expect(icon.textContent?.trim()).toBe('chevron_left');
    expect(toggleButton.getAttribute('aria-expanded')).toBe('false');

    component.toggleExpand();
    fixture.detectChanges();
    expect(component.expanded).toBeTrue();
    expect(panel.classList.contains('expanded')).toBeTrue();
    expect(icon.textContent?.trim()).toBe('chevron_right');
    expect(toggleButton.getAttribute('aria-expanded')).toBe('true');

    component.toggleExpand();
    fixture.detectChanges();
    expect(component.expanded).toBeFalse();
    expect(panel.classList.contains('expanded')).toBeFalse();
    expect(icon.textContent?.trim()).toBe('chevron_left');
    expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
  });
});
