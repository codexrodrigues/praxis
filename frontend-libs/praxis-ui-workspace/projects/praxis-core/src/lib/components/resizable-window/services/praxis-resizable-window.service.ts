// praxis-resizable-window.service.ts
import { Injectable, InjectionToken, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import { PraxisResizableWindowComponent } from '../praxis-resizable-window.component';

export const WINDOW_DATA = new InjectionToken<any>('WINDOW_DATA');
// WINDOW_REF token will be defined after PraxisResizableWindowRef class

export interface WindowConfig {
  title?: string;
  contentComponent?: Type<any>;
  contentTemplate?: TemplateRef<any>;
  viewContainerRef?: ViewContainerRef;
  data?: any;
  initialWidth?: string;
  initialHeight?: string;
  minWidth?: string;
  minHeight?: string;
  hasBackdrop?: boolean;
  disableResize?: boolean;
  disableMaximize?: boolean;
  autoCenterAfterResize?: boolean;
  disableTransitions?: boolean;
  enableTouch?: boolean;
  minDragDistance?: number;
  enableInertia?: boolean;
  inertiaFriction?: number;
  inertiaMultiplier?: number;
  bounceFactor?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PraxisResizableWindowService {

  constructor(private overlay: Overlay) {}

  open(config: WindowConfig): PraxisResizableWindowRef {
    const overlayConfig: OverlayConfig = {
      hasBackdrop: config.hasBackdrop ?? true,
      backdropClass: 'praxis-backdrop',
      panelClass: 'praxis-resizable-pane',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width: config.initialWidth ?? '80vw',
      height: config.initialHeight ?? '80vh',
    };

    const overlayRef = this.overlay.create(overlayConfig);

    const portal = new ComponentPortal(PraxisResizableWindowComponent);
    const componentRef = overlayRef.attach(portal);

    // Set inputs
    componentRef.instance.title = config.title ?? 'Janela';
    componentRef.instance.initialWidth = config.initialWidth ?? '80vw';
    componentRef.instance.initialHeight = config.initialHeight ?? '80vh';
    componentRef.instance.minWidth = config.minWidth ?? '320px';
    componentRef.instance.minHeight = config.minHeight ?? '400px';
    componentRef.instance.hasBackdrop = config.hasBackdrop ?? true;
    componentRef.instance.disableResize = config.disableResize ?? false;
    componentRef.instance.disableMaximize = config.disableMaximize ?? false;
    componentRef.instance.autoCenterAfterResize = config.autoCenterAfterResize ?? false;
    componentRef.instance.disableTransitions = config.disableTransitions ?? false;
    componentRef.instance.enableTouch = config.enableTouch ?? false;
    componentRef.instance.minDragDistance = config.minDragDistance ?? 5;
    componentRef.instance.enableInertia = config.enableInertia ?? false;
    componentRef.instance.inertiaFriction = config.inertiaFriction ?? 0.95;
    componentRef.instance.inertiaMultiplier = config.inertiaMultiplier ?? 10;
    componentRef.instance.bounceFactor = config.bounceFactor ?? 0;
    componentRef.instance.data = config.data;
    componentRef.instance.overlayRef = overlayRef;

    const ref = new PraxisResizableWindowRef(overlayRef, componentRef.instance);
    
    if (config.contentComponent) {
      componentRef.instance.attachContent(config.contentComponent, ref);
    } else if (config.contentTemplate && config.viewContainerRef) {
      componentRef.instance.attachTemplate(config.contentTemplate, config.viewContainerRef, config.data);
    }

    // Force recenter after content is attached
    setTimeout(() => {
      overlayRef.updatePositionStrategy(
        this.overlay.position()
          .global()
          .centerHorizontally()
          .centerVertically()
      );
    }, 0);

    return ref;
  }
}

export class PraxisResizableWindowRef {
  opened = new Subject<void>();
  closed = new Subject<any>();

  constructor(private overlayRef: OverlayRef, private component: PraxisResizableWindowComponent) {
    component.opened.subscribe(() => this.opened.next());
    component.closed.subscribe(result => {
      this.closed.next(result);
      this.closed.complete();
      this.overlayRef.dispose();
    });
  }

  close(result?: any): void {
    this.component.close(result);
  }
}

// Define WINDOW_REF token after the class is declared
export const WINDOW_REF = new InjectionToken<PraxisResizableWindowRef>('WINDOW_REF');
