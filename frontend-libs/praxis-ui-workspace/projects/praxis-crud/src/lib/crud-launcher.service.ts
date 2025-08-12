import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CrudMetadata, CrudAction, FormOpenMode } from './crud.types';
import { DynamicFormDialogHostComponent } from './dynamic-form-dialog-host.component';
import { DialogService, DialogRef } from './dialog.service';

@Injectable({ providedIn: 'root' })
export class CrudLauncherService {
  private readonly router = inject(Router);
  private readonly dialog = inject(DialogService);

  launch(
    action: CrudAction,
    row: Record<string, unknown> | undefined,
    metadata: CrudMetadata,
  ): DialogRef<DynamicFormDialogHostComponent> | undefined {
    const mode: FormOpenMode =
      action.openMode ?? metadata.defaults?.openMode ?? 'route';

    if (mode === 'route') {
      if (!action.route) {
        throw new Error(`Route not provided for action ${action.action}`);
      }
      const url = this.buildRoute(action, row);
      this.router.navigateByUrl(url);
      return;
    }

    if (!action.formId) {
      throw new Error(`formId not provided for action ${action.action}`);
    }
    const inputs = this.mapInputs(action, row);
    return this.dialog.open(DynamicFormDialogHostComponent, {
      ...(metadata.defaults?.modal || {}),
      data: { action, row, metadata, inputs },
    });
  }

  private buildRoute(
    action: CrudAction,
    row: Record<string, unknown> | undefined,
  ): string {
    let route = action.route as string;
    const query: Record<string, unknown> = {};
    action.params?.forEach((p) => {
      const value = row?.[p.from];
      if (p.to === 'routeParam') {
        route = route.replace(`:${p.name}`, encodeURIComponent(String(value)));
      } else if (p.to === 'query') {
        query[p.name] = value;
      }
    });
    const queryString = new URLSearchParams(
      query as Record<string, string>,
    ).toString();
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
