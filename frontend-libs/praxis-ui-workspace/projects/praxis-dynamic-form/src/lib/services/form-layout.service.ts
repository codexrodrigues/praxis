import { Injectable, Inject, Optional } from '@angular/core';
import { FormLayout, ConfigStorage, CONFIG_STORAGE } from '@praxis/core';

@Injectable({ providedIn: 'root' })
export class FormLayoutService {
  constructor(
    @Optional() @Inject(CONFIG_STORAGE) private storage?: ConfigStorage,
  ) {}

  loadLayout(formId: string): FormLayout | null {
    return (
      this.storage?.loadConfig<FormLayout>(`praxis-layout-${formId}`) ?? null
    );
  }

  saveLayout(formId: string, layout: FormLayout): void {
    this.storage?.saveConfig(`praxis-layout-${formId}`, layout);
  }

  clearLayout(formId: string): void {
    this.storage?.clearConfig(`praxis-layout-${formId}`);
  }
}
