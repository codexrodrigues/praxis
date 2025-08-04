# pdx-week-input

## Lista de inputs/outputs atuais

- **Metadados**: label, prefixIcon, suffixIcon, required, readonly, min, max, ariaLabel, hint, hintAlign.
- **Outputs**: `valueChange`, `focusChange` e `validationChange`.

## Propriedades/eventos ausentes

- Ausência de `step`, `name`, `id`, `tabIndex`, `aria-describedby`, `errorStateMatcher`, controle `disabled` e eventos `change`/`blur`.

## Integridade do Código e Lógica de Negócio

- Validação fixa no formato `YYYY-Www`.
- Mesmas limitações de estilização e acessibilidade da base.
- Validações e estado desabilitado dependem do FormControl; o wrapper não sincroniza mudanças em tempo real.
- Falta de normalização ou mascaramento para garantir padrões corporativos.
- Ausência de hooks para regras de negócio adicionais ou auditoria.

## Cenários Corporativos e UX

- Mensagens de erro, internacionalização e acessibilidade limitadas.
- Necessidade de máscaras e formatações para entradas sensíveis (CNPJ, CPF, datas).
- Navegação por teclado e feedback visual podem ser aprimorados.

## Ações recomendadas

- Permitir configuração de `step` e `disabled` via metadados.
- Expor atributos ARIA adicionais e eventos nativos.
- Considerar suporte a formatações regionais.
