# pdx-material-textarea

## Lista de inputs/outputs atuais

- **Metadados**: label, placeholder, required, readonly, hint, prefixIcon, suffixIcon, autoSize, maxLength, minLength, rows, cols, hintAlign, spellcheck, materialDesign.floatLabel, cssClass.
- **Outputs**: `valueChange`, `focusChange`, `blur`, `input`.

## Propriedades/eventos ausentes

- Não expõe atributos nativos do `<textarea>`/`MatInput` como `name`, `id`, `tabIndex`, `autocomplete`, `aria-*`, `disabled`, `errorStateMatcher`.
- Eventos como `selectionChange`, `keydown`, `keyup` não são configuráveis.

## Integridade do Código e Lógica de Negócio

- Customização de classes limitada; não há `ngClass` dinâmico no `mat-form-field` ou no `<textarea>`.
- Projeção de conteúdo restrita a ícones; sem suporte a prefix/suffix customizados.
- Falta validação de tamanho máximo de conteúdo e número de linhas.
- Estado `disabled` e contagem de caracteres não sincronizam com o `FormControl`.
- Ausência de auto-resize configurável via metadados.

## Cenários Corporativos e UX

- Suporte limitado a redimensionamento controlado e atalhos de formatação.
- Mensagens de erro e ajuda contextual não são customizáveis.
- Não há mecanismos de sanitização para prevenir XSS em textos longos.

## Ações recomendadas

- Mapear atributos nativos e ARIA do textarea e `MatInput`.
- Expor eventos adicionais e permitir injeção de classes/estilos.
- Suportar prefixos/sufixos projetados e opções de auto-resize configuráveis.
