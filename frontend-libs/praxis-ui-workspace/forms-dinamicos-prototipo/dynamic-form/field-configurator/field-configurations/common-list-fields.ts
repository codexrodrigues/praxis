// common-list-fields.ts
import { createField } from './config.types';
import { FieldMetadata } from '../../../models/field-metadata.model';

/**
 * Campos comuns para controles baseados em lista, como select, radio, checkbox etc.
 */
export function getListFields(): Partial<FieldMetadata>[] {
  return [
    createField({
      name: 'options',
      label: 'Opções',
      type: 'array',
      required: false,
      controlType: 'listField',
      hint: 'Lista de opções estáticas. Cada item deve ter { displayField, valueField }.'
    }),
    createField({
      name: 'endpoint',
      label: 'Endpoint para carregar opções',
      type: 'text',
      controlType: 'input',
      hint: 'URL ou rota para buscar as opções dinamicamente.'
    }),
    createField({
      name: 'valueField',
      label: 'Campo de Valor',
      type: 'text',
      controlType: 'input',
      hint: 'Nome da propriedade do objeto retornado que será usado como valor.'
    }),
    createField({
      name: 'displayField',
      label: 'Campo de Exibição',
      type: 'text',
      controlType: 'input',
      hint: 'Nome da propriedade do objeto retornado que será exibida ao usuário.'
    }),
    // Inclua aqui o que for comum a todos os tipos "lista"
  ];
}
