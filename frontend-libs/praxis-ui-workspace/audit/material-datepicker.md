# pdx-material-datepicker

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, required, readonly, prefixIcon, suffixIcon, minDate, maxDate, startAt, startView, touchUi, dateFilter, hint, hintAlign, ariaLabel.
- **Outputs**: `valueChange`, `focusChange`, `validationChange`, `dateChange`.

## Propriedades/eventos ausentes

- Não expõe atributos do `MatDatepicker`/`MatDatepickerInput` como `color`, `panelClass`, `tabIndex`, `panelOpen`, `openedStream`, `closedStream`.
- Não propaga métodos `open`/`close` nem eventos `monthSelected`/`yearSelected`.

## Integridade do Código e Lógica de Negócio

- Estilização restrita ao `mat-form-field`; sem `panelClass` ou `ngClass` dinâmico.
- Entrada não repassa eventos nativos `input`/`change`.
- `min`, `max` e `dateFilter` não são expostos via metadados.
- Não há tratamento para datas inválidas digitadas manualmente.
- Configuração de fuso horário e formatação depende do ambiente externo.

## Cenários Corporativos e UX

- Falta de atalhos de seleção rápida e suporte a calendários corporativos (feriados).
- Mensagens de erro e formatação local não são personalizáveis.
- Acessibilidade do calendário (atalhos, leitores de tela) é limitada.

## Ações recomendadas

- Mapear atributos e eventos faltantes, incluindo `open`/`close`.
- Permitir customização de classes/painel e atributos ARIA.
- Repassar eventos nativos do input.
