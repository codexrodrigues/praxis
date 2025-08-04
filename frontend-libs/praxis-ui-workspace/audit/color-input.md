# pdx-color-input

## Lista de inputs/outputs atuais

- **Metadados**: label, prefixIcon, suffixIcon, required, readonly, ariaLabel, hint, hintAlign.
- **Outputs**: `valueChange`, `focusChange` e `validationChange`.

## Propriedades/eventos ausentes

- Não há suporte a `name`, `id`, `tabIndex`, `aria-describedby`, `errorStateMatcher`, `disabled` ou eventos nativos (`change`, `blur`).
- Sem opção para valor padrão ou transparência.

## Integridade do Código e Lógica de Negócio

- `matInput` é usado apenas para estilização; campo não suporta placeholder.
- Acessibilidade e personalização limitadas à base.
- Validações e estado desabilitado dependem do FormControl; o wrapper não sincroniza mudanças em tempo real.
- Falta de normalização ou mascaramento para garantir padrões corporativos.
- Ausência de hooks para regras de negócio adicionais ou auditoria.

## Cenários Corporativos e UX

- Mensagens de erro, internacionalização e acessibilidade limitadas.
- Necessidade de máscaras e formatações para entradas sensíveis (CNPJ, CPF, datas).
- Navegação por teclado e feedback visual podem ser aprimorados.

## Ações recomendadas

- Expor `disabled` e atributos ARIA adicionais.
- Permitir configuração de valor inicial e eventos nativos.
- Avaliar suporte a prefixos/sufixos customizados além de ícones.
