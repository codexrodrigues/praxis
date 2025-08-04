# pdx-url-input

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, prefixIcon, suffixIcon, required, autocomplete, spellcheck, readonly, minLength, maxLength, ariaLabel, hint, hintAlign.
- **Outputs**: `valueChange`, `focusChange` e `validationChange`.

## Propriedades/eventos ausentes

- Não disponibiliza `pattern` configurável, `name`, `id`, `tabIndex`, `aria-describedby`, `errorStateMatcher` ou `disabled` via metadados.
- Eventos `change` e `blur` não são repassados.

## Integridade do Código e Lógica de Negócio

- Utiliza `Validators.pattern` fixo para URLs iniciando com http/https.
- Estilização e ARIA seguem restrições do componente base.
- Validações e estado desabilitado dependem do FormControl; o wrapper não sincroniza mudanças em tempo real.
- Falta de normalização ou mascaramento para garantir padrões corporativos.
- Ausência de hooks para regras de negócio adicionais ou auditoria.

## Cenários Corporativos e UX

- Mensagens de erro, internacionalização e acessibilidade limitadas.
- Necessidade de máscaras e formatações para entradas sensíveis (CNPJ, CPF, datas).
- Navegação por teclado e feedback visual podem ser aprimorados.

## Ações recomendadas

- Tornar o pattern de validação configurável e expor atributos nativos.
- Suportar propagação de `disabled` e eventos adicionais.
- Expandir mapeamento de atributos ARIA.
