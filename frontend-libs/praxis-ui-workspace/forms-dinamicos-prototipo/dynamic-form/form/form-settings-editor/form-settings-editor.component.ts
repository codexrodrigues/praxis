// form-settings-editor/form-settings-editor.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldsetLayout, FormLayout, FormLayoutRule, FormRuleContext } from '../../../models/form-layout.model';
import { CommonModule } from '@angular/common';
import { FormFieldModule, InputsModule } from '@progress/kendo-angular-inputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { FieldMetadata } from '../../../models/field-metadata.model';
import { WindowService } from '@progress/kendo-angular-dialog';
import { FormContextService } from '../../services/form-context.service';
import { FormRuleEditorComponent } from './form-rule-editor/form-rule-editor.component';
import { v4 as uuidv4 } from 'uuid';
import { ThNotificationService, NotificationType } from '../../../services/th-notification.service';
import { KENDO_DROPDOWNS } from '@progress/kendo-angular-dropdowns';
import { ExpansionPanelComponent } from '@progress/kendo-angular-layout';
import { DynamicFieldDetailComponent } from '../dynamic-field-detail/dynamic-field-detail.component';
import { UpdatedFieldSets } from '../dynamic-field-detail/models/updated-fieldsets';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, FormFieldModule, InputsModule, ButtonsModule,
    KENDO_DROPDOWNS, ExpansionPanelComponent, DynamicFieldDetailComponent],
  selector: 'lib-form-settings-editor',
  templateUrl: './form-settings-editor.component.html',
  styleUrls: ['./form-settings-editor.component.css']
})
export class FormSettingsEditorComponent implements OnInit {
  @Input() formLayout?: FormLayout;
  @Output() formLayoutChange = new EventEmitter<FormLayout>();
  @Output() close = new EventEmitter<void>();

  private formLayoutUpdated!: FormLayout;

  settingsForm?: FormGroup;
  actionsForm?: FormGroup;
  styleForm?: FormGroup;
  apiForm?: FormGroup;
  behaviorForm?: FormGroup;
  metadataForm?: FormGroup;
  messagesForm?: FormGroup;

  activeTab = 'general';

  availableFields: FieldMetadata[] = [];
  updatedFields: FieldMetadata[] = [];

