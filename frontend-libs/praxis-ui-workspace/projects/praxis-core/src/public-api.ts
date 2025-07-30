/*
 * Public API Surface of praxis-core
 */

export * from './lib/praxis-core';
//GenericCrudService
export * from './lib/services/generic-crud.service';
//ApiUrlConfig
export * from './lib/tokens/api-url.token';
// Table configuration models (V1 + V2 unified)
export * from './lib/models/table-config.model';
export * from './lib/models/table-config-v2.model';
export * from './lib/models/page.model';
export * from './lib/models/field-definition.model';

// Component Metadata Interfaces (Angular Material Integration)
export * from './lib/models/component-metadata.interface';
export * from './lib/models/material-field-metadata.interface';

// Metadata constants
export * from './lib/metadata/field-control-type.constants';
export * from './lib/metadata/field-data-type.constants';
export * from './lib/metadata/allowed-file-types.constants';
export * from './lib/metadata/icon-position.constants';
export * from './lib/metadata/icon-size.constants';
export * from './lib/metadata/numeric-format.constants';
export * from './lib/metadata/validation-pattern.constants';

// Table configuration services
export * from './lib/services/table-config.service';

// Resizable Window Component
export * from './lib/components/resizable-window/praxis-resizable-window.component';
export * from './lib/components/resizable-window/services/praxis-resizable-window.service';
export * from './lib/helpers/field-definition-mapper';
// Dynamic form models
export * from './lib/models/form/form-config.model';
export * from './lib/models/form/form-events.model';
export * from './lib/models/form/form-layout.model';
