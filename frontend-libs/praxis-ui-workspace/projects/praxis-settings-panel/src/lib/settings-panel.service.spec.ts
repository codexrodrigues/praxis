import { TestBed } from '@angular/core/testing';
import { SettingsPanelService } from './settings-panel.service';
import { Component } from '@angular/core';
import { SettingsValueProvider } from './settings-panel.types';
import { firstValueFrom } from 'rxjs';

@Component({ standalone: true, template: '' })
class DummyComponent implements SettingsValueProvider {
  getSettingsValue() {
    return {};
  }
}

describe('SettingsPanelService', () => {
  let service: SettingsPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsPanelService);
  });

  it('emits through ref streams', async () => {
    const ref = service.open({
      id: 't',
      title: 'Test',
      content: { component: DummyComponent },
    });

    const appliedPromise = firstValueFrom(ref.applied$);
    const savedPromise = firstValueFrom(ref.saved$);
    const closedPromise = firstValueFrom(ref.closed$);

    ref.apply('a');
    ref.save('b');

    expect(await appliedPromise).toBe('a');
    expect(await savedPromise).toBe('b');
    expect(await closedPromise).toBe('save');
  });

  it('closes an existing panel when opening a new one', async () => {
    const firstRef = service.open({
      id: 'a',
      title: 'First',
      content: { component: DummyComponent },
    });

    const closedPromise = firstValueFrom(firstRef.closed$);

    service.open({
      id: 'b',
      title: 'Second',
      content: { component: DummyComponent },
    });

    expect(await closedPromise).toBe('cancel');
  });
});
