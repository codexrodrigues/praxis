import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TableConfig } from '@praxis/core';

@Component({
  selector: 'praxis-table-json-config',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  template: `
    <textarea [(ngModel)]="jsonText" (ngModelChange)="onTextChange()" rows="10" style="width:100%"></textarea>
    <div style="margin-top:0.5rem;">
      <button mat-button (click)="formatJson()"><mat-icon>format_align_left</mat-icon>Formatar JSON</button>
      <button mat-button (click)="copyJson()"><mat-icon>content_copy</mat-icon>Copiar</button>
    </div>
    <div style="color:red;" *ngIf="!valid">JSON inválido</div>
  `,
  styles:[`:host{display:block;}`]
})
export class PraxisTableJsonConfig {
  @Input() config: TableConfig = { columns: [], data: [] };
  @Output() configChange = new EventEmitter<{config: TableConfig; valid: boolean}>();

  jsonText = '';
  valid = true;

  ngOnInit() {
    this.jsonText = JSON.stringify(this.config, null, 2);
  }

  onTextChange() {
    try {
      const cfg = JSON.parse(this.jsonText);
      this.valid = true;
      this.configChange.emit({ config: cfg, valid: true });
    } catch {
      this.valid = false;
      this.configChange.emit({ config: this.config, valid: false });
    }
  }

  formatJson() {
    try {
      const obj = JSON.parse(this.jsonText);
      this.jsonText = JSON.stringify(obj, null, 2);
    } catch {}
  }

  copyJson() {
    const textarea = document.createElement('textarea');
    textarea.value = this.jsonText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
