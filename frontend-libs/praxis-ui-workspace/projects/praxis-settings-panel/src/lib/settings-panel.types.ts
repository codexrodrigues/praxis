import { Type } from '@angular/core';

export interface SettingsPanelConfig {
  id: string;
  title: string;
  width?: number; // default 720
  content: { component: Type<any>; inputs?: Record<string, any> };
}

export interface SettingsValueProvider {
  getSettingsValue(): any;
  reset?(): void;
}

export type SettingsPanelCloseReason = 'cancel' | 'save' | 'backdrop' | 'esc';
