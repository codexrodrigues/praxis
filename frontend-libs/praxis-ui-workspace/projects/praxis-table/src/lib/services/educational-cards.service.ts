import { Injectable } from '@angular/core';

export type TabCardKey = 'overview' | 'columns' | 'toolbar' | 'messages' | 'json';

@Injectable({
  providedIn: 'root'
})
export class EducationalCardsService {
  private readonly STORAGE_KEY = 'praxis-table-config-educational-cards';

  /**
   * Check if a card should be visible for a specific tab
   */
  isCardVisible(tabKey: TabCardKey): boolean {
    try {
      const preferences = this.getPreferences();
      return preferences[tabKey] !== false; // Default to visible
    } catch {
      return true; // Default to visible on error
    }
  }

  /**
   * Hide a card for a specific tab
   */
  hideCard(tabKey: TabCardKey): void {
    try {
      const preferences = this.getPreferences();
      preferences[tabKey] = false;
      this.savePreferences(preferences);
    } catch (error) {
      console.warn('Failed to save card visibility preference:', error);
    }
  }

  /**
   * Show a card for a specific tab
   */
  showCard(tabKey: TabCardKey): void {
    try {
      const preferences = this.getPreferences();
      preferences[tabKey] = true;
      this.savePreferences(preferences);
    } catch (error) {
      console.warn('Failed to save card visibility preference:', error);
    }
  }

  /**
   * Reset all card preferences to visible
   */
  resetAllCards(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to reset card preferences:', error);
    }
  }

private getPreferences(): Record<TabCardKey, boolean> {
  const defaultPreferences: Record<TabCardKey, boolean> = {
    overview: true,
    columns: true,
    toolbar: true,
    messages: true,
    json: true
  };
  try {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultPreferences, ...parsed };
    }
    return defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

  private savePreferences(preferences: Record<TabCardKey, boolean>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save preferences to localStorage:', error);
    }
  }
}
