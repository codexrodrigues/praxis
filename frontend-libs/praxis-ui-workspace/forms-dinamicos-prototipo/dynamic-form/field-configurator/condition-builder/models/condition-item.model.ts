//projects/angular-ui/src/lib/dynamic-form/field-configurator/condition-builder/models/condition-item.model.ts
import { FieldDataType } from '../../../../models/field-metadata.model';

export interface ConditionItem {
  id: number;
  field?: string;
  operator?: string;
  value?: any;
  fieldType?: FieldDataType;
}
