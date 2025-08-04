# pdx-text-input

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, prefixIcon, suffixIcon, required, autocomplete, spellcheck, readonly, minLength, maxLength, ariaLabel, hint, hintAlign, showCharacterCount, defaultValue.
- **Outputs**: `valueChange`, `focusChange` (herdados da base) e `validationChange`.

## Propriedades/eventos ausentes

- Não expõe opções do `MatInput` como `errorStateMatcher`, `name`, `id`, `tabIndex`, `inputmode`, `aria-describedby` ou estado `disabled` via metadados.
- Eventos nativos como `change`, `blur` e `input` não são emitidos externamente.

## Integridade do Código e Lógica de Negócio

- Estilização baseada em `[appearance]` e `[color]`, mas não há suporte a `floatLabel`, `subscriptSizing` ou `ngClass` dinâmico.
- Acessibilidade limitada a `aria-label` e `aria-required`.
- Prefixo/sufixo restritos a `mat-icon`, sem slots ng-content genéricos.
- Validações e estado desabilitado dependem do FormControl; o wrapper não sincroniza mudanças em tempo real.
- Falta de normalização ou mascaramento para garantir padrões corporativos.
- Ausência de hooks para regras de negócio adicionais ou auditoria.

## Cenários Corporativos e UX

- Mensagens de erro, internacionalização e acessibilidade limitadas.
- Necessidade de máscaras e formatações para entradas sensíveis (CNPJ, CPF, datas).
- Navegação por teclado e feedback visual podem ser aprimorados.

## Ações recomendadas

- Mapear atributos faltantes do `MatInput` e permitir configuração via metadados.
- Expor eventos `change`/`blur` e estado `disabled`.
- Ampliar suporte a atributos ARIA (`aria-describedby`, `aria-invalid`).
- Permitir projeção de conteúdo customizado para prefixos/sufixos e classes dinâmicas.
