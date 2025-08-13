import {
  Component,
  ComponentRef,
  HostListener,
  Injector,
  Type,
  ViewChild,
  ChangeDetectorRef,
  ViewContainerRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { SettingsPanelRef } from './settings-panel.ref';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'praxis-settings-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CdkTrapFocus,
  ],
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPanelComponent {
  title = '';
  expanded = false;
  ref!: SettingsPanelRef;
  contentRef?: ComponentRef<any>;
  private static nextId = 0;
  titleId = `praxis-settings-panel-title-${SettingsPanelComponent.nextId++}`;
  disableSaveButton = false;

  @ViewChild('contentHost', { read: ViewContainerRef, static: true })
  private contentHost!: ViewContainerRef;

  constructor(private cdr: ChangeDetectorRef) {}

  attachContent(
    component: Type<any>,
    injector: Injector,
    ref: SettingsPanelRef,
  ): void {
    this.ref = ref;
    this.contentRef = this.contentHost.createComponent(component, {
      injector,
    });

    const instance: any = this.contentRef.instance;
    if ('canSave$' in instance && instance.canSave$) {
      instance.canSave$.pipe(takeUntilDestroyed()).subscribe((v: boolean) => {
        this.disableSaveButton = !v;
        this.cdr.detectChanges();
      });
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

  toggleExpand(): void {
    this.expanded = !this.expanded;
    this.cdr.markForCheck();
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
