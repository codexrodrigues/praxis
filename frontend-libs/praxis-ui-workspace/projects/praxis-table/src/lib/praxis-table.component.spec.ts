import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PraxisTableComponent } from './praxis-table.component';
import { PraxisTableModule } from './praxis-table.module';
import { API_URL } from '@praxis/core';

describe('PraxisTableComponent', () => {
  let component: PraxisTableComponent;
  let fixture: ComponentFixture<PraxisTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, PraxisTableModule],
      providers: [{ provide: API_URL, useValue: { default: {} } }]
    }).compileComponents();

    fixture = TestBed.createComponent(PraxisTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
