import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CrudMetadata, CrudAction, FormOpenMode } from './crud.types';
import { DialogService, DialogRef } from './dialog.service';

@Injectable({ providedIn: 'root' })
export class CrudLauncherService {
  private readonly router = inject(Router);
  private readonly dialog = inject(DialogService);

  async launch(
    action: CrudAction,
    row: Record<string, unknown> | undefined,
    metadata: CrudMetadata,
  ): Promise<{
    mode: FormOpenMode;
    ref?: DialogRef<any>;
  }> {
    const mode = this.resolveOpenMode(action, metadata);
    console.debug('[CRUD:Launcher] mode=', mode, 'action=', action);

    if (mode === 'route') {
      if (!action.route) {
        throw new Error(`Route not provided for action ${action.action}`);
      }
      const url = this.buildRoute(action, row);
      await this.router.navigateByUrl(url);
      return { mode };
    }

    if (!action.formId) {
      throw new Error(`formId not provided for action ${action.action}`);
    }
    const inputs = this.mapInputs(action, row);
    const modalCfg = { ...(metadata.defaults?.modal || {}) } as any;

    console.debug('[CRUD:Launcher] opening dialog with:', {
      action: action.action,
      formId: action.formId,
      inputs,
      modalCfg,
      resourcePath:
        metadata.resource?.path ?? (metadata.table as any)?.resourcePath,
    });
    const panelClasses = ['pfx-dialog-pane', 'pfx-dialog-frosted'];
    if (modalCfg.panelClass) {
      panelClasses.push(modalCfg.panelClass);
    }
    const backdropClasses = ['pfx-blur-backdrop'];
    if (modalCfg.backdropClass) {
      backdropClasses.push(modalCfg.backdropClass);
    }
    const ref = await this.dialog.openAsync(
      () =>
        import('./dynamic-form-dialog-host.component').then(
          (m) => m.DynamicFormDialogHostComponent,
        ),
      {
        ...modalCfg,
        panelClass: panelClasses,
        backdropClass: backdropClasses,
        autoFocus: true,
        restoreFocus: true,
        minWidth: '360px',
        maxWidth: '95vw',
        ariaLabelledBy: 'crudDialogTitle',
        data: { action, row, metadata, inputs },
      },
    );
    return { mode, ref };
  }

  resolveOpenMode(action: CrudAction, metadata: CrudMetadata): FormOpenMode {
    return action.openMode ?? metadata.defaults?.openMode ?? 'route';
  }

  private buildRoute(
    action: CrudAction,
    row: Record<string, unknown> | undefined,
  ): string {
    let route = action.route as string;
    const query: Record<string, string> = {};
    action.params?.forEach((p) => {
      const value = row?.[p.from];
      if (p.to === 'routeParam') {
        if (value === undefined || value === null) {
          throw new Error(`Missing value for route param ${p.name}`);
        }
        const re = new RegExp(`:${p.name}\\b`, 'g');
        route = route.replace(re, encodeURIComponent(String(value)));
      } else if (p.to === 'query' && value !== undefined && value !== null) {
        query[p.name] = String(value);
      }
    });
    const missing = route.match(/:[a-zA-Z0-9_-]+/g);
    if (missing) {
      throw new Error(
        `Missing route parameters for action "${action.action}": ${missing
          .map((m) => m.slice(1))
          .join(', ')}`,
      );
    }
    const queryString = new URLSearchParams(query).toString();
    return queryString ? `${route}?${queryString}` : route;
  }

  private mapInputs(
    action: CrudAction,
    row: Record<string, unknown> | undefined,
  ): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};
    action.params?.forEach((p) => {
      if (p.to === 'input') {
        inputs[p.name] = row?.[p.from];
      }
    });
    return inputs;
  }
}
