// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\button.config.ts
import { createField } from './config.types';
import { getButtonFields } from './common-button-fields';

export const buttonConfig = [
  ...getButtonFields(),
  createField({
    name: 'buttonType',
    label: 'Tipo do Botão',
    required: false,
    options: [
      { key: 'button', value: 'Padrão' },
      { key: 'submit', value: 'Submit' },
      { key: 'reset', value: 'Reset' }
    ],
    defaultValue: 'button',
    controlType: 'select'
  }),
  createField({
    name: 'action',
    label: 'Ação',
    type: 'text',
    required: false,
    placeholder: 'Digite uma função para ação no click',
    controlType: 'textarea'
  }),
  createField({
    name: 'link',
    label: 'URL do link',
    type: 'text',
    required: false,
    placeholder: 'Digte a URL do link',
    controlType: 'input'
  })
];
