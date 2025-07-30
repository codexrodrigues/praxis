// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\calendar.config.ts
import { getCommonFields } from './common-fields';
import { getFillFields } from './common-fill-fields';
import { createField } from './config.types';

export const calendarConfig = [
  ...getCommonFields(),
  ...getFillFields(),
  createField({
    name: 'startView',
    label: 'Visão Inicial',
    required: false,
    options: [
      { key: 'month', value: 'Mês' },
      { key: 'year', value: 'Ano' },
      { key: 'decade', value: 'Década' }
    ],
    defaultValue: 'month',
    controlType: 'select'
  }),
  createField({
    name: 'depth',
    label: 'Profundidade',
    required: false,
    options: [
      { key: 'month', value: 'Mês' },
      { key: 'year', value: 'Ano' },
      { key: 'decade', value: 'Década' }
    ],
    defaultValue: 'month',
    controlType: 'select'
  }),
  createField({
    name: 'format',
    label: 'Formato',
    required: false,
    controlType: 'input'
  }),
  createField({
    name: 'min',
    label: 'Data Mínima',
    required: false,
    controlType: 'date',
  }),
  createField({
    name: 'max',
    label: 'Data Máxima',
    required: false,
    controlType: 'date'
  }),
  createField({
    name: 'weekNumber',
    label: 'Número da Semana',
    required: false,
    controlType: 'checkbox'
  }),
  createField({
    name: 'startAt',
    label: 'Data Inicial',
    required: false,
    controlType: 'date'
  }),

];
