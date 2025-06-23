import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TableConfig } from '@praxis/core';
import { PraxisTableEvent } from './praxis-table-event';

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
      <button *ngIf="config?.toolbar?.showNewButton" mat-button
              [color]="config?.toolbar?.newButtonColor || 'primary'"
              (click)="onNewRecord()">
        <mat-icon *ngIf="config?.toolbar?.newButtonIcon">{{config?.toolbar?.newButtonIcon}}</mat-icon>
        {{ config?.toolbar?.newButtonText || 'Novo' }}
      </button>
      <ng-container *ngFor="let action of config?.toolbar?.actions">
        <button mat-button
                [color]="action.color"
                [disabled]="action.disabled"
                (click)="onToolbarAction(action.action)">
          <mat-icon *ngIf="action.icon">{{action.icon}}</mat-icon>
          {{ action.label }}
        </button>
      </ng-container>
      <ng-container *ngIf="showFilter">
        <span class="spacer"></span>
        <mat-form-field appearance="outline" style="margin-right:8px;">
          <mat-label>Filtro</mat-label>
          <input matInput (input)="onFilter($any($event.target).value)" [value]="filterValue" />
        </mat-form-field>
      </ng-container>
      <ng-content select="[advancedFilter]"></ng-content>
      <ng-content select="[toolbar]"></ng-content>
      <span class="spacer"></span>
      <ng-container *ngIf="config?.exportOptions">
        <button mat-button [matMenuTriggerFor]="exportMenu">
          <mat-icon>download</mat-icon>
        </button>
        <mat-menu #exportMenu="matMenu">
          <button mat-menu-item *ngIf="config?.exportOptions?.excel" (click)="onExport('excel')">
            <mat-icon>grid_on</mat-icon>
            Excel
          </button>
          <button mat-menu-item *ngIf="config?.exportOptions?.pdf" (click)="onExport('pdf')">
            <mat-icon>picture_as_pdf</mat-icon>
            PDF
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

  @Output() newRecord = new EventEmitter<PraxisTableEvent<void>>();
  @Output() toolbarAction = new EventEmitter<PraxisTableEvent<string>>();
  @Output() exportData = new EventEmitter<PraxisTableEvent<'excel' | 'pdf'>>();
  @Output() filterInput = new EventEmitter<PraxisTableEvent<string>>();

  onNewRecord(): void {
    this.newRecord.emit({ type: 'new', payload: undefined });
  }

  onToolbarAction(action: string): void {
    this.toolbarAction.emit({ type: action, payload: action });
  }

  onExport(type: 'excel' | 'pdf'): void {
    this.exportData.emit({ type: 'export', payload: type });
  }

  onFilter(value: string): void {
    this.filterInput.emit({ type: 'filter', payload: value });
  }
}
