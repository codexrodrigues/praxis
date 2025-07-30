// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\textarea.config.ts
import { createField } from './config.types';
import {getCommonFields} from './common-fields';
import {getListFields} from './common-list-fields';
import { getFillFields } from './common-fill-fields';

export const textareaConfig = [
  ...getCommonFields(),
  ...getFillFields(),
  createField({
    name: 'rows',
    label: 'Linhas',
    type: 'number',
    required: false,
    defaultValue: 3,
    controlType: 'input'
  }),
  createField({
    name: 'cols',
    label: 'Colunas',
    type: 'number',
    required: false,
    defaultValue: 20,
    controlType: 'input'
  }),
  createField({
    name: 'wrap',
    label: 'Quebra de Linha',
    type: 'text',
    required: false,
    defaultValue: 'soft',
    placeholder: 'Quebra de linha (soft, hard)',
    controlType: 'input'
  }),//Quantidade maxima de caracteres
  createField({
    name: 'maxlength',
    label: 'Máximo de Caracteres',
    type: 'number',
    required: false,
    controlType: 'input'
  }),
  createField({
    name: 'minlength',
    label: 'Mínimo de Caracteres',
    type: 'number',
    required: false,
    controlType: 'input'
  }),

];
