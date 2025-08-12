import {
  Component,
  ComponentRef,
  HostListener,
  Injector,
  Type,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  CdkPortalOutlet,
  ComponentPortal,
  PortalModule,
} from '@angular/cdk/portal';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { SettingsPanelRef } from './settings-panel.ref';

@Component({
  selector: 'praxis-settings-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PortalModule,
    CdkTrapFocus,
  ],
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.scss'],
})
export class SettingsPanelComponent {
  title = '';
  width = 720;
  ref!: SettingsPanelRef;
  contentRef?: ComponentRef<any>;

  @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet!: CdkPortalOutlet;

  attachContent(
    component: Type<any>,
    injector: Injector,
    ref: SettingsPanelRef,
  ): void {
    this.ref = ref;
    const portal = new ComponentPortal(component, null, injector);
    this.contentRef = this.portalOutlet.attachComponentPortal(portal);
  }

  onReset(): void {
    this.contentRef?.instance?.reset?.();
    this.ref.reset();
  }

  onApply(): void {
    const value = this.contentRef?.instance?.getSettingsValue?.();
    this.ref.apply(value);
  }

  onSave(): void {
    const value = this.contentRef?.instance?.getSettingsValue?.();
    this.ref.save(value);
  }

  onCancel(): void {
    this.ref.close();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.ref.close();
    } else if (event.key === 'Enter' && event.ctrlKey) {
      this.onApply();
    } else if ((event.key === 's' || event.key === 'S') && event.ctrlKey) {
      event.preventDefault();
      this.onSave();
    }
  }
}
