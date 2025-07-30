// File: D:\Developer\Techne\ErgonX\lib-angular-ui\projects\angular-ui\src\lib\dynamic-form\field-configurator\field-configurations\select.config.ts
import { createField } from './config.types';
import {getCommonFields} from './common-fields';
import {getListFields} from './common-list-fields';
import { getFillFields } from './common-fill-fields';

export const selectConfig = [
  // Primeiro, adicionamos campos comuns a qualquer controle
  ...getCommonFields(),
  // Depois, campos comuns a controles de lista (select, radio, checkbox etc.)
  ...getListFields(),

  ...getFillFields(),
  // Agora, campos específicos só para SELECT
];
