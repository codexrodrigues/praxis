# pdx-material-checkbox-group

## Lista de inputs/outputs atuais

- **Metadados**: label, color, layout, checkboxOptions/options, selectAll, searchable, resourcePath, filterCriteria, optionLabelKey, optionValueKey, maxSelections.
- **Outputs**: `valueChange`, `focusChange`, `selectionChange`, `optionsLoaded`.

## Propriedades/eventos ausentes

- Não expõe atributos do `MatCheckbox` como `indeterminate`, `aria-label`, `aria-labelledby`, `disableRipple`, `tabIndex`.
- Eventos nativos `change`/`indeterminateChange` não são repassados.

## Integridade do Código e Lógica de Negócio

- `selectAll` implementado sem estado indeterminado no checkbox mestre.
- Sem suporte para `ngClass` ou `labelPosition` por opção individual.
- Falta de controle de seleção mínima/máxima além do `maxSelections` informado.
- Estado `disabled` não é propagado por opção e `indeterminate` não é suportado.
- Regras de negócio específicas (ex.: dependências entre opções) não são tratadas.

## Cenários Corporativos e UX

- Listas extensas carecem de busca ou agrupamento para facilitar seleção.
- Mensagens de erro e labels customizáveis são limitadas.
- Navegação por teclado e leitura por screen readers podem ser melhoradas.

## Ações recomendadas

- Mapear e repassar atributos e eventos nativos para cada checkbox.
- Implementar estado indeterminado e personalização por opção.
- Permitir classes e estilos dinâmicos nas opções.
