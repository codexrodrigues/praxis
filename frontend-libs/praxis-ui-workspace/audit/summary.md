# Auditoria MatInput Wrappers

## Componentes analisados

text-input, number-input, email-input, password-input, url-input, search-input, phone-input, color-input, date-input, datetime-local-input, month-input, time-input, week-input.

## Principais gaps identificados

- Falta de paridade com `MatInput` para atributos como `disabled`, `name`, `id`, `tabIndex`, `inputmode`, `errorStateMatcher` e mapeamento completo de atributos ARIA.
- Eventos nativos (`change`, `blur`) não são repassados pelos wrappers.
- Prefixo e sufixo limitados a `mat-icon`, sem projeção de conteúdo customizado.
- Validações específicas (patterns) fixas em diversos componentes.

## Tarefas recomendadas

1. Mapear e expor todos os atributos suportados pelo `MatInput` via metadados.
2. Criar saídas para eventos `change` e `blur` e propagar o estado `disabled`.
3. Centralizar suporte a atributos ARIA no `SimpleBaseInputComponent`.
4. Permitir projeção de conteúdo customizado para prefixos/sufixos e classes dinâmicas (`ngClass`).
5. Tornar validadores (`pattern`, `min`, `max`, `step`) configuráveis e consistentes.

## Sugestões arquiteturais

- Evoluir `SimpleBaseInputComponent` para concentrar mapeamento de atributos/ARIA comuns, reduzindo duplicação.
- Criar camada de compatibilidade que facilite atualização conforme mudanças no Angular Material.
- Documentar metadados suportados e adicionar testes de regressão para cada atributo exposto.

# Auditoria MatSelect Wrappers

## Componentes analisados

material-select, material-multi-select, material-searchable-select, material-async-select.

## Principais gaps identificados

- Falta de paridade com `MatSelect` para atributos como `compareWith`, `panelClass`, `disableRipple`, `errorStateMatcher`, `tabIndex`, `name`, `id`, `aria-*`, `panelOpen` e opções de estratégia de rolagem.
- Eventos `openedChange`, `closed` e `optionSelectionChanges` não são repassados pelos wrappers.
- Metadados como `searchable`, `selectAll` e `maxSelections` possuem implementações inconsistentes.
- Estilização restrita ao `mat-form-field`; não há suporte a `panelClass`, `ngClass` dinâmico ou projeção de templates.

## Tarefas recomendadas

1. Mapear e expor os atributos restantes do `MatSelect` via metadados.
2. Criar saídas para eventos de abertura/fechamento e seleção nativa.
3. Implementar busca integrada e suporte consistente a `selectAll`/`maxSelections`.
4. Permitir customização de opções, `panelClass` e templates (`mat-select-trigger`).

## Sugestões arquiteturais

- Centralizar mapeamento de atributos `MatSelect` no `SimpleBaseSelectComponent`.
- Adotar projeção de conteúdo para facilitar personalizações de opções e trigger.
- Reutilizar lógica de carregamento remoto e busca entre componentes para reduzir duplicação.

# Auditoria de outros componentes

## Componentes analisados

material-button, material-checkbox-group, material-radio-group, material-date-range, material-datepicker, material-textarea, material-timepicker, preload-status.

## Principais gaps identificados

- Atributos nativos e ARIA dos componentes Angular Material não expostos.
- Eventos nativos como abertura/fechamento, mudança e teclado não são propagados.
- Estilização limitada, sem `ngClass`/`panelClass` dinâmicos e pouca projeção de conteúdo.
- `preload-status` acoplado ao serviço sem inputs ou outputs configuráveis.

## Tarefas recomendadas

1. Mapear e expor atributos e eventos nativos dos componentes Material utilizados.
2. Permitir customização de classes/estilos e projeção de conteúdo.
3. Desacoplar `preload-status` com inputs configuráveis e eventos de status.
4. Adicionar testes cobrindo novos comportamentos.
