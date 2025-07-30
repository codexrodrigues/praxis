import { createField } from './config.types';
import { getCommonIdentificationFields } from './common-identification-fields';

export const floatingActionButtonConfig = [
    ...getCommonIdentificationFields(),
    createField({
        name: 'closedIconClass',
        label: 'Classe de ícone para botão fechado',
        type: 'text',
        required: false,
        placeholder: 'Classe de de ícone...',
        controlType: 'input'
    }),
    createField({
        name: 'openedIconClass',
        label: 'Classe de ícone para botão aberto',
        type: 'text',
        required: false,
        placeholder: 'Classe de de ícone...',
        controlType: 'input'
    }),
    createField({
        name: 'tooltip',
        label: 'Tooltip',
        type: 'text',
        required: false,
        placeholder: 'Digite um texto para tooltip',
        controlType: 'input'
    }),
    createField({
        name: 'disabled',
        label: 'Desabilitado',
        type: 'boolean',
        controlType: 'checkbox'
    }),
    createField({
        name: 'positionMode',
        label: 'Posição',
        options: [
            { key: 'absolute', value: 'Absolute' },
            { key: 'fixed', value: 'Fixed' }
        ],
        defaultValue: 'absolute',
        required: true,
        controlType: 'select'
    }),
    createField({
        name: 'themeColor',
        label: 'Cor tema',
        options: [
            { key: 'base', value: 'Base' },
            { key: 'primary', value: 'Primary' },
            { key: 'secondary', value: 'Secondary' },
            { key: 'tertiary', value: 'Tertiary' },
            { key: 'info', value: 'Info' },
            { key: 'success', value: 'Success' },
            { key: 'warning', value: 'Warning' },
            { key: 'error', value: 'Error' },
            { key: 'dark', value: 'Dark' },
            { key: 'light', value: 'Light' },
            { key: 'inverse', value: 'Inverse' },
            { key: 'none', value: 'None' },
        ],
        defaultValue: 'primary',
        required: true,
        controlType: 'select'
    }),
    createField({
        name: 'size',
        label: 'Tamanho',
        options: [
            { key: 'small', value: 'Pequeno' },
            { key: 'medium', value: 'Médio' },
            { key: 'large', value: 'Grande' },
            { key: 'none', value: 'Nenhum' }
        ],
        defaultValue: 'medium',
        required: true,
        controlType: 'select'
    }),
    createField({
        name: 'verticalAlign',
        label: 'Alinhamento vertical',
        options: [
            { key: 'top', value: 'Superior' },
            { key: 'middle', value: 'Centro' },
            { key: 'bottom', value: 'Inferior' },
        ],
        defaultValue: 'bottom',
        required: true,
        controlType: 'select'
    }),
    createField({
        name: 'horizontalAlign',
        label: 'Alinhamento horizontal',
        options: [
            { key: 'start', value: 'Esquerda' },
            { key: 'center', value: 'Centro' },
            { key: 'end', value: 'Direira' },
        ],
        defaultValue: 'end',
        required: true,
        controlType: 'select'
    }),
    createField({
        name: 'rounded',
        label: 'Arredondamento',
        options: [
            { key: 'small', value: 'Pequeno' },
            { key: 'medium', value: 'Médio' },
            { key: 'large', value: 'Grande' },
            { key: 'full', value: 'Completo' },
            { key: 'none', value: 'Nenhum' }
        ],
        defaultValue: 'full',
        required: true,
        controlType: 'select'
    }),
    createField({
        name: 'action',
        label: 'Ação',
        type: 'text',
        required: false,
        placeholder: 'Digite uma função para ação no click',
        controlType: 'textarea'
    }),
    createField({
        name: 'link',
        label: 'URL do link',
        type: 'text',
        required: false,
        placeholder: 'Digte a URL do link',
        controlType: 'input'
    })
];
