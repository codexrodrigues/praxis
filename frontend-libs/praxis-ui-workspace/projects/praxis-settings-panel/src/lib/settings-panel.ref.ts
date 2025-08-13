import { OverlayRef } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';
import { SettingsPanelCloseReason } from './settings-panel.types';

export class SettingsPanelRef {
  private appliedSubject = new Subject<any>();
  private savedSubject = new Subject<any>();
  private resetSubject = new Subject<void>();
  private closedSubject = new Subject<SettingsPanelCloseReason>();

  applied$ = this.appliedSubject.asObservable();
  saved$ = this.savedSubject.asObservable();
  reset$ = this.resetSubject.asObservable();
  closed$ = this.closedSubject.asObservable();

  constructor(private overlayRef: OverlayRef) {}

  apply(value: any): void {
    this.appliedSubject.next(value);
  }

  save(value: any): void {
    this.savedSubject.next(value);
    this.close('save');
  }

  reset(): void {
    this.resetSubject.next();
  }

  updateSize(width: string | number): void {
    this.overlayRef.updateSize({ width });
  }

  close(reason: SettingsPanelCloseReason = 'cancel'): void {
    if (!this.overlayRef?.hasAttached()) {
      return;
    }
    this.overlayRef.dispose();
    this.closedSubject.next(reason);
    this.complete();
  }

  private complete(): void {
    this.appliedSubject.complete();
    this.savedSubject.complete();
    this.resetSubject.complete();
    this.closedSubject.complete();
  }
}
