# Text Input Wrapper Audit

## Current API

### Inputs
- _None exposed_. Configuration is provided via `setInputMetadata(metadata: MaterialInputMetadata)`.

### Outputs
- `valueChange` – emitted when the internal value updates.
- `focusChange` – emitted when the field gains or loses focus.
- `validationChange` – emitted after `validateField()` runs.

### Host bindings
- `[class]`: `componentCssClasses()`
- `data-field-type="input"`
- `data-field-name`: `metadata()?.name`
- `data-component-id`: `componentId()`

## Supported Angular Material Features
- Placeholder, required, type, autocomplete, spellcheck, readonly
- MaxLength/MinLength, aria-label, aria-required
- Prefix/suffix icons, hint with alignment, character counter
- `mat-form-field` appearance and color

## Missing Features vs. MatInput / MatFormField
- `name` and `id` attributes on the `<input>` element
- `autoFocus` and `inputMode`
- Text-based prefix/suffix and clear button
- `floatLabel`, `subscriptSizing`, `hideRequiredMarker`
- `errorStateMatcher` and `disabledInteractive`
- `aria-describedby` / `aria-labelledby` handling
- No support for projecting custom content (`ng-content`)

## Recommended Actions
- Expose and bind the missing attributes to the underlying `<input>` or `<mat-form-field>`
- Implement clear button and text prefix/suffix slots
- Surface material form-field options such as `floatLabel`
- Wire up `errorStateMatcher` and ARIA descriptors for accessibility
