# pdx-material-button

## Lista de inputs/outputs atuais

- **Metadados**: label, variant, icon, color, tooltip, disabled, loading, confirm, action, shortcut.
- **Outputs**: `clicked`, `actionExecuted`, `focus`, `blur`.

## Propriedades/eventos ausentes

- Não expõe atributos nativos do `MatButton` como `type`, `href`, `tabIndex`, `aria-*`, `disableRipple`, `name`, `id`.
- Eventos nativos como `mouseover`, `mouseleave` e teclas de atalho não são repassados.

## Integridade do Código e Lógica de Negócio

- Estilização limitada a classes pré-definidas; não há suporte a `ngClass`/`ngStyle` dinâmicos.
- Conteúdo do botão restrito a texto e ícone único; não suporta projeção livre.
- Ausência de `type` explícito pode causar submits indesejados.
- Estado `disabled` não previne múltiplos cliques ou ações concorrentes.
- Sem rastreabilidade de ações para auditoria ou logging.

## Cenários Corporativos e UX

- Falta de indicador de progresso ou confirmação visual para operações longas.
- Tematização e tamanhos não seguem padrões corporativos por metadados.
- Acessibilidade limitada: ausência de `aria-label` e suporte a atalhos de teclado.

## Ações recomendadas

- Mapear e repassar atributos do `MatButton`, incluindo `type`, `disableRipple` e atributos ARIA.
- Expor eventos nativos de mouse e teclado.
- Permitir projeção de conteúdo e customização de classes/estilos.
