// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\numericTextBox.config.ts
import { createField } from './config.types';
import {getCommonFields} from './common-fields';
import { getFillFields } from './common-fill-fields';

export const numericTextBoxConfig = [
  ...getCommonFields(),
  ...getFillFields(),
  createField({
    name: 'numericFormat',
    label: 'Formato',
    options: [
      { key: 'n0', value: 'Decimal com 0 casas decimais' },
      { key: 'n1', value: 'Decimal com 1 casa decimal' },
      { key: 'n2', value: 'Decimal com 2 casas decimais' },
      { key: 'p0', value: 'Porcentagem com 0 casas decimais' },
      { key: 'p1', value: 'Porcentagem com 1 casa decimal' },
      { key: 'p2', value: 'Porcentagem com 2 casas decimais' },
      { key: 'c0', value: 'Moeda com 0 casas decimais' },
      { key: 'c1', value: 'Moeda com 1 casa decimal' },
      { key: 'c2', value: 'Moeda com 2 casas decimais' }
    ],
    required: true,
    controlType: 'select'
  }),
  createField({
    name: 'numericStep',
    label: 'Valor do Step',
    type: 'number',
    required: false,
    controlType: 'numericTextBox',
    numericMin: 0.1
  }),
  createField({
    name: 'numericMin',
    label: 'Valor Mínimo',
    type: 'number',
    required: false,
    controlType: 'input'
  }),
  createField({
    name: 'numericMax',
    label: 'Valor Máximo',
    type: 'number',
    required: false,
    controlType: 'input'
  }),
  createField({
    name: 'numericMaxLength',
    label: 'Tamanho Máximo',
    type: 'number',
    required: false,
    controlType: 'input'
  }),
];
