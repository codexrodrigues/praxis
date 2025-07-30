// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\input.config.ts
import { createField } from './config.types';
import {getCommonFields} from './common-fields';
import { getFillFields } from './common-fill-fields';

export const inputConfig = [
  ...getCommonFields(),
  ...getFillFields(),
  createField({
    name: 'maxLength',
    label: 'Tamanho Máximo',
    type: 'number',
    required: false,
    placeholder: 'Quantidade máximo de caracteres',
    controlType: 'input'
  }),
  createField({
    name: 'minLength',
    label: 'Tamanho Mínimo',
    type: 'number',
    required: false,
    placeholder: 'Quantidade mínimo de caracteres',
    controlType: 'input'
  }),
  createField({
    name: 'pattern',
    label: 'Padrão (Regex)',
    type: 'text',
    required: false,
    placeholder: 'Expressão regular para validação (ex: ^[a-zA-Z0-9]*$)',
    controlType: 'input'
  }),
  createField({
    name: 'mask',
    label: 'Máscara',
    type: 'text',
    required: false,
    placeholder: 'Máscara de entrada (ex: 000.000.000-00)',
    controlType: 'input'
  }),
  createField({
    name: 'inputType',
    label: 'Tipo de Input',
    required: false,
    options: [
      { key: 'text', value: 'Texto' },
      { key: 'password', value: 'Senha' },
      { key: 'email', value: 'Email' },
      { key: 'number', value: 'Número' },
      { key: 'tel', value: 'Telefone' },
      { key: 'url', value: 'URL' }
    ],
    defaultValue: 'text',
    controlType: 'select'
  })
];
