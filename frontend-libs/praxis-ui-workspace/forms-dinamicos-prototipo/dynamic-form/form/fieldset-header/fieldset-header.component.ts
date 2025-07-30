// src/app/funcionalidades/form-field-drag/fieldset-header/fieldset-header.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import {EditableFieldsetTitleDirective} from '../editable-fieldset-title.directive';
import {NgClass, NgIf, NgStyle} from '@angular/common';
import { FieldsetLayout } from '../../../models/form-layout.model';
import {
  FieldsetConfig,
  FieldsetConfiguratorComponent
} from '../../fieldset-configurator/fieldset-configurator/fieldset-configurator.component';
import {DialogService} from '@progress/kendo-angular-dialog';

@Component({
  selector: 'fieldset-header',
  templateUrl: './fieldset-header.component.html',
  styleUrls: ['./fieldset-header.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EditableFieldsetTitleDirective,
    NgIf,
    NgClass,
    NgStyle,
    // Importar módulos e diretivas necessárias, por exemplo:
    // CommonModule, NgIf, NgClass, e a diretiva editFieldsetTitle (caso seja standalone)
  ]
})
export class FieldsetHeaderComponent {
  @Input() fieldset!: FieldsetLayout;
  @Input() editMode: boolean = false;
  // Propriedade para controlar o estado de hover
  isHovered: boolean = false;
  @Input() formMode: 'create' | 'edit' |'view' | '' = '';

  // Emitir o fieldset atualizado.
  @Output() orientationChanged = new EventEmitter<FieldsetLayout>();
  @Output() removeFieldset = new EventEmitter<string>();
  @Output() addRow = new EventEmitter<any>();
  @Output() addFieldset = new EventEmitter<void>();

  //Construtor
  constructor(private dialogService: DialogService) {
    // Inicialização, se necessário
  }

  onToggleOrientation(event: Event): void {
    event.stopPropagation();

    // Decide a nova orientação
    const newOrientation: 'horizontal' | 'vertical' =
      this.fieldset.orientation === 'horizontal' ? 'vertical' : 'horizontal';

    // Cria um novo objeto fieldset (imutável) com a nova orientação
    const updatedFieldset: FieldsetLayout = {
      ...this.fieldset,
      orientation: newOrientation
    };

    // Emite para o componente pai o fieldset atualizado
    this.orientationChanged.emit(updatedFieldset);
  }


  // Add a method to handle the add fieldset action
  onAddFieldset(event: Event): void {
    event.stopPropagation();
    this.addFieldset.emit();
  }

  openSettings(event: Event): void {
    event.stopPropagation();

    // Create a fieldset configuration object to pass to the dialog
    const fieldsetConfig: FieldsetLayout = {
      id: this.fieldset.id,
      title: this.fieldset.title,
      titleNew: this.fieldset.titleNew,
      titleView: this.fieldset.titleView,
      titleEdit: this.fieldset.titleEdit,
      orientation: this.fieldset.orientation,
      rows: this.fieldset.rows || [],
      hiddenCondition: this.fieldset.hiddenCondition
    };

    const dialogRef = this.dialogService.open({
      title: 'Configurações do Fieldset',
      content: FieldsetConfiguratorComponent,
    });

    // Pass the current fieldset config to the dialog component
    const componentInstance = dialogRef.content.instance;
    componentInstance.fieldsetConfig = fieldsetConfig;

    dialogRef.result.subscribe((result) => {
      if (result) {
        // Update the fieldset with the new settings
        Object.assign(this.fieldset, result);
        console.log('Fieldset settings updated', this.fieldset);
      }
    });
  }

  /**
   * Verifica se o fieldset pode ser removido.
   * Um fieldset pode ser removido se ele não tiver nenhuma regra condicional (hiddenCondition),
   * e não contiver nenhum field dentro dele. Em outras palavras, ele deve estar vazio.
   * @returns {boolean} true se o fieldset pode ser removido, false caso contrário
   */
  isFieldsetRemovable(): boolean {
    return !this.fieldset?.hiddenCondition && !this.fieldset?.rows?.some(row => row.fields?.length);
  }

  onRemoveFieldset(event: Event): void {
    event.stopPropagation();
    this.removeFieldset.emit(this.fieldset.id);
  }

  //onAddRow
 onAddRow(event: Event): void {
    event.stopPropagation();

    // Create a properly structured event object
    // When adding from fieldset header, we need to specify where to add the row
    // We'll use null or the last row's ID to indicate where to add the new row
    const lastRow = this.fieldset.rows && this.fieldset.rows.length > 0
      ? this.fieldset.rows[this.fieldset.rows.length - 1]
      : null;

    // Emit object with fieldset and row information
    this.addRow.emit({
      fieldset: this.fieldset,
      row: lastRow, // This will add after the last row, or at beginning if null
      rowIndex: lastRow ? this.fieldset.rows.length - 1 : -1
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
