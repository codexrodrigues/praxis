import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FieldMetadata } from '@praxis/core';
import { FormLayoutRule, FormRuleContext } from '../models/form-layout.model';

@Injectable({ providedIn: 'root' })
export class FormContextService {
  private fieldsByContext = new Map<string, BehaviorSubject<FieldMetadata[]>>();
  private componentsByContext = new Map<string, Map<string, any>>();
  private formRulesByContext = new Map<string, FormLayoutRule[]>();
  private currentContext = new BehaviorSubject<string>('default');

  getCurrentContext(): string {
    return this.currentContext.value;
  }

  setContext(context: string): void {
    this.currentContext.next(context);
    if (!this.fieldsByContext.has(context)) {
      this.fieldsByContext.set(context, new BehaviorSubject<FieldMetadata[]>([]));
    }
    if (!this.componentsByContext.has(context)) {
      this.componentsByContext.set(context, new Map<string, any>());
    }
    if (!this.formRulesByContext.has(context)) {
      this.formRulesByContext.set(context, []);
    }
  }

  getAvailableFields$(): Observable<FieldMetadata[]> {
    const ctx = this.currentContext.value;
    if (!this.fieldsByContext.has(ctx)) {
      this.fieldsByContext.set(ctx, new BehaviorSubject<FieldMetadata[]>([]));
    }
    return this.fieldsByContext.get(ctx)!.asObservable();
  }

  setAvailableFields(fields: FieldMetadata[]): void {
    const ctx = this.currentContext.value;
    if (!this.fieldsByContext.has(ctx)) {
      this.fieldsByContext.set(ctx, new BehaviorSubject<FieldMetadata[]>([]));
    }
    this.fieldsByContext.get(ctx)!.next(fields);
  }

  registerFieldComponent(fieldName: string, component: any): void {
    const ctx = this.currentContext.value;
    if (!this.componentsByContext.has(ctx)) {
      this.componentsByContext.set(ctx, new Map<string, any>());
    }
    this.componentsByContext.get(ctx)!.set(fieldName, component);
  }

  getFieldComponent(fieldName: string): any | null {
    const ctx = this.currentContext.value;
    return this.componentsByContext.get(ctx)?.get(fieldName) ?? null;
  }

  unregisterFieldComponent(fieldName: string): void {
    const ctx = this.currentContext.value;
    this.componentsByContext.get(ctx)?.delete(fieldName);
  }

  setFormRules(rules: FormLayoutRule[]): void {
    this.formRulesByContext.set(this.currentContext.value, rules);
  }

  getFormRuleById(ruleId: string): FormLayoutRule | undefined {
    const rules = this.formRulesByContext.get(this.currentContext.value) || [];
    return rules.find(r => r.id === ruleId);
  }

  getFormRulesByContext(ruleContext: FormRuleContext): FormLayoutRule[] {
    const rules = this.formRulesByContext.get(this.currentContext.value) || [];
    return rules.filter(r => r.context === ruleContext);
  }
}
