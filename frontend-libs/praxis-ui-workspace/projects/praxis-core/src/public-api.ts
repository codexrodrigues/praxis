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

// Table configuration services
export * from './lib/services/table-config.service';

// Resizable Window Component
export * from './lib/components/resizable-window/praxis-resizable-window.component';
export * from './lib/components/resizable-window/services/praxis-resizable-window.service';
