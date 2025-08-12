import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PraxisDynamicForm } from '@praxis/dynamic-form';
import { DialogService, DialogRef, DIALOG_DATA } from './dialog.service';
import { ConfirmDialogComponent } from '@praxis/dynamic-fields';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'praxis-dynamic-form-dialog-host',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    PraxisDynamicForm,
  ],
  host: { class: 'praxis-dialog' },
  template: `
    <div class="dialog-header">
      <h2 id="crudDialogTitle" class="dialog-title">
        {{ data.action?.label || texts.title }}
      </h2>
      <span class="spacer"></span>
      @if (modal.canMaximize) {
        <button
          mat-icon-button
          type="button"
          (click)="toggleMaximize()"
          [attr.aria-label]="
            maximized ? texts.restoreLabel : texts.maximizeLabel
          "
        >
          <mat-icon>{
            maximized ? 'close_fullscreen' : 'open_in_full'
          }</mat-icon>
        </button>
      }
      <button
        mat-icon-button
        type="button"
        (click)="onCancel()"
        [attr.aria-label]="texts.closeLabel"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <mat-dialog-content
      class="dialog-content"
      aria-labelledby="crudDialogTitle"
      role="dialog"
      aria-modal="true"
    >
      <praxis-dynamic-form
        [formId]="data.action?.formId"
        [inputs]="data.inputs"
        (formSubmit)="onSave($event)"
        (formCancel)="onCancel()"
      ></praxis-dynamic-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-footer">
      <button mat-button type="button" (click)="onCancel()">
        {{ texts.close }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-header {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .dialog-title {
        margin: 0;
        font: inherit;
      }
      .spacer {
        flex: 1;
      }
      .dialog-content {
        max-height: calc(100vh - 160px);
        overflow: auto;
      }
      .dialog-footer {
        position: sticky;
        bottom: 0;
        background: inherit;
        padding-top: 8px;
      }
    `,
  ],
})
export class DynamicFormDialogHostComponent implements OnInit {
  @ViewChild(PraxisDynamicForm) formComp?: PraxisDynamicForm;
  modal: any = {};
  maximized = false;
  private initialSize: { width?: string; height?: string } = {};
  texts = {
    title: 'Form',
    close: 'Close',
    closeLabel: 'Close dialog',
    maximizeLabel: 'Maximize',
    restoreLabel: 'Restore',
    discardTitle: 'Discard changes?',
    discardMessage: 'You have unsaved changes. Close anyway?',
    discardConfirm: 'Discard',
    discardCancel: 'Cancel',
  } as Record<string, string>;

  constructor(
    @Inject(MatDialogRef)
    public dialogRef: DialogRef<DynamicFormDialogHostComponent>,
    @Inject(DIALOG_DATA) public data: any,
    private dialogService: DialogService,
  ) {
    this.dialogRef.disableClose = true;
    this.texts = {
      ...this.texts,
      ...(this.data.metadata?.i18n?.crudDialog || {}),
    };

    this.modal = this.data.metadata?.defaults?.modal || {};

    if (!this.modal.disableCloseOnEsc) {
      this.dialogRef
        .keydownEvents()
        .pipe(
          filter((e) => e.key === 'Escape'),
          takeUntilDestroyed(),
        )
        .subscribe(() => this.onCancel());
    }

    if (!this.modal.disableCloseOnBackdrop) {
      this.dialogRef
        .backdropClick()
        .pipe(takeUntilDestroyed())
        .subscribe(() => this.onCancel());
    }
  }

  ngOnInit(): void {
    this.initialSize = {
      width: this.modal.width,
      height: this.modal.height,
    };
    const shouldMax =
      this.modal.startMaximized ||
      (this.modal.fullscreenBreakpoint &&
        window.innerWidth <= this.modal.fullscreenBreakpoint);
    if (shouldMax) {
      this.toggleMaximize(true);
    }
  }

  onSave(result: unknown): void {
    this.dialogRef.close({ type: 'save', data: result });
  }

  onCancel(): void {
    const dirty = this.formComp?.form.dirty;
    if (dirty) {
      const ref = this.dialogService.open(ConfirmDialogComponent, {
        data: {
          title: this.texts.discardTitle,
          message: this.texts.discardMessage,
          confirmText: this.texts.discardConfirm,
          cancelText: this.texts.discardCancel,
          type: 'warning',
        },
      });
      ref
        .afterClosed()
        .pipe(filter(Boolean), takeUntilDestroyed())
        .subscribe(() => this.dialogRef.close());
    } else {
      this.dialogRef.close();
    }
  }

  toggleMaximize(initial = false): void {
    this.maximized = initial ? true : !this.maximized;
    if (this.maximized) {
      this.dialogRef.updateSize('100vw', '100vh');
      this.dialogRef.updatePosition({ top: '0', left: '0' });
    } else {
      this.dialogRef.updateSize(
        this.initialSize.width,
        this.initialSize.height,
      );
      this.dialogRef.updatePosition();
    }
  }
}
