import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TableConfig, ToolbarAction } from '@praxis/core';

@Component({
  selector: 'praxis-table-toolbar-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-slide-toggle [(ngModel)]="visible" (ngModelChange)="onToolbarChange()">Toolbar visível</mat-slide-toggle>
    <div style="margin-top:0.5rem;">
      <mat-slide-toggle [(ngModel)]="showNewButton" (ngModelChange)="onToolbarChange()">Botão Novo</mat-slide-toggle>
    </div>
    <div *ngIf="showNewButton" style="margin-top:0.5rem;">
      <mat-form-field appearance="fill">
        <mat-label>Texto do botão</mat-label>
        <input matInput [(ngModel)]="newButtonText" (ngModelChange)="onToolbarChange()" />
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Ícone</mat-label>
        <input matInput [(ngModel)]="newButtonIcon" (ngModelChange)="onToolbarChange()" />
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Cor</mat-label>
        <input matInput [(ngModel)]="newButtonColor" (ngModelChange)="onToolbarChange()" />
      </mat-form-field>
    </div>
    <div style="margin-top:0.5rem;">
      <label>Ações (JSON)</label>
      <textarea [(ngModel)]="actionsJson" rows="5" style="width:100%" (ngModelChange)="onActionsChange()"></textarea>
      <div style="color:red" *ngIf="!actionsValid">JSON inválido</div>
    </div>
  `,
  styles: [`:host{display:block;}`]
})
export class PraxisTableToolbarConfig {
  @Input() config: TableConfig = { columns: [] };
  @Output() configChange = new EventEmitter<TableConfig>();

  visible = false;
  showNewButton = true;
  newButtonText = 'Novo';
  newButtonIcon = '';
  newButtonColor = 'primary';

  actions: ToolbarAction[] = [];
  actionsJson = '[]';
  actionsValid = true;

  ngOnInit() {
    const tb = this.config.toolbar || {};
    this.visible = tb.visible ?? false;
    this.showNewButton = tb.showNewButton ?? true;
    this.newButtonText = tb.newButtonText || 'Novo';
    this.newButtonIcon = tb.newButtonIcon || '';
    this.newButtonColor = tb.newButtonColor || 'primary';
    if (tb.actions) {
      this.actions = tb.actions;
      this.actionsJson = JSON.stringify(tb.actions, null, 2);
    }
  }

  onActionsChange() {
    try {
      this.actions = JSON.parse(this.actionsJson);
      this.actionsValid = true;
      this.emitChange();
    } catch {
      this.actionsValid = false;
    }
  }

  onToolbarChange() {
    this.emitChange();
  }

  emitChange() {
    if (!this.actionsValid) return;
    const cfg = JSON.parse(JSON.stringify(this.config));
    cfg.toolbar = {
      visible: this.visible,
      actions: this.actions,
      showNewButton: this.showNewButton,
      newButtonText: this.newButtonText,
      newButtonIcon: this.newButtonIcon,
      newButtonColor: this.newButtonColor
    };
    this.configChange.emit(cfg);
  }
}
