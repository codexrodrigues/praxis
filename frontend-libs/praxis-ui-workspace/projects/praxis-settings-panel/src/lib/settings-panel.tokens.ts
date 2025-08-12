import { InjectionToken } from '@angular/core';
import { SettingsPanelRef } from './settings-panel.ref';

export const SETTINGS_PANEL_DATA = new InjectionToken<any>('SETTINGS_PANEL_DATA');
export const SETTINGS_PANEL_REF = new InjectionToken<SettingsPanelRef>('SETTINGS_PANEL_REF');
