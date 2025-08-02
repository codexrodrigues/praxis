import type { FieldMetadata } from '../component-metadata.interface';
import type { 
  FormActionsLayout, 
  FormBehaviorLayout, 
  FormApiLayout, 
  FormMessagesLayout, 
  FormLayoutRule 
} from './form-layout.model';

export interface FormColumn {
  fields: string[];
}

export interface FormRow {
  columns: FormColumn[];
}

export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  rows: FormRow[];
}

export interface FormConfig {
  /** Layout sections for simple form organization */
  sections: FormSection[];
  
  /** Complete field metadata for all fields in the form */
  fieldMetadata?: FieldMetadata[];
  
  /** Form configuration metadata */
  metadata?: FormConfigMetadata;
  
  /** Form actions configuration */
  actions?: FormActionsLayout;
  
  /** Form behavior configuration */
  behavior?: FormBehaviorLayout;
  
  /** Form API configuration */
  api?: FormApiLayout;
  
  /** Form messages/i18n configuration */
  messages?: FormMessagesLayout;
  
  /** Form rules for dynamic behavior */
  formRules?: FormLayoutRule[];
}

export interface FormConfigMetadata {
  /** Configuration version for migration support */
  version?: string;
  /** Last update timestamp */
  lastUpdated?: Date;
  /** Configuration source */
  source?: 'local' | 'server' | 'default';
  /** Server data hash for change detection */
  serverHash?: string;
  /** User customizations log */
  customizations?: CustomizationLog[];
}

export interface CustomizationLog {
  /** Field that was customized */
  fieldName: string;
  /** Property that was changed */
  property: string;
  /** Previous value */
  oldValue: any;
  /** New value */
  newValue: any;
  /** When the change was made */
  timestamp: Date;
  /** Who/what made the change */
  source: 'user' | 'server' | 'system';
}

export interface FormConfigState {
  config: FormConfig;
  isLoading: boolean;
  error?: string;
}

export function createDefaultFormConfig(): FormConfig {
  return { 
    sections: [
      {
        id: 'personal-info',
        title: 'Informações Pessoais',
        description: 'Dados básicos do usuário',
        rows: [
          {
            columns: [
              { fields: ['nome', 'email'] },
              { fields: ['telefone', 'dataNascimento'] }
            ]
          },
          {
            columns: [
              { fields: ['endereco'] },
              { fields: ['cidade', 'cep'] }
            ]
          }
        ]
      },
      {
        id: 'professional-info',
        title: 'Informações Profissionais',
        description: 'Dados profissionais',
        rows: [
          {
            columns: [
              { fields: ['cargo', 'departamento'] },
              { fields: ['salario', 'dataAdmissao'] }
            ]
          }
        ]
      }
    ]
  };
}

export function isValidFormConfig(config: any): config is FormConfig {
  return config && typeof config === 'object' && Array.isArray(config.sections);
}

/**
 * Cria configuração vazia para inicialização
 */
export function createEmptyFormConfig(): FormConfig {
  return { sections: [] };
}

/**
 * Merges field metadata into a FormConfig
 * Useful when combining layout with server-loaded metadata
 */
export function mergeFieldMetadata(
  config: FormConfig, 
  fieldMetadata: FieldMetadata[]
): FormConfig {
  return {
    ...config,
    fieldMetadata: fieldMetadata,
    metadata: {
      ...config.metadata,
      lastUpdated: new Date()
    }
  };
}

/**
 * Extracts field metadata for fields referenced in a FormConfig
 * Useful for getting only the metadata that's actually used in the layout
 */
export function getReferencedFieldMetadata(
  config: FormConfig,
  allFieldMetadata: FieldMetadata[]
): FieldMetadata[] {
  // Get all field names referenced in the config
  const referencedFieldNames = new Set<string>();
  
  config.sections.forEach(section => {
    section.rows.forEach(row => {
      row.columns.forEach(column => {
        column.fields.forEach(fieldName => {
          referencedFieldNames.add(fieldName);
        });
      });
    });
  });
  
  // Return only metadata for referenced fields
  return allFieldMetadata.filter(metadata => 
    referencedFieldNames.has(metadata.name)
  );
}

/**
 * Synchronization result for field metadata changes
 */
