import { getButtonFields } from "./common-button-fields";
import { createField } from "./config.types";

export const buttonGroupConfig = [
    ...getButtonFields(),
    createField({
        name: 'buttons',
        label: 'Botões',
        type: 'array',
        required: true,
        controlType: 'listField'
    }),
    createField({
        name: 'selectionMode',
        label: 'Modo de seleção',
        required: false,
        options: [
          { key: 'single', value: 'Seleção única' },
          { key: 'multiple', value: 'Seleção múltipla' },
        ],
        defaultValue: 'single',
        controlType: 'select'
    }),
]