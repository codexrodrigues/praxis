/*
 * Public API Surface of praxis-dynamic-fields
 */

// =============================================================================
// SISTEMA DE REGISTRO SIMPLIFICADO
// =============================================================================

// Interface e tipos essenciais
export * from './lib/services/component-registry/component-registry.interface';

// Serviço principal de registro
export * from './lib/services/component-registry/component-registry.service';

// =============================================================================
// COMPONENTES ATIVOS E UTILITÁRIOS
// =============================================================================

// Error State Matcher utilitário
export * from './lib/utils/error-state-matcher';

// Diálogo de confirmação
export * from './lib/components/material-button/confirm-dialog.component';

// =============================================================================
// SERVIÇOS UTILITÁRIOS ATIVOS
// =============================================================================

// Resolver de ações
export * from './lib/services/action-resolver.service';

// Atalhos de teclado
export * from './lib/services/keyboard-shortcut.service';

// =============================================================================
// COMPONENTES MATERIAL DESIGN
// =============================================================================

// Componentes base
export * from './lib/base/base-dynamic.component';
export * from './lib/base/base-dynamic-field.component';
export * from './lib/base/base-dynamic-list.component';

// Componentes Material Design
export * from './lib/components/material-input/material-input.component';
export * from './lib/components/material-select/material-select.component';
export * from './lib/components/material-textarea/material-textarea.component';
export * from './lib/components/material-checkbox/material-checkbox.component';
export * from './lib/components/material-radio/material-radio.component';
export * from './lib/components/material-date-picker/material-date-picker.component';
export * from './lib/components/material-date-range/material-date-range.component';
export * from './lib/components/material-button/material-button.component';
export * from './lib/components/material-colorpicker/material-colorpicker.component';

// =============================================================================
// DIRETIVAS
// =============================================================================

// Diretiva de renderização dinâmica
export * from './lib/directives/dynamic-field-loader.directive';