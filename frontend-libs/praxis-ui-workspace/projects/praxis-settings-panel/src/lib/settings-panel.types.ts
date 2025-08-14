import { Type } from '@angular/core';
import { Observable } from 'rxjs';

export interface SettingsPanelConfig {
  id: string;
  title: string;
  content: { component: Type<any>; inputs?: Record<string, any> };
}

export interface SettingsValueProvider {
  getSettingsValue(): any;
  /**
   * Called by {@link SettingsPanelComponent} when persisting changes. Should
   * return the updated configuration so it can be emitted through
   * {@link SettingsPanelRef#saved$}. If omitted, `getSettingsValue()` will be
   * used as a fallback.
   */
  onSave?(): any;
  reset?(): void;
  canSave$?: Observable<boolean>;
}

export type SettingsPanelCloseReason = 'cancel' | 'save' | 'backdrop' | 'esc';
