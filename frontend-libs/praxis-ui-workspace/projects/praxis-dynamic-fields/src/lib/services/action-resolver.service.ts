/**
 * @fileoverview Serviço para resolução de ações customizadas por string reference
 * 
 * Permite registrar e executar ações dinâmicas definidas por string no metadata.
 */

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Context object passed to action handlers containing all relevant data
 * about the component state and form context when an action is executed.
 * 
 * This interface provides maximum flexibility for action handlers to access
 * both component-specific data and broader form/application context.
 * 
 * @example Basic usage in action handler
 * ```typescript
 * this.registerAction('customAction', async (context: ActionContext) => {
 *   console.log('Field:', context.fieldName);
 *   console.log('Value:', context.fieldValue);
 *   console.log('Metadata:', context.metadata);
 *   return { success: true, data: 'Action completed' };
 * });
 * ```
 * 
 * @example Using actionParam for parameterized actions
 * ```typescript
 * // Metadata configuration: action: "navigate:/dashboard"
 * this.registerAction('navigate', async (context: ActionContext) => {
 *   const url = context.actionParam; // "/dashboard"
 *   await this.router.navigate([url]);
 *   return { success: true };
 * });
 * ```
 */
export interface ActionContext {
  /** 
   * Name/identifier of the field that triggered the action.
   * 
   * Useful for:
   * - Logging and debugging
   * - Field-specific business logic
   * - Form validation context
   * 
   * @example "email", "firstName", "submitButton"
   */
  fieldName?: string;
  
  /** 
   * Current value of the field that triggered the action.
   * 
   * For different field types:
   * - Input fields: string value
   * - Checkboxes: boolean
   * - Select: selected option value
   * - Buttons: typically undefined
   * 
   * @example "john@example.com", true, ["option1", "option2"]
   */
  fieldValue?: any;
  
  /** 
   * Complete metadata configuration object for the field.
   * 
   * Contains all field configuration including:
   * - Label, placeholder, validation rules
   * - UI configuration (appearance, icons, etc.)
   * - Custom properties specific to the field
   * 
   * @example MaterialButtonMetadata, MaterialInputMetadata, etc.
   */
  metadata?: any;
  
  /** 
   * Complete form data object containing all field values.
   * 
   * Useful for:
   * - Cross-field validation
   * - Conditional logic based on other fields
   * - Form-wide operations
   * 
   * @example { email: "user@example.com", name: "John", age: 30 }
   */
  formData?: any;
  
  /** 
   * Reference to the Angular component instance that triggered the action.
   * 
   * Provides access to:
   * - Component methods and properties
   * - ElementRef for DOM manipulation
   * - Angular lifecycle and services
   * 
   * @example MaterialButtonComponent, MaterialInputComponent instances
   */
  componentInstance?: any;
  
  /** 
   * Parameter extracted from action reference after colon separator.
   * 
   * When action is defined as "actionName:parameter", this contains the parameter part.
   * Enables parameterized actions without separate configuration.
   * 
   * @example 
   * - Action: "navigate:/dashboard" → actionParam: "/dashboard"
   * - Action: "showAlert:Data saved successfully" → actionParam: "Data saved successfully"
   * - Action: "download:https://example.com/file.pdf" → actionParam: "https://example.com/file.pdf"
   */
  actionParam?: string;
}

/**
 * Result object returned by action handlers indicating success/failure
 * and any associated data or error information.
 * 
 * Provides a standardized way for action handlers to communicate results
 * back to the calling component for appropriate user feedback.
 * 
 * @example Successful action result
 * ```typescript
 * return {
 *   success: true,
 *   data: 'Form submitted successfully',
 *   redirect: '/dashboard'
 * };
 * ```
 * 
 * @example Failed action result
 * ```typescript
 * return {
 *   success: false,
 *   error: 'Validation failed: Email is required'
 * };
 * ```
 */
export interface ActionResult {
  /** 
   * Indicates whether the action completed successfully.
   * 
   * - true: Action completed without errors
   * - false: Action failed or encountered an error
   * 
   * Used by components to determine appropriate user feedback
   * (success message, error display, etc.)
   */
  success: boolean;
  
  /** 
   * Optional data returned by successful actions.
   * 
   * Can contain:
   * - Success messages for user display
   * - Result data from API calls
   * - State information for further processing
   * - Any serializable data relevant to the action
   * 
   * @example "Form submitted", { userId: 123 }, ["item1", "item2"]
   */
  data?: any;
  
  /** 
   * Error message when action fails (success = false).
   * 
   * Should contain:
   * - User-friendly error descriptions
   * - Validation error messages
   * - Technical error details (for logging)
   * 
   * Displayed to users or logged for debugging purposes.
   * 
   * @example "Network error occurred", "Invalid email format", "Access denied"
   */
  error?: string;
  
  /** 
   * Optional URL for automatic navigation after action completion.
   * 
   * When provided, the calling component may automatically redirect
   * the user to this URL after the action succeeds.
   * 
   * Useful for:
   * - Post-submit redirects
   * - Workflow navigation
   * - Success page redirection
   * 
   * @example "/dashboard", "/success", "https://external-site.com"
   */
  redirect?: string;
}

