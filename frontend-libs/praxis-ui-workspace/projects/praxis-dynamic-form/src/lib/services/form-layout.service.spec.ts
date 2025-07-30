import { FormLayoutService, LOCAL_STORAGE_FORM_LAYOUT_PROVIDER } from './form-layout.service';
import { FormLayout } from '@praxis/core';

describe('FormLayoutService', () => {
  let service: FormLayoutService;

  beforeEach(() => {
    localStorage.clear();
    service = new FormLayoutService();
  });

  it('should save and load layout using localStorage', () => {
    const layout: FormLayout = { fieldsets: [] };
    service.saveLayout('test-form', layout);

    const loaded = service.loadLayout('test-form');
    expect(loaded).toEqual(layout);
  });
});
