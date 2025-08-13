import { Component, Injector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  }
}

describe('SettingsPanelComponent', () => {
  let component: SettingsPanelComponent;
  let fixture: ComponentFixture<SettingsPanelComponent>;
  let ref: MockSettingsPanelRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPanelComponent, DummyProvider, NoopAnimationsModule],
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
    expect(ref.save).toHaveBeenCalledWith(instance.getSettingsValue());
  });

  it('should toggle expanded state and width', () => {
    fixture.detectChanges();
    const panel: HTMLElement =
      fixture.nativeElement.querySelector('.settings-panel');
    const icon: HTMLElement = fixture.nativeElement.querySelector(
      'header button mat-icon',
    );
    expect(panel.style.width).toBe('720px');
    expect(icon.textContent?.trim()).toBe('chevron_left');

    component.toggleExpand();
    fixture.detectChanges();
    expect(component.expanded).toBeTrue();
    expect(panel.style.width).toBe('85vw');
    expect(icon.textContent?.trim()).toBe('chevron_right');

    component.toggleExpand();
    fixture.detectChanges();
    expect(component.expanded).toBeFalse();
    expect(panel.style.width).toBe('720px');
    expect(icon.textContent?.trim()).toBe('chevron_left');
  });
});
