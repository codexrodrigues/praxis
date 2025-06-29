import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosFolha } from './eventos-folha';

describe('EventosFolha', () => {
  let component: EventosFolha;
  let fixture: ComponentFixture<EventosFolha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventosFolha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventosFolha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
