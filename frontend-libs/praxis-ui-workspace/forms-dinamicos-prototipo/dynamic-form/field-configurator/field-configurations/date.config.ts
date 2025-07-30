// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\date.config.ts
import { createField } from './config.types';
import {getCommonFields} from './common-fields';
import { getFillFields } from './common-fill-fields';

export const dateConfig = [
  ...getCommonFields(),
  ...getFillFields(),
  createField({
    name: 'min',
    label: 'Data Mínima',
    type: 'date',
    format: 'dd/MM/yyyy',
    required: false,
    controlType: 'date'
  }),
  createField({
    name: 'max',
    label: 'Data Máxima',
    type: 'date',
    format: 'dd/MM/yyyy',
    required: false,
    controlType: 'date'
  }),
  createField({
    name: 'format',
    label: 'Formato da Data',
    type: 'text',
    required: false,
    defaultValue: 'dd/MM/yyyy',
    controlType: 'input'
  }),
];
