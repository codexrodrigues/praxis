import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventoFolhaViewComponent } from './evento-folha-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { GenericCrudService } from '@praxis/core';

describe('EventoFolhaViewComponent', () => {
  let component: EventoFolhaViewComponent;
  let fixture: ComponentFixture<EventoFolhaViewComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(EventoFolhaViewComponent, {
      set: {
        providers: [
          { provide: GenericCrudService, useValue: { configure: () => {} } },
        ],
      },
    });

    await TestBed.configureTestingModule({
      imports: [EventoFolhaViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map()) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventoFolhaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
