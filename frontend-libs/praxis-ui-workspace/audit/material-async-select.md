# pdx-material-async-select

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, required, disabled, hint, selectOptions/options, multiple, resourcePath, filterCriteria, optionLabelKey, optionValueKey, defaultValue.
- **Outputs**: `valueChange`, `focusChange`, `selectionChange`, `optionSelected`, `optionsLoaded`.

## Propriedades/eventos ausentes

- Não mapeia atributos do `MatSelect` como `compareWith`, `disableRipple`, `panelClass`, `panelWidth`, `panelOpen`, `errorStateMatcher`, `name`, `id`, `tabIndex`, `aria-*`, `typeaheadDebounceInterval`, `disableOptionCentering` ou `scrollStrategy`.
- Eventos `openedChange`, `closed` e `optionSelectionChanges` não são expostos.

## Integridade do Código e Lógica de Negócio

- Opções carregadas apenas ao abrir o painel, sem paginação ou busca configurável.
- Estado de erro exibido como `mat-option` estático e sem mapeamento para mensagens personalizadas.
- Estilização e acessibilidade limitadas; não há `panelClass` ou atributos ARIA.
- Ausência de `compareWith` compromete seleção de objetos complexos.
- Opções dinâmicas não possuem tratamento de erro ou estado de carregamento consistente.
- Falta de revalidação do `defaultValue` quando a lista de opções é atualizada.

## Cenários Corporativos e UX

- Carência de suporte a grandes datasets (virtual scroll, paginação) comuns em ambientes corporativos.
- Mensagens de vazio, carregamento e erro não são personalizáveis.
- Acessibilidade limitada: navegação por teclado e atributos ARIA adicionais são necessários.

## Ações recomendadas

- Expor atributos e eventos nativos do `MatSelect` e permitir paginação/pesquisa remota.
- Suportar `panelClass`, `ngClass` e mensagens de erro configuráveis.
- Disponibilizar evento `openedChange` e opções de acessibilidade ARIA.
