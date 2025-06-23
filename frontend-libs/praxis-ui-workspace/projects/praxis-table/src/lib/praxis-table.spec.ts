import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PraxisTable } from './praxis-table';
import { TableConfig } from '@praxis/core';

describe('PraxisTable', () => {
  let component: PraxisTable;
  let fixture: ComponentFixture<PraxisTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PraxisTable]
    }).compileComponents();

    fixture = TestBed.createComponent(PraxisTable);
    component = fixture.componentInstance;
    const config: TableConfig = {
      columns: [{ field: 'id', title: 'ID' }],
      data: []
    };
    component.config = config;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
