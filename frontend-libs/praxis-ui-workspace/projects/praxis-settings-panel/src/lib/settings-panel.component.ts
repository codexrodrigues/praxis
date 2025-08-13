import {
  Component,
  ComponentRef,
  HostListener,
  Injector,
  Type,
  ViewChild,
  ChangeDetectorRef,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SettingsPanelSection } from './settings-panel.types';

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
  private static nextId = 0;
  titleId = `praxis-settings-panel-title-${SettingsPanelComponent.nextId++}`;
  disableSaveButton = false;
  sections: SettingsPanelSection[] = [];
  activeSectionIndex = 0;

  @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet!: CdkPortalOutlet;

  constructor(private cdr: ChangeDetectorRef) {}

  attachContent(
    component: Type<any>,
    injector: Injector,
    ref: SettingsPanelRef,
  ): void {
    this.ref = ref;
    const portal = new ComponentPortal(component, null, injector);
    this.contentRef = this.portalOutlet.attachComponentPortal(portal);

    const instance: any = this.contentRef.instance;
    if ('canSave$' in instance && instance.canSave$) {
      instance.canSave$
        .pipe(takeUntilDestroyed())
        .subscribe((v: boolean) => (this.disableSaveButton = !v));
    }

    if ('sections$' in instance && instance.sections$) {
      instance.sections$
        .pipe(takeUntilDestroyed())
        .subscribe((s: SettingsPanelSection[]) => {
          this.sections = s;
          this.cdr.markForCheck();
        });
    } else if ('sections' in instance && Array.isArray(instance.sections)) {
      this.sections = instance.sections;
      this.cdr.markForCheck();
    }
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
    const instance: any = this.contentRef?.instance;
    instance?.onSave?.();
    const value = instance?.getSettingsValue?.();
    this.ref.save(value);
  }

  onCancel(): void {
    this.ref.close('cancel');
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.ref.close('esc');
    } else if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.onApply();
    } else if ((event.key === 's' || event.key === 'S') && event.ctrlKey) {
      event.preventDefault();
      this.onSave();
    }
  }
}
