# Material Timepicker Wrapper Audit

## Current API

### Inputs
- _None exposed_. Configuration is provided via `setInputMetadata(metadata: MaterialTimepickerMetadata)`.

### Outputs
- `valueChange` – emitted when the internal value updates.
- `focusChange` – emitted when the field gains or loses focus.
- `validationChange` – emitted after asynchronous validation completes.

### Host bindings
- `[class]`: `componentCssClasses()`
- `data-field-type="timePicker"`
- `data-field-name`: `metadata()?.name`
- `data-component-id`: `componentId()`

## Supported Angular Material Features
- `mat-timepicker` with configurable `interval`, `touchUi`, `format` and `showSeconds`
- Min/max time, open-on-click and custom filter function
- Prefix icon, hint text and validation messages
- Step minute/second enforcement and ARIA labels

## Missing Features vs. MatTimepicker
- No outputs for `opened`/`closed` events
- `panelClass`, `timepickerToggleIcon` and theming options not configurable
- Lacks bindings for `tabIndex`, `aria-describedby`, or toggle button attributes
- Cannot programmatically `open`/`close` the picker via metadata

## Recommended Actions
- Emit `opened`/`closed` events and expose programmatic control methods
- Surface `panelClass`, toggle customization and additional styling hooks
- Allow setting `tabIndex`, `aria-*` attributes and step granularity
- Provide access to timepicker instance for advanced usage

