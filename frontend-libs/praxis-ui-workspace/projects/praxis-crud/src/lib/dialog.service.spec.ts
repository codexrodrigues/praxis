import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Component, NgZone } from '@angular/core';

@Component({ selector: 'pdx-dummy', template: '' })
class DummyComponent {}

describe('DialogService', () => {
  let service: DialogService;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let ngZone: jasmine.SpyObj<NgZone>;

  beforeEach(() => {
    matDialog = jasmine.createSpyObj('MatDialog', ['open']);
    ngZone = jasmine.createSpyObj('NgZone', ['run']);
    TestBed.configureTestingModule({
      providers: [
        DialogService,
        { provide: MatDialog, useValue: matDialog },
        { provide: NgZone, useValue: ngZone },
      ],
    });
    service = TestBed.inject(DialogService);
  });

  it('delegates open to MatDialog', () => {
    const ref = {} as MatDialogRef<any>;
    matDialog.open.and.returnValue(ref);
    ngZone.run.and.callFake((fn) => fn());
    const result = service.open(DummyComponent, { width: '100px' });
    expect(ngZone.run).toHaveBeenCalled();
    expect(matDialog.open).toHaveBeenCalledWith(DummyComponent, {
      width: '100px',
    });
    expect(result).toBe(ref);
  });

  it('supports openAsync with dynamic import', async () => {
    const ref = {} as MatDialogRef<any>;
    matDialog.open.and.returnValue(ref);
    ngZone.run.and.callFake((fn) => fn());
    const result = await service.openAsync(() => Promise.resolve(DummyComponent));
    expect(ngZone.run).toHaveBeenCalled();
    expect(result).toBe(ref);
  });
});
