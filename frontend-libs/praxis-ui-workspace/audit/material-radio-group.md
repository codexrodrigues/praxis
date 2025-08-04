# pdx-material-radio-group

## Lista de inputs/outputs atuais

- **Metadados**: label, color, layout, radioOptions/options, resourcePath, filterCriteria, optionLabelKey, optionValueKey.
- **Outputs**: `valueChange`, `focusChange`, `selectionChange`, `optionsLoaded`.

## Propriedades/eventos ausentes

- Não expõe atributos do `MatRadioGroup`/`MatRadioButton` como `name`, `aria-label`, `disableRipple`, `tabIndex`, `labelPosition` individual.
- Eventos `change` nativo do `MatRadioGroup` não é repassado.

## Integridade do Código e Lógica de Negócio

- Não suporta ng-content para personalização de opções.
- Estilização limitada, sem `ngClass` dinâmico no grupo ou opções.
- Valor padrão não é revalidado ao atualizar opções.
- Falta exposição de `name` e `aria-labelledby` para identificação adequada.
- Não há regras para seleção obrigatória ou desabilitar opções condicionais.

## Cenários Corporativos e UX

- Ausência de layouts responsivos e controle de orientação via metadados.
- Mensagens de erro e tooltips não são personalizáveis.
- Navegação por teclado e foco visível precisam ser garantidos.

## Ações recomendadas

- Permitir configuração de atributos nativos (`name`, ARIA) e eventos.
- Suportar customização de classes e projeção de conteúdo para opções.
