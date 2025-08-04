# pdx-material-timepicker

## Lista de inputs/outputs atuais

- **Metadados**: label, required, readonly, prefixIcon, suffixIcon, min, max, stepMinute, stepSecond, interval, touchUi, format, showSeconds, timeFilter, timeOptions, hint, hintAlign, ariaLabel.
- **Outputs**: `valueChange`, `focusChange`, `validationChange`.

## Propriedades/eventos ausentes

- Não expõe atributos do `MatTimepicker` como `color`, `panelClass`, `openOnFocus`, `openedStream`, `closedStream`.
- Falta repasse de eventos nativos do input (`timeChange`, `timeInput`) e métodos `open`/`close`.

## Integridade do Código e Lógica de Negócio

- Estilização e classes do `mat-timepicker` não são configuráveis.
- Falta suporte ARIA avançado e `tabIndex` para controle do input.
- Não expõe formatos 12h/24h ou validação de faixas de horário.
- Estado `disabled`/`required` não sincroniza com o input nativo.
- Falta de integração com `FormControl` para horários inválidos.

## Cenários Corporativos e UX

- Necessidade de suporte a timezone e locale corporativo.
- Ausência de atalhos rápidos e máscara de digitação.
- Navegação por teclado e acessibilidade precisam de melhorias.

## Ações recomendadas

- Mapear atributos restantes do `MatTimepicker` e repassar eventos/controles.
- Permitir customização de classes/painel e atributos ARIA.
- Propagar eventos nativos do input de tempo.
