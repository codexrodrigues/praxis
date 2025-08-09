import { TestBed } from '@angular/core/testing';
import { FieldControlType } from '@praxis/core';
import { MaterialSearchableSelectComponent } from '../../components/material-searchable-select/material-searchable-select.component';
import { MaterialRadioGroupComponent } from '../../components/material-radio-group/material-radio-group.component';
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

  it('should normalize radioGroup alias to RADIO component', async () => {
    const component = await service.getComponent('radioGroup');
    expect(component).toBe(MaterialRadioGroupComponent);
  });
});
