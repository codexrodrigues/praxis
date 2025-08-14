import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { FormConfig, FormActionsLayout, FormActionButton } from '@praxis/core';

@Component({
  selector: 'praxis-actions-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSelectModule,
  ],
  template: `
    <div class="actions-editor-form">
      <h4>Botões Visíveis</h4>
      <mat-slide-toggle
        [checked]="actions.submit.visible"
        (change)="updateAction('submit', 'visible', $event.checked)"
      >
        Botão de Submeter
      </mat-slide-toggle>
      <mat-slide-toggle
        [checked]="actions.cancel.visible"
        (change)="updateAction('cancel', 'visible', $event.checked)"
      >
        Botão de Cancelar
      </mat-slide-toggle>
      <mat-slide-toggle
        [checked]="actions.reset.visible"
        (change)="updateAction('reset', 'visible', $event.checked)"
      >
        Botão de Resetar
      </mat-slide-toggle>

      <h4>Labels dos Botões</h4>
      <mat-form-field>
        <mat-label>Label de Submeter</mat-label>
        <input
          matInput
          [value]="actions.submit.label"
          (input)="
            updateAction(
              'submit',
              'label',
              ($event.target as HTMLInputElement)?.value ?? ''
            )
          "
        />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Label de Cancelar</mat-label>
        <input
          matInput
          [value]="actions.cancel.label"
          (input)="
            updateAction(
              'cancel',
              'label',
              ($event.target as HTMLInputElement)?.value ?? ''
            )
          "
        />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Label de Resetar</mat-label>
        <input
          matInput
          [value]="actions.reset.label"
          (input)="
            updateAction(
              'reset',
              'label',
              ($event.target as HTMLInputElement)?.value ?? ''
            )
          "
        />
      </mat-form-field>

      <h4>Posicionamento</h4>
      <mat-form-field>
        <mat-label>Alinhamento dos Botões</mat-label>
        <mat-select
          [value]="actions.position"
          (selectionChange)="updateLayout('position', $event.value)"
        >
          <mat-option value="left">Esquerda</mat-option>
          <mat-option value="center">Centro</mat-option>
          <mat-option value="right">Direita</mat-option>
          <mat-option value="justified">Justificado</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [
    `
      .actions-editor-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
    `,
  ],
})
export class ActionsEditorComponent {
  @Input() config!: FormConfig;
  @Output() configChange = new EventEmitter<FormConfig>();

  get actions(): FormActionsLayout {
    return (
      this.config.actions || {
        submit: { visible: true, label: 'Submit' },
        cancel: { visible: true, label: 'Cancel' },
        reset: { visible: false, label: 'Reset' },
        position: 'right',
      }
    );
  }

  updateAction(
    button: 'submit' | 'cancel' | 'reset',
    key: keyof FormActionButton,
    value: any,
  ) {
    const newConfig = {
      ...this.config,
      actions: {
        ...this.actions,
        [button]: {
          ...this.actions[button],
          [key]: value,
        } as FormActionButton,
      },
    };
    this.config = newConfig;
    this.configChange.emit(this.config);
  }

  updateLayout(key: 'position', value: any) {
    const newConfig = {
      ...this.config,
      actions: {
        ...this.actions,
        [key]: value,
      },
    };
    this.config = newConfig;
    this.configChange.emit(this.config);
  }
}
