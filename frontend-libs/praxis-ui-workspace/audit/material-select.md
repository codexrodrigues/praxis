# pdx-material-select

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, required, disabled, hint, selectOptions/options, searchable, resourcePath, filterCriteria, optionLabelKey, optionValueKey, defaultValue.
- **Outputs**: `valueChange`, `focusChange`, `selectionChange`, `optionSelected`, `optionsLoaded`.

## Propriedades/eventos ausentes

- Não expõe atributos do `MatSelect` como `compareWith`, `disableRipple`, `panelClass`, `panelWidth`, `panelOpen`, `errorStateMatcher`, `name`, `id`, `tabIndex`, `aria-*`, `typeaheadDebounceInterval`, `disableOptionCentering` ou `scrollStrategy`.
- Eventos nativos `openedChange`, `closed` e `optionSelectionChanges` não são repassados.

## Integridade do Código e Lógica de Negócio

- Estilização limitada ao `mat-form-field`; não há suporte para `panelClass` ou `ngClass` dinâmico no `mat-select`.
- Acessibilidade restrita a `mat-label`, sem atributos ARIA adicionais.
- Opções renderizadas apenas como texto, sem projeção de templates customizados.
- Ausência de `compareWith` compromete seleção de objetos complexos.
- Opções dinâmicas não possuem tratamento de erro ou estado de carregamento consistente.
- Falta de revalidação do `defaultValue` quando a lista de opções é atualizada.

## Cenários Corporativos e UX

- Carência de suporte a grandes datasets (virtual scroll, paginação) comuns em ambientes corporativos.
- Mensagens de vazio, carregamento e erro não são personalizáveis.
- Acessibilidade limitada: navegação por teclado e atributos ARIA adicionais são necessários.

## Ações recomendadas

- Mapear e expor atributos e eventos faltantes do `MatSelect` via metadados.
- Permitir customização de classes (`panelClass`, `ngClass`) e atributos ARIA.
- Suportar projeção de conteúdo para `mat-select-trigger` e opções avançadas.
