import { Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';

export type DialogRef<T = any, R = any> = MatDialogRef<T, R>;
export type DialogConfig<D = any> = MatDialogConfig<D>;
export { MAT_DIALOG_DATA as DIALOG_DATA } from '@angular/material/dialog';

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private matDialog: MatDialog) {}

  open<T, D = unknown, R = unknown>(
    component: ComponentType<T>,
    config?: DialogConfig<D>,
  ): DialogRef<T, R> {
    return this.matDialog.open(component, config);
  }
}
