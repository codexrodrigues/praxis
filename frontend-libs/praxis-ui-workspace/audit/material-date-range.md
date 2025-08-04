# pdx-material-date-range

## Lista de inputs/outputs atuais

- **Metadados**: label, required, readonly, prefixIcon, suffixIcon, startPlaceholder, endPlaceholder, minDate, maxDate, startAt, touchUi, dateFilter, hint, hintAlign.
- **Outputs**: `valueChange`, `focusChange`, `validationChange`.

## Propriedades/eventos ausentes

- Não expõe atributos do `MatDateRangeInput`/`MatDateRangePicker` como `color`, `disabled`, `panelClass`, `comparisonStart`, `comparisonEnd`, `openedStream`, `closedStream`.
- Falta suporte a `tabIndex`, `aria-describedby` e métodos `open`/`close`.

## Integridade do Código e Lógica de Negócio

- Classes fixas; não há `ngClass` ou `panelClass` dinâmico para o range picker.
- Sem projeção de conteúdo para prefix/suffix além de ícones.
- Não valida se a data inicial é menor ou igual à final.
- `min`, `max` e `dateFilter` do `MatDateRangeInput` não são expostos.
- Estado `disabled` e `required` não sincroniza para ambos os campos.

## Cenários Corporativos e UX

- Falta de formatos e localizações customizáveis para padrões corporativos.
- Ausência de feedback visual quando o intervalo é inválido.
- Não há seleção rápida (hoje, última semana) típica em sistemas empresariais.

## Ações recomendadas

- Mapear atributos restantes do `MatDateRangePicker` e repassar eventos de abertura/fechamento.
- Permitir personalização de classes/`panelClass` e atributos ARIA.
- Suportar conteúdo customizado para prefixos e sufixos.
