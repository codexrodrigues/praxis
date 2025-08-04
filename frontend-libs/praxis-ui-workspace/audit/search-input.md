# pdx-search-input

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, prefixIcon, suffixIcon, required, autocomplete, spellcheck, readonly, ariaLabel, hint, hintAlign.
- **Outputs**: `valueChange`, `focusChange` e `validationChange`.

## Propriedades/eventos ausentes

- Atributos nativos como `incremental`, `name`, `id`, `tabIndex`, `aria-describedby`, `errorStateMatcher` e `disabled` não são expostos.
- Eventos `change`/`blur` não são propagados.

## Integridade do Código e Lógica de Negócio

- Não há suporte a customização de prefixo/sufixo além de ícones.
- Estilização e acessibilidade limitadas à base.
- Validações e estado desabilitado dependem do FormControl; o wrapper não sincroniza mudanças em tempo real.
- Falta de normalização ou mascaramento para garantir padrões corporativos.
- Ausência de hooks para regras de negócio adicionais ou auditoria.

## Cenários Corporativos e UX

- Mensagens de erro, internacionalização e acessibilidade limitadas.
- Necessidade de máscaras e formatações para entradas sensíveis (CNPJ, CPF, datas).
- Navegação por teclado e feedback visual podem ser aprimorados.

## Ações recomendadas

- Mapear atributos nativos (`incremental`, `disabled`, `aria` extras).
- Expor eventos nativos e permitir conteúdo customizado.
