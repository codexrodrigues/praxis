import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormConfig } from '@praxis/core';

@Component({
  selector: 'praxis-rules-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="rules-editor-form">
      <p>Defina as regras de visibilidade e obrigatoriedade em formato JSON.</p>
      <mat-form-field>
        <mat-label>Regras do Formulário (JSON)</mat-label>
        <textarea
          matInput
          [value]="rulesAsString"
          (input)="
            onRulesChange(
              ($event.target as HTMLTextAreaElement)?.value ?? ''
            )
          "
          rows="10"
        ></textarea>
      </mat-form-field>
      <mat-error *ngIf="parsingError">
        JSON inválido: {{ parsingError }}
      </mat-error>
    </div>
  `,
  styles: [
    `
      .rules-editor-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      textarea {
        font-family: monospace;
      }
    `,
  ],
})
export class RulesEditorComponent implements OnInit {
  @Input() config!: FormConfig;
  @Output() configChange = new EventEmitter<FormConfig>();

  rulesAsString = '';
  parsingError: string | null = null;

  ngOnInit(): void {
    this.rulesAsString = JSON.stringify(this.config.formRules || {}, null, 2);
  }

  onRulesChange(jsonString: string): void {
    this.rulesAsString = jsonString;
    try {
      const rules = JSON.parse(jsonString);
      this.parsingError = null;
      const newConfig = {
        ...this.config,
        formRules: rules,
      };
      this.configChange.emit(newConfig);
    } catch (e: any) {
      this.parsingError = e.message;
    }
  }
}
