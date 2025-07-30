import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormLayoutEditorComponent } from './form-layout-editor.component';
import { FormLayout } from '../models/form-layout.model';
import { DragDropModule } from '@angular/cdk/drag-drop';

describe('FormLayoutEditorComponent', () => {
  let component: FormLayoutEditorComponent;
  let fixture: ComponentFixture<FormLayoutEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormLayoutEditorComponent, DragDropModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FormLayoutEditorComponent);
    component = fixture.componentInstance;
  });

  it('moves fieldset within layout on drop', () => {
    const layout: FormLayout = {
      fieldsets: [
        { id: 'fs1', title: 'FS1', orientation: 'vertical', rows: [] },
        { id: 'fs2', title: 'FS2', orientation: 'vertical', rows: [] }
      ]
    } as any;
    component.layout = layout;
    fixture.detectChanges();

    component.dropFieldset({
      previousIndex: 0,
      currentIndex: 1,
      container: { data: layout.fieldsets } as any,
      previousContainer: { data: layout.fieldsets } as any,
      item: {} as any,
      isPointerOverContainer: true,
      distance: { x: 0, y: 0 }
    });

    expect(component.layout.fieldsets[0].id).toBe('fs2');
  });
});
