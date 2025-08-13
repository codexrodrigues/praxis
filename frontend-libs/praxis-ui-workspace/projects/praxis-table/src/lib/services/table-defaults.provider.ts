import { Injectable } from '@angular/core';
import { TableConfig, createDefaultTableConfig } from '@praxis/core';

/**
 * Provides default table configurations.
 * Applications may override this service to supply product or tenant-specific defaults.
 */
@Injectable({ providedIn: 'root' })
export class TableDefaultsProvider {
  /**
   * Returns default configuration for a given table identifier.
   * @param tableId Table identifier
   */
  getDefaults(tableId: string): TableConfig {
    return createDefaultTableConfig();
  }
}
