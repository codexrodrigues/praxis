import { FormGroup } from '@angular/forms';
import { of, EMPTY } from 'rxjs';
import { DynamicFormDialogHostComponent } from './dynamic-form-dialog-host.component';
import { DialogService, DialogRef } from './dialog.service';

function createComponent(
  dialogService: jasmine.SpyObj<DialogService>,
  modal: any = {},
  i18n: any = {},
) {
  const dialogRef: DialogRef<any> = {
    close: jasmine.createSpy('close'),
    disableClose: false,
    keydownEvents: () => EMPTY,
    backdropClick: () => EMPTY,
    updateSize: jasmine.createSpy('updateSize'),
    updatePosition: jasmine.createSpy('updatePosition'),
  } as any;
  const comp = new DynamicFormDialogHostComponent(
    dialogRef,
    {
      action: { formId: 'f1' },
      metadata: { defaults: { modal }, i18n: { crudDialog: i18n } },
    },
    dialogService,
  );
  comp.formComp = { form: new FormGroup({}) } as any;
  return { comp, dialogRef };
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

  it('toggles maximization', () => {
    const { comp, dialogRef } = createComponent(dialogService, {
      width: '500px',
      height: '300px',
      canMaximize: true,
    });
    comp.toggleMaximize();
    expect(dialogRef.updateSize).toHaveBeenCalledWith('100vw', '100vh');
    comp.toggleMaximize();
    expect(dialogRef.updateSize).toHaveBeenCalledWith('500px', '300px');
  });

  it('honors provided i18n texts', () => {
    const { comp } = createComponent(dialogService, {}, { close: 'Fechar' });
    expect(comp.texts.close).toBe('Fechar');
  });
});
