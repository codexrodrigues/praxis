/*
 * Public API Surface of praxis-dynamic-fields
 */

// Base components and interfaces
export * from './lib/base/base-dynamic-field-component.interface';
export * from './lib/base/simple-base-input.component';
export * from './lib/base/simple-base-button.component';

// Directives
export * from './lib/directives/dynamic-field-loader.directive';

// Material field components
export * from './lib/components/material-button/material-button.component';
export * from './lib/components/material-button/confirm-dialog.component';
export * from './lib/components/text-input/text-input.component';
export * from './lib/components/preload-status/preload-status.component';

// Services
export * from './lib/services/action-resolver.service';
export * from './lib/services/date-utils.service';
export * from './lib/services/keyboard-shortcut.service';
export * from './lib/services/component-registry/component-registry.service';
export * from './lib/services/component-registry/component-registry.interface';
export * from './lib/services/component-preloader.service';

// Providers
export {
  providePraxisDynamicFields,
  providePraxisDynamicFieldsCore,
} from './lib/providers';

// Utilities
export * from './lib/utils/error-state-matcher';
export * from './lib/utils/logger';
export * from './lib/utils/json-schema-mapper';
