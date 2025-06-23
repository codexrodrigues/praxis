import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PraxisTable } from './praxis-table';
import { TableConfig, GenericCrudService, API_URL } from '@praxis/core';

describe('PraxisTable', () => {
  let component: PraxisTable;
  let fixture: ComponentFixture<PraxisTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PraxisTable, HttpClientTestingModule],
      providers: [GenericCrudService, { provide: API_URL, useValue: { default: {} } }]
    }).compileComponents();

    fixture = TestBed.createComponent(PraxisTable);
    component = fixture.componentInstance;
    const config: TableConfig = {
      columns: [{ field: 'id', title: 'ID' }],
      data: [],
      gridOptions: {
        pagination: { pageSize: 5, pageSizeOptions: [5, 10] },
        sortable: true
      },
      toolbar: { visible: true, showNewButton: true }
    };
    component.config = config;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display toolbar when configured', () => {
    fixture.detectChanges();
    const toolbar = fixture.nativeElement.querySelector('mat-toolbar');
    expect(toolbar).not.toBeNull();
  });
});
