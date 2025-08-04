# Material Select Wrapper Audit

## Current API

### Inputs

- _None exposed_. Configuration is provided via `setSelectMetadata(metadata: SimpleSelectMetadata)`.

### Outputs

- `valueChange` – emitted when the internal value updates.
- `focusChange` – emitted when the field gains or loses focus.
- `searchTermChange` – emitted when the search text changes.
- `selectionChange` – emitted after the selection is updated.
- `optionSelected` – emitted when a particular option is picked.
- `optionsLoaded` – emitted after remote options are fetched.

### Host bindings

- `[class]`: `componentCssClasses()`
- `data-field-type="select"`
- `data-field-name`: `metadata()?.name`
- `data-component-id`: `componentId()`

## Supported Angular Material Features

- Placeholder, required and disabled states
- Basic single-selection behaviour via `FormControl`
- `mat-form-field` appearance and color bindings

## Missing Features vs. MatSelect

- `multiple` selections or select-all helpers
- `compareWith` and custom value comparison
- `panelClass`, `backdropClass`, `disableOptionCentering`, `panelWidth`
- `errorStateMatcher`, `id`, `name`, `tabIndex`, `aria-*` attributes
- Open/close events and `openedChange`
- Projection slots like `mat-select-trigger` and `mat-optgroup`

## Recommended Actions

- Expose core MatSelect inputs such as `compareWith`, `panelClass` and ARIA attributes
- Emit open/close related outputs to mirror MatSelect events
- Support content projection for custom trigger and option grouping
- Allow configuration of multiple selection when appropriate or document limitations
