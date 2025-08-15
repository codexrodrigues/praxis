import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RuleEditorComponent } from './rule-editor.component';
import { RuleBuilderService } from '../services/rule-builder.service';
import { FieldSchemaService } from '../services/field-schema.service';
import { RuleNodeType } from '../models/rule-builder.model';

describe('RuleEditorComponent', () => {
  let component: RuleEditorComponent;
  let ruleBuilderService: jasmine.SpyObj<RuleBuilderService>;

  beforeEach(() => {
    ruleBuilderService = jasmine.createSpyObj<RuleBuilderService>(
      'RuleBuilderService',
      ['addNode', 'selectNode', 'updateNode'],
    );

    const fieldSchemaService = {} as FieldSchemaService;
    const snackBar = {
      open: jasmine.createSpy('open').and.returnValue({}),
    } as unknown as MatSnackBar;
    const dialog = {} as MatDialog;

    component = new RuleEditorComponent(
      ruleBuilderService,
      fieldSchemaService,
      snackBar,
      new FormBuilder(),
      dialog,
    );
  });

  it('should add node and select it when onNodeAdded is called', () => {
    ruleBuilderService.addNode.and.returnValue('new-node');
    component.onNodeAdded({ type: RuleNodeType.FIELD_CONDITION });

    expect(ruleBuilderService.addNode).toHaveBeenCalledWith(
      { type: RuleNodeType.FIELD_CONDITION, config: undefined },
      undefined,
    );
    expect(ruleBuilderService.selectNode).toHaveBeenCalledWith('new-node');
  });

  it('should update node when onNodeUpdated is called', () => {
    component.onNodeUpdated({
      nodeId: 'node-1',
      updates: { label: 'updated' },
    });

    expect(ruleBuilderService.updateNode).toHaveBeenCalledWith('node-1', {
      label: 'updated',
    });
  });
});
