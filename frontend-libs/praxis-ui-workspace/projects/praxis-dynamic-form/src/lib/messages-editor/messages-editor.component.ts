import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import {
  FormConfig,
  FormMessagesLayout,
  FormActionButton,
} from '@praxis/core';

@Component({
  selector: 'praxis-messages-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatIconModule,
  ],
  template: `
    <div class="messages-editor-container">
      <mat-accordion multi>
        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title> Mensagens de Feedback </mat-panel-title>
          </mat-expansion-panel-header>
          <ng-template matExpansionPanelContent>
            <div class="messages-editor-form">
              <mat-form-field>
                <mat-label>Sucesso ao Criar Registro</mat-label>
                <input
                  matInput
                  [value]="messages.createRegistrySuccess"
                  (input)="
                    updateMessage(
                      'createRegistrySuccess',
                      $any($event.target).value
                    )
                  "
                />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Erro ao Criar Registro</mat-label>
                <input
                  matInput
                  [value]="messages.createRegistryError"
                  (input)="
                    updateMessage(
                      'createRegistryError',
                      $any($event.target).value
                    )
                  "
                />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Sucesso ao Atualizar Registro</mat-label>
                <input
                  matInput
                  [value]="messages.updateRegistrySuccess"
                  (input)="
                    updateMessage(
                      'updateRegistrySuccess',
                      $any($event.target).value
                    )
                  "
                />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Erro ao Atualizar Registro</mat-label>
                <input
                  matInput
                  [value]="messages.updateRegistryError"
                  (input)="
                    updateMessage(
                      'updateRegistryError',
                      $any($event.target).value
                    )
                  "
                />
              </mat-form-field>
            </div>
          </ng-template>
        </mat-expansion-panel>

        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title> Mensagens de Confirmação </mat-panel-title>
          </mat-expansion-panel-header>
          <ng-template matExpansionPanelContent>
            <div class="messages-editor-form">
              <mat-form-field>
                <mat-label>Confirmação de Submissão</mat-label>
                <input
                  matInput
                  [value]="messages.confirmations?.submit"
                  (input)="
                    updateConfirmationMessage(
                      'submit',
                      $any($event.target).value
                    )
                  "
                />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Confirmação de Cancelamento</mat-label>
                <input
                  matInput
                  [value]="messages.confirmations?.cancel"
                  (input)="
                    updateConfirmationMessage(
                      'cancel',
                      $any($event.target).value
                    )
                  "
                />
              </mat-form-field>
              <mat-form-field>
                <mat-label>Confirmação de Reset</mat-label>
                <input
                  matInput
                  [value]="messages.confirmations?.reset"
                  (input)="
                    updateConfirmationMessage('reset', $any($event.target).value)
                  "
                />
              </mat-form-field>
            </div>
          </ng-template>
        </mat-expansion-panel>

        @if (getCustomActions().length > 0) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                Mensagens de Ações Customizadas
              </mat-panel-title>
            </mat-expansion-panel-header>
            <ng-template matExpansionPanelContent>
              @for (action of getCustomActions(); track action.id) {
                <div class="custom-action-messages">
                  <h5>
                    <mat-icon>{{ action.icon || 'smart_button' }}</mat-icon>
                    Mensagens para "{{ action.label }}" (ID: {{ action.id }})
                  </h5>
                  <div class="messages-editor-form">
                    <mat-form-field>
                      <mat-label>Mensagem de Confirmação</mat-label>
                      <input
                        matInput
                        [value]="messages.customActions?.[action.id!]?.confirmation"
                        (input)="
                          updateCustomActionMessage(
                            action.id!,
                            'confirmation',
                            $any($event.target).value
                          )
                        "
                      />
                    </mat-form-field>
                    <mat-form-field>
                      <mat-label>Mensagem de Sucesso</mat-label>
                      <input
                        matInput
                        [value]="messages.customActions?.[action.id!]?.success"
                        (input)="
                          updateCustomActionMessage(
                            action.id!,
                            'success',
                            $any($event.target).value
                          )
                        "
                      />
                    </mat-form-field>
                    <mat-form-field>
                      <mat-label>Mensagem de Erro</mat-label>
                      <input
                        matInput
                        [value]="messages.customActions?.[action.id!]?.error"
                        (input)="
                          updateCustomActionMessage(
                            action.id!,
                            'error',
                            $any($event.target).value
                          )
                        "
                      />
                    </mat-form-field>
                  </div>
                </div>
              }
            </ng-template>
          </mat-expansion-panel>
        }
      </mat-accordion>
    </div>
  `,
  styles: [
    `
      .messages-editor-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .messages-editor-form {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
      }
      .custom-action-messages {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
      }
      .custom-action-messages h5 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class MessagesEditorComponent {
  @Input() config!: FormConfig;
  @Output() configChange = new EventEmitter<FormConfig>();

  get messages(): FormMessagesLayout {
    return this.config.messages || {};
  }

  getCustomActions(): FormActionButton[] {
    return this.config.actions?.custom || [];
  }

  updateMessage(key: string, value: string): void {
    const newConfig = {
      ...this.config,
      messages: {
        ...this.messages,
        [key]: value,
      },
    };
    this.configChange.emit(newConfig);
  }

  updateConfirmationMessage(action: 'submit' | 'cancel' | 'reset', value: string) {
    const newConfig = {
      ...this.config,
      messages: {
        ...this.messages,
        confirmations: {
          ...this.messages.confirmations,
          [action]: value,
        },
      },
    };
    this.configChange.emit(newConfig);
  }

  updateCustomActionMessage(
    actionId: string,
    type: 'confirmation' | 'success' | 'error',
    value: string
  ) {
    const newConfig = {
      ...this.config,
      messages: {
        ...this.messages,
        customActions: {
          ...this.messages.customActions,
          [actionId]: {
            ...this.messages.customActions?.[actionId],
            [type]: value,
          },
        },
      },
    };
    this.configChange.emit(newConfig);
  }
}
