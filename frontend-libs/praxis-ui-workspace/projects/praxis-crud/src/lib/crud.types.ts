import { DialogConfig } from './dialog.service';
import {
  TableConfig,
  FormConfig,
  RowAction,
  ToolbarAction,
  ApiEndpoint,
} from '@praxis/core';

export type FormOpenMode = 'route' | 'modal';

export interface CrudParamMapping {
  from: string;
  to: 'routeParam' | 'query' | 'input';
  name: string;
}

export type CrudAction = (RowAction | ToolbarAction) & {
  openMode?: FormOpenMode;
  route?: string;
  formId?: string;
  params?: CrudParamMapping[];
};

export interface CrudDefaults {
  openMode?: FormOpenMode;
  modal?: DialogConfig;
}

export interface CrudResource {
  path: string;
  idField?: string | number;
  endpointKey?: ApiEndpoint;
}

export interface CrudMetadata {
  component: 'praxis-crud';
  resource?: CrudResource;
  table: TableConfig;
  form?: FormConfig;
  defaults?: CrudDefaults;
  actions?: CrudAction[];
  i18n?: { crudDialog?: Record<string, string> };
}

export function assertCrudMetadata(meta: CrudMetadata): void {
  meta.actions?.forEach((action) => {
    const mode = action.openMode ?? meta.defaults?.openMode ?? 'route';
    if (mode === 'route' && !action.route) {
      throw new Error(`Route not provided for action ${action.action}`);
    }
    if (mode === 'modal' && !action.formId) {
      throw new Error(`formId not provided for action ${action.action}`);
    }
    action.params?.forEach((p) => {
      if (!['routeParam', 'query', 'input'].includes(p.to)) {
        throw new Error(`Invalid param mapping target: ${p.to}`);
      }
    });
  });
}
