import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormConfig } from '@praxis/core';
import { LayoutEditorComponent } from './layout-editor.component';

describe('LayoutEditorComponent', () => {
  let component: LayoutEditorComponent;
  let fixture: ComponentFixture<LayoutEditorComponent>;

  const mockConfig: FormConfig = {
    fieldMetadata: [
      { name: 'field1', controlType: 'text' },
      { name: 'field2', controlType: 'text' },
      { name: 'field3', controlType: 'text' },
    ],
    layout: {
      sections: [
        {
          id: 's1',
          title: 'Section 1',
          rows: [{ columns: [{ fields: ['field1'] }] }],
        },
        {
          id: 's2',
          title: 'Section 2',
          rows: [{ columns: [{ fields: ['field2'] }] }],
        },
      ],
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutEditorComponent, DragDropModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutEditorComponent);
    component = fixture.componentInstance;
    component.config = JSON.parse(JSON.stringify(mockConfig)); // Deep copy
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a new section and emit configChange', () => {
    spyOn(component.configChange, 'emit');
    const initialSections = component.config.layout.sections.length;

    component.addSection();

    expect(component.configChange.emit).toHaveBeenCalled();
    const newConfig = (component.configChange.emit as jasmine.Spy).calls.mostRecent().args[0];
    expect(newConfig.layout.sections.length).toBe(initialSections + 1);
  });

  it('should remove a section and emit configChange', () => {
    spyOn(component.configChange, 'emit');
    const initialSections = component.config.layout.sections.length;

    component.removeSection(0);

    expect(component.configChange.emit).toHaveBeenCalled();
    const newConfig = (component.configChange.emit as jasmine.Spy).calls.mostRecent().args[0];
    expect(newConfig.layout.sections.length).toBe(initialSections - 1);
    expect(newConfig.layout.sections[0].id).toBe('s2');
  });

  it('should correctly calculate available fields', () => {
    const available = component.availableFields;
    expect(available.length).toBe(1);
    expect(available[0].name).toBe('field3');
  });

  it('should return empty availableFields when all are placed', () => {
    component.config.layout.sections[0].rows[0].columns[0].fields.push('field3');
    fixture.detectChanges();
    const available = component.availableFields;
    expect(available.length).toBe(0);
  });
});
