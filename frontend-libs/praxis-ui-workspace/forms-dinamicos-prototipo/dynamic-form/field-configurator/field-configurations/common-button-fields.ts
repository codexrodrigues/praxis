import { FieldMetadata } from "../../../models/field-metadata.model";
import { createField } from "./config.types";
import { getCommonIdentificationFields } from "./common-identification-fields";

/**
 * Campos necessários para a especificação das propriedades comuns dos botões
 */
export function getButtonFields(): Partial<FieldMetadata>[] {
    return [
        ...getCommonIdentificationFields(),
        createField({
            name: 'themeColor',
            label: 'Cor',
            options: [
              { key: 'primary', value: 'Primário' },
              { key: 'secondary', value: 'Secundário' },
              { key: 'success', value: 'Sucesso' },
              { key: 'danger', value: 'Perigo' },
              { key: 'warning', value: 'Aviso' },
              { key: 'info', value: 'Informação' },
              { key: 'light', value: 'Claro' },
              { key: 'dark', value: 'Escuro' }
            ],
            defaultValue: 'primary',
            controlType: 'select'
        }),
        createField({
            name: 'iconClass',
            label: 'Ícone',
            required: false,
            controlType: 'input'
        }),
        createField({
            name: 'iconPosition',
            label: 'Posição do Ícone',
            required: false,
            options: [
              { key: 'left', value: 'Esquerda' },
              { key: 'right', value: 'Direita' }
            ],
            defaultValue: 'left',
            controlType: 'select'
        }),
    ]
}
