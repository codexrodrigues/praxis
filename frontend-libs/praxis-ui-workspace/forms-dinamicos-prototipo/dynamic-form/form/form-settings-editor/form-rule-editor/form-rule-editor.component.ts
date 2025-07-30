// form-rule-editor.component.ts
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CompositeFilterDescriptor} from '@progress/kendo-data-query';
import {NgIf} from '@angular/common';
import {DropDownListComponent, MultiSelectComponent} from '@progress/kendo-angular-dropdowns';
import {InputsModule} from '@progress/kendo-angular-inputs';
import {ButtonsModule} from '@progress/kendo-angular-buttons';
import {ConditionBuilderComponent} from '../../../field-configurator/condition-builder/condition-builder.component';
import {FieldMetadata} from '../../../../models/field-metadata.model';
import {FormLayoutRule, FormRuleContext} from '../../../../models/form-layout.model';
import {FormContextService} from '../../../services/form-context.service';

@Component({
  selector: 'app-form-rule-editor',
  templateUrl: './form-rule-editor.component.html',
  styleUrls: ['./form-rule-editor.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    DropDownListComponent,
    MultiSelectComponent,
    InputsModule,
    ButtonsModule,
    ConditionBuilderComponent
  ]
})
export class FormRuleEditorComponent implements OnInit {
  @Input() rule: FormLayoutRule | null = null;
  @Input() availableFields: FieldMetadata[] = [];
  @Output() save = new EventEmitter<FormLayoutRule>();
  @Output() cancel = new EventEmitter<void>();

  ruleForm: FormGroup;
  contexts: { text: string; value: FormRuleContext }[] = [
    { text: 'Visibilidade', value: 'visibility' },
    { text: 'Somente Leitura', value: 'readOnly' },
    { text: 'Estilo', value: 'style' },
    { text: 'Validação', value: 'validation' },
    { text: 'Notificação', value: 'notification' }
  ];

  constructor(private fb: FormBuilder, private formContextService: FormContextService) {
    this.ruleForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      context: ['visibility', Validators.required],
      targetFields: [[], Validators.required],
      description: [''],
      effect: this.fb.group({
        condition: [null, Validators.required],
        styleClass: [''],
        style: [{}]
      })
    });
  }

  ngOnInit(): void {
    if (this.rule) {
      // Preencher formulário com dados da regra existente
      this.ruleForm.patchValue({
        id: this.rule.id,
        name: this.rule.name,
        context: this.rule.context,
        targetFields: this.rule.targetFields,
        description: this.rule.description || '',
        effect: {
          condition: this.rule.effect.condition,
          styleClass: this.rule.effect.styleClass || '',
          style: this.rule.effect.style || {}
        }
      });
    }
  }

  onConditionChange(condition: CompositeFilterDescriptor | null): void {
    this.ruleForm.patchValue({
      effect: {
        ...this.ruleForm.get('effect')?.value,
        condition: condition
      }
    });
  }

  onSubmit(): void {
    if (this.ruleForm.valid) {
      this.save.emit(this.ruleForm.value);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Adicione este método ao FormRuleEditorComponent
  mapContextToConditionContext(context: FormRuleContext): 'visibility' | 'required' {
    // Mapeie conforme necessário para compatibilidade com o ConditionBuilderComponent
    if (context === 'required' || context === 'validation') {
      return 'required';
    }
    return 'visibility';
  }
}
