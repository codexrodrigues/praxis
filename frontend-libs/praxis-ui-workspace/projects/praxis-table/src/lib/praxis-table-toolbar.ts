import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TableConfig } from '@praxis/core';

@Component({
  selector: 'praxis-table-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <mat-toolbar class="praxis-toolbar">
      <!-- Add button via actions array -->
      <ng-container *ngFor="let action of getStartActions()">
        <button mat-button [color]="action.color || 'primary'">
          <mat-icon *ngIf="action.icon">{{action.icon}}</mat-icon>
          {{ action.label }}
        </button>
      </ng-container>
      <ng-container *ngFor="let action of config?.toolbar?.actions">
        <button mat-button
                [color]="action.color"
                [disabled]="action.disabled">
          <mat-icon *ngIf="action.icon">{{action.icon}}</mat-icon>
          {{ action.label }}
        </button>
      </ng-container>
      <ng-container *ngIf="showFilter">
        <span class="spacer"></span>
        <mat-form-field appearance="outline" style="margin-right:8px;">
          <mat-label>Filtro</mat-label>
          <input matInput  [value]="filterValue" />
        </mat-form-field>
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
            <mat-icon>{{getExportIcon(format)}}</mat-icon>
            {{format.toUpperCase()}}
          </button>
        </mat-menu>
      </ng-container>
    </mat-toolbar>
  `,
  styles: [`:host{display:block;} .spacer{flex:1 1 auto;}`]
})
export class PraxisTableToolbar {

  @Input() config?: TableConfig;
  @Input() showFilter = false;
  @Input() filterValue = '';

  getStartActions() {
    return this.config?.toolbar?.actions?.filter(action => action.position === 'start') || [];
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