  httpMethods = ['POST', 'PUT', 'PATCH'];
  buttonPositions = [{ value: 'left', label: 'Esquerda' }, { value: 'center', label: 'Centro' }, { value: 'right', label: 'Direita' }, { value: 'justified', label: 'Justificado' }];
  buttonTypes = ['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'default'];

  isFormValid = true;

  constructor(private fb: FormBuilder, private windowService: WindowService, private formContextService: FormContextService, private notificationService: ThNotificationService
  ) { }

  ngOnInit(): void {
    this.formContextService.getAvailableFields$().subscribe(fields => {
      this.availableFields = fields;
    });

    // Inicializa formLayout se não existir
    if (!this.formLayout) {
      this.formLayout = { formRules: [], fieldsets: [] } as FormLayout;
    }
    // Inicializa formRules se não existir
    else if (!this.formLayout.formRules) {
      this.formLayout.formRules = [];
    }

    this.formLayoutUpdated = structuredClone(this.formLayout);

    this.initForms();
  }

  initForms(): void {
    // Formulário de configurações gerais
    this.settingsForm = this.fb.group({
      formTitle: [this.formLayout?.formTitle ?? ''],
      formDescription: [this.formLayout?.formDescription ?? ''],
      formTitleCreate: [this.formLayout?.formTitleCreate ?? ''],
      formDescriptionCreate: [this.formLayout?.formDescriptionCreate ?? ''],
      formTitleView: [this.formLayout?.formTitleView ?? ''],
      formDescriptionView: [this.formLayout?.formDescriptionView ?? ''],
      formTitleEdit: [this.formLayout?.formTitleEdit ?? ''],
      formDescriptionEdit: [this.formLayout?.formDescriptionEdit ?? ''],
      className: [this.formLayout?.className ?? ''],
      autoSave: [this.formLayout?.autoSave ?? false],
      autoSaveDebounce: [this.formLayout?.autoSaveDebounce ?? 2000],
      readOnly: [this.formLayout?.readOnly ?? false]
    });

    // Formulário de estilos
    this.styleForm = this.fb.group({
      styles: this.fb.group(this.formLayout?.styles || {})
    });

    // Formulário de ações
    const actions = this.formLayout?.actions || {};
    this.actionsForm = this.fb.group({
      showSaveButton: [actions.showSaveButton !== false],
      submitButtonLabel: [actions.submitButtonLabel || 'Salvar'],
      showCancelButton: [actions.showCancelButton !== false],
      cancelButtonLabel: [actions.cancelButtonLabel || 'Cancelar'],
      showResetButton: [actions.showResetButton || false],
      resetButtonLabel: [actions.resetButtonLabel || 'Limpar'],
      position: [actions.position || 'right'],
      containerClassName: [actions.containerClassName || ''],
      containerStyles: this.fb.group(actions.containerStyles || {})
    });

    // Formulário de API
    const api = this.formLayout?.api || {};
    this.apiForm = this.fb.group({
      saveEndpoint: [api.saveEndpoint || ''],
      loadEndpoint: [api.loadEndpoint || ''],
      saveMethod: [api.saveMethod || 'POST'],
      timeout: [api.timeout || 30000],
      idField: [api.idField || 'id'],
      beforeSave: [api.beforeSave || ''],
      afterLoad: [api.afterLoad || '']
    });

    // Formulário de comportamento
    const behavior = this.formLayout?.behavior || {};
    this.behaviorForm = this.fb.group({
      confirmOnUnsavedChanges: [behavior.confirmOnUnsavedChanges !== false],
      trackHistory: [behavior.trackHistory || false],
      focusFirstError: [behavior.focusFirstError !== false],
      scrollToErrors: [behavior.scrollToErrors !== false],
      clearAfterSave: [behavior.clearAfterSave || false],
      redirectAfterSave: [behavior.redirectAfterSave || '']
    });

    // Formulário de metadados
    const metadata = this.formLayout?.metadata || {};
    this.metadataForm = this.fb.group({
      formCode: [metadata.formCode || ''],
      version: [metadata.version || '1.0']
    });

    // Formulário de mensagens
    const messages = this.formLayout?.messages || {};
    this.messagesForm = this.fb.group({
      /** Mensagens sobre Registros */
      updateRegistrySuccess: [messages.updateRegistrySuccess || 'Registro atualizado com sucesso!', Validators.required],
      createRegistrySuccess: [messages.createRegistrySuccess || 'Registro criado com sucesso!', Validators.required],
      updateRegistryError: [messages.updateRegistryError || 'Erro ao atualizar registro', Validators.required],
      createRegistryError: [messages.createRegistryError || 'Erro ao criar registro', Validators.required]
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  addStyleProperty(): void {
    const styleGroup = this.styleForm?.get('styles') as FormGroup;
    const newKey = prompt('Digite o nome da propriedade CSS:');
    if (newKey && !styleGroup.contains(newKey)) {
      styleGroup.addControl(newKey, this.fb.control(''));
    }
  }

  removeStyleProperty(property: string): void {
    const styleGroup = this.styleForm?.get('styles') as FormGroup;
    styleGroup.removeControl(property);
  }

  addContainerStyleProperty(): void {
    const styleGroup = this.actionsForm?.get('containerStyles') as FormGroup;
    const newKey = prompt('Digite o nome da propriedade CSS:');
    if (newKey && !styleGroup.contains(newKey)) {
      styleGroup.addControl(newKey, this.fb.control(''));
    }
  }

  removeContainerStyleProperty(property: string): void {
    const styleGroup = this.actionsForm?.get('containerStyles') as FormGroup;
    styleGroup.removeControl(property);
  }

  addHeaderProperty(): void {
    const api = this.formLayout?.api || {};
    api.headers = api.headers || {};

    const newKey = prompt('Digite o nome do header:');
    if (newKey && !api.headers[newKey]) {
      api.headers[newKey] = '';

      // Atualizar o formLayout
      this.formLayout!.api = api;
      this.formLayoutChange.emit(this.formLayout);
    }
  }

  //addMetadataProperty
  addMetadataProperty(): void {
    const metadataGroup = this.metadataForm?.get('metadata') as FormGroup;
    const newKey = prompt('Digite o nome da propriedade de metadados:');
    if (newKey && !metadataGroup.contains(newKey)) {
      metadataGroup.addControl(newKey, this.fb.control(''));
    }
  }
  //removeMetadataProperty
  removeMetadataProperty(property: string): void {
    const metadataGroup = this.metadataForm?.get('metadata') as FormGroup;
    metadataGroup.removeControl(property);
  }

  removeHeaderProperty(header: string): void {
    if (this.formLayout?.api?.headers && this.formLayout.api.headers[header]) {
      delete this.formLayout.api.headers[header];
      this.formLayoutChange.emit(this.formLayout);
    }
  }

  saveSettings(): void {
    this.formLayout = structuredClone(this.formLayoutUpdated);
    // Construir o objeto formLayout atualizado
    const updatedLayout: FormLayout = {
      ...this.formLayout,
      ...this.settingsForm!.value,
      styles: this.styleForm?.value.styles,
      actions: {
        ...this.formLayout?.actions,
        ...this.actionsForm?.value
      },
      api: {
        ...this.formLayout?.api,
        ...this.apiForm?.value,
      },
      behavior: {
        ...this.formLayout?.behavior,
        ...this.behaviorForm?.value
      },
      metadata: {
        ...this.formLayout?.metadata,
        ...this.metadataForm?.value
      },
      messages: {
        ...this.formLayout?.messages,
        ...this.messagesForm?.value
      }
    };

    // Emitir as alterações
    this.formLayoutChange.emit(updatedLayout);
    this.close.emit();
  }

  cancel(): void {
    this.close.emit();
  }

  get stylesValue(): { [key: string]: any } {
    return this.styleForm?.get('styles')?.value || {};
  }

  // Método para adicionar nova regra
  addRule(): void {
    // Primeiro, certifique-se de que os availableFields estão no formato correto
    // para serem utilizados pelo kendo-dropdownlist
    if (!this.availableFields || this.availableFields.length === 0) {
      // Se não houver campos disponíveis, mostrar uma notificação
      this.showNotification('Não há campos disponíveis para criar regras.', 'warning');
      return;
    }

    const windowRef = this.windowService.open({
      title: 'Nova Regra de Formulário',
      content: FormRuleEditorComponent,
      width: 700,
      height: 600
    });

    const editor = windowRef.content.instance as FormRuleEditorComponent;

    // Passa os campos sem transformação
    editor.availableFields = this.availableFields;

    editor.save.subscribe((rule: FormLayoutRule) => {
      // Adiciona ID se não existir
      if (!rule.id) {
        rule.id = uuidv4();
      }

      // Adiciona a regra ao formLayout
      this.formLayout!.formRules = [...(this.formLayout?.formRules || []), rule];

      // Atualiza os metadados dos campos alvos para vincular a esta regra
      this.updateFieldsWithRule(rule);

      // Emitir evento de atualização
      this.formLayoutChange.emit(this.formLayout);

      windowRef.close();
    });

    editor.cancel.subscribe(() => {
      windowRef.close();
    });
  }

  // Método auxiliar para mostrar notificações usando o ThNotificationService
  private showNotification(
    message: string,
    type: NotificationType = 'info'
  ): void {
    switch (type) {
      case 'success':
        this.notificationService.success(message);
        break;
      case 'error':
        this.notificationService.error(message);
        break;
      case 'warning':
        this.notificationService.warning(message);
        break;
      case 'info':
        this.notificationService.info(message);
        break;
      case 'action':
      case 'none':
      default:
        this.notificationService.show({ content: message, type: { style: type as any } });
        break;
    }
  }


  // Método para editar uma regra existente
  editRule(rule: FormLayoutRule): void {
    if (!rule || !rule.id) {
      this.showNotification('Tentativa de editar uma regra inválida ou sem ID', 'error');
      return;
    }

    try {
      const windowRef = this.windowService.open({
        title: 'Editar Regra de Formulário',
        content: FormRuleEditorComponent,
        width: 700,
        height: 600
      });

      const editor = windowRef.content.instance as FormRuleEditorComponent;

      editor.availableFields = this.availableFields;
      editor.rule = { ...rule }; // Clone para evitar modificação direta

      editor.save.subscribe((updatedRule: FormLayoutRule) => {
        // Inicializa o formLayout com estrutura completa se não existir
        if (!this.formLayout) {
          this.formLayout = { formRules: [], fieldsets: [] } as FormLayout;
        }

        // Inicializa formRules se não existir
        if (!this.formLayout.formRules) {
          this.formLayout.formRules = [];
        }

        // Atualiza a regra no formLayout
        this.formLayout.formRules = this.formLayout.formRules.map(r =>
          r.id === updatedRule.id ? updatedRule : r
        );

        // Atualiza os metadados dos campos afetados
        this.updateFieldsWithRule(updatedRule);

        // Emitir evento de atualização
        this.formLayoutChange.emit(this.formLayout);

        windowRef.close();
      });

      editor.cancel.subscribe(() => {
        windowRef.close();
      });
    } catch (error) {
      this.showNotification(`Erro ao abrir o editor de regras: ${error}`, 'error');
    }
  }

  /**
   * Remove uma regra do formulário e atualiza todas as suas referências
   * @param rule A regra de formulário a ser removida
   * @returns void
   */
  removeRule(rule: FormLayoutRule): void {
    // Verifica se a regra é válida
    if (!rule || !rule.id) {
      console.error('Tentativa de remover uma regra inválida ou sem ID');
      return;
    }

    try {
      // Verificar se há campos que usam esta regra
      const camposAfetados = this.getFieldsUsingRule(rule.id);

      // Remover a regra da lista de regras do formulário
      this.formLayout!.formRules = (this.formLayout?.formRules || []).filter(r => r.id !== rule.id);

      // Remover referências à regra de todos os campos afetados
      this.removeRuleFromFields(rule.id);

      // Log para fins de depuração
      console.log(`Regra ${rule.id} removida com sucesso. ${camposAfetados.length} campo(s) foram atualizados.`);

      // Emitir evento de atualização do formLayout
      this.formLayoutChange.emit(this.formLayout);
    } catch (error) {
      console.error(`Erro ao remover a regra: ${rule.id}`, error);
    }
  }

  /**
   * Retorna a lista de campos que estão usando uma determinada regra
   * @param ruleId O ID da regra
   * @returns Array de campos que usam a regra
   */
  private getFieldsUsingRule(ruleId: string): FieldMetadata[] {
    const allFields = this.getAllFieldsFromLayout();

    return allFields.filter(field => {
      if (!field.linkedRuleIds) return false;

      // Verifica se o campo tem referência à regra em algum contexto
      return Object.values(field.linkedRuleIds).some(
        ruleIds => ruleIds && ruleIds.includes(ruleId)
      );
    });
  }

  // Atualiza os metadados dos campos para vincular/desvincular regras
  private updateFieldsWithRule(rule: FormLayoutRule): void {
    const allFields = this.getAllFieldsFromLayout();

    allFields.forEach(field => {
      // Se o campo está na lista de targetFields da regra
      if (rule.targetFields.includes(field.name)) {
        // Inicializa linkedRuleIds se não existir
        if (!field.linkedRuleIds) {
          field.linkedRuleIds = {};
        }

        // Inicializa o array para o contexto específico se não existir
        if (!field.linkedRuleIds[rule.context]) {
          field.linkedRuleIds[rule.context] = [];
        }

        // Adiciona o ID da regra se ainda não existir
        if (!field.linkedRuleIds[rule.context]?.includes(rule.id)) {
          field.linkedRuleIds[rule.context]?.push(rule.id);
        }

        // Remove regras individuais do mesmo contexto
        this.removeIndividualRuleForContext(field, rule.context);
      } else {
        // Se o campo não está na lista de targetFields, remove o vínculo se existir
        if (field.linkedRuleIds && field.linkedRuleIds[rule.context]) {
          field.linkedRuleIds[rule.context] = field.linkedRuleIds[rule.context]?.filter(id => id !== rule.id);
        }
      }
    });
  }

  /**
   * Remove referências à regra com o ID especificado de todos os campos do formulário.
   * Isso garante que quando uma regra for excluída, nenhum campo mantenha referências obsoletas.
   *
   * @param ruleId O ID da regra a ser removida das referências dos campos
   */
  private removeRuleFromFields(ruleId: string): void {
    if (!this.formLayout?.fieldsets) {
      return;
    }

    let fieldsUpdated = 0;

    // Percorre todos os fieldsets e rows para encontrar todos os campos
    this.formLayout.fieldsets.forEach(fieldset => {
      fieldset.rows.forEach(row => {
        // Para cada campo na row, verifica e atualiza linkedRuleIds
        row.fields.forEach(field => {
          if (field.linkedRuleIds) {
            let updated = false;

            // Verifica cada contexto (visibility, required, etc.)
            Object.keys(field.linkedRuleIds).forEach(contextKey => {
              const context = contextKey as FormRuleContext;
              const ruleIds = field.linkedRuleIds![context];

              if (ruleIds && ruleIds.includes(ruleId)) {
                // Remove a regra da lista
                field.linkedRuleIds![context] = ruleIds.filter(id => id !== ruleId);
                updated = true;

                // Se a lista ficou vazia, remove o contexto
                if (field.linkedRuleIds![context].length === 0) {
                  delete field.linkedRuleIds![context];
                }
              }
            });

            // Se não há mais contextos, remove o objeto linkedRuleIds completamente
            if (Object.keys(field.linkedRuleIds).length === 0) {
              delete field.linkedRuleIds;
            }

            if (updated) {
              fieldsUpdated++;
            }
          }
        });
      });
    });

    console.log(`Referências à regra ${ruleId} removidas de ${fieldsUpdated} campo(s).`);
  }

  // Remove regra individual do mesmo contexto
  private removeIndividualRuleForContext(field: FieldMetadata, context: string): void {
    // Limpa regras individuais baseadas no contexto
    switch (context) {
      case 'visibility':
        field['visibilityCondition'] = undefined;
        break;
      case 'readOnly':
        field['readOnlyCondition'] = undefined;
        break;
      case 'style':
        // Limpa estilos condicionais se existirem
        break;
      case 'validation':
        // Limpa validações condicionais se existirem
        break;
      case 'notification':
        // Limpa notificações condicionais se existirem
        break;
    }
  }


  getContextDisplayName(context: string): string {
    const contextNames = {
      'visibility': 'Visibilidade',
      'readOnly': 'Somente Leitura',
      'required': 'Obrigatório',
      'validation': 'Validação',
      'style': 'Estilo',
      'notification': 'Notificação'
    };

    return contextNames[context as keyof typeof contextNames] || context;
  }

  // Recupera todos os campos do layout
  private getAllFieldsFromLayout(): FieldMetadata[] {
    const fields: FieldMetadata[] = [];

    this.formLayout?.fieldsets?.forEach(fieldset => {
      fieldset.rows.forEach(row => {
        fields.push(...row.fields);
      });
    });

    return fields;
  }



  protected readonly Object = Object;

  aplicarTituloParaTodos() {
    if (this.settingsForm) {
      const titulo = this.settingsForm.get('formTitle')?.value;
      const descricao = this.settingsForm.get('formDescription')?.value;

      this.settingsForm.patchValue({
        formTitleCreate: titulo,
        formTitleView: titulo,
        formTitleEdit: titulo,
        formDescriptionCreate: descricao,
        formDescriptionView: descricao,
        formDescriptionEdit: descricao,
      });
    }
  }

  atualizaFieldsets(event: UpdatedFieldSets): void {
    this.isFormValid = event.isValid;
    if (this.formLayoutUpdated) {
      this.formLayoutUpdated.fieldsets = event.updatedFieldsets;
    }
  }
}
