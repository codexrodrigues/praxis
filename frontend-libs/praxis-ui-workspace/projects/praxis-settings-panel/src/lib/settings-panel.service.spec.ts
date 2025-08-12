import { TestBed } from '@angular/core/testing';
import { SettingsPanelService } from './settings-panel.service';
import { Component } from '@angular/core';
import { SettingsValueProvider } from './settings-panel.types';
import { firstValueFrom } from 'rxjs';

@Component({ standalone: true, template: '' })
class DummyComponent implements SettingsValueProvider {
  getSettingsValue() { return {}; }
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
      content: { component: DummyComponent }
    });

    const appliedPromise = firstValueFrom(ref.applied$);
    const savedPromise = firstValueFrom(ref.saved$);

    ref.apply('a');
    ref.save('b');

    expect(await appliedPromise).toBe('a');
    expect(await savedPromise).toBe('b');

    service.close();
  });
});
