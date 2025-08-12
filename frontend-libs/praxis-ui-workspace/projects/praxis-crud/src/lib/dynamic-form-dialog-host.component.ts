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
      <praxis-dynamic-form
        [formId]="data.action?.formId"
        [resourcePath]="resourcePath"
        [resourceId]="resourceId"
        [mode]="mode"
        (formSubmit)="onSave($event)"
        (formCancel)="onCancel()"
      ></praxis-dynamic-form>
    </mat-dialog-content>
  `,
  styles: [
    `
      :host {
        --dlg-header-h: 56px;
        --dlg-footer-h: 56px;
        --dlg-pad: 16px;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      :host([data-density='compact']) {
        --dlg-header-h: 44px;
        --dlg-footer-h: 44px;
        --dlg-pad: 12px;
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
        padding: var(--dlg-pad);
      }
    `,
  ],
})
export class DynamicFormDialogHostComponent implements OnInit {
  @ViewChild(PraxisDynamicForm) formComp?: PraxisDynamicForm;
  modal: any = {};
  maximized = false;
  private initialSize: { width?: string; height?: string } = {};

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
    private crud: GenericCrudService<any>,
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

    if (this.resourcePath) {
      this.crud.configure(
        this.resourcePath,
        this.data.metadata?.resource?.endpointKey,
      );
    }

    this.idField = this.data.metadata?.resource?.idField ?? 'id';
    this.resourceId = this.data.inputs?.[this.idField];

    const act = this.data.action?.action;
    this.mode = act === 'edit' ? 'edit' : act === 'view' ? 'view' : 'create';

    console.debug('[CRUD:Host] constructed', {
      action: this.data?.action,
      resourcePath: this.resourcePath,
      resourceId: this.resourceId,
      mode: this.mode,
      modal: this.modal,
    });

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
    console.debug('[CRUD:Host] ngOnInit', {
      initialSize: this.initialSize,
      startMaximized: this.modal.startMaximized,
      fullscreenBreakpoint: this.modal.fullscreenBreakpoint,
    });
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

    const gap = this.maximized ? 8 : undefined;
    const width = this.maximized
      ? `calc(100vw - ${2 * (gap ?? 0)}px)`
      : this.initialSize.width;
    const height = this.maximized
      ? `calc(100dvh - ${2 * (gap ?? 0)}px)`
      : this.initialSize.height;

    this.dialogRef.updateSize(width, height);
    this.dialogRef.updatePosition();

    const pane: HTMLElement | undefined = (this.dialogRef as any)
      ?._containerInstance?._elementRef?.nativeElement?.parentElement;
    if (pane && pane.classList.contains('pfx-dialog-pane')) {
      pane.style.margin = this.maximized ? `${gap}px` : '';
    }
  }
}
