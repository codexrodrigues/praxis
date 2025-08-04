# pdx-email-input

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, prefixIcon, suffixIcon, required, autocomplete, spellcheck, readonly, minLength, maxLength, ariaLabel, hint, hintAlign.
- **Outputs**: `valueChange`, `focusChange` e `validationChange`.

## Propriedades/eventos ausentes

- Não há suporte para `multiple`, `size`, `name`, `id`, `tabIndex`, `aria-describedby`, `errorStateMatcher` ou controle `disabled` via metadados.
- Eventos nativos (`change`, `blur`) não são expostos ao consumidor.

## Integridade do Código e Lógica de Negócio

- Validação baseada em `Validators.email`; demais padrões precisam ser configurados na classe base.
- Mesmas limitações de estilização e acessibilidade do componente base.
- Validações e estado desabilitado dependem do FormControl; o wrapper não sincroniza mudanças em tempo real.
- Falta de normalização ou mascaramento para garantir padrões corporativos.
- Ausência de hooks para regras de negócio adicionais ou auditoria.

## Cenários Corporativos e UX

- Mensagens de erro, internacionalização e acessibilidade limitadas.
- Necessidade de máscaras e formatações para entradas sensíveis (CNPJ, CPF, datas).
- Navegação por teclado e feedback visual podem ser aprimorados.

## Ações recomendadas

- Expor `disabled`, `name` e atributos ARIA adicionais.
- Permitir configuração de `multiple`, `inputmode` e tamanho.
- Emitir eventos nativos para integração externa.