export interface SyncResult {
  hasChanges: boolean;
  addedFields: FieldMetadata[];
  removedFields: string[];
  modifiedFields: FieldModification[];
  conflicts: FieldConflict[];
}

export interface FieldModification {
  fieldName: string;
  property: string;
  localValue: any;
  serverValue: any;
}

export interface FieldConflict {
  fieldName: string;
  reason: 'user-customized' | 'type-mismatch' | 'validation-conflict';
  resolution: 'keep-local' | 'use-server' | 'merge';
}

/**
 * Synchronizes local config with server metadata
 * Detects additions, removals, and modifications
 */
export function syncWithServerMetadata(
  localConfig: FormConfig,
  serverMetadata: FieldMetadata[]
): { config: FormConfig; syncResult: SyncResult } {
  const localFields = localConfig.fieldMetadata || [];
  const localFieldsMap = new Map(localFields.map(f => [f.name, f]));
  const serverFieldsMap = new Map(serverMetadata.map(f => [f.name, f]));
  
  // Detect changes
  const addedFields = serverMetadata.filter(f => !localFieldsMap.has(f.name));
  const removedFields = localFields.filter(f => !serverFieldsMap.has(f.name)).map(f => f.name);
  const modifiedFields: FieldModification[] = [];
  
  // Check for modifications
  localFields.forEach(localField => {
    const serverField = serverFieldsMap.get(localField.name);
    if (serverField) {
      // Compare key properties
      ['label', 'required', 'maxLength', 'minLength', 'dataType'].forEach(prop => {
        if ((localField as any)[prop] !== (serverField as any)[prop]) {
          modifiedFields.push({
            fieldName: localField.name,
            property: prop,
            localValue: (localField as any)[prop],
            serverValue: (serverField as any)[prop]
          });
        }
      });
    }
  });
  
  // Build merged config
  const mergedFieldMetadata = [
    ...serverMetadata, // All server fields
    ...localFields.filter(f => !serverFieldsMap.has(f.name)) // Keep removed fields if customized
  ];
  
  // Update sections to include new fields
  const updatedSections = [...localConfig.sections];
  if (addedFields.length > 0 && updatedSections.length > 0) {
    // Add new fields to the last section
    const lastSection = updatedSections[updatedSections.length - 1];
    const lastRow = lastSection.rows[lastSection.rows.length - 1];
    
    addedFields.forEach(field => {
      lastRow.columns.push({ fields: [field.name] });
    });
  }
  
  const syncResult: SyncResult = {
    hasChanges: addedFields.length > 0 || removedFields.length > 0 || modifiedFields.length > 0,
    addedFields,
    removedFields,
    modifiedFields,
    conflicts: [] // TODO: Implement conflict detection
  };
  
  const updatedConfig: FormConfig = {
    ...localConfig,
    sections: updatedSections,
    fieldMetadata: mergedFieldMetadata,
    metadata: {
      ...localConfig.metadata,
      lastUpdated: new Date(),
      serverHash: generateMetadataHash(serverMetadata)
    }
  };
  
  return { config: updatedConfig, syncResult };
}

/**
 * Generates a hash from metadata for change detection
 */
function generateMetadataHash(metadata: FieldMetadata[]): string {
  const relevant = metadata.map(f => ({
    name: f.name,
    type: f.controlType,
    required: f.required,
    validators: f.validators
  }));
  return btoa(JSON.stringify(relevant)).substring(0, 16);
}

/**
 * Converte FormLayout (do protótipo) para FormConfig (da biblioteca)
 * Compatibilidade entre diferentes estruturas de formulário
 */
export function convertFormLayoutToConfig(formLayout: any): FormConfig {
  if (!formLayout || !formLayout.fieldsets) {
    return createDefaultFormConfig();
  }

  const sections: FormSection[] = formLayout.fieldsets.map((fieldset: any, index: number) => ({
    id: fieldset.id || `section-${index}`,
    title: fieldset.title || `Seção ${index + 1}`,
    description: fieldset.description,
    rows: fieldset.rows?.map((row: any) => ({
      columns: row.fields?.map((field: any) => ({
        fields: Array.isArray(field) ? field : [field.name || field]
      })) || [{ fields: [] }]
    })) || [{
      columns: [{ 
        fields: fieldset.fields?.map((f: any) => f.name || f) || [] 
      }]
    }]
  }));

  return { sections };
}
