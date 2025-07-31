import { Injectable } from '@angular/core';
import { BaseDynamicComponent } from '../base/base-dynamic.component';
import { ComponentMetadata } from '@praxis/core';

/**
 * Facade service that exposes {@link BaseDynamicComponent} features for
 * composition-based usage. It simply extends the base component class with an
 * empty implementation of the {@code onComponentInit} lifecycle hook so it can
 * be injected and used by other classes without inheritance.
 */
@Injectable({ providedIn: 'root' })
export class DynamicComponentService<
  T extends ComponentMetadata = ComponentMetadata,
> extends BaseDynamicComponent<T> {
  protected onComponentInit(): void {}
}
