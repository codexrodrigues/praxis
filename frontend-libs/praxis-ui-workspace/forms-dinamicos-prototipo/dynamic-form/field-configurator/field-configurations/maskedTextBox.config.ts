// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\maskedTextBox.config.ts
import { getCommonFields } from './common-fields';
import { getFillFields } from './common-fill-fields';
import { createField } from './config.types';

export const maskedTextBoxConfig = [
  ...getCommonFields(),
  ...getFillFields(),
  createField({
    name: 'mask',
    label: 'Máscara de Entrada',
    type: 'text',
    required: false,
    placeholder: 'Ex: 000.000.000-00',
    controlType: 'input'
  }),
  createField({
    name: 'customErrorMessage',
    label: 'Mensagem de Erro',
    type: 'text',
    required: false,
    placeholder: 'Mensagem exibida quando a máscara não é respeitada',
    controlType: 'textarea',
  }),
];
