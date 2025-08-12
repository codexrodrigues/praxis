import { TestBed } from '@angular/core/testing';
import { CrudLauncherService } from './crud-launcher.service';
import { Router } from '@angular/router';
import { CrudMetadata, CrudAction } from './crud.types';
import { DialogService, DialogRef } from './dialog.service';

describe('CrudLauncherService', () => {
  let service: CrudLauncherService;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<DialogService>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    dialog = jasmine.createSpyObj('DialogService', ['openAsync']);
    TestBed.configureTestingModule({
      providers: [
        CrudLauncherService,
        { provide: Router, useValue: router },
        { provide: DialogService, useValue: dialog },
      ],
    });
    service = TestBed.inject(CrudLauncherService);
  });

  it('resolveOpenMode gives precedence to action then defaults then route', () => {
    const meta: CrudMetadata = {
      component: 'praxis-crud',
      table: {} as any,
      defaults: { openMode: 'modal' },
    };
    const action: CrudAction = {
      action: 'edit',
      label: 'Edit',
      openMode: 'route',
    } as any;
    expect(service.resolveOpenMode(action, meta)).toBe('route');
    const action2: CrudAction = { action: 'edit', label: 'Edit' } as any;
    expect(service.resolveOpenMode(action2, meta)).toBe('modal');
    expect(service.resolveOpenMode(action2, { ...meta, defaults: {} })).toBe(
      'route',
    );
  });

  it('buildRoute replaces multiple params and throws when missing', () => {
    const action: CrudAction = {
      action: 'view',
      label: 'View',
      route: '/item/:id/detail/:id',
      params: [{ from: 'id', to: 'routeParam', name: 'id' }],
    } as any;
    const url = (service as any).buildRoute(action, { id: 5 });
    expect(url).toBe('/item/5/detail/5');
    expect(() => (service as any).buildRoute(action, {})).toThrowError(
      'Missing value for route param id',
    );
  });

  it('launch returns mode and DialogRef when opening modal', async () => {
    const meta: CrudMetadata = {
      component: 'praxis-crud',
      table: {} as any,
      defaults: { modal: { width: '300px', panelClass: 'custom' } },
    };
    const action: CrudAction = {
      action: 'edit',
      label: 'Edit',
      openMode: 'modal',
      formId: 'f1',
    } as any;
    const dummyRef = {} as DialogRef<any>;
    dialog.openAsync.and.resolveTo(dummyRef);
    const result = await service.launch(action, undefined, meta);
    expect(result.mode).toBe('modal');
    expect(result.ref).toBe(dummyRef);
    expect(dialog.openAsync).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        panelClass: ['praxis-dialog-panel', 'custom'],
        backdropClass: ['praxis-dialog-backdrop'],
        autoFocus: true,
        restoreFocus: true,
      }),
    );
  });

  it('launch navigates when mode is route', async () => {
    const meta: CrudMetadata = {
      component: 'praxis-crud',
      table: {} as any,
    };
    const action: CrudAction = {
      action: 'view',
      label: 'View',
      route: '/item/:id',
      params: [{ from: 'id', to: 'routeParam', name: 'id' }],
    } as any;
    const result = await service.launch(action, { id: 1 }, meta);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/item/1');
    expect(result).toEqual({ mode: 'route' });
  });
});
