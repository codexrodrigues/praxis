// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\checkbox.config.ts
import {getCommonFields} from './common-fields';
import { getListFields } from './common-list-fields';
import { createField } from './config.types';

export const checkboxConfig = [
  // Primeiro, adicionamos campos comuns a qualquer controle
  ...getCommonFields(),
  ...getListFields(),
  createField({
    name: 'orientation',
    label: 'Orientação',
    required: false,
    options: [
      { key: 'horizontal', value: 'Horizontal' },
      { key: 'vertical', value: 'Vertical' }
    ],
    defaultValue: 'horizontal',
    controlType: 'select'
  }),
  createField({
    name: 'multiple',
    label: 'Múltiplo',
    type: 'boolean',
    controlType: 'checkbox'
  }),
];
