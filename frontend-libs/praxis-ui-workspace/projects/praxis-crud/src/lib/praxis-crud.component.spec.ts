import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PraxisCrudComponent } from './praxis-crud.component';
import { CrudLauncherService } from './crud-launcher.service';
import { Subject } from 'rxjs';
import { PraxisTable } from '@praxis/table';

class TableStub {
  refetch = jasmine.createSpy('refetch');
}

describe('PraxisCrudComponent', () => {
  let component: PraxisCrudComponent;
  let fixture: ComponentFixture<PraxisCrudComponent>;
  let launcher: jasmine.SpyObj<CrudLauncherService>;

  beforeEach(async () => {
    launcher = jasmine.createSpyObj('CrudLauncherService', ['launch']);
    await TestBed.configureTestingModule({
      imports: [PraxisCrudComponent],
      providers: [{ provide: CrudLauncherService, useValue: launcher }],
    }).compileComponents();
    fixture = TestBed.createComponent(PraxisCrudComponent);
    component = fixture.componentInstance;
    component.metadata = {
      component: 'praxis-crud',
      table: {} as any,
      actions: [],
    } as any;
    component['table'] = new TableStub() as any;
    fixture.detectChanges();
  });

  it('emits afterOpen with mode returned by service', async () => {
    const close$ = new Subject<any>();
    launcher.launch.and.resolveTo({
      mode: 'modal',
      ref: { afterClosed: () => close$.asObservable() } as any,
    });
    component.resolvedMetadata = {
      component: 'praxis-crud',
      table: {} as any,
      actions: [
        { action: 'edit', label: 'Edit', formId: 'f1', openMode: 'modal' },
      ],
    } as any;
    const openSpy = jasmine.createSpy('open');
    component.afterOpen.subscribe(openSpy);
    await component.onAction('edit', {});
    expect(openSpy).toHaveBeenCalledWith({ mode: 'modal', action: 'edit' });
    close$.complete();
  });

  it('refreshes table after save and delete', async () => {
    const close$ = new Subject<any>();
    launcher.launch.and.resolveTo({
      mode: 'modal',
      ref: { afterClosed: () => close$.asObservable() } as any,
    });
    component.resolvedMetadata = {
      component: 'praxis-crud',
      table: {} as any,
      actions: [
        { action: 'edit', label: 'Edit', formId: 'f1', openMode: 'modal' },
      ],
    } as any;
    await component.onAction('edit', {});
    close$.next({ type: 'save', data: { id: 1 } });
    close$.next({ type: 'delete', data: { id: 1 } });
    expect((component as any).table.refetch).toHaveBeenCalledTimes(2);
    close$.complete();
  });

  it('emits error on invalid metadata JSON', () => {
    const spy = jasmine.createSpy('error');
    component.error.subscribe(spy);
    component.metadata = '{ invalid';
    component.ngOnChanges({
      metadata: { currentValue: component.metadata } as any,
    });
    expect(spy).toHaveBeenCalled();
  });
});
