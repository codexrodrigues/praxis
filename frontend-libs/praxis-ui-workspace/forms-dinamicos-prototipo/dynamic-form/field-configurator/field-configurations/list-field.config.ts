import { createField } from './config.types';
import { getCommonFields } from './common-fields';
import { getListFields } from './common-list-fields';

/**
 * Configurações específicas para o novo componente de lista dinâmica (ListFieldComponent).
 */
export const listFieldConfig = [
  // Primeiro, adicionamos campos comuns a qualquer controle
  ...getCommonFields(),

  // Depois, campos comuns a controles de lista (options, endpoint, valueField, displayField, etc.)
  ...getListFields(),

  // Agora, campos específicos do seu "ListField", se houver:
  // Exemplo de campo adicional só para esse componente
  createField({
    name: 'allowDuplicates',
    label: 'Permitir itens duplicados?',
    type: 'boolean',
    controlType: 'toggle',
    hint: 'Se marcado, o usuário poderá adicionar itens com mesmo valueField repetidamente.',
    required: false
  })
];
