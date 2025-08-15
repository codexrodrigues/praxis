/*
 * Public API Surface of praxis-visual-builder
 */

// Main visual builder library
export * from './lib/praxis-visual-builder';

// Core models
export * from './lib/models/field-schema.model';
export * from './lib/models/rule-builder.model';
export * from './lib/models/array-field-schema.model';

// Services
export * from './lib/services/field-schema.service';
export * from './lib/services/rule-builder.service';
export { SpecificationBridgeService } from './lib/services/specification-bridge.service';
export type { SpecificationContextualConfig } from './lib/services/specification-bridge.service';
export * from './lib/services/round-trip-validator.service';
export * from './lib/services/export-integration.service';
export * from './lib/services/webhook-integration.service';
export * from './lib/services/rule-template.service';
export * from './lib/services/rule-validation.service';
export * from './lib/services/rule-node-registry.service';
export * from './lib/services/converters/converter-factory.service';
export * from './lib/services/rule-conversion.service';
export * from './lib/services/dsl/dsl-parsing.service';
export { ContextManagementService } from './lib/services/context/context-management.service';
export type {
  ContextScope,
  ContextEntry,
  ContextValue,
} from './lib/services/context/context-management.service';
export {
  VisualBuilderError,
  ValidationError as VBValidationError,
  ConversionError,
  RegistryError,
  DslError,
  ContextError,
  ConfigurationError,
  InternalError,
  ErrorCategory,
  ErrorSeverity,
  ErrorHandler,
  globalErrorHandler,
  createError,
} from './lib/errors/visual-builder-errors';
export type {
  ErrorInfo,
  ErrorStatistics,
} from './lib/errors/visual-builder-errors';

// Components
export * from './lib/components/rule-editor.component';
export * from './lib/components/rule-canvas.component';
export * from './lib/components/rule-node.component';
export * from './lib/components/field-condition-editor.component';
export * from './lib/components/conditional-validator-editor.component';
export * from './lib/components/collection-validator-editor.component';
export * from './lib/components/metadata-editor.component';
export * from './lib/components/dsl-viewer.component';
export * from './lib/components/json-viewer.component';
export * from './lib/components/round-trip-tester.component';
export * from './lib/components/export-dialog.component';
export * from './lib/components/dsl-linter.component';
export * from './lib/components/visual-rule-builder.component';
export * from './lib/components/template-gallery.component';
export * from './lib/components/template-editor-dialog.component';
export * from './lib/components/template-preview-dialog.component';