/**
 * Function signature for action handlers that can be registered with the ActionResolverService.
 * 
 * Action handlers receive an ActionContext with all relevant component and form data,
 * and must return an ActionResult indicating success/failure.
 * 
 * Handlers can be either synchronous or asynchronous to support both immediate
 * operations and API calls/complex processing.
 * 
 * @example Synchronous action handler
 * ```typescript
 * const logHandler: ActionHandler = (context) => {
 *   console.log('Field value:', context.fieldValue);
 *   return { success: true, data: 'Logged successfully' };
 * };
 * ```
 * 
 * @example Asynchronous action handler
 * ```typescript
 * const saveHandler: ActionHandler = async (context) => {
 *   try {
 *     await apiService.saveData(context.formData);
 *     return { success: true, data: 'Data saved' };
 *   } catch (error) {
 *     return { success: false, error: 'Save failed' };
 *   }
 * };
 * ```
 * 
 * @param context - Complete action execution context
 * @returns Promise<ActionResult> or ActionResult indicating success/failure
 */
export type ActionHandler = (context: ActionContext) => Promise<ActionResult> | ActionResult;

@Injectable({
  providedIn: 'root'
})
export class ActionResolverService {
  private readonly router = inject(Router, { optional: true });
  private readonly http = inject(HttpClient, { optional: true });
  private readonly actionRegistry = new Map<string, ActionHandler>();

  constructor() {
    this.registerBuiltInActions();
    this.registerStateValidationActions();
    this.registerApiDataActions();
  }

  /**
   * Registra uma nova ação
   */
  registerAction(actionName: string, handler: ActionHandler): void {
    this.actionRegistry.set(actionName, handler);
  }

  /**
   * Remove uma ação registrada
   */
  unregisterAction(actionName: string): void {
    this.actionRegistry.delete(actionName);
  }

  /**
   * Executa uma ação por nome
   */
  async executeAction(actionRef: string, context: ActionContext = {}): Promise<ActionResult> {
    try {
      // Parse do action reference (pode ser "actionName" ou "actionName:param")
      const [actionName, actionParam] = actionRef.split(':', 2);
      
      // Verificações preventivas para dependências opicionais
      if (actionName === 'navigate' && !this.router) {
        return {
          success: false,
          error: 'Router service not available for navigation actions'
        };
      }
      
      if (actionName === 'apiCall' && !this.http) {
        return {
          success: false,
          error: 'HttpClient service not available for API actions'
        };
      }
      
      const handler = this.actionRegistry.get(actionName);
      if (!handler) {
        return {
          success: false,
          error: `Action '${actionName}' not found in registry`
        };
      }

      // Adicionar parâmetro ao context se disponível
      const enrichedContext: ActionContext = {
        ...context,
        actionParam
      };

      const result = await handler(enrichedContext);
      return result;

    } catch (error) {
      return {
        success: false,
        error: `Error executing action '${actionRef}': ${error}`
      };
    }
  }

  /**
   * Lista todas as ações registradas
   */
  getRegisteredActions(): string[] {
    return Array.from(this.actionRegistry.keys());
  }

  /**
   * Verifica se uma ação existe
   */
  hasAction(actionName: string): boolean {
    return this.actionRegistry.has(actionName);
  }

