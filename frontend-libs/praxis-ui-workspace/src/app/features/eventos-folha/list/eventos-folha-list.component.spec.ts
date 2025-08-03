import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventosFolhaListComponent } from './eventos-folha-list.component';

describe('EventosFolhaListComponent', () => {
  let component: EventosFolhaListComponent;
  let fixture: ComponentFixture<EventosFolhaListComponent>;

  beforeEach(async () => {
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
