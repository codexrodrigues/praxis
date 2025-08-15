import {
  Component,
  ComponentRef,
  HostListener,
  Injector,
  DestroyRef,
  inject,
  Type,
  ViewChild,
  ChangeDetectorRef,
  ViewContainerRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SettingsPanelRef } from './settings-panel.ref';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@praxis/dynamic-fields';

@Component({
  selector: 'praxis-settings-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CdkTrapFocus,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPanelComponent {
  title = '';
  expanded = false;
  ref!: SettingsPanelRef;
  contentRef?: ComponentRef<any>;
  private static nextId = 0;
  titleId = `praxis-settings-panel-title-${SettingsPanelComponent.nextId++}`;

  isDirty = false;
  isValid = true;
  isBusy = false;

  get canApply(): boolean {
    return this.isDirty && this.isValid && !this.isBusy;
  }

  get canSave(): boolean {
    return this.isDirty && this.isValid && !this.isBusy;
  }

  get disabledReason(): string {
    if (this.isBusy) {
      return 'Operação em andamento...';
    }
    if (!this.isValid) {
      return 'O formulário contém erros que precisam ser corrigidos.';
    }
    if (!this.isDirty) {
      return 'Nenhuma alteração para aplicar ou salvar.';
    }
    return '';
  }

  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('contentHost', { read: ViewContainerRef, static: true })
  private contentHost!: ViewContainerRef;

  constructor(private cdr: ChangeDetectorRef, private dialog: MatDialog) {}

  attachContent(
    component: Type<any>,
    injector: Injector,
    ref: SettingsPanelRef,
  ): void {
    this.ref = ref;
    this.contentRef = this.contentHost.createComponent(component, {
      injector,
    });

    const instance: any = this.contentRef.instance;

    if (instance.isDirty$) {
      instance.isDirty$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((dirty: boolean) => {
          this.isDirty = dirty;
          this.cdr.markForCheck();
        });
    }

    if (instance.isValid$) {
      instance.isValid$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((valid: boolean) => {
          this.isValid = valid;
          this.cdr.markForCheck();
        });
    }

    if (instance.isBusy$) {
      instance.isBusy$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((busy: boolean) => {
          this.isBusy = busy;
          this.cdr.markForCheck();
        });
    }
  }

  onReset(): void {
    const dialogData: ConfirmDialogData = {
      title: 'Redefinir Alterações',
      message: 'Tem certeza de que deseja redefinir todas as alterações?',
      confirmText: 'Redefinir',
      cancelText: 'Cancelar',
      type: 'warning',
      icon: 'restart_alt',
    };

    this.dialog
      .open(ConfirmDialogComponent, { data: dialogData })
      .afterClosed()
      .pipe(filter((confirmed) => confirmed))
      .subscribe(() => {
        this.contentRef?.instance?.reset?.();
        this.ref.reset();
      });
  }

  onApply(): void {
    if (!this.canApply) return;
    const value = this.contentRef?.instance?.getSettingsValue?.();
    this.ref.apply(value);
  }

  onSave(): void {
    if (!this.canSave) return;
    const instance: any = this.contentRef?.instance;
    const result = instance?.onSave?.();

    if (isObservable(result)) {
      firstValueFrom(result).then((value) => this.ref.save(value));
    } else if (result instanceof Promise) {
      result.then((value: unknown) => this.ref.save(value));
    } else if (result !== undefined) {
      this.ref.save(result);
    } else {
      const value = instance?.getSettingsValue?.();
      this.ref.save(value);
    }
  }

  toggleExpand(): void {
    this.expanded = !this.expanded;
    this.cdr.markForCheck();
  }

  onCancel(): void {
    of(this.isDirty)
      .pipe(
        switchMap((dirty) => {
          if (!dirty) {
            return of(true);
          }
          const dialogData: ConfirmDialogData = {
            title: 'Descartar Alterações',
            message:
              'Você tem alterações não salvas. Tem certeza de que deseja descartá-las?',
            confirmText: 'Descartar',
            cancelText: 'Continuar Editando',
            type: 'warning',
            icon: 'warning',
          };
          return this.dialog
            .open(ConfirmDialogComponent, { data: dialogData })
            .afterClosed();
        }),
        filter((confirmed) => confirmed),
      )
      .subscribe(() => {
        this.ref.close('cancel');
      });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
    } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.onSave();
    } else if ((event.key === 's' || event.key === 'S') && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.onSave();
    }
  }
}
