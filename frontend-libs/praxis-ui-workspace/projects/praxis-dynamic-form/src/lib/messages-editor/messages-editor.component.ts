import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormConfig, FormMessagesLayout } from '@praxis/core';

@Component({
  selector: 'praxis-messages-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="messages-editor-form">
      <mat-form-field>
        <mat-label>Sucesso ao Criar Registro</mat-label>
        <input matInput [value]="messages.createRegistrySuccess" (input)="updateMessage('createRegistrySuccess', $event.target.value)" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Erro ao Criar Registro</mat-label>
        <input matInput [value]="messages.createRegistryError" (input)="updateMessage('createRegistryError', $event.target.value)" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Sucesso ao Atualizar Registro</mat-label>
        <input matInput [value]="messages.updateRegistrySuccess" (input)="updateMessage('updateRegistrySuccess', $event.target.value)" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Erro ao Atualizar Registro</mat-label>
        <input matInput [value]="messages.updateRegistryError" (input)="updateMessage('updateRegistryError', $event.target.value)" />
      </mat-form-field>
    </div>
  `,
  styles: [`
    .messages-editor-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `]
})
export class MessagesEditorComponent {
  @Input() config!: FormConfig;
  @Output() configChange = new EventEmitter<FormConfig>();

  get messages(): FormMessagesLayout {
    return this.config.messages || {};
  }

  updateMessage(key: keyof FormMessagesLayout, value: string): void {
    const newConfig = {
      ...this.config,
      messages: {
        ...this.messages,
        [key]: value,
      },
    };
    this.configChange.emit(newConfig);
  }
}
