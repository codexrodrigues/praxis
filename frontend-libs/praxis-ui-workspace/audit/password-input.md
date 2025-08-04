# pdx-password-input

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, prefixIcon, suffixIcon, required, autocomplete, readonly, ariaLabel, hint, hintAlign.
- **Outputs**: `valueChange`, `focusChange` e `validationChange`.

## Propriedades/eventos ausentes

- Não expõe `minLength`, `maxLength`, `name`, `id`, `tabIndex`, `aria-describedby`, `errorStateMatcher` ou `disabled` via metadados.
- Falta evento para alternar visibilidade e não emite `change`/`blur` externamente.

## Integridade do Código e Lógica de Negócio

- Não há suporte a regras de força de senha ou projeção de prefixo/sufixo customizado.
- Estilização e acessibilidade seguem limitações do componente base.
- Validações e estado desabilitado dependem do FormControl; o wrapper não sincroniza mudanças em tempo real.
- Falta de normalização ou mascaramento para garantir padrões corporativos.
- Ausência de hooks para regras de negócio adicionais ou auditoria.

## Cenários Corporativos e UX

- Mensagens de erro, internacionalização e acessibilidade limitadas.
- Necessidade de máscaras e formatações para entradas sensíveis (CNPJ, CPF, datas).
- Navegação por teclado e feedback visual podem ser aprimorados.

## Ações recomendadas

- Permitir configuração de tamanho mínimo/máximo e de `disabled`.
- Expor eventos nativos e opcionalmente um toggle de visibilidade.
- Expandir suporte a atributos ARIA e personalização de ícones.