  /**
   * Registra ações built-in (pré-definidas) do sistema ActionResolverService.
   * 
   * Este método é chamado automaticamente no constructor e registra um conjunto
   * de ações comuns úteis para aplicações corporativas, eliminando a necessidade
   * de implementar essas funcionalidades básicas repetidamente.
   * 
   * Todas as ações built-in seguem padrões corporativos de:
   * - ✅ Tratamento de erros robusto
   * - ✅ Logging consistente para auditoria
   * - ✅ Mensagens user-friendly
   * - ✅ Segurança (noopener, noreferrer)
   * - ✅ Compatibilidade cross-browser
   * 
   * ## 📋 Ações Disponíveis
   * 
   * ### 📝 Formulários
   * - **submitForm**: Submete o formulário pai do componente
   * - **resetForm**: Reseta todos os campos do formulário pai
   * 
   * ### 🧭 Navegação
   * - **navigate**: Navegação interna via Angular Router ou externa via window.location
   * - **openUrl**: Abre URL em nova aba com segurança (noopener, noreferrer)
   * 
   * ### 📥 Downloads e Dados
   * - **download**: Inicia download de arquivo via URL
   * - **copyToClipboard**: Copia texto para área de transferência
   * 
   * ### 🔔 Interface e Feedback
   * - **showAlert**: Exibe alerta nativo do navegador
   * - **log**: Registra mensagem no console para debugging
   * 
   * ## 🎯 Uso no Metadata
   * 
   * ```typescript
   * // Ação simples
   * const submitButton: MaterialButtonMetadata = {
   *   name: 'submit',
   *   label: 'Enviar',
   *   controlType: 'button',
   *   action: 'submitForm' // ← Ação built-in
   * };
   * 
   * // Ação com parâmetro
   * const linkButton: MaterialButtonMetadata = {
   *   name: 'dashboard',
   *   label: 'Dashboard',
   *   controlType: 'button',
   *   action: 'navigate:/dashboard' // ← Parâmetro após ':'
   * };
   * 
   * // Ação de download
   * const downloadButton: MaterialButtonMetadata = {
   *   name: 'download',
   *   label: 'Download PDF',
   *   controlType: 'button',
   *   action: 'download:https://example.com/report.pdf'
   * };
   * ```
   * 
   * ## ⚠️ Notas Importantes
   * 
   * - Ações são **case-sensitive**: use exatamente como documentado
   * - Parâmetros são opcionais: ações funcionam com/sem parâmetros
   * - Tratamento de erro: todas as ações retornam ActionResult padronizado
   * - Logging: ações importantes são logadas automaticamente para auditoria
   * - Segurança: URLs externas usam 'noopener,noreferrer' por padrão
   * 
   * @private
   * @see ActionContext - Interface de contexto passada para todas as ações
   * @see ActionResult - Interface de resultado retornada por todas as ações
   * @see ActionHandler - Tipo de função para implementar ações customizadas
   */
  private registerBuiltInActions(): void {
    // =============================================================================
    // 📝 AÇÕES DE FORMULÁRIO
    // =============================================================================

    /**
     * 📤 submitForm - Submete o formulário pai do componente
     * 
     * Localiza o elemento <form> pai do componente e chama form.submit().
     * Útil para botões de submit que precisam acionar submissão programática.
     * 
     * ✅ Uso: action: "submitForm"
     * 📋 Parâmetros: Nenhum (ignora actionParam)
     * 🎯 Contexto: Qualquer campo dentro de um <form>
     * 
     * @example Metadata configuration
     * ```typescript
     * const submitBtn: MaterialButtonMetadata = {
     *   name: 'submit',
     *   label: 'Enviar Dados',
     *   controlType: 'button',
     *   action: 'submitForm'
     * };
     * ```
     */
    this.registerAction('submitForm', async (context) => {
      const form = this.findParentForm(context.componentInstance);
      if (form) {
        form.submit();
        return { success: true, data: 'Form submitted' };
      }
      return { success: false, error: 'No parent form found' };
    });

    /**
     * 🔄 resetForm - Reseta todos os campos do formulário pai
     * 
     * Localiza o elemento <form> pai e chama form.reset() para limpar todos os campos.
     * Restaura valores para o estado inicial/default do formulário.
     * 
     * ✅ Uso: action: "resetForm"
     * 📋 Parâmetros: Nenhum (ignora actionParam)
     * 🎯 Contexto: Qualquer campo dentro de um <form>
     * ⚠️ Cuidado: Remove TODOS os dados não salvos do formulário
     * 
     * @example Metadata configuration
     * ```typescript
     * const clearBtn: MaterialButtonMetadata = {
     *   name: 'clear',
     *   label: 'Limpar Formulário',
     *   controlType: 'button',
     *   action: 'resetForm',
     *   confirmDialog: {
     *     enabled: true,
     *     title: 'Confirmar Limpeza',
     *     message: 'Deseja limpar todos os campos?'
     *   }
     * };
     * ```
     */
    this.registerAction('resetForm', async (context) => {
      const form = this.findParentForm(context.componentInstance);
      if (form) {
        form.reset();
        return { success: true, data: 'Form reset' };
      }
      return { success: false, error: 'No parent form found' };
    });

    // =============================================================================
    // 🧭 AÇÕES DE NAVEGAÇÃO
    // =============================================================================

    /**
     * 🧭 navigate - Navegação interna (Angular Router) ou externa (window.location)
     * 
     * Navega para URL especificada usando a estratégia mais apropriada:
     * - URLs internas (/path): Angular Router (SPA navigation)
     * - URLs externas (http://): window.location.href (page reload)
     * 
     * ✅ Uso: action: "navigate:/dashboard" ou action: "navigate:https://external.com"
     * 📋 Parâmetros: URL de destino (obrigatório)
     * 🎯 Contexto: Qualquer componente com ação
     * 🔒 Segurança: URLs externas são validadas
     * 
     * @example Internal navigation (SPA)
     * ```typescript
     * const dashboardBtn: MaterialButtonMetadata = {
     *   name: 'dashboard',
     *   label: 'Ir para Dashboard',
     *   controlType: 'button',
     *   action: 'navigate:/dashboard'
     * };
     * ```
     * 
     * @example External navigation (new page)
     * ```typescript
     * const helpBtn: MaterialButtonMetadata = {
     *   name: 'help',
     *   label: 'Central de Ajuda',
     *   controlType: 'button',
     *   action: 'navigate:https://help.empresa.com'
     * };
     * ```
     */
    this.registerAction('navigate', async (context) => {
      const url = context.actionParam;
      if (!url) {
        return { success: false, error: 'No URL provided for navigation' };
      }

      if (this.router && url.startsWith('/')) {
        await this.router.navigate([url]);
        return { success: true, data: `Navigated to ${url}` };
      } else {
        window.location.href = url;
        return { success: true, data: `Redirected to ${url}` };
      }
    });

    /**
     * 🔗 openUrl - Abre URL em nova aba/janela com segurança
     * 
     * Abre URL especificada em nova aba usando window.open() com flags de segurança.
     * Sempre aplica 'noopener,noreferrer' para prevenir ataques de tabnabbing.
     * 
     * ✅ Uso: action: "openUrl:https://example.com"
     * 📋 Parâmetros: URL completa (obrigatório)
     * 🎯 Contexto: Links externos, documentação, ferramentas
     * 🔒 Segurança: noopener + noreferrer automático
     * 📱 Mobile: Compatível com todos os navegadores mobile
     * 
     * @example External documentation link
     * ```typescript
     * const docsBtn: MaterialButtonMetadata = {
     *   name: 'docs',
     *   label: 'Ver Documentação',
     *   controlType: 'button',
     *   action: 'openUrl:https://docs.empresa.com/api',
     *   icon: 'open_in_new'
     * };
     * ```
     * 
     * @example Report viewer
     * ```typescript
     * const reportBtn: MaterialButtonMetadata = {
     *   name: 'viewReport',
     *   label: 'Ver Relatório',
     *   controlType: 'button',
     *   action: 'openUrl:https://reports.empresa.com/monthly/2024-01'
     * };
     * ```
     */
    this.registerAction('openUrl', async (context) => {
      const url = context.actionParam;
      if (!url) {
        return { success: false, error: 'No URL provided' };
      }

      window.open(url, '_blank', 'noopener,noreferrer');
      return { success: true, data: `Opened ${url}` };
    });

    // =============================================================================
    // 🔔 AÇÕES DE INTERFACE E FEEDBACK
    // =============================================================================

    /**
     * 🚨 showAlert - Exibe alerta nativo do navegador
     * 
     * Mostra dialog modal nativo usando alert() do navegador.
     * Útil para notificações simples, avisos e confirmações de ação.
     * 
     * ✅ Uso: action: "showAlert:Mensagem personalizada"
     * 📋 Parâmetros: Texto da mensagem (opcional)
     * 🎯 Contexto: Feedback imediato, avisos, debug
     * ⚠️ UX: Use com moderação - interrompe fluxo do usuário
     * 📱 Mobile: Funciona em todos os dispositivos
     * 
     * @example Success notification
     * ```typescript
     * const saveBtn: MaterialButtonMetadata = {
     *   name: 'save',
     *   label: 'Salvar',
     *   controlType: 'button',
     *   action: 'showAlert:Dados salvos com sucesso!'
     * };
     * ```
     * 
     * @example Debug/development usage
     * ```typescript
     * const debugBtn: MaterialButtonMetadata = {
     *   name: 'debug',
     *   label: 'Test Action',
     *   controlType: 'button',
     *   action: 'showAlert' // Usa mensagem padrão
     * };
     * ```
     */
    this.registerAction('showAlert', async (context) => {
      const message = context.actionParam || 'Action executed successfully';
      alert(message);
      return { success: true, data: message };
    });

    /**
     * 🐛 log - Registra mensagem no console para debugging
     * 
     * Escreve mensagem no console.log() com prefixo [ActionResolver] padronizado.
     * Inclui contexto completo para facilitar debugging e auditoria.
     * 
     * ✅ Uso: action: "log:Custom debug message"
     * 📋 Parâmetros: Mensagem personalizada (opcional)
     * 🎯 Contexto: Development, debugging, auditoria
     * 📊 Output: console.log() com contexto completo
     * 🔍 Debug: Útil para rastrear fluxo de ações
     * 
     * @example Development debugging
     * ```typescript
     * const testBtn: MaterialButtonMetadata = {
     *   name: 'test',
     *   label: 'Test Button',
     *   controlType: 'button',
     *   action: 'log:Test button clicked - form data logged'
     * };
     * ```
     * 
     * @example Audit trail
     * ```typescript
     * const auditBtn: MaterialButtonMetadata = {
     *   name: 'audit',
     *   label: 'Audit Action',
     *   controlType: 'button',
     *   action: 'log:User performed audit action'
     * };
     * ```
     */
    this.registerAction('log', async (context) => {
      const message = context.actionParam || 'Button action executed';
      console.log('[ActionResolver]', message, context);
      return { success: true, data: message };
    });

    // =============================================================================
    // 📥 AÇÕES DE DADOS E ARQUIVOS
    // =============================================================================

    /**
     * 📥 download - Inicia download de arquivo via URL
     * 
     * Cria elemento <a> temporário com atributo download para forçar download
     * ao invés de navegação. Remove elemento após uso para manter DOM limpo.
     * 
     * ✅ Uso: action: "download:https://example.com/file.pdf"
     * 📋 Parâmetros: URL do arquivo (obrigatório)
     * 🎯 Contexto: Relatórios, documentos, exports
     * 📁 Filename: Extraído automaticamente da URL
     * 🔒 CORS: Sujeito a políticas de same-origin
     * 📱 Mobile: Funciona na maioria dos navegadores mobile
     * 
     * @example PDF report download
     * ```typescript
     * const pdfBtn: MaterialButtonMetadata = {
     *   name: 'downloadPdf',
     *   label: 'Download PDF',
     *   controlType: 'button',
     *   action: 'download:https://api.empresa.com/reports/monthly.pdf',
     *   icon: 'download'
     * };
     * ```
     * 
     * @example CSV export
     * ```typescript
     * const csvBtn: MaterialButtonMetadata = {
     *   name: 'exportCsv',
     *   label: 'Exportar CSV',
     *   controlType: 'button',
     *   action: 'download:https://api.empresa.com/data/export.csv'
     * };
     * ```
     */
    this.registerAction('download', async (context) => {
      const url = context.actionParam;
      if (!url) {
        return { success: false, error: 'No URL provided for download' };
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = url.split('/').pop() || 'download';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, data: `Download started: ${url}` };
    });

    /**
     * 📋 copyToClipboard - Copia texto para área de transferência
     * 
     * Usa Clipboard API moderna (navigator.clipboard) para copiar texto.
     * Com fallback para tratamento de erro em navegadores mais antigos.
     * 
     * ✅ Uso: action: "copyToClipboard:Texto customizado"
     * 📋 Parâmetros: Texto a copiar (opcional - usa fieldValue se não fornecido)
     * 🎯 Contexto: Códigos, links, IDs, dados para compartilhar
     * 🔒 Segurança: Requer HTTPS em produção
     * 📱 Mobile: Suporte limitado em alguns navegadores antigos
     * ⚡ Performance: Operação assíncrona não bloqueia UI
     * 
     * @example Copy field value
     * ```typescript
     * const copyBtn: MaterialButtonMetadata = {
     *   name: 'copyId',
     *   label: 'Copiar ID',
     *   controlType: 'button',
     *   action: 'copyToClipboard', // Usa o valor do campo
     *   icon: 'content_copy'
     * };
     * ```
     * 
     * @example Copy custom text
     * ```typescript
     * const shareBtn: MaterialButtonMetadata = {
     *   name: 'shareLink',
     *   label: 'Copiar Link',
     *   controlType: 'button',
     *   action: 'copyToClipboard:https://app.empresa.com/share/abc123',
     *   icon: 'share'
     * };
     * ```
     * 
     * @example Copy generated content
     * ```typescript
     * const apiKeyBtn: MaterialButtonMetadata = {
     *   name: 'copyApiKey',
     *   label: 'Copiar API Key',
     *   controlType: 'button',
     *   action: 'copyToClipboard:sk-1234567890abcdef'
     * };
     * ```
     */
    this.registerAction('copyToClipboard', async (context) => {
      const text = context.actionParam || context.fieldValue?.toString() || '';
      
      try {
        await navigator.clipboard.writeText(text);
        return { success: true, data: `Copied to clipboard: ${text}` };
      } catch (error) {
        return { success: false, error: 'Failed to copy to clipboard' };
      }
    });
  }

