import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventosFolhaListComponent } from './eventos-folha-list.component';
import { GenericCrudService } from '@praxis/core';

describe('EventosFolhaListComponent', () => {
  let component: EventosFolhaListComponent;
  let fixture: ComponentFixture<EventosFolhaListComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(EventosFolhaListComponent, {
      set: {
        providers: [
          { provide: GenericCrudService, useValue: { configure: () => {} } },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [EventosFolhaListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventosFolhaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
