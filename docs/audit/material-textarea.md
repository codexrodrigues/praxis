# Material Textarea Wrapper Audit

## Current API

### Inputs
- _None exposed_. Configuration is provided via `setTextareaMetadata(metadata: MaterialTextareaMetadata)`.

### Outputs
- `valueChange` – emitted when the internal value updates.
- `focusChange` – emitted when the field gains or loses focus.

### Host bindings
- `[class]`: `componentCssClasses()`
- `data-field-type="textarea"`
- `data-field-name`: `metadata()?.name`
- `data-component-id`: `componentId()`

## Supported Angular Material Features
- `mat-form-field` appearance, color, `floatLabel` and `hideRequiredMarker`
- Prefix/suffix icons and hint text
- Character counter and validation messages via `mat-hint`/`mat-error`
- Auto-resize with `cdkTextareaAutosize`
- Placeholder, min/max length, `readonly`, `spellcheck`, rows/cols, `aria-describedby`

## Missing Features vs. MatTextarea
- No bindings for `name`, `id`, or `autocomplete`
- Lacks `aria-label`, `aria-labelledby`, and `tabIndex`
- Cannot project custom prefix/suffix content beyond icons
- No outputs for `input`, `blur` or `keydown` events

## Recommended Actions
- Surface `name`, `id`, `autocomplete`, and ARIA attributes
- Expose `tabIndex` and allow custom content projection
- Emit native events such as `input` and `blur`
- Support additional Material features like `matTextareaAutosize` options and theming hooks

