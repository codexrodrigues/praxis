import { createField } from './config.types';
import { getCommonIdentificationFields } from './common-identification-fields';

export const switchButtonConfig = [
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
        name: 'readonly',
        label: 'Somente Leitura',
        required: false,
        controlType: 'checkbox'
    }),
    createField({
        name: 'defaultValue',
        label: 'Valor Padrão',
        required: false,
        controlType: 'switchButton'
    }),
    createField({
        name: 'valueField',
        label: 'Valor',
        required: false,
        controlType: 'switchButton'
    })
];
