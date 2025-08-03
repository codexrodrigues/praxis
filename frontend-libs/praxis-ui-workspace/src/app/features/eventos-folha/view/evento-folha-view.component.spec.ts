import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventoFolhaViewComponent } from './evento-folha-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('EventoFolhaViewComponent', () => {
  let component: EventoFolhaViewComponent;
  let fixture: ComponentFixture<EventoFolhaViewComponent>;

  beforeEach(async () => {
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
