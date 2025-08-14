import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RowConfiguratorComponent } from './row-configurator.component';
import { FormRow } from '@praxis/core';

describe('RowConfiguratorComponent', () => {
  let component: RowConfiguratorComponent;
  let fixture: ComponentFixture<RowConfiguratorComponent>;

  const mockRow: FormRow = {
    columns: [{ fields: ['fieldA'] }, { fields: ['fieldB'] }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowConfiguratorComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(RowConfiguratorComponent);
    component = fixture.componentInstance;
    component.row = JSON.parse(JSON.stringify(mockRow));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a column and emit a new row object', () => {
    spyOn(component.rowChange, 'emit');
    component.addColumn();

    expect(component.rowChange.emit).toHaveBeenCalled();
    const emittedRow = (component.rowChange.emit as jasmine.Spy).calls.mostRecent().args[0];
    expect(emittedRow).not.toBe(component.row);
    expect(emittedRow.columns.length).toBe(3);
  });

  it('should remove a column and emit a new row object', () => {
    spyOn(component.rowChange, 'emit');
    component.removeColumn(0);

    expect(component.rowChange.emit).toHaveBeenCalled();
    const emittedRow = (component.rowChange.emit as jasmine.Spy).calls.mostRecent().args[0];
    expect(emittedRow).not.toBe(component.row);
    expect(emittedRow.columns.length).toBe(1);
  });

  it('should emit remove on removeRow', () => {
    spyOn(component.remove, 'emit');
    component.removeRow();
    expect(component.remove.emit).toHaveBeenCalled();
  });
});
