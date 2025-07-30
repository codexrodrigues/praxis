import { FieldMetadata } from "../../../models/field-metadata.model";
import { createField } from "./config.types";

/**
 * Campos necessários para configuração de propriedades comuns a todos campos que são preenchidos pelo usuário
 * como input, select, textarea
 */
export function getFillFields(): Partial<FieldMetadata>[] {
  return [
    createField({
          name: 'placeholder',
          label: 'Placeholder (Mini Documentação)',
          type: 'text',
          placeholder: 'Ex: "Digite o seu nome..."',
          controlType: 'input',
          hint: 'Este texto aparece dentro do campo para guiar o usuário.'
    }),
    createField({
        name: 'hint',
        label: 'Dica de Preenchimento',
        type: 'text',
        placeholder: 'Ex: "Somente letras e números..."',
        controlType: 'input'
    }),
  ]
}
