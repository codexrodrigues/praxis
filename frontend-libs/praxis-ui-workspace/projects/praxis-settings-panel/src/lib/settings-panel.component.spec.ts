import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { SettingsPanelComponent } from './settings-panel.component';
import { SettingsPanelRef } from './settings-panel.ref';
import {
  SettingsPanelSection,
  SettingsSectionsProvider,
  SettingsValueProvider,
} from './settings-panel.types';
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

@Component({
  standalone: true,
  template: `
    <ng-template #first>First Section</ng-template>
    <ng-template #second>Second Section</ng-template>
  `,
})
class SectionProvider
  implements SettingsValueProvider, SettingsSectionsProvider, OnInit
{
  @ViewChild('first', { static: true }) first!: TemplateRef<any>;
  @ViewChild('second', { static: true }) second!: TemplateRef<any>;
  sections: SettingsPanelSection[] = [];
  sections$ = new BehaviorSubject<SettingsPanelSection[]>([]);
  getSettingsValue() {
    return null;
  }
  ngOnInit(): void {
    Promise.resolve().then(() => {
      const list = [
        { id: 'first', label: 'First', template: this.first },
        { id: 'second', label: 'Second', template: this.second },
      ];
      this.sections = list;
      this.sections$.next(list);
    });
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
        SectionProvider,
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
    expect(ref.save).toHaveBeenCalledWith(instance.getSettingsValue());
  });

  it('should render sections provided by content component', () => {
    component.attachContent(
      SectionProvider,
      TestBed.inject(Injector),
      ref as unknown as SettingsPanelRef,
    );
    fixture.detectChanges();
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll(
      '.settings-panel-sections button',
    );
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('First');
  });
});
