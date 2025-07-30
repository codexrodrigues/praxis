// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\dateRange.config.ts
import { createField } from './config.types';
import {getCommonFields} from './common-fields';
import { getFillFields } from './common-fill-fields';

export const dateRangeConfig = [
  ...getCommonFields(),
  ...getFillFields(),
  createField({
    name: 'format',
    label: 'Formato da Data',
    type: 'text',
    required: false,
    defaultValue: 'dd/MM/yyyy',
    placeholder: 'Formato da data (ex: dd/MM/yyyy, AAAA-MM-dd)',
    controlType: 'input'
  }),
  createField({
    name: 'min',
    label: 'Data Mínima',
    type: 'date',
    required: false,
    controlType: 'dateRange'
  }),
  createField({
    name: 'max',
    label: 'Data Máxima',
    type: 'date',
    required: false,
    controlType: 'dateRange'
  })
];
