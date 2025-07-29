/**
 * @fileoverview Componente de diálogo de confirmação para MaterialButtonComponent
 * 
 * Diálogo Material nativo para confirmação de ações críticas.
 */

import { Component, Inject } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type?: 'warning' | 'danger' | 'info';
  icon?: string;
}

@Component({
  selector: 'pdx-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="pdx-confirm-dialog" [class]="'pdx-confirm-type-' + (data.type || 'info')">
      
      <!-- Header com ícone e título -->
      <div class="pdx-dialog-header">
        @if (data.icon) {
          <mat-icon class="pdx-dialog-icon">{{ data.icon }}</mat-icon>
        }
        <h2 mat-dialog-title class="pdx-dialog-title">{{ data.title }}</h2>
      </div>

      <!-- Conteúdo da mensagem -->
      <mat-dialog-content class="pdx-dialog-content">
        <p class="pdx-dialog-message">{{ data.message }}</p>
      </mat-dialog-content>

      <!-- Ações do diálogo -->
      <mat-dialog-actions align="end" class="pdx-dialog-actions">
        <button 
          mat-button 
          type="button"
          [mat-dialog-close]="false"
          class="pdx-cancel-button">
          {{ data.cancelText }}
        </button>
        
        <button 
          mat-raised-button 
          type="button"
          [color]="getConfirmButtonColor()"
          [mat-dialog-close]="true"
          class="pdx-confirm-button">
          {{ data.confirmText }}
        </button>
      </mat-dialog-actions>

    </div>
  `,
  styles: [`
    .pdx-confirm-dialog {
      min-width: 300px;
      max-width: 500px;
    }

    .pdx-dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .pdx-dialog-icon {
      font-size: 24px;
      height: 24px;
      width: 24px;
    }

    .pdx-dialog-title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .pdx-dialog-content {
      padding: 0;
      margin-bottom: 24px;
    }

    .pdx-dialog-message {
      margin: 0;
      color: var(--mdc-dialog-content-text-color, var(--mat-app-on-surface));
      line-height: 1.5;
    }

    .pdx-dialog-actions {
      padding: 0;
      gap: 8px;
    }

    .pdx-cancel-button {
      color: var(--mdc-text-button-label-text-color, var(--mat-app-on-surface-variant));
    }

    /* Tipos de diálogo usando Material Design tokens */
    .pdx-confirm-type-warning {
      .pdx-dialog-icon {
        color: var(--mdc-theme-warning, var(--mat-app-warning));
      }
    }

    .pdx-confirm-type-danger {
      .pdx-dialog-icon {
        color: var(--mdc-theme-error, var(--mat-app-error));
      }
    }

    .pdx-confirm-type-info {
      .pdx-dialog-icon {
        color: var(--mdc-theme-primary, var(--mat-app-primary));
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  getConfirmButtonColor(): 'primary' | 'accent' | 'warn' {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'warning':
        return 'accent';
      default:
        return 'primary';
    }
  }
}