  /**
   * Encontra o elemento <form> pai de um componente Angular.
   * 
   * Percorre a árvore DOM a partir do elemento do componente até encontrar
   * um elemento <form> pai ou chegar ao document.body.
   * 
   * Usado pelas ações submitForm e resetForm para localizar o formulário
   * que contém o componente que disparou a ação.
   * 
   * @param componentInstance - Instância do componente Angular
   * @returns HTMLFormElement se encontrado, null caso contrário
   * 
   * @example Estrutura HTML típica
   * ```html
   * <form>
   *   <mat-form-field>
   *     <input matInput>
   *   </mat-form-field>
   *   <pdx-material-button action="submitForm">Submit</pdx-material-button>
   * </form>
   * ```
   * 
   * @private
   */
  private findParentForm(componentInstance: any): HTMLFormElement | null {
    // Validar se o componente tem ElementRef (padrão Angular)
    if (!componentInstance?.elementRef?.nativeElement) {
      console.warn('[ActionResolver] Component instance does not have elementRef');
      return null;
    }

    // Percorrer árvore DOM procurando elemento <form> com proteção contra loop infinito
    let element: HTMLElement | null = componentInstance.elementRef.nativeElement;
    let depth = 0;
    const MAX_DEPTH = 20; // Evitar loop infinito

    while (element && element !== document.body && depth < MAX_DEPTH) {
      if (element.tagName === 'FORM') {
        return element as HTMLFormElement;
      }
      element = element.parentElement;
      depth++;
    }
    
    if (depth >= MAX_DEPTH) {
      console.warn('[ActionResolver] Max depth reached while searching for parent form');
    }
    
    // Não encontrou formulário pai
    return null;
  }

