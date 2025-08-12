import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PraxisDynamicForm } from '@praxis/dynamic-form';
import { GenericCrudService } from '@praxis/core';
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
  providers: [GenericCrudService],
  host: {
    class: 'praxis-dialog',
    '[attr.data-density]': 'modal.density || "default"',
  },
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
          <mat-icon>{{
            maximized ? 'close_fullscreen' : 'open_in_full'
          }}</mat-icon>
        </button>
      }
      <button
        mat-icon-button
        type="button"
        (click)="onCancel()"
        [attr.aria-label]="texts.closeLabel"
        cdkFocusInitial
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content
      class="dialog-content"
      aria-labelledby="crudDialogTitle"
    >
      @if (loading) {
        <div class="skeleton">
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div>
      } @else {
        <praxis-dynamic-form
          [formId]="data.action?.formId"
          [resourcePath]="resourcePath"
          [resourceId]="resourceId"
          [mode]="mode"
          (formSubmit)="onSave($event)"
          (formCancel)="onCancel()"
          (formReady)="onFormReady()"
        ></praxis-dynamic-form>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-footer">
      <button mat-button type="button" (click)="onCancel()">
        {{ texts.close }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        --dlg-header-h: 56px;
        --dlg-footer-h: 56px;
        --dlg-pad: 16px;
        --dlg-gap: 16px;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      :host([data-density='compact']) {
        --dlg-header-h: 44px;
        --dlg-footer-h: 44px;
        --dlg-pad: 12px;
        --dlg-gap: 12px;
      }
      .dialog-header {
        position: sticky;
        top: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: var(--dlg-pad);
        padding: 0 var(--dlg-pad);
        height: var(--dlg-header-h);
      }
      .dialog-title {
        margin: 0;
        font: inherit;
      }
      .spacer {
        flex: 1;
      }
      .dialog-content {
        overflow: auto;
        padding: var(--dlg-pad);
        max-height: calc(100dvh - var(--dlg-header-h) - var(--dlg-footer-h));
      }
      .dialog-footer {
        position: sticky;
        bottom: 0;
        z-index: 1;
        background: inherit;
        padding: var(--dlg-pad);
      }
      .skeleton {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .skeleton .line {
        height: 16px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.1);
      }
      :host ::ng-deep .praxis-dialog-backdrop {
        backdrop-filter: blur(4px);
      }
      :host ::ng-deep .praxis-dialog-panel {
        margin: var(--dlg-gap);
        width: clamp(360px, 88vw, var(--praxis-dialog-max-width, 960px));
        transition:
          width 200ms ease,
          height 200ms ease,
          top 200ms ease,
          left 200ms ease;
      }
    `,
  ],
})
export class DynamicFormDialogHostComponent implements OnInit {
  @ViewChild(PraxisDynamicForm) formComp?: PraxisDynamicForm;
  modal: any = {};
  maximized = false;
  private initialSize: { width?: string; height?: string } = {};
  loading = true;

  resourcePath?: string;
  resourceId?: string | number;
  mode: 'create' | 'edit' | 'view' = 'create';
  private idField = 'id';

  texts = {
    title: 'Formulário',
    close: 'Fechar',
    closeLabel: 'Fechar diálogo',
    maximizeLabel: 'Maximizar',
    restoreLabel: 'Restaurar',
    discardTitle: 'Descartar alterações?',
    discardMessage:
      'Você tem alterações não salvas. Deseja fechar assim mesmo?',
    discardConfirm: 'Descartar',
    discardCancel: 'Cancelar',
  } as Record<string, string>;

  constructor(
    @Inject(MatDialogRef)
    public dialogRef: DialogRef<DynamicFormDialogHostComponent>,
    @Inject(DIALOG_DATA) public data: any,
    private dialogService: DialogService,
  ) {
    this.dialogRef.disableClose = true;

    // i18n
    this.texts = {
      ...this.texts,
      ...(this.data.metadata?.i18n?.crudDialog || {}),
    };

    // defaults do modal (inclui canMaximize: true)
    this.modal = {
      canMaximize: true,
      ...(this.data.metadata?.defaults?.modal || {}),
    };

    // derivar path/id/mode
    this.resourcePath =
      this.data.metadata?.resource?.path ??
      this.data.metadata?.table?.resourcePath;

    this.idField = this.data.metadata?.resource?.idField ?? 'id';
    this.resourceId = this.data.inputs?.[this.idField];

    const act = this.data.action?.action;
    this.mode = act === 'edit' ? 'edit' : act === 'view' ? 'view' : 'create';

    // Esc
    if (!this.modal.disableCloseOnEsc) {
      this.dialogRef
        .keydownEvents()
        .pipe(
          filter((e) => e.key === 'Escape'),
          takeUntilDestroyed(),
        )
        .subscribe(() => this.onCancel());
    }

    // Backdrop
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

  onFormReady(): void {
    this.loading = false;
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
        .pipe(
          filter((confirmed) => !!confirmed),
          takeUntilDestroyed(),
        )
        .subscribe(() => this.dialogRef.close());
    } else {
      this.dialogRef.close();
    }
  }

  toggleMaximize(initial = false): void {
    this.maximized = initial ? true : !this.maximized;
    if (this.maximized) {
      const gap = this.modal.fullscreenGap ?? 8;
      this.dialogRef.updateSize(
        `calc(100dvw - ${gap * 2}px)`,
        `calc(100dvh - ${gap * 2}px)`,
      );
      this.dialogRef.updatePosition({ top: `${gap}px`, left: `${gap}px` });
    } else {
      this.dialogRef.updateSize(
        this.initialSize.width,
        this.initialSize.height,
      );
      this.dialogRef.updatePosition();
    }
  }
}
