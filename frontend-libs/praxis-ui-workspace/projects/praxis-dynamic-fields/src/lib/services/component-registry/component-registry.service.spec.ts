import { TestBed } from '@angular/core/testing';
import { FieldControlType } from '@praxis/core';
import { MaterialSearchableSelectComponent } from '../../components/material-searchable-select/material-searchable-select.component';
import { ComponentRegistryService } from './component-registry.service';

describe('ComponentRegistryService', () => {
  let service: ComponentRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentRegistryService);
  });

  it('should resolve MaterialSearchableSelectComponent for AUTO_COMPLETE', async () => {
    const component = await service.getComponent(
      FieldControlType.AUTO_COMPLETE,
    );
    expect(component).toBe(MaterialSearchableSelectComponent);
  });
});
