import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeriasAfastamentosListComponent } from './ferias-afastamentos-list.component';
import { GenericCrudService } from '@praxis/core';

describe('FeriasAfastamentosListComponent', () => {
  let component: FeriasAfastamentosListComponent;
  let fixture: ComponentFixture<FeriasAfastamentosListComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(FeriasAfastamentosListComponent, {
      set: {
        providers: [
          { provide: GenericCrudService, useValue: { configure: () => {} } },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [FeriasAfastamentosListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeriasAfastamentosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
