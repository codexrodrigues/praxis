import { Directive, Input, HostListener } from '@angular/core';
import { FieldsetLayout } from '../../models/form-layout.model';

@Directive({
  selector: '[editFieldsetTitle]', // Seletor usado no HTML
  standalone: true,                // Permite importá-la diretamente em componentes standalone
})
export class EditableFieldsetTitleDirective {
  /**
   * Recebe o objeto do fieldset atual.
   */
  @Input() fieldset!: FieldsetLayout;

  /**
   * Indica se estamos em modo de edição. Se não estiver em edição, não faz nada no duplo clique.
   */
  @Input() editMode: boolean = false;

}
