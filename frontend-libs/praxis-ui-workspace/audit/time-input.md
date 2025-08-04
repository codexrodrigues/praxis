# pdx-time-input

## Lista de inputs/outputs atuais

- **Metadados**: label, prefixIcon, suffixIcon, required, readonly, min, max, step, ariaLabel, hint, hintAlign.
- **Outputs**: `valueChange`, `focusChange` e `validationChange`.

## Propriedades/eventos ausentes

- Não expõe `name`, `id`, `tabIndex`, `aria-describedby`, `errorStateMatcher`, `disabled` ou eventos `change`/`blur`.

## Integridade do Código e Lógica de Negócio

- Validação fixa no formato `HH:MM`.
- Estilização e acessibilidade limitadas pela base.
- Validações e estado desabilitado dependem do FormControl; o wrapper não sincroniza mudanças em tempo real.
- Falta de normalização ou mascaramento para garantir padrões corporativos.
- Ausência de hooks para regras de negócio adicionais ou auditoria.

## Cenários Corporativos e UX

- Mensagens de erro, internacionalização e acessibilidade limitadas.
- Necessidade de máscaras e formatações para entradas sensíveis (CNPJ, CPF, datas).
- Navegação por teclado e feedback visual podem ser aprimorados.

## Ações recomendadas

- Expor atributos e eventos nativos adicionais.
- Suportar `disabled` e atributos ARIA extra.
- Considerar suporte a segundos e fuso horário.
