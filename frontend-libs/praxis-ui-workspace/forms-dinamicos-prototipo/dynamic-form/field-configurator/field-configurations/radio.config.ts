// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\radio.config.ts
import { getCommonFields } from './common-fields';
import { getListFields } from './common-list-fields';
import { createField } from './config.types';

export const radioConfig = [
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
    name: 'labelPosition',
    label: 'Posição do Rótulo',
    required: false,
    options: [
      { key: 'top', value: 'Acima' },
      { key: 'left', value: 'Esquerda' },
      { key: 'right', value: 'Direita' },
      { key: 'bottom', value: 'Abaixo' }
    ],
    defaultValue: 'top',
    controlType: 'select'
  }),
];
