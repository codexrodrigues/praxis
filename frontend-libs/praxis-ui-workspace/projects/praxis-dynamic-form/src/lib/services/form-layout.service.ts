import { Injectable, InjectionToken, Inject, Optional } from '@angular/core';
import { FormLayout } from '../models/form-layout.model';

export interface FormLayoutStorage {
  load(formId: string): FormLayout | null;
  save(formId: string, layout: FormLayout): void;
}

export const LOCAL_STORAGE_FORM_LAYOUT_PROVIDER: FormLayoutStorage = {
  load(formId: string): FormLayout | null {
    const raw = localStorage.getItem(`praxis-layout-${formId}`);
    return raw ? (JSON.parse(raw) as FormLayout) : null;
  },
  save(formId: string, layout: FormLayout): void {
    localStorage.setItem(`praxis-layout-${formId}`, JSON.stringify(layout));
  }
};

export const FORM_LAYOUT_STORAGE = new InjectionToken<FormLayoutStorage>('FORM_LAYOUT_STORAGE');

@Injectable({ providedIn: 'root' })
export class FormLayoutService {
  private provider: FormLayoutStorage;

  constructor(@Optional() @Inject(FORM_LAYOUT_STORAGE) provider?: FormLayoutStorage) {
    this.provider = provider ?? LOCAL_STORAGE_FORM_LAYOUT_PROVIDER;
  }

  loadLayout(formId: string): FormLayout | null {
    return this.provider.load(formId);
  }

  saveLayout(formId: string, layout: FormLayout): void {
    this.provider.save(formId, layout);
  }
}
