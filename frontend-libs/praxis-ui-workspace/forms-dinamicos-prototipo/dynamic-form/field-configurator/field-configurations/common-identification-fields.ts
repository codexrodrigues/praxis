import { FieldMetadata } from "../../../models/field-metadata.model";
import { createField } from "./config.types";

const reservedWords = [
    'SELECT', 'FROM', 'WHERE', 'DELETE', 'UPDATE', 'INSERT',
    'IF', 'ELSE', 'FOR', 'WHILE', 'FUNCTION', 'RETURN', 'CLASS', 'LET', 'CONST', 'VAR',
    'TRUE', 'FALSE', 'NULL', 'UNDEFINED', 'IMPORT', 'EXPORT', 'TRY', 'CATCH', 'FINALLY',
    // ... adicione outras palavras específicas do seu projeto ...
  ];

export function getCommonIdentificationFields(): Partial<FieldMetadata>[] {
    return [
        createField({
          name: 'name',
          label: 'Nome do Campo',
          placeholder: 'Nome único no formulário',
          controlType: 'input',
          required: true,
          validators: {
            required: true,
            pattern: '^[A-Za-z_][A-Za-z0-9_]*$', // Regex que impede iniciar com número e limita a letras, números e '_'
            patternMessage: 'O nome deve iniciar com letra ou sublinhado, e conter apenas letras, números e sublinhados.',

            // Verificação adicional de palavras reservadas e/ou unicidade:
            customValidator: (value: string, context?: any) => {
              if (!value) {
                return true;
              }
              // 1) Checar se é palavra reservada
              if (reservedWords.includes(value.toUpperCase())) {
                return 'Este nome é reservado e não pode ser utilizado.';
              }

              // 2) Checar unicidade dentro do próprio formulário (caso você tenha acesso ao array de campos):
              // Exemplo: context pode conter 'formFields' ou algo similar; depende de como seu Dynamic Form injeta o contexto.
              const fields = context?.formFields || [];
              const duplicado = fields.some((f: any) => f.name === value && f !== context);
              if (duplicado) {
                return 'Já existe outro campo com este mesmo nome no formulário.';
              }

              // Se passou por todas as validações:
              return true;
            },
          },
        }),
        createField({
          name: 'label',
          label: 'Texto',
          placeholder: 'Texto exibido no botão',
          controlType: 'input',
          required: true
        }),
    ]
}
