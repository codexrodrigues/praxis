import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PraxisCrudComponent } from './praxis-crud.component';
import { CrudLauncherService } from './crud-launcher.service';
import { Subject, of } from 'rxjs';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delegate action to launcher', () => {
    component.resolvedMetadata = {
      component: 'praxis-crud',
      table: {} as any,
      actions: [{ id: 'edit', label: 'Edit', action: 'edit' }],
    } as any;
    component.onAction('edit', {});
    expect(launcher.launch).toHaveBeenCalled();
  });

  it('should emit lifecycle events for modal action', () => {
    const close$ = new Subject<any>();
    launcher.launch.and.returnValue({
      afterClosed: () => close$.asObservable(),
    } as any);
    component.resolvedMetadata = {
      component: 'praxis-crud',
      table: {} as any,
      actions: [
        {
          id: 'edit',
          label: 'Edit',
          action: 'edit',
          openMode: 'modal',
          formId: 'f1',
        },
      ],
    } as any;
    const openSpy = jasmine.createSpy('open');
    const closeSpy = jasmine.createSpy('close');
    const saveSpy = jasmine.createSpy('save');
    component.afterOpen.subscribe(openSpy);
    component.afterClose.subscribe(closeSpy);
    component.afterSave.subscribe(saveSpy);
    component.onAction('edit', {});
    expect(openSpy).toHaveBeenCalledWith({ mode: 'modal', action: 'edit' });
    close$.next({ type: 'save', data: { id: 1 } });
    close$.complete();
    expect(closeSpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalledWith({ id: 1, data: { id: 1 } });
  });

  it('should emit error when launcher throws', () => {
    const errorSpy = jasmine.createSpy('error');
    component.resolvedMetadata = {
      component: 'praxis-crud',
      table: {} as any,
      actions: [{ id: 'edit', label: 'Edit', action: 'edit' }],
    } as any;
    component.error.subscribe(errorSpy);
    launcher.launch.and.throwError('boom');
    component.onAction('edit', {});
    expect(errorSpy).toHaveBeenCalled();
  });
});
