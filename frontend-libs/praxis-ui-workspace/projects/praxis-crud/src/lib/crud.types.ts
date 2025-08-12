import { DialogConfig } from './dialog.service';
import {
  TableConfig,
  FormConfig,
  RowAction,
  ToolbarAction,
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
