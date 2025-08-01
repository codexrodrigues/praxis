import { FormLayoutService } from './form-layout.service';
import {
  FormLayout,
  LocalStorageConfigService,
  CONFIG_STORAGE,
} from '@praxis/core';
import { TestBed } from '@angular/core/testing';

describe('FormLayoutService', () => {
  let service: FormLayoutService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        FormLayoutService,
        { provide: CONFIG_STORAGE, useClass: LocalStorageConfigService },
      ],
    });
    service = TestBed.inject(FormLayoutService);
  });

  it('should save and load layout using localStorage', () => {
    const layout: FormLayout = { fieldsets: [] };
    service.saveLayout('test-form', layout);

    const loaded = service.loadLayout('test-form');
    expect(loaded).toEqual(layout);
  });

  it('should clear layout from storage', () => {
    localStorage.setItem('praxis-layout-test', JSON.stringify({}));
    service.clearLayout('test');
    expect(localStorage.getItem('praxis-layout-test')).toBeNull();
  });
});
