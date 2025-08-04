# pdx-phone-input

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, prefixIcon, suffixIcon, required, autocomplete, readonly, ariaLabel, hint, hintAlign.
- **Outputs**: `valueChange`, `focusChange` e `validationChange`.

## Propriedades/eventos ausentes

- Não expõe atributos nativos como `pattern` configurável, `name`, `id`, `tabIndex`, `aria-describedby`, `errorStateMatcher` ou `disabled` via metadados.
- Falta propagação de eventos `change` e `blur`.

## Integridade do Código e Lógica de Negócio

- Validação fixa para dígitos e símbolos básicos; não há suporte a máscaras ou formatação internacional.
- Acessibilidade e estilização seguem limitações da base.
- Validações e estado desabilitado dependem do FormControl; o wrapper não sincroniza mudanças em tempo real.
- Falta de normalização ou mascaramento para garantir padrões corporativos.
- Ausência de hooks para regras de negócio adicionais ou auditoria.

## Cenários Corporativos e UX

- Mensagens de erro, internacionalização e acessibilidade limitadas.
- Necessidade de máscaras e formatações para entradas sensíveis (CNPJ, CPF, datas).
- Navegação por teclado e feedback visual podem ser aprimorados.

## Ações recomendadas

- Permitir configuração de `pattern` e propagação de `disabled`.
- Expor eventos nativos e atributos ARIA adicionais.
- Considerar suporte a máscaras e formatação.
