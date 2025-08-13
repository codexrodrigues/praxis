import { TemplateRef, Type } from '@angular/core';
import { Observable } from 'rxjs';

export interface SettingsPanelConfig {
  id: string;
  title: string;
  width?: number; // default 720
  content: { component: Type<any>; inputs?: Record<string, any> };
}

export interface SettingsPanelSection {
  id: string;
  label: string;
  icon?: string;
  template: TemplateRef<any>;
}

export interface SettingsSectionsProvider {
  sections: SettingsPanelSection[];
  /**
   * Emits whenever the section list changes after initialization.
   * Used when sections are populated asynchronously.
   */
  sections$?: Observable<SettingsPanelSection[]>;
}

export interface SettingsValueProvider {
  getSettingsValue(): any;
  reset?(): void;
  canSave$?: Observable<boolean>;
}

export type SettingsPanelCloseReason = 'cancel' | 'save' | 'backdrop' | 'esc';
