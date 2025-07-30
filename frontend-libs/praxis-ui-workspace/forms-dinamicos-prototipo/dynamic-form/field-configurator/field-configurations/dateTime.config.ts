// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\dateTime.config.ts
import { createField } from './config.types';
import {getCommonFields} from './common-fields';
import { getFillFields } from './common-fill-fields';

export const dateTimeConfig = [
  ...getCommonFields(),
  ...getFillFields(),
  createField({
    name: 'format',
    label: 'Formato da Data e Hora',
    type: 'text',
    required: false,
    defaultValue: 'dd/MM/yyyy HH:mm',
    controlType: 'input'
  })
];
