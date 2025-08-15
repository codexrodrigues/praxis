import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  FormConfig,
  FormActionsLayout,
  FormActionButton,
} from '@praxis/core';

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
    MatTabsModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <mat-tab-group>
      <mat-tab label="Botões Padrão">
        <div class="editor-container">
          <mat-accordion multi>
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                Botão de Submeter (Submit)
              </mat-expansion-panel-header>
              <ng-template matExpansionPanelContent>
                <div class="action-fields">
                  <mat-slide-toggle
                    [checked]="actions.submit.visible"
                    (change)="updateAction('submit', 'visible', $event.checked)"
                    >Visível</mat-slide-toggle
                  >
                  <mat-form-field>
                    <mat-label>Label</mat-label>
                    <input
                      matInput
                      [value]="actions.submit.label"
                      (input)="
                        updateAction(
                          'submit',
                          'label',
                          $any($event.target).value
                        )
                      "
                    />
                  </mat-form-field>
                  <mat-form-field>
                    <mat-label>Ícone</mat-label>
                    <input
                      matInput
                      [value]="actions.submit.icon"
                      (input)="
                        updateAction(
                          'submit',
                          'icon',
                          $any($event.target).value
                        )
                      "
                    />
                  </mat-form-field>
                  <mat-form-field>
                    <mat-label>Cor</mat-label>
                    <mat-select
                      [value]="actions.submit.color"
                      (selectionChange)="
                        updateAction('submit', 'color', $event.value)
                      "
                    >
                      <mat-option value="primary">Primary</mat-option>
                      <mat-option value="accent">Accent</mat-option>
                      <mat-option value="warn">Warn</mat-option>
                      <mat-option value="basic">Basic</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </ng-template>
            </mat-expansion-panel>
            <!-- Repetir para Cancel e Reset -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                Botão de Cancelar (Cancel)
              </mat-expansion-panel-header>
              <ng-template matExpansionPanelContent>
                <div class="action-fields">
                  <mat-slide-toggle
                    [checked]="actions.cancel.visible"
                    (change)="updateAction('cancel', 'visible', $event.checked)"
                    >Visível</mat-slide-toggle
                  >
                  <mat-form-field>
                    <mat-label>Label</mat-label>
                    <input
                      matInput
                      [value]="actions.cancel.label"
                      (input)="
                        updateAction(
                          'cancel',
                          'label',
                          $any($event.target).value
                        )
                      "
                    />
                  </mat-form-field>
                  <mat-form-field>
                    <mat-label>Ícone</mat-label>
                    <input
                      matInput
                      [value]="actions.cancel.icon"
                      (input)="
                        updateAction('cancel', 'icon', $any($event.target).value)
                      "
                    />
                  </mat-form-field>
                  <mat-form-field>
                    <mat-label>Cor</mat-label>
                    <mat-select
                      [value]="actions.cancel.color"
                      (selectionChange)="
                        updateAction('cancel', 'color', $event.value)
                      "
                    >
                      <mat-option value="primary">Primary</mat-option>
                      <mat-option value="accent">Accent</mat-option>
                      <mat-option value="warn">Warn</mat-option>
                      <mat-option value="basic">Basic</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </ng-template>
            </mat-expansion-panel>
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                Botão de Limpar (Reset)
              </mat-expansion-panel-header>
              <ng-template matExpansionPanelContent>
                <div class="action-fields">
                  <mat-slide-toggle
                    [checked]="actions.reset.visible"
                    (change)="updateAction('reset', 'visible', $event.checked)"
                    >Visível</mat-slide-toggle
                  >
                  <mat-form-field>
                    <mat-label>Label</mat-label>
                    <input
                      matInput
                      [value]="actions.reset.label"
                      (input)="
                        updateAction('reset', 'label', $any($event.target).value)
                      "
                    />
                  </mat-form-field>
                  <mat-form-field>
                    <mat-label>Ícone</mat-label>
                    <input
                      matInput
                      [value]="actions.reset.icon"
                      (input)="
                        updateAction('reset', 'icon', $any($event.target).value)
                      "
                    />
                  </mat-form-field>
                  <mat-form-field>
                    <mat-label>Cor</mat-label>
                    <mat-select
                      [value]="actions.reset.color"
                      (selectionChange)="
                        updateAction('reset', 'color', $event.value)
                      "
                    >
                      <mat-option value="primary">Primary</mat-option>
                      <mat-option value="accent">Accent</mat-option>
                      <mat-option value="warn">Warn</mat-option>
                      <mat-option value="basic">Basic</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </ng-template>
            </mat-expansion-panel>
          </mat-accordion>
        </div>
      </mat-tab>

      <mat-tab label="Botões Customizados">
        <div class="editor-container">
          <button
            mat-stroked-button
            color="primary"
            (click)="addCustomButton()"
            class="add-button"
          >
            <mat-icon>add</mat-icon> Adicionar Botão
          </button>
          <mat-accordion multi>
            @for (
              customAction of actions.custom;
              track customAction;
              let i = $index
            ) {
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  {{ customAction.label || 'Novo Botão Customizado' }}
                </mat-expansion-panel-header>
                <ng-template matExpansionPanelContent>
                  <div class="action-fields">
                    <mat-slide-toggle
                      [checked]="customAction.visible"
                      (change)="
                        updateCustomAction(i, 'visible', $event.checked)
                      "
                      >Visível</mat-slide-toggle
                    >
                    <mat-form-field>
                      <mat-label>ID da Ação</mat-label>
                      <input
                        matInput
                        [value]="customAction.id"
                        (input)="
                          updateCustomAction(i, 'id', $any($event.target).value)
                        "
                        required
                      />
                    </mat-form-field>
                    <mat-form-field>
                      <mat-label>Label</mat-label>
                      <input
                        matInput
                        [value]="customAction.label"
                        (input)="
                          updateCustomAction(
                            i,
                            'label',
                            $any($event.target).value
                          )
                        "
                      />
                    </mat-form-field>
                    <mat-form-field>
                      <mat-label>Ícone</mat-label>
                      <input
                        matInput
                        [value]="customAction.icon"
                        (input)="
                          updateCustomAction(
                            i,
                            'icon',
                            $any($event.target).value
                          )
                        "
                      />
                    </mat-form-field>
                    <mat-form-field>
                      <mat-label>Cor</mat-label>
                      <mat-select
                        [value]="customAction.color"
                        (selectionChange)="
                          updateCustomAction(i, 'color', $event.value)
                        "
                      >
                        <mat-option value="primary">Primary</mat-option>
                        <mat-option value="accent">Accent</mat-option>
                        <mat-option value="warn">Warn</mat-option>
                        <mat-option value="basic">Basic</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="removeCustomButton(i)"
                    matTooltip="Remover este botão"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </ng-template>
              </mat-expansion-panel>
            }
          </mat-accordion>
        </div>
      </mat-tab>

      <mat-tab label="Layout">
        <div class="editor-container action-fields">
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
              <mat-option value="split">Separado</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Orientação</mat-label>
            <mat-select
              [value]="actions.orientation"
              (selectionChange)="updateLayout('orientation', $event.value)"
            >
              <mat-option value="horizontal">Horizontal</mat-option>
              <mat-option value="vertical">Vertical</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Espaçamento</mat-label>
            <mat-select
              [value]="actions.spacing"
              (selectionChange)="updateLayout('spacing', $event.value)"
            >
              <mat-option value="compact">Compacto</mat-option>
              <mat-option value="normal">Normal</mat-option>
              <mat-option value="spacious">Espaçado</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-slide-toggle
            [checked]="actions.sticky"
            (change)="updateLayout('sticky', $event.checked)"
            >Barra de Ações Fixa (Sticky)</mat-slide-toggle
          >
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [
    `
      .editor-container {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .action-fields {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        align-items: center;
      }
      .add-button {
        margin-bottom: 16px;
        align-self: flex-start;
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
        submit: { visible: true, label: 'Submit', color: 'primary' },
        cancel: { visible: true, label: 'Cancel' },
        reset: { visible: false, label: 'Reset' },
        custom: [],
        position: 'right',
        orientation: 'horizontal',
        spacing: 'normal',
      }
    );
  }

  updateAction(
    button: 'submit' | 'cancel' | 'reset',
    key: keyof FormActionButton,
    value: any
  ) {
    const newConfig = {
      ...this.config,
      actions: {
        ...this.actions,
        [button]: {
          ...this.actions[button],
          [key]: value,
        },
      },
    };
    this.configChange.emit(newConfig);
  }

  updateCustomAction(
    index: number,
    key: keyof FormActionButton,
    value: any
  ) {
    const customActions = [...(this.actions.custom || [])];
    customActions[index] = {
      ...customActions[index],
      [key]: value,
    };
    const newConfig = {
      ...this.config,
      actions: {
        ...this.actions,
        custom: customActions,
      },
    };
    this.configChange.emit(newConfig);
  }

  addCustomButton() {
    const newButton: FormActionButton = {
      id: `custom_${Date.now()}`,
      label: 'Novo Botão',
      visible: true,
      color: 'basic',
      action: `custom_action_${Date.now()}`,
    };
    const customActions = [...(this.actions.custom || []), newButton];
    const newConfig = {
      ...this.config,
      actions: {
        ...this.actions,
        custom: customActions,
      },
    };
    this.configChange.emit(newConfig);
  }

  removeCustomButton(index: number) {
    const customActions = [...(this.actions.custom || [])];
    customActions.splice(index, 1);
    const newConfig = {
      ...this.config,
      actions: {
        ...this.actions,
        custom: customActions,
      },
    };
    this.configChange.emit(newConfig);
  }

  updateLayout(key: keyof FormActionsLayout, value: any) {
    const newConfig = {
      ...this.config,
      actions: {
        ...this.actions,
        [key]: value,
      },
    };
    this.configChange.emit(newConfig);
  }
}
