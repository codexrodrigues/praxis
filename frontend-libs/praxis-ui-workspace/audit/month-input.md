# pdx-month-input

## Lista de inputs/outputs atuais

- **Metadados**: label, prefixIcon, suffixIcon, required, readonly, min, max, ariaLabel, hint, hintAlign.
- **Outputs**: `valueChange`, `focusChange` e `validationChange`.

## Propriedades/eventos ausentes

- Não há suporte a `step`, `name`, `id`, `tabIndex`, `aria-describedby`, `errorStateMatcher`, `disabled` ou eventos `change`/`blur`.

## Integridade do Código e Lógica de Negócio

- Validação fixa no formato `YYYY-MM`.
- Estilização e acessibilidade limitadas à implementação base.
- Validações e estado desabilitado dependem do FormControl; o wrapper não sincroniza mudanças em tempo real.
- Falta de normalização ou mascaramento para garantir padrões corporativos.
- Ausência de hooks para regras de negócio adicionais ou auditoria.

## Cenários Corporativos e UX

- Mensagens de erro, internacionalização e acessibilidade limitadas.
- Necessidade de máscaras e formatações para entradas sensíveis (CNPJ, CPF, datas).
- Navegação por teclado e feedback visual podem ser aprimorados.

## Ações recomendadas

- Adicionar configuração de `step` e `disabled` via metadados.
- Expor eventos nativos e atributos ARIA adicionais.
- Considerar suporte a formatações regionais.
