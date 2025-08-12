import { FormGroup } from '@angular/forms';
import { of, EMPTY, Subject } from 'rxjs';
import { DynamicFormDialogHostComponent } from './dynamic-form-dialog-host.component';
import { DialogService, DialogRef } from './dialog.service';
import { GenericCrudService } from '@praxis/core';

function createComponent(
  dialogService: jasmine.SpyObj<DialogService>,
  modal: any = {},
  i18n: any = {},
) {
  const esc$ = new Subject<KeyboardEvent>();
  const backdrop$ = new Subject<void>();
  const dialogRef: DialogRef<any> = {
    close: jasmine.createSpy('close'),
    disableClose: false,
    keydownEvents: () => esc$.asObservable(),
    backdropClick: () => backdrop$.asObservable(),
    updateSize: jasmine.createSpy('updateSize'),
    updatePosition: jasmine.createSpy('updatePosition'),
  } as any;
  const crud = jasmine.createSpyObj<GenericCrudService<any>>(
    'GenericCrudService',
    ['configure'],
  );
  const comp = new DynamicFormDialogHostComponent(
    dialogRef,
    {
      action: { formId: 'f1' },
      metadata: {
        defaults: { modal },
        i18n: { crudDialog: i18n },
        resource: { path: 'res' },
      },
    },
    dialogService,
    crud as any,
  );
  comp.formComp = { form: new FormGroup({}) } as any;
  return { comp, dialogRef, esc$, backdrop$, crud };
}

describe('DynamicFormDialogHostComponent', () => {
  let dialogService: jasmine.SpyObj<DialogService>;

  beforeEach(() => {
    dialogService = jasmine.createSpyObj('DialogService', ['open']);
  });

  it('closes immediately when form pristine', () => {
    const { comp, dialogRef } = createComponent(dialogService);
    comp.onCancel();
    expect(dialogService.open).not.toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('asks confirmation when form dirty', () => {
    const { comp, dialogRef } = createComponent(dialogService);
    comp.formComp!.form.markAsDirty();
    dialogService.open.and.returnValue({ afterClosed: () => of(true) } as any);
    comp.onCancel();
    expect(dialogService.open).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('cancels close when user rejects', () => {
    const { comp, dialogRef } = createComponent(dialogService);
    comp.formComp!.form.markAsDirty();
    dialogService.open.and.returnValue({ afterClosed: () => of(false) } as any);
    comp.onCancel();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('toggles maximization and restores original size', () => {
    const { comp, dialogRef } = createComponent(dialogService, {
      width: '500px',
      height: '300px',
      canMaximize: true,
    });
    comp.toggleMaximize();
    expect(dialogRef.updateSize).toHaveBeenCalledWith(
      'calc(100vw - 16px)',
      'calc(100dvh - 16px)',
    );
    expect(dialogRef.updatePosition).toHaveBeenCalled();
    comp.toggleMaximize();
    expect(dialogRef.updateSize).toHaveBeenCalledWith('500px', '300px');
    expect(dialogRef.updatePosition).toHaveBeenCalled();
  });

  it('backdrop and esc respect disable flags', () => {
    const { comp, esc$, backdrop$, dialogRef } = createComponent(
      dialogService,
      {
        disableCloseOnBackdrop: true,
        disableCloseOnEsc: true,
      },
    );
    comp.formComp!.form.markAsDirty();
    esc$.next(new KeyboardEvent('keydown', { key: 'Escape' }));
    backdrop$.next();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('honors provided i18n texts', () => {
    const { comp } = createComponent(dialogService, {}, { close: 'Fechar' });
    expect(comp.texts.close).toBe('Fechar');
  });

  it('stops loading when form ready', () => {
    const { comp } = createComponent(dialogService);
    expect(comp.loading).toBeTrue();
    comp.onFormReady();
    expect(comp.loading).toBeFalse();
  });

  it('configures crud service with resource path', () => {
    const { crud } = createComponent(dialogService);
    expect(crud.configure).toHaveBeenCalledWith('res', undefined);
  });
});
