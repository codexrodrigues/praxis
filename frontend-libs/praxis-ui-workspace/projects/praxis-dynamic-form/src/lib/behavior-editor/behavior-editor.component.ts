import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormConfig, FormBehaviorLayout } from '@praxis/core';

@Component({
  selector: 'praxis-behavior-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  template: `
    <div class="behavior-editor-form">
      <mat-slide-toggle
        [checked]="behavior.confirmOnUnsavedChanges"
        (change)="updateBehavior('confirmOnUnsavedChanges', $event.checked)"
      >
        Confirmar ao sair com alterações não salvas
      </mat-slide-toggle>

      <mat-slide-toggle
        [checked]="behavior.trackHistory"
        (change)="updateBehavior('trackHistory', $event.checked)"
      >
        Rastrear histórico de alterações
      </mat-slide-toggle>

      <mat-slide-toggle
        [checked]="behavior.focusFirstError"
        (change)="updateBehavior('focusFirstError', $event.checked)"
      >
        Focar no primeiro erro ao submeter
      </mat-slide-toggle>

      <mat-slide-toggle
        [checked]="behavior.scrollToErrors"
        (change)="updateBehavior('scrollToErrors', $event.checked)"
      >
        Rolar até os erros ao submeter
      </mat-slide-toggle>

      <mat-slide-toggle
        [checked]="behavior.clearAfterSave"
        (change)="updateBehavior('clearAfterSave', $event.checked)"
      >
        Limpar formulário após salvar
      </mat-slide-toggle>

      <mat-form-field>
        <mat-label>Redirecionar após salvar (URL)</mat-label>
        <input
          matInput
          [value]="behavior.redirectAfterSave || ''"
          (input)="updateBehavior('redirectAfterSave', ($event.target as HTMLInputElement).value)"
        />
      </mat-form-field>
    </div>
  `,
  styles: [`
    .behavior-editor-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `]
})
export class BehaviorEditorComponent {
  @Input() config!: FormConfig;
  @Output() configChange = new EventEmitter<FormConfig>();

  get behavior(): FormBehaviorLayout {
    return this.config.behavior || {};
  }

  updateBehavior(key: keyof FormBehaviorLayout, value: any): void {
    const newConfig = {
      ...this.config,
      behavior: {
        ...this.behavior,
        [key]: value,
      },
    };
    this.configChange.emit(newConfig);
  }
}
