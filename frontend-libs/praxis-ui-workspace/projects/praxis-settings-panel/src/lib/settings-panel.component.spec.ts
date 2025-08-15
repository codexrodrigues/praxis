import { Component, Injector } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { SettingsPanelComponent } from './settings-panel.component';
import { SettingsPanelRef } from './settings-panel.ref';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';

// Mocks
class MockSettingsPanelRef {
  apply = jasmine.createSpy('apply');
  save = jasmine.createSpy('save');
  reset = jasmine.createSpy('reset');
  close = jasmine.createSpy('close');
}

class MockMatDialog {
  open = jasmine.createSpy('open').and.returnValue({
    afterClosed: () => of(true), // Default to confirmed
  });
}

@Component({
  standalone: true,
  template: '',
})
class DummyProvider {
  isDirty$ = new BehaviorSubject<boolean>(false);
  isValid$ = new BehaviorSubject<boolean>(true);
  isBusy$ = new BehaviorSubject<boolean>(false);

  onSaveCalled = false;
  resetCalled = false;

  getSettingsValue() {
    return { foo: 'bar' };
  }
  onSave() {
    this.onSaveCalled = true;
    return { foo: 'baz' };
  }
  reset() {
    this.resetCalled = true;
    this.isDirty$.next(false);
  }
}

describe('SettingsPanelComponent', () => {
  let component: SettingsPanelComponent;
  let fixture: ComponentFixture<SettingsPanelComponent>;
  let ref: MockSettingsPanelRef;
  let dialog: MockMatDialog;
  let dummyProvider: DummyProvider;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPanelComponent, DummyProvider, NoopAnimationsModule],
      providers: [
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: SettingsPanelRef, useClass: MockSettingsPanelRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPanelComponent);
    component = fixture.componentInstance;
    ref = TestBed.inject(SettingsPanelRef) as unknown as MockSettingsPanelRef;
    dialog = TestBed.inject(MatDialog) as unknown as MockMatDialog;

    // Attach a dummy provider for most tests
    component.attachContent(
      DummyProvider,
      TestBed.inject(Injector),
      ref as unknown as SettingsPanelRef
    );
    dummyProvider = component.contentRef!.instance as DummyProvider;
  });

  describe('State Management and Button Disabling', () => {
    it('should have buttons disabled by default when not dirty', () => {
      expect(component.isDirty).toBeFalse();
      expect(component.isValid).toBeTrue();
      expect(component.isBusy).toBeFalse();
      expect(component.canApply).toBeFalse();
      expect(component.canSave).toBeFalse();
    });

    it('should enable buttons when dirty and valid', () => {
      dummyProvider.isDirty$.next(true);
      fixture.detectChanges();
      expect(component.canApply).toBeTrue();
      expect(component.canSave).toBeTrue();
    });

    it('should disable buttons when form is invalid', () => {
      dummyProvider.isDirty$.next(true);
      dummyProvider.isValid$.next(false);
      fixture.detectChanges();
      expect(component.canApply).toBeFalse();
      expect(component.canSave).toBeFalse();
    });

    it('should disable buttons when busy', () => {
      dummyProvider.isDirty$.next(true);
      dummyProvider.isBusy$.next(true);
      fixture.detectChanges();
      expect(component.canApply).toBeFalse();
      expect(component.canSave).toBeFalse();
    });

    it('should provide the correct disabled reason', () => {
      // Not dirty
      dummyProvider.isDirty$.next(false);
      expect(component.disabledReason).toContain('Nenhuma alteração');

      // Invalid
      dummyProvider.isDirty$.next(true);
      dummyProvider.isValid$.next(false);
      expect(component.disabledReason).toContain('erros');

      // Busy
      dummyProvider.isValid$.next(true);
      dummyProvider.isBusy$.next(true);
      expect(component.disabledReason).toContain('Operação em andamento');
    });
  });

  describe('Actions', () => {
    it('should call child onSave before saving value', () => {
      dummyProvider.isDirty$.next(true);
      spyOn(dummyProvider, 'onSave').and.callThrough();
      component.onSave();
      expect(dummyProvider.onSave).toHaveBeenCalled();
      expect(ref.save).toHaveBeenCalledWith({ foo: 'baz' });
    });

    it('should not call save if canSave is false', () => {
      dummyProvider.isDirty$.next(false); // canSave is false
      component.onSave();
      expect(ref.save).not.toHaveBeenCalled();
    });

    it('should call apply if canApply is true', () => {
      dummyProvider.isDirty$.next(true);
      component.onApply();
      expect(ref.apply).toHaveBeenCalledWith({ foo: 'bar' });
    });
  });

  describe('Confirmation Dialogs', () => {
    it('should NOT open confirmation on onCancel if not dirty', () => {
      dummyProvider.isDirty$.next(false);
      component.onCancel();
      expect(dialog.open).not.toHaveBeenCalled();
      expect(ref.close).toHaveBeenCalledWith('cancel');
    });

    it('should open confirmation on onCancel if dirty', () => {
      dummyProvider.isDirty$.next(true);
      component.onCancel();
      expect(dialog.open).toHaveBeenCalled();
      expect(ref.close).toHaveBeenCalledWith('cancel');
    });

    it('should NOT close on onCancel if user cancels dialog', () => {
      dialog.open.and.returnValue({ afterClosed: () => of(false) } as any);
      dummyProvider.isDirty$.next(true);
      component.onCancel();
      expect(dialog.open).toHaveBeenCalled();
      expect(ref.close).not.toHaveBeenCalled();
    });

    it('should always open confirmation on onReset', () => {
      component.onReset();
      expect(dialog.open).toHaveBeenCalled();
      expect(dummyProvider.resetCalled).toBeTrue();
      expect(ref.reset).toHaveBeenCalled();
    });

    it('should NOT reset if user cancels dialog', () => {
      dialog.open.and.returnValue({ afterClosed: () => of(false) } as any);
      component.onReset();
      expect(dialog.open).toHaveBeenCalled();
      expect(dummyProvider.resetCalled).toBeFalse();
      expect(ref.reset).not.toHaveBeenCalled();
    });
  });
});