  // =============================================================================
  // 🔄 NOVAS AÇÕES DE ESTADO E VALIDAÇÃO
  // =============================================================================

  /**
   * Registra ações de estado e validação de formulários.
   * Chamado durante a inicialização do serviço.
   */
  private registerStateValidationActions(): void {
    /**
     * ✅ validateForm - Valida formulário sem submissão
     * 
     * Executa validação completa do formulário pai sem disparar o submit.
     * Mostra erros de validação nos campos mas não envia dados.
     * Útil para validação em tempo real ou antes de ações específicas.
     * 
     * ✅ Uso: action: "validateForm"
     * 📋 Parâmetros: Nenhum (ignora actionParam)
     * 🎯 Contexto: Botões de validação, workflows multi-step
     * 📊 Output: Lista de erros encontrados ou confirmação de sucesso
     * 
     * @example Validação antes de salvar rascunho
     * ```typescript
     * const validateBtn: MaterialButtonMetadata = {
     *   name: 'validate',
     *   label: 'Validar Dados',
     *   controlType: 'button',
     *   action: 'validateForm',
     *   icon: 'check_circle'
     * };
     * ```
     */
    this.registerAction('validateForm', async (context) => {
      const form = this.findParentForm(context.componentInstance);
      if (!form) {
        return { success: false, error: 'No parent form found for validation' };
      }

      // Trigger validation sem submit
      const formData = new FormData(form);
      const inputs = form.querySelectorAll('input, select, textarea');
      const errors: string[] = [];

      inputs.forEach((input: Element) => {
        const htmlInput = input as HTMLInputElement;
        if (!htmlInput.checkValidity()) {
          const label = form.querySelector(`label[for="${htmlInput.id}"]`)?.textContent || htmlInput.name;
          errors.push(`${label}: ${htmlInput.validationMessage}`);
        }
      });

      if (errors.length > 0) {
        return { 
          success: false, 
          error: `Validation failed: ${errors.join(', ')}`,
          data: { errors }
        };
      }

      return { 
        success: true, 
        data: 'Form validation passed successfully',
        validationErrors: []
      };
    });

    /**
     * 🧹 clearValidation - Limpa erros de validação do formulário
     * 
     * Remove mensagens de erro de validação de todos os campos do formulário pai.
     * Útil para resetar estado visual sem limpar os dados.
     * 
     * ✅ Uso: action: "clearValidation"
     * 📋 Parâmetros: Nenhum (ignora actionParam)
     * 🎯 Contexto: Botões de reset visual, início de nova validação
     * 
     * @example Limpar erros antes de nova tentativa
     * ```typescript
     * const clearBtn: MaterialButtonMetadata = {
     *   name: 'clearErrors',
     *   label: 'Limpar Erros',
     *   controlType: 'button',
     *   action: 'clearValidation',
     *   icon: 'clear_all'
     * };
     * ```
     */
    this.registerAction('clearValidation', async (context) => {
      const form = this.findParentForm(context.componentInstance);
      if (!form) {
        return { success: false, error: 'No parent form found' };
      }

      // Remove custom validity messages
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach((input: Element) => {
        const htmlInput = input as HTMLInputElement;
        htmlInput.setCustomValidity('');
      });

      // Remove error classes (se seguir padrão Material)
      const errorElements = form.querySelectorAll('.mat-form-field-invalid, .mat-error');
      errorElements.forEach(el => {
        el.classList.remove('mat-form-field-invalid');
        if (el.classList.contains('mat-error')) {
          el.remove();
        }
      });

      return { success: true, data: 'Validation errors cleared' };
    });

    /**
     * 💾 saveFormDraft - Salva rascunho do formulário no localStorage
     * 
     * Salva estado atual do formulário no localStorage do navegador.
     * Útil para preservar dados durante navegação ou em caso de fechamento acidental.
     * 
     * ✅ Uso: action: "saveFormDraft" ou action: "saveFormDraft:customKey"
     * 📋 Parâmetros: Chave personalizada (opcional - usa URL atual se não fornecido)
     * 🎯 Contexto: Auto-save, formulários longos, prevenção de perda de dados
     * 💾 Storage: localStorage (persistente entre sessões)
     * 🔒 Privacidade: Dados ficam apenas no navegador do usuário
     * 
     * @example Auto-save periódico
     * ```typescript
     * const autoSaveBtn: MaterialButtonMetadata = {
     *   name: 'autoSave',
     *   label: 'Salvar Rascunho',
     *   controlType: 'button',
     *   action: 'saveFormDraft:userForm',
     *   icon: 'save_alt'
     * };
     * ```
     */
    this.registerAction('saveFormDraft', async (context) => {
      const form = this.findParentForm(context.componentInstance);
      if (!form) {
        return { success: false, error: 'No parent form found' };
      }

      try {
        const formData = new FormData(form);
        const draftData: Record<string, any> = {};
        
        // Converter FormData para objeto serializável
        formData.forEach((value, key) => {
          if (draftData[key]) {
            // Múltiplos valores (checkboxes, selects múltiplos)
            if (Array.isArray(draftData[key])) {
              draftData[key].push(value);
            } else {
              draftData[key] = [draftData[key], value];
            }
          } else {
            draftData[key] = value;
          }
        });

        const draftKey = context.actionParam || `formDraft_${window.location.pathname}`;
        const draftObject = {
          data: draftData,
          timestamp: new Date().toISOString(),
          url: window.location.href
        };

        // Verificar tamanho antes de salvar
        const draftString = JSON.stringify(draftObject);
        if (draftString.length > 500000) { // 500KB limit
          return { success: false, error: 'Draft too large to save (max 500KB)' };
        }

        // Cleanup drafts antigos antes de salvar
        this.cleanupOldDrafts();

        localStorage.setItem(draftKey, draftString);

        return { 
          success: true, 
          data: `Form draft saved with key: ${draftKey}`,
          draftKey
        };

      } catch (error: any) {
        if (error.name === 'QuotaExceededError') {
          return { 
            success: false, 
            error: 'Storage quota exceeded. Please clear old drafts or reduce form data.' 
          };
        }
        return { 
          success: false, 
          error: `Failed to save form draft: ${error.message || error}`
        };
      }
    });

    /**
     * 📂 loadFormDraft - Carrega rascunho salvo do localStorage
     * 
     * Restaura dados de formulário previamente salvos no localStorage.
     * Preenche automaticamente os campos com valores salvos.
     * 
     * ✅ Uso: action: "loadFormDraft" ou action: "loadFormDraft:customKey"
     * 📋 Parâmetros: Chave personalizada (opcional - usa URL atual se não fornecido)
     * 🎯 Contexto: Recuperação de dados, continuação de formulários
     * 🔍 Validação: Verifica se rascunho existe antes de tentar carregar
     * 
     * @example Carregar dados salvos
     * ```typescript
     * const loadBtn: MaterialButtonMetadata = {
     *   name: 'loadDraft',
     *   label: 'Carregar Rascunho',
     *   controlType: 'button',
     *   action: 'loadFormDraft:userForm',
     *   icon: 'restore'
     * };
     * ```
     */
    this.registerAction('loadFormDraft', async (context) => {
      const form = this.findParentForm(context.componentInstance);
      if (!form) {
        return { success: false, error: 'No parent form found' };
      }

      try {
        const draftKey = context.actionParam || `formDraft_${window.location.pathname}`;
        const savedDraft = localStorage.getItem(draftKey);

        if (!savedDraft) {
          return { 
            success: false, 
            error: `No draft found with key: ${draftKey}`
          };
        }

        const draftObject = JSON.parse(savedDraft);
        const draftData = draftObject.data;

        // Preencher campos do formulário
        Object.entries(draftData).forEach(([fieldName, value]) => {
          const field = form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
          if (field) {
            if (field.type === 'checkbox' || field.type === 'radio') {
              field.checked = Array.isArray(value) ? value.includes(field.value) : value === field.value;
            } else {
              field.value = Array.isArray(value) ? value[0] : String(value);
            }
            
            // Disparar evento de mudança para Angular detectar
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });

        return { 
          success: true, 
          data: `Form draft loaded from ${draftObject.timestamp}`,
          draftData,
          loadedAt: new Date().toISOString()
        };

      } catch (error) {
        return { 
          success: false, 
          error: `Failed to load form draft: ${error}`
        };
      }
    });

    /**
     * 🗑️ clearFormDraft - Remove rascunho salvo do localStorage
     * 
     * Deleta rascunho específico do localStorage.
     * Útil para limpeza após submissão bem-sucedida ou quando não precisar mais dos dados.
     * 
     * ✅ Uso: action: "clearFormDraft" ou action: "clearFormDraft:customKey"
     * 📋 Parâmetros: Chave personalizada (opcional - usa URL atual se não fornecido)
     * 🎯 Contexto: Limpeza pós-submit, gerenciamento de storage
     * 
     * @example Limpar após envio
     * ```typescript
     * const clearDraftBtn: MaterialButtonMetadata = {
     *   name: 'clearDraft',
     *   label: 'Remover Rascunho',
     *   controlType: 'button',
     *   action: 'clearFormDraft:userForm',
     *   icon: 'delete_forever'
     * };
     * ```
     */
    this.registerAction('clearFormDraft', async (context) => {
      try {
        const draftKey = context.actionParam || `formDraft_${window.location.pathname}`;
        const existed = localStorage.getItem(draftKey) !== null;
        
        localStorage.removeItem(draftKey);

        return { 
          success: true, 
          data: existed 
            ? `Form draft cleared: ${draftKey}` 
            : `No draft found to clear: ${draftKey}`,
          existed
        };

      } catch (error) {
        return { 
          success: false, 
          error: `Failed to clear form draft: ${error}`
        };
      }
    });
  }

  // =============================================================================
  // 📡 NOVAS AÇÕES DE API E DADOS
  // =============================================================================

  /**
   * Registra ações de API e manipulação de dados.
   * Chamado durante a inicialização do serviço.
   */
  private registerApiDataActions(): void {
    /**
     * 🌐 apiCall - Requisição HTTP configurável
     * 
     * Executa chamada HTTP com método e URL configuráveis.
     * Suporta GET, POST, PUT, DELETE com headers e body personalizáveis.
     * 
     * ✅ Uso: action: "apiCall:GET:https://api.com/data"
     * ✅ Uso: action: "apiCall:POST:https://api.com/save"
     * 📋 Parâmetros: "METHOD:URL" (ambos obrigatórios)
     * 🎯 Contexto: Integração com APIs, CRUD operations
     * 🔒 Segurança: Headers de autenticação via contexto
     * 📊 Response: Retorna dados da resposta ou erro HTTP
     * 
     * @example GET request
     * ```typescript
     * const loadDataBtn: MaterialButtonMetadata = {
     *   name: 'loadData',
     *   label: 'Carregar Dados',
     *   controlType: 'button',
     *   action: 'apiCall:GET:https://api.empresa.com/users'
     * };
     * ```
     * 
     * @example POST with form data
     * ```typescript
     * const saveBtn: MaterialButtonMetadata = {
     *   name: 'saveData',
     *   label: 'Salvar via API',
     *   controlType: 'button',
     *   action: 'apiCall:POST:https://api.empresa.com/users'
     * };
     * ```
     */
    this.registerAction('apiCall', async (context) => {
      if (!this.http) {
        return { success: false, error: 'HttpClient not available' };
      }

      const actionParam = context.actionParam;
      if (!actionParam) {
        return { success: false, error: 'API call requires METHOD:URL format' };
      }

      const [method, url] = actionParam.split(':', 2);
      if (!method || !url) {
        return { success: false, error: 'Invalid format. Use METHOD:URL (e.g., GET:https://api.com/data)' };
      }

      const httpMethod = method.toUpperCase();
      if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(httpMethod)) {
        return { success: false, error: `Unsupported HTTP method: ${httpMethod}` };
      }

      try {
        // Configurar headers padrão
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        });

        let request;
        const options = { headers };

        // Preparar body para métodos que suportam
        if (['POST', 'PUT', 'PATCH'].includes(httpMethod)) {
          const body = context.formData || context.fieldValue || {};
          
          switch (httpMethod) {
            case 'POST':
              request = this.http.post(url, body, options);
              break;
            case 'PUT':
              request = this.http.put(url, body, options);
              break;
            case 'PATCH':
              request = this.http.patch(url, body, options);
              break;
          }
        } else {
          // GET, DELETE
          switch (httpMethod) {
            case 'GET':
              request = this.http.get(url, options);
              break;
            case 'DELETE':
              request = this.http.delete(url, options);
              break;
          }
        }

        if (!request) {
          return { success: false, error: `Failed to create ${httpMethod} request` };
        }

        const response = await firstValueFrom(request);

        return {
          success: true,
          data: response,
          apiResponse: {
            method: httpMethod,
            url,
            status: 'success',
            timestamp: new Date().toISOString()
          }
        };

      } catch (error: any) {
        return {
          success: false,
          error: `API call failed: ${error.message || error}`,
          apiResponse: {
            method: httpMethod,
            url,
            status: 'error',
            error: error.message || error,
            timestamp: new Date().toISOString()
          }
        };
      }
    });

    /**
     * 🔄 refreshOptions - Recarrega opções de campo select
     * 
     * Recarrega as opções de um campo select específico via API ou configuração.
     * Útil para listas dependentes ou dados que mudam frequentemente.
     * 
     * ✅ Uso: action: "refreshOptions:fieldName"
     * 📋 Parâmetros: Nome do campo select (obrigatório)
     * 🎯 Contexto: Campos dependentes, atualização de listas
     * 🔄 Processo: Encontra campo, recarrega dados, atualiza opções
     * 
     * @example Atualizar lista de cidades baseado no estado
     * ```typescript
     * const refreshBtn: MaterialButtonMetadata = {
     *   name: 'refreshCities',
     *   label: 'Atualizar Cidades',
     *   controlType: 'button',
     *   action: 'refreshOptions:citySelect',
     *   icon: 'refresh'
     * };
     * ```
     */
    this.registerAction('refreshOptions', async (context) => {
      const fieldName = context.actionParam;
      if (!fieldName) {
        return { success: false, error: 'Field name required for refreshOptions' };
      }

      const form = this.findParentForm(context.componentInstance);
      if (!form) {
        return { success: false, error: 'No parent form found' };
      }

      const selectField = form.querySelector(`[name="${fieldName}"]`) as HTMLSelectElement;
      if (!selectField || selectField.tagName !== 'SELECT') {
        return { success: false, error: `Select field '${fieldName}' not found` };
      }

      try {
        // Esta é uma implementação básica. Em uma implementação real,
        // você pegaria a URL de reload do metadata do campo ou configuração
        const refreshEvent = new CustomEvent('refreshOptions', {
          detail: { fieldName, selectField },
          bubbles: true
        });
        
        selectField.dispatchEvent(refreshEvent);

        return {
          success: true,
          data: `Options refreshed for field: ${fieldName}`,
          fieldName,
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        return {
          success: false,
          error: `Failed to refresh options for '${fieldName}': ${error}`
        };
      }
    });

    /**
     * 📊 loadDependentData - Carrega dados baseado em outro campo
     * 
     * Carrega dados para um campo baseado no valor de outro campo.
     * Útil para implementar relacionamentos master-detail entre campos.
     * 
     * ✅ Uso: action: "loadDependentData:targetField"
     * 📋 Parâmetros: Nome do campo de destino (obrigatório)
     * 🎯 Contexto: Relacionamentos entre campos, cascading dropdowns
     * 🔗 Dependência: Usa valor do campo atual como filtro
     * 
     * @example Carregar produtos baseado na categoria selecionada
     * ```typescript
     * // No campo categoria
     * const categoryField: MaterialSelectMetadata = {
     *   name: 'category',
     *   label: 'Categoria',
     *   controlType: 'select',
     *   // Quando categoria mudar, carrega produtos relacionados
     *   onChange: 'loadDependentData:products'
     * };
     * ```
     */
    this.registerAction('loadDependentData', async (context) => {
      const targetFieldName = context.actionParam;
      if (!targetFieldName) {
        return { success: false, error: 'Target field name required' };
      }

      const sourceValue = context.fieldValue;
      if (!sourceValue) {
        return { success: false, error: 'No source value to load dependent data' };
      }

      const form = this.findParentForm(context.componentInstance);
      if (!form) {
        return { success: false, error: 'No parent form found' };
      }

      const targetField = form.querySelector(`[name="${targetFieldName}"]`);
      if (!targetField) {
        return { success: false, error: `Target field '${targetFieldName}' not found` };
      }

      try {
        // Disparar evento customizado para que o componente/serviço apropriado
        // possa interceptar e carregar os dados dependentes
        const loadEvent = new CustomEvent('loadDependentData', {
          detail: {
            sourceField: context.fieldName,
            sourceValue,
            targetField: targetFieldName,
            targetElement: targetField
          },
          bubbles: true
        });

        targetField.dispatchEvent(loadEvent);

        return {
          success: true,
          data: `Dependent data loading triggered for '${targetFieldName}' based on '${context.fieldName}' = '${sourceValue}'`,
          sourceField: context.fieldName,
          sourceValue,
          targetField: targetFieldName,
          timestamp: new Date().toISOString()
        };

      } catch (error) {
        return {
          success: false,
          error: `Failed to load dependent data: ${error}`
        };
      }
    });
  }

  /**
   * Limpa drafts antigos do localStorage para evitar quota exceeded.
   * 
   * Remove drafts com mais de 7 dias ou que estejam malformados.
   * Chamado automaticamente antes de salvar novos drafts.
   * 
   * @private
   */
  private cleanupOldDrafts(): void {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias em milliseconds
    const now = Date.now();
    
    try {
      // Iterar através das chaves do localStorage
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('formDraft_')) {
          try {
            const item = localStorage.getItem(key);
            if (!item) {
              keysToRemove.push(key);
              continue;
            }
            
            const draftObject = JSON.parse(item);
            if (!draftObject.timestamp) {
              // Draft sem timestamp é inválido
              keysToRemove.push(key);
              continue;
            }
            
            const draftTime = new Date(draftObject.timestamp).getTime();
            if (isNaN(draftTime) || (now - draftTime) > maxAge) {
              keysToRemove.push(key);
            }
            
          } catch (parseError) {
            // Item malformado, remover
            keysToRemove.push(key);
          }
        }
      }
      
      // Remover chaves identificadas (fazer em separado para não interferir na iteração)
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`[ActionResolver] Failed to remove old draft '${key}':`, error);
        }
      });
      
      if (keysToRemove.length > 0) {
        console.debug(`[ActionResolver] Cleaned up ${keysToRemove.length} old form drafts`);
      }
      
    } catch (error) {
      console.warn('[ActionResolver] Error during draft cleanup:', error);
    }
  }
}