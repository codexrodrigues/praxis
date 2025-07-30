// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\timePicker.config.ts
import { createField } from './config.types';
import {getCommonFields} from './common-fields';
import { getFillFields } from './common-fill-fields';

export const timePickerConfig = [
  ...getCommonFields(),
  ...getFillFields(),
  createField({
    name: 'format',
    label: 'Formato da Hora',
    type: 'text',
    required: false,
    defaultValue: 'HH:mm',
    placeholder: 'Formato da hora (ex: HH:mm, hh:mm a)',
    controlType: 'input'
  }),
  createField({
    name: 'interval',
    label: 'Intervalo dos Minutos',
    type: 'number',
    required: false,
    defaultValue: 1,
    placeholder: 'Intervalo em minutos para o seletor',
    controlType: 'input'
  }),
  createField({
    name: 'min',
    label: 'Hora Mínima',
    type: 'time',
    required: false,
    controlType: 'timePicker'
  }),
  createField({
    name: 'max',
    label: 'Hora Máxima',
    type: 'time',
    required: false,
    controlType: 'timePicker'
  })
];
