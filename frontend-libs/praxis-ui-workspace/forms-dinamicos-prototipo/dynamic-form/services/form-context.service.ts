// field-metadata-sharing.service.ts
  import { Injectable } from '@angular/core';
  import { BehaviorSubject, Observable } from 'rxjs';
  import { FieldMetadata } from '../../models/field-metadata.model';
import { FormRuleContext,FormLayoutRule } from '../../models/form-layout.model';

@Injectable({
  providedIn: 'root'
})
export class FormContextService {
  // Keeping your existing properties
  private fieldsByContext = new Map<string, BehaviorSubject<FieldMetadata[]>>();
  private currentContext = new BehaviorSubject<string>('default');
  private formRulesByContext = new Map<string, FormLayoutRule[]>();


  // Adding new property for component instances
  private componentsByContext = new Map<string, Map<string, any>>();

  // Existing methods
  getCurrentContext(): string {
    return this.currentContext.value;
  }

  setContext(context: string): void {
    this.currentContext.next(context);
    // Initialize field context if not exists
    if (!this.fieldsByContext.has(context)) {
      this.fieldsByContext.set(context, new BehaviorSubject<FieldMetadata[]>([]));
    }
    // Initialize component context if not exists
    if (!this.componentsByContext.has(context)) {
      this.componentsByContext.set(context, new Map<string, any>());
    }
    // Inicializa as regras do contexto se não existirem
    if (!this.formRulesByContext.has(context)) {
      this.formRulesByContext.set(context, []);
    }
  }

  getAvailableFields$(): Observable<FieldMetadata[]> {
    const context = this.currentContext.value;
    if (!this.fieldsByContext.has(context)) {
      this.fieldsByContext.set(context, new BehaviorSubject<FieldMetadata[]>([]));
    }
    return this.fieldsByContext.get(context)!.asObservable();
  }

  setAvailableFields(fields: FieldMetadata[]): void {
    const context = this.currentContext.value;
    if (!this.fieldsByContext.has(context)) {
      this.fieldsByContext.set(context, new BehaviorSubject<FieldMetadata[]>([]));
    }
    this.fieldsByContext.get(context)!.next(fields);
  }

  // New methods for component instance management
  registerFieldComponent(fieldName: string, component: any): void {
    const context = this.currentContext.value;
    if (!this.componentsByContext.has(context)) {
      this.componentsByContext.set(context, new Map<string, any>());
    }
    this.componentsByContext.get(context)!.set(fieldName, component);
  }

  getFieldComponent(fieldName: string): any {
    const context = this.currentContext.value;
    if (!this.componentsByContext.has(context)) {
      return null;
    }
    return this.componentsByContext.get(context)!.get(fieldName) || null;
  }

  unregisterFieldComponent(fieldName: string): void {
    const context = this.currentContext.value;
    if (this.componentsByContext.has(context)) {
      this.componentsByContext.get(context)!.delete(fieldName);
    }
  }


  /**
   * Define as regras para o contexto atual
   *
   * @param rules - Lista de regras a serem armazenadas para o contexto atual
   */
  setFormRules(rules: FormLayoutRule[]): void {
    const context = this.currentContext.value;
    this.formRulesByContext.set(context, rules);
  }

  /**
   * Busca uma regra específica pelo seu ID
   *
   * @param ruleId - ID da regra a ser buscada
   * @returns A regra encontrada ou undefined se não existir
   */
  getFormRuleById(ruleId: string): FormLayoutRule | undefined {
    const context = this.currentContext.value;
    const rules = this.formRulesByContext.get(context) || [];
    return rules.find(rule => rule.id === ruleId);
  }

  /**
   * Busca todas as regras para um determinado contexto de regra (visibility, required, etc)
   *
   * @param ruleContext - O contexto da regra (visibility, required, readOnly, etc)
   * @returns Lista de regras que correspondem ao contexto especificado
   */
  getFormRulesByContext(ruleContext: FormRuleContext): FormLayoutRule[] {
    const currentContext = this.currentContext.value;
    const rules = this.formRulesByContext.get(currentContext) || [];
    return rules.filter(rule => rule.context === ruleContext);
  }



}
