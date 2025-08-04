# Material Button Wrapper Audit

## Current API

### Inputs
- _None exposed_. Configuration is provided via `setButtonMetadata(metadata: MaterialButtonMetadata)`.

### Outputs
- `actionExecuted` – emitted when a configured action completes.
- `click` – emitted on button click.
- `focusChange` – emitted when the button gains or loses focus.

### Host bindings
- `[class]`: `componentCssClasses()`
- `data-field-type="button"`
- `data-field-name`: `metadata()?.name`
- `data-button-variant`: `buttonVariant()`
- `data-component-id`: `componentId()`

## Supported Angular Material Features
- All Material variants: `basic`, `raised`, `stroked`, `flat`, `icon`, `fab`, `mini-fab`
- Configurable `color`, `type` and `disableRipple`
- Prefix icons, tooltips and loading spinner
- Keyboard shortcuts via `KeyboardShortcutService`

## Missing Features vs. MatButton
- No bindings for `tabIndex`, `aria-pressed`, or other ARIA attributes
- Lacks anchor (`<a mat-button>`) and `href` support
- `matBadge`, `matMenuTriggerFor`, and tooltip `panelClass` not configurable
- No outputs for focus/blur or toggle state changes

## Recommended Actions
- Expose `tabIndex`, `aria-*` attributes and anchor support
- Allow passing extra Material directives like `matBadge` or `matMenuTriggerFor`
- Surface tooltip `panelClass` and additional styling hooks
- Emit focus/blur and pressed state changes for integrations

