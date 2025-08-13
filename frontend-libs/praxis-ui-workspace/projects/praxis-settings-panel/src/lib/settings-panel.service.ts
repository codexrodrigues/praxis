import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SettingsPanelComponent } from './settings-panel.component';
import { SettingsPanelRef } from './settings-panel.ref';
import {
  SettingsPanelCloseReason,
  SettingsPanelConfig,
} from './settings-panel.types';
import {
  SETTINGS_PANEL_DATA,
  SETTINGS_PANEL_REF,
} from './settings-panel.tokens';

@Injectable({ providedIn: 'root' })
export class SettingsPanelService {
  private currentRef?: SettingsPanelRef;

  constructor(
    private overlay: Overlay,
    private injector: Injector,
  ) {}

  /**
   * Opens a new settings panel. If another panel is already open it will be
   * closed before the new one is created. Future improvements may reuse the
   * same overlay when the provided id matches.
   */
  open(config: SettingsPanelConfig): SettingsPanelRef {
    if (this.currentRef) {
      this.currentRef.close('cancel');
    }

    const overlayConfig: OverlayConfig = {
      hasBackdrop: true,
      backdropClass: 'praxis-settings-panel-backdrop',
      positionStrategy: this.overlay.position().global().top('0').right('0'),
      height: '100vh',
      scrollStrategy: this.overlay.scrollStrategies.block(),
    };

    const overlayRef = this.overlay.create(overlayConfig);
    const ref = new SettingsPanelRef(overlayRef);
    ref.updateSize(config.width ?? 720);

    const panelPortal = new ComponentPortal(SettingsPanelComponent);
    const panelRef = overlayRef.attach(panelPortal);
    panelRef.instance.title = config.title;
    panelRef.instance.width = config.width ?? 720;

    const injector = Injector.create({
      providers: [
        { provide: SETTINGS_PANEL_DATA, useValue: config.content.inputs },
        { provide: SETTINGS_PANEL_REF, useValue: ref },
      ],
      parent: this.injector,
    });
    panelRef.instance.attachContent(config.content.component, injector, ref);

    overlayRef.backdropClick().subscribe(() => ref.close('backdrop'));
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        ref.close('esc');
      }
    });
    ref.closed$.subscribe(() => {
      if (this.currentRef === ref) {
        this.currentRef = undefined;
      }
    });

    this.currentRef = ref;
    return ref;
  }

  close(reason: SettingsPanelCloseReason = 'cancel'): void {
    this.currentRef?.close(reason);
    this.currentRef = undefined;
  }
}
