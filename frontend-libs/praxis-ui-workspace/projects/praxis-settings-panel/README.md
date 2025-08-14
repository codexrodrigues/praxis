# Praxis Settings Panel

Drawer-based settings panel service and components.

## Usage Contract

Editors rendered inside the panel must expose an `onSave()` method that
returns the updated settings object. The `SettingsPanelComponent` forwards this
value through `SettingsPanelRef.saved$`, allowing the host component to persist
and apply the new configuration.
