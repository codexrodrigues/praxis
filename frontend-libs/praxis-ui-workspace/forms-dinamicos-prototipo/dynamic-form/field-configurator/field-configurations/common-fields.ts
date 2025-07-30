// common-fields.ts
import { createField } from './config.types';
import { FieldMetadata } from '../../../models/field-metadata.model';
import { getCommonIdentificationFields } from './common-identification-fields';

/**
 * Campos comuns a praticamente todos os tipos de controle.
 */
export function getCommonFields(): Partial<FieldMetadata>[] {
  return [
    ...getCommonIdentificationFields(),   
    createField({
      name: 'required',
      label: 'Obrigatório',
      controlType: 'checkbox'
    }),
    createField({
      name: 'disabled',
      label: 'Desabilitado',
      type: 'boolean',
      controlType: 'checkbox'
    }),
    createField({
      name: 'readOnly',
      label: 'Somente Leitura',
      required: false,
      controlType: 'checkbox'
    }),
    createField({
      name: 'defaultValue',
      label: 'Valor Padrão',
      required: false,
      controlType: 'input'
    })
  ];
}
