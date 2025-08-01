import { Injectable } from '@angular/core';
import {
  BaseDynamicComponent,
  ComponentState,
  LogLevel,
} from '../base/base-dynamic.component';
import { ComponentMetadata } from '@praxis/core';

/**
 * Facade service that exposes {@link BaseDynamicComponent} features for
 * composition-based usage. It simply extends the base component class with an
 * empty implementation of the {@code onComponentInit} lifecycle hook so it can
 * be injected and used by other classes without inheritance.
 */
@Injectable()
export class DynamicComponentService<
  T extends ComponentMetadata = ComponentMetadata,
> extends BaseDynamicComponent<T> {
  protected onComponentInit(): void {}

  /** Exposes the metadata signal */
  metadataSignal() {
    return this.metadata;
  }

  /** Exposes the component ID signal */
  componentIdSignal() {
    return this.componentId;
  }

  /** Exposes the component state signal */
  componentStateSignal() {
    return this.componentState;
  }

  /** Returns the current CSS classes */
  getCssClasses(): string {
    return this.cssClasses();
  }

  /** Returns whether debug mode is active */
  getIsDebugMode(): boolean {
    return this.isDebugMode();
  }

  /** Public wrapper around the protected log method */
  logMessage(level: LogLevel, message: string, data?: any): void {
    this.log(level, message, data);
  }

  /**
   * Updates the underlying component metadata
   */
  updateMetadata(metadata: T): void {
    this.setMetadata(metadata);
  }
}
