/*
 * Public API Surface of praxis-dynamic-fields
 */

// Base components
export * from './lib/base/base-dynamic.component';
export * from './lib/base/base-dynamic-field.component';
export * from './lib/base/base-dynamic-list.component';

// Directives
export * from './lib/directives/dynamic-field-loader.directive';

// Material field components
export * from './lib/components/material-button/material-button.component';
export * from './lib/components/material-button/confirm-dialog.component';
export * from './lib/components/material-checkbox/material-checkbox.component';
export * from './lib/components/material-colorpicker/material-colorpicker.component';
export * from './lib/components/material-currency/material-currency.component';
export * from './lib/components/material-date-picker/material-date-picker.component';
export * from './lib/components/material-date-range/material-date-range.component';
export * from './lib/components/material-datepicker/material-datepicker.component';
export * from './lib/components/material-input/material-input.component';
export * from './lib/components/material-radio/material-radio.component';
export * from './lib/components/material-rating/material-rating.component';
export * from './lib/components/material-select/material-select.component';
export * from './lib/components/material-select/select-options-list.component';
export * from './lib/components/material-select/select-search-input.component';
export * from './lib/components/material-select/select-chips.component';
export * from './lib/components/material-slider/material-slider.component';
export * from './lib/components/material-textarea/material-textarea.component';
export * from './lib/components/material-timepicker/material-timepicker.component';
export * from './lib/components/material-toggle/material-toggle.component';
export * from './lib/components/text-input/text-input.component';

// Services
export * from './lib/services/action-resolver.service';
export * from './lib/services/date-utils.service';
export * from './lib/services/dynamic-component.service';
export * from './lib/services/keyboard-shortcut.service';
export * from './lib/services/component-registry/component-registry.service';
export * from './lib/services/component-registry/component-registry.interface';

// Providers
export {
  providePraxisDynamicFields,
  providePraxisDynamicFieldsCore,
} from './lib/providers';

// Utilities
export * from './lib/utils/error-state-matcher';
