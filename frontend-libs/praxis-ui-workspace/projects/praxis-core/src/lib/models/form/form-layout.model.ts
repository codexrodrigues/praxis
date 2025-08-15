import type { FieldMetadata } from '../component-metadata.interface';
import type { Specification } from '@praxis/specification';

export interface FormActionButton {
  id?: string; // Add an ID for custom buttons
  visible: boolean;
  label: string;
  icon?: string; // Material Icon
  color?: 'primary' | 'accent' | 'warn' | 'basic';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  action?: string; // Custom event for `customAction` emitter
  tooltip?: string;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'raised' | 'stroked' | 'flat' | 'fab';
  shortcut?: string; // Keyboard shortcut
}

export interface FormActionsLayout {
  /**
   * Configuration for the submit button
   */
  submit: FormActionButton;

  /**
   * Configuration for the cancel button
   */
  cancel: FormActionButton;

  /**
   * Configuration for the reset button
   */
  reset: FormActionButton;

  /**
   * Custom buttons
   */
  custom?: FormActionButton[];

  /**
   * Layout and behavior
   */
  position?: 'left' | 'center' | 'right' | 'justified' | 'split';
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'compact' | 'normal' | 'spacious';
  sticky?: boolean;

  /**
   * Responsive settings
   */
  mobile?: {
    position?: 'left' | 'center' | 'right' | 'justified';
    orientation?: 'horizontal' | 'vertical';
    collapseToMenu?: boolean;
  };

  containerClassName?: string;
  containerStyles?: { [key: string]: any };

  // Legacy properties for backward compatibility
  showSaveButton?: boolean;
  submitButtonLabel?: string;
  showCancelButton?: boolean;
  cancelButtonLabel?: string;
  showResetButton?: boolean;
  resetButtonLabel?: string;
}

export interface FormApiLayout {
  saveEndpoint?: string;
  loadEndpoint?: string;
  saveMethod?: 'POST' | 'PUT' | 'PATCH';
  timeout?: number;
  headers?: Record<string, string>;
  idField?: string;
  beforeSave?: string;
  afterLoad?: string;
}

export interface FormBehaviorLayout {
  confirmOnUnsavedChanges?: boolean;
  trackHistory?: boolean;
  focusFirstError?: boolean;
  scrollToErrors?: boolean;
  clearAfterSave?: boolean;
  redirectAfterSave?: string;
}

export interface FormMetadataLayout {
  formCode?: string;
  version?: string;
  [key: string]: any;
}

export interface FormMessagesLayout {
  // Existing feedback messages (backward compatible)
  updateRegistrySuccess?: string;
  createRegistrySuccess?: string;
  updateRegistryError?: string;
  createRegistryError?: string;

  // Pre-action confirmation messages
  confirmations?: {
    submit?: string;
    cancel?: string;
    reset?: string;
    [customAction: string]: string | undefined; // For custom actions
  };

  // Messages for custom actions
  customActions?: {
    [actionId: string]: {
      success?: string;
      error?: string;
      confirmation?: string; // Overrides confirmations[actionId] if present
    };
  };

  // Loading state messages
  loading?: {
    submit?: string;
    cancel?: string;
    reset?: string;
    [customAction: string]: string | undefined;
  };

  [key: string]: any; // For extensibility
}

export interface FormRowLayout {
  id: string;
  name?: string;
  label?: string;
  orientation: 'horizontal' | 'vertical';
  fields: FieldMetadata[];
  styles?: { [key: string]: any };
  hiddenCondition?: string | Specification<any> | null;
  visibilityCondition?: string | Specification<any> | null;
}

export interface NestedFieldsetLayout extends FormRowLayout {
  fieldsets?: FieldsetLayout[];
}

export interface FieldsetLayout {
  id: string;
  title: string;
  titleNew?: string;
  titleView?: string;
  titleEdit?: string;
  orientation: 'horizontal' | 'vertical';
  rows: FormRowLayout[];
  hiddenCondition?: string | Specification<any> | null;
}

export type FormRuleContext =
  | 'visibility'
  | 'readOnly'
  | 'style'
  | 'validation'
  | 'notification';

export interface FormLayoutRule {
  id: string;
  name: string;
  context: FormRuleContext;
  targetFields: string[];
  description?: string;
  effect: {
    condition: string | Specification<any> | null;
    styleClass?: string;
    style?: { [key: string]: any };
  };
}

export interface FormLayout {
  formTitle?: string;
  formDescription?: string;
  formTitleCreate?: string;
  formDescriptionCreate?: string;
  formTitleView?: string;
  formDescriptionView?: string;
  formTitleEdit?: string;
  formDescriptionEdit?: string;
  className?: string;
  styles?: { [key: string]: any };
  actions?: FormActionsLayout;
  api?: FormApiLayout;
  behavior?: FormBehaviorLayout;
  metadata?: FormMetadataLayout;
  messages?: FormMessagesLayout;
  fieldsets: FieldsetLayout[];
  formRules?: FormLayoutRule[];
}
