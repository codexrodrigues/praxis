# pdx-material-searchable-select

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, required, disabled, hint, selectOptions/options, multiple, selectAll, maxSelections, resourcePath, filterCriteria, optionLabelKey, optionValueKey, defaultValue.
- **Outputs**: `valueChange`, `focusChange`, `selectionChange`, `optionSelected`, `optionsLoaded`, `searchTermChange`.

## Propriedades/eventos ausentes

- Não expõe `compareWith`, `disableRipple`, `panelClass`, `panelWidth`, `panelOpen`, `errorStateMatcher`, `name`, `id`, `tabIndex`, `aria-*`, `typeaheadDebounceInterval`, `disableOptionCentering` e `scrollStrategy` do `MatSelect`.
- Eventos `openedChange`, `closed` e `optionSelectionChanges` não estão disponíveis.

## Integridade do Código e Lógica de Negócio

- Campo de busca possui placeholder fixo e sem configuração de debounce.
- Metadados `selectAll` e `maxSelections` não possuem implementação de UI.
- Falta suporte a templates customizados e classes dinâmicas no painel de seleção.
- Ausência de `compareWith` compromete seleção de objetos complexos.
- Opções dinâmicas não possuem tratamento de erro ou estado de carregamento consistente.
- Falta de revalidação do `defaultValue` quando a lista de opções é atualizada.

## Cenários Corporativos e UX

- Carência de suporte a grandes datasets (virtual scroll, paginação) comuns em ambientes corporativos.
- Mensagens de vazio, carregamento e erro não são personalizáveis.
- Acessibilidade limitada: navegação por teclado e atributos ARIA adicionais são necessários.

## Ações recomendadas

- Mapear atributos e eventos nativos do `MatSelect`, inclusive `openedChange` e `closed`.
- Tornar configuráveis placeholder e debounce da busca; implementar `selectAll`/`maxSelections` no template.
- Permitir customização de opções, `panelClass`, `ngClass` e atributos ARIA.
