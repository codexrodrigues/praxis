# Material Checkbox Group Wrapper Audit

## Current API

### Inputs

- _None exposed_. Configuration is provided via `setSelectMetadata(metadata: MaterialCheckboxMetadata)`.

### Outputs

- `valueChange` – emitted when the internal value updates.
- `focusChange` – emitted when the field gains or loses focus.
- `searchTermChange` – emitted when the search text changes.
- `selectionChange` – emitted after the selection is updated.
- `optionSelected` – emitted when a particular option is picked.
- `optionsLoaded` – emitted after remote options are fetched.

### Host bindings

- `[class]`: `componentCssClasses()`
- `data-field-type="checkbox"`
- `data-field-name`: `metadata()?.name`
- `data-component-id`: `componentId()`

## Supported Angular Material Features

- Multiple selection with `selectAll` helper and `maxSelections` limit
- Dynamic option loading through `resourcePath`
- Checkbox theming via `color` and `labelPosition`
- Horizontal or vertical layouts using `layout` metadata

## Missing Features vs. MatCheckbox

- `indeterminate` state and related `indeterminateChange` event
- Native `change` output for individual checkboxes
- `name`, `id`, `aria-*` attributes and `tabIndex`
- `required`, `disableRipple`, `value`, `checked`, `inputId`
- No support for projecting custom checkbox content (`ng-content`)

## Recommended Actions

- Surface MatCheckbox inputs like `indeterminate`, `disableRipple` and ARIA attributes
- Emit `change`/`indeterminateChange` for each option selection
- Allow passing names, ids and tabindex to individual checkboxes
- Support content projection for custom checkbox labels and descriptions
