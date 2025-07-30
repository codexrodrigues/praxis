import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { KENDO_CARD } from '@progress/kendo-angular-layout';
import { FormActionsLayout } from '../../../models/form-layout.model';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dynamic-form-buttons-actions',
  template: `
    <kendo-card-actions [ngClass]="actionsContainerClass">
      <!-- Espaço para botões customizados -->

      <button kendoButton type="button" themeColor="primary" *ngIf="actions?.showResetButton" (click)="onReset()" fillMode="outline" [disabled]="isDisabled()">
        <i class="bi bi-backspace-reverse"></i>
        {{ actions?.resetButtonLabel || 'Limpar' }}
      </button>

      <ng-content select="[custom-actions]"></ng-content>
      <button kendoButton type="button" themeColor="primary" *ngIf="actions?.showCancelButton" (click)="onCancel()" fillMode="outline" [disabled]="isDisabled()">
        <i class="bi bi-x-circle"></i>
        {{ actions?.cancelButtonLabel || 'Cancelar' }}
      </button>

      <button kendoButton type="button" themeColor="primary" *ngIf="actions?.showSaveButton" (click)="onSubmit()" fillMode="solid" [disabled]="isDisabled()">
        <i class="bi bi-save"></i>
        {{ actions?.submitButtonLabel || 'Enviar' }}
      </button>
    </kendo-card-actions>
  `,
  standalone: true,
  imports: [
    KENDO_CARD,
    KENDO_BUTTONS,
    NgIf,
    CommonModule
  ],
  styleUrls: ['./form-buttons-actions.component.scss']
})
export class FormButtonsActionsComponent {
  /** Metadados para configurar as ações do formulário */
  @Input() actions: FormActionsLayout | undefined;
  /** Caso seja necessário acesso ao formGroup para reset ou outras operações */
  @Input() form: FormGroup | undefined;

  @Output() submitAction = new EventEmitter<void>();
  @Output() cancelAction = new EventEmitter<void>();
  @Output() resetAction = new EventEmitter<void>();

  @Input() formMode: 'view' | 'edit' | 'create' = 'create';

  get isViewMode(): boolean {
    return this.formMode === 'view';
  }

  onSubmit(): void {
    this.submitAction.emit();
  }

  onCancel(): void {
    this.cancelAction.emit();
  }

  onReset(): void {
    this.resetAction.emit();
    if (this.form) {
      this.form.reset();
    }
  }
  // Método para verificar se os botões devem estar desabilitados
  isDisabled(): boolean {
    return this.formMode === 'view';
  }

  get actionsContainerClass(): string {
    switch (this.actions?.position) {
      case 'right':
        return 'actions-container-right';
      case 'left':
        return 'actions-container-left';
      case 'center':
        return 'actions-container-center';
      case 'justified':
        return 'actions-container-justified';
      default:
        return 'actions-container-right';
    }
  }
}
