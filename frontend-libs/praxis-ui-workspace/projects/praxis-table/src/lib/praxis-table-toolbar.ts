import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TableConfig } from '@praxis/core';
import { getActionId } from './utils/action-utils';

@Component({
  selector: 'praxis-table-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar class="praxis-toolbar">
      <!-- Add button via actions array -->
      <ng-container *ngFor="let action of getStartActions()">
        <button
          mat-button
          [color]="action.color || 'primary'"
          (click)="emitToolbarAction($event, getActionId(action))"
        >
          <mat-icon *ngIf="action.icon">{{ action.icon }}</mat-icon>
          {{ action.label }}
        </button>
      </ng-container>
      <ng-container *ngFor="let action of config?.toolbar?.actions">
        <button
          mat-button
          [color]="action.color"
          [disabled]="action.disabled"
          (click)="emitToolbarAction($event, getActionId(action))"
        >
          <mat-icon *ngIf="action.icon">{{ action.icon }}</mat-icon>
          {{ action.label }}
        </button>
      </ng-container>
      <ng-container *ngIf="config?.actions?.bulk?.enabled">
        <button
          mat-button
          *ngFor="let action of config?.actions?.bulk?.actions"
          [color]="action.color || 'primary'"
          (click)="emitToolbarAction($event, getActionId(action))"
        >
          <mat-icon *ngIf="action.icon">{{ action.icon }}</mat-icon>
          {{ action.label }}
        </button>
      </ng-container>
      <ng-content select="[advancedFilter]"></ng-content>
      <ng-content select="[toolbar]"></ng-content>
      <span class="spacer"></span>
      <ng-container *ngIf="config?.export?.enabled">
        <button mat-button [matMenuTriggerFor]="exportMenu">
          <mat-icon>download</mat-icon>
        </button>
        <mat-menu #exportMenu="matMenu">
          <button mat-menu-item *ngFor="let format of config?.export?.formats">
            <mat-icon>{{ getExportIcon(format) }}</mat-icon>
            {{ format.toUpperCase() }}
          </button>
        </mat-menu>
      </ng-container>
    </mat-toolbar>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .praxis-toolbar {
        border-radius: 10px;
        background: var(--surface, #333);
        box-shadow: var(--elevation-shadow);
        padding-inline: 8px;
        min-height: 52px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .spacer {
        flex: 1 1 auto;
      }
    `,
  ],
})
export class PraxisTableToolbar {
  @Input() config?: TableConfig;
  @Output() toolbarAction = new EventEmitter<{ action: string }>();

  readonly getActionId = getActionId;

  emitToolbarAction(event: Event, action: string): void {
    (event.target as HTMLElement).blur();
    this.toolbarAction.emit({ action });
  }

  getStartActions() {
    return (
      this.config?.toolbar?.actions?.filter(
        (action) => action.position === 'start',
      ) || []
    );
  }

  getExportIcon(format: string): string {
    switch (format.toLowerCase()) {
      case 'excel':
      case 'xlsx':
        return 'grid_on';
      case 'pdf':
        return 'picture_as_pdf';
      case 'csv':
        return 'table_chart';
      default:
        return 'download';
    }
  }
}
