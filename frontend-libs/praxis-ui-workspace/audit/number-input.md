# pdx-number-input

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, prefixIcon, suffixIcon, required, readonly, min, max, step, ariaLabel, hint, hintAlign.
- **Outputs**: `valueChange`, `focusChange` e `validationChange`.

## Propriedades/eventos ausentes

- Faltam atributos do `MatInput` como `errorStateMatcher`, `name`, `id`, `tabIndex`, `inputmode`, `aria-describedby` e controle explícito de `disabled`.
- Eventos nativos (`change`, `blur`) não são expostos.

## Integridade do Código e Lógica de Negócio

- Usa validação via `Validators.min`, `max` e `pattern` numérico, porém o pattern não é configurável.
- Estilização e acessibilidade seguem as limitações do componente base.
- Validações e estado desabilitado dependem do FormControl; o wrapper não sincroniza mudanças em tempo real.
- Falta de normalização ou mascaramento para garantir padrões corporativos.
- Ausência de hooks para regras de negócio adicionais ou auditoria.

## Cenários Corporativos e UX

- Mensagens de erro, internacionalização e acessibilidade limitadas.
- Necessidade de máscaras e formatações para entradas sensíveis (CNPJ, CPF, datas).
- Navegação por teclado e feedback visual podem ser aprimorados.

## Ações recomendadas

- Permitir configuração de `inputmode`, `step` e `disabled` via metadados.
- Propagar atributos ARIA adicionais e eventos nativos.
- Tornar o pattern validável configurável.
