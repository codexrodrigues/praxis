# pdx-material-multi-select

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, required, disabled, hint, selectOptions/options, searchable, selectAll, maxSelections, resourcePath, filterCriteria, optionLabelKey, optionValueKey, defaultValue.
- **Outputs**: `valueChange`, `focusChange`, `selectionChange`, `optionSelected`, `optionsLoaded`.

## Propriedades/eventos ausentes

- Falta suporte a atributos do `MatSelect` como `compareWith`, `disableRipple`, `panelClass`, `panelWidth`, `panelOpen`, `errorStateMatcher`, `name`, `id`, `tabIndex`, `aria-*`, `typeaheadDebounceInterval`, `disableOptionCentering` e `scrollStrategy`.
- Eventos nativos `openedChange`, `closed` e `optionSelectionChanges` não são emitidos.

## Integridade do Código e Lógica de Negócio

- Metadado `searchable` é aceito, porém não há campo de busca no template.
- Opção "Selecionar todos" e limite `maxSelections` implementados de forma estática.
- Acessibilidade limitada e ausência de classes dinâmicas ou `panelClass`.
- Ausência de `compareWith` compromete seleção de objetos complexos.
- Opções dinâmicas não possuem tratamento de erro ou estado de carregamento consistente.
- Falta de revalidação do `defaultValue` quando a lista de opções é atualizada.

## Cenários Corporativos e UX

- Carência de suporte a grandes datasets (virtual scroll, paginação) comuns em ambientes corporativos.
- Mensagens de vazio, carregamento e erro não são personalizáveis.
- Acessibilidade limitada: navegação por teclado e atributos ARIA adicionais são necessários.

## Ações recomendadas

- Expor atributos ausentes do `MatSelect` e eventos de abertura/fechamento.
- Implementar busca interna e suporte configurável a `selectAll`/`maxSelections`.
- Permitir `panelClass`, `ngClass` e personalização de opções via template.
