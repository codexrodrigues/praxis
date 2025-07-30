// src/app/funcionalidades/form-field-drag/row-header/row-header.component.ts

import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {NgClass, NgIf, NgStyle} from '@angular/common';
import {DialogService} from '@progress/kendo-angular-dialog';
import {
  FieldWizardDialogComponent
} from '../../field-configurator/field-wizard-dialog/field-wizard-dialog.component';
import { DynamicFormGroupService } from '../../../services/dynamic-form-group.service';
import { FormLayoutService } from '../../../services/form-layout.service';
import {FormGroup} from '@angular/forms';
import { RowConfig, RowConfiguratorComponent } from '../../row-configurator/row-configurator/row-configurator.component';

@Component({
  selector: 'dynamic-form-row-header',
  templateUrl: './form-row-header.component.html',
  styleUrls: ['./form-row-header.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgClass,
    NgStyle
  ],
})
export class FormRowHeaderComponent {
  @Input() formGroup: FormGroup = new FormGroup({});
  @Input() editMode: boolean = false;
  @Input() row: any;
  @Input() fieldset: any;
  @Input() rowIndex: number = 0;

  @Output() toggleOrientation = new EventEmitter<any>();
  @Output() removeRow = new EventEmitter<any>();

  // Add the isHovered property
  isHovered: boolean = false;

  constructor(private dialogService: DialogService,
              private formLayoutService: FormLayoutService,
              private dynamicFormGroupService: DynamicFormGroupService) {}

  // Calcula o label com base na orientação do fieldset
  get rowLabel(): string {
    return this.fieldset?.orientation === 'horizontal'
      ? `Coluna ${this.rowIndex + 1}`
      : `Linha ${this.rowIndex + 1}`;
  }

  onToggleOrientation(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleOrientation.emit(this.row);
  }

  /**
   * Movido para o FieldsetHeaderComponent
   @Output() addRow = new EventEmitter<any>();
   onAdd(event: Event): void {
    event.stopPropagation();
    // Emite um objeto com a row atual, seu índice e o fieldset pai
    this.addRow.emit({ row: this.row, rowIndex: this.rowIndex, fieldset: this.fieldset });
  }
   */

  onRemove(event: Event): void {
    event.stopPropagation();
    // Emite um objeto com as informações necessárias para remover a row
    this.removeRow.emit({ row: this.row, rowIndex: this.rowIndex, fieldset: this.fieldset });
  }

  /**
   * Abre o Field Wizard Dialog para criação de um novo field.
   * Ao fechar o diálogo com sucesso, o novo field é adicionado tanto
   * ao FormGroup dinâmico quanto ao layout do formulário.
   */
  openFieldWizardDialog(): void {
    const dialogRef = this.dialogService.open({
      title: 'Adicionar Campo',
      content: FieldWizardDialogComponent,
    });

    dialogRef.result.subscribe((result: any) => {
      if (result) {
        // 'result' é do tipo FieldMetadata retornado pelo FieldWizardDialogComponent
        console.log('Field criado:', result);

        // Primeiro, adiciona o controle ao FormGroup dinâmico
        if (this.formGroup) {
          this.dynamicFormGroupService.addFieldToFormGroup(this.formGroup, result);
          console.log('FormControl adicionado ao FormGroup.');
        } else {
          console.warn('FormGroup não encontrado na row para adicionar o FormControl.');
        }

        // Em seguida, adiciona o field ao layout do formulário
        // É necessário que tanto o fieldset quanto a row tenham um ID válido
        if (this.fieldset?.id && this.row?.id) {
          this.formLayoutService.addField(this.fieldset.id, this.row.id, result);
          console.log('Field adicionado ao layout.');
        } else {
          console.warn('IDs inválidos para fieldset ou row. Field não adicionado ao layout.');
        }
      }
    });
  }

  /**
   * Opens the settings dialog for configuring the row/fieldset
   */
  openSettings(event: Event): void {
    event.stopPropagation();

    // Create a row configuration object to pass to the dialog
    const rowConfig: RowConfig = {
      id: this.row.id,
      name: this.row.name,
      label: this.row.label,
      orientation: this.row.orientation,
      fields: this.row.fields || [],
      hiddenCondition: this.row.hiddenCondition,
      visibilityCondition: this.row.visibilityCondition
    };

    const dialogRef = this.dialogService.open({
      title: this.row.orientation === 'horizontal' ? 'Configurações da Coluna' : 'Configurações da Linha',
      content: RowConfiguratorComponent,
    });

    // Pass the current row config to the dialog component
    const componentInstance = dialogRef.content.instance;
    componentInstance.rowConfig = rowConfig;

    dialogRef.result.subscribe((result) => {
      if (result) {
        // Update the row with the new settings
        Object.assign(this.row, result);
        console.log('Row settings updated', this.row);
      }
    });
  }

  // Methods to handle mouse events
  onMouseEnter(): void {
    this.isHovered = true;
  }

  onMouseLeave(): void {
    this.isHovered = false;
  }

}
