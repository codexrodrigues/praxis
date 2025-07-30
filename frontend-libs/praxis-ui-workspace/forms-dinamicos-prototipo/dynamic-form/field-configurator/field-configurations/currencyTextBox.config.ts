// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\numericTextBox.config.ts
import { createField } from './config.types';
import { getCommonFields } from './common-fields';
import { getFillFields } from './common-fill-fields';

export const currencyTextBoxConfig = [
  ...getCommonFields(),
  ...getFillFields(),
  createField({
    name: 'numericMin',
    label: 'Valor Mínimo',
    type: 'number',
    required: false,
    controlType: 'currencyTextBox',
    allowNegative: true,
    numericMin: -999999999,
    numericMax: 999999999
  }),
  createField({
    name: 'numericMax',
    label: 'Valor Máximo',
    type: 'number',
    required: false,
    controlType: 'currencyTextBox',
    allowNegative: true,
    numericMin: -999999999,
    numericMax: 999999999
  }),
  createField({
    name: 'allowNegative',
    label: 'Permitir Valor Negativo',
    controlType: 'checkbox'
  })
];
