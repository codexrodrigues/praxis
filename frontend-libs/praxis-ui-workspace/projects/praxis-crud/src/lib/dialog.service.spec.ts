import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Component } from '@angular/core';

@Component({ selector: 'pdx-dummy', template: '' })
class DummyComponent {}

describe('DialogService', () => {
  let service: DialogService;
  let matDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    matDialog = jasmine.createSpyObj('MatDialog', ['open']);
    TestBed.configureTestingModule({
      providers: [DialogService, { provide: MatDialog, useValue: matDialog }],
    });
    service = TestBed.inject(DialogService);
  });

  it('delegates open to MatDialog', () => {
    const ref = {} as MatDialogRef<any>;
    matDialog.open.and.returnValue(ref);
    const result = service.open(DummyComponent, { width: '100px' });
    expect(matDialog.open).toHaveBeenCalledWith(DummyComponent, {
      width: '100px',
    });
    expect(result).toBe(ref);
  });

  it('supports openAsync with dynamic import', async () => {
    const ref = {} as MatDialogRef<any>;
    matDialog.open.and.returnValue(ref);
    const result = await service.openAsync(() =>
      Promise.resolve(DummyComponent),
    );
    expect(result).toBe(ref);
  });
});
