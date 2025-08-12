import { Injectable, NgZone } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';

export type DialogRef<T = any, R = any> = MatDialogRef<T, R>;

export interface DialogConfig<D = any> extends MatDialogConfig<D> {
  /** Disable closing when user clicks on backdrop */
  disableCloseOnBackdrop?: boolean;
  /** Disable closing when user presses escape */
  disableCloseOnEsc?: boolean;
  /** Enable maximize button */
  canMaximize?: boolean;
  /** Start dialog maximized */
  startMaximized?: boolean;
  /** Screen width in px where dialog starts fullscreen */
  fullscreenBreakpoint?: number;
}

export { MAT_DIALOG_DATA as DIALOG_DATA } from '@angular/material/dialog';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private matDialog: MatDialog, private zone: NgZone) {}

  open<T, D = unknown, R = unknown>(
    component: ComponentType<T>,
    config?: DialogConfig<D>,
  ): DialogRef<T, R> {
    return this.zone.run(() => this.matDialog.open(component, config));
  }

  async openAsync<T, D = unknown, R = unknown>(
    loader: () => Promise<ComponentType<T>>,
    config?: DialogConfig<D>,
  ): Promise<DialogRef<T, R>> {
    const component = await loader();
    return this.zone.run(() => this.matDialog.open(component, config));
  }
}
