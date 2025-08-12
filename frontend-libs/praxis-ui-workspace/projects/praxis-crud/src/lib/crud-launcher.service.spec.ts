import { TestBed } from '@angular/core/testing';
import { CrudLauncherService } from './crud-launcher.service';
import { Router } from '@angular/router';
import { CrudMetadata } from './crud.types';
import { DynamicFormDialogHostComponent } from './dynamic-form-dialog-host.component';
import { DialogService, DialogRef } from './dialog.service';

describe('CrudLauncherService', () => {
  let service: CrudLauncherService;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<DialogService>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    dialog = jasmine.createSpyObj('DialogService', ['open']);
    TestBed.configureTestingModule({
      providers: [
        CrudLauncherService,
        { provide: Router, useValue: router },
        { provide: DialogService, useValue: dialog },
      ],
    });
    service = TestBed.inject(CrudLauncherService);
  });

  it('should navigate for route open mode with params', () => {
    const meta: CrudMetadata = {
      component: 'praxis-crud',
      table: {} as any,
      actions: [
        {
          id: 'view',
          label: 'View',
          action: 'view',
          route: '/item/:id',
          params: [
            { from: 'id', to: 'routeParam', name: 'id' },
            { from: 'q', to: 'query', name: 'search' },
          ],
        },
      ],
    } as any;
    const result = service.launch(meta.actions![0], { id: 1, q: 'abc' }, meta);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/item/1?search=abc');
    expect(result).toBeUndefined();
  });

  it('should open dialog for modal mode and map inputs', () => {
    const meta: CrudMetadata = {
      component: 'praxis-crud',
      table: {} as any,
      defaults: { modal: { width: '400px' } },
      actions: [
        {
          id: 'edit',
          label: 'Edit',
          action: 'edit',
          openMode: 'modal',
          formId: 'f1',
          params: [{ from: 'id', to: 'input', name: 'itemId' }],
        },
      ],
    } as any;
    const dummyRef = {} as DialogRef<any>;
    dialog.open.and.returnValue(dummyRef);
    const result = service.launch(meta.actions![0], { id: 10 }, meta);
    expect(dialog.open).toHaveBeenCalledWith(
      DynamicFormDialogHostComponent,
      jasmine.objectContaining({
        width: '400px',
        data: jasmine.objectContaining({
          inputs: { itemId: 10 },
        }),
      }),
    );
    expect(result).toBe(dummyRef);
  });

  it('should throw when route action missing route', () => {
    const meta: CrudMetadata = {
      component: 'praxis-crud',
      table: {} as any,
      actions: [
        {
          id: 'view',
          label: 'View',
          action: 'view',
          openMode: 'route',
        },
      ],
    } as any;
    expect(() =>
      service.launch(meta.actions![0], { id: 1 }, meta),
    ).toThrowError('Route not provided for action view');
  });

  it('should throw when modal action missing formId', () => {
    const meta: CrudMetadata = {
      component: 'praxis-crud',
      table: {} as any,
      actions: [
        {
          id: 'edit',
          label: 'Edit',
          action: 'edit',
          openMode: 'modal',
        },
      ],
    } as any;
    expect(() =>
      service.launch(meta.actions![0], { id: 1 }, meta),
    ).toThrowError('formId not provided for action edit');
  });
});
