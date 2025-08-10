import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  FieldControlType,
  MaterialMultiSelectTreeMetadata,
} from '@praxis/core';

import { MaterialMultiSelectTreeComponent } from './material-multi-select-tree.component';

describe('MaterialMultiSelectTreeComponent', () => {
  let component: MaterialMultiSelectTreeComponent;
  let fixture: ComponentFixture<MaterialMultiSelectTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MaterialMultiSelectTreeComponent,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialMultiSelectTreeComponent);
    component = fixture.componentInstance;
    const metadata: MaterialMultiSelectTreeMetadata = {
      controlType: FieldControlType.MULTI_SELECT_TREE,
      name: 'departments',
      label: 'Departments',
      selectAll: true,
      nodes: [
        {
          label: 'IT',
          value: 'it',
          children: [
            { label: 'Dev', value: 'dev' },
            { label: 'QA', value: 'qa' },
          ],
        },
        { label: 'HR', value: 'hr' },
      ],
    };
    component.setTreeMetadata(metadata);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select parent and its children', () => {
    const node = component.dataSource.data[0];
    component.toggleNode(node);
    expect(component.selection.isSelected(node)).toBeTrue();
    const child = node.children![0];
    expect(component.selection.isSelected(child)).toBeTrue();
  });

  it('should toggle select all', () => {
    component.toggleSelectAll();
    expect(component.isAllSelected()).toBeTrue();
    component.toggleSelectAll();
    expect(component.selection.selected.length).toBe(0);
  });

  it('should respect maxSelections', () => {
    component.maxSelections.set(1);
    const [first, second] = component.dataSource.data;
    component.toggleNode(first);
    component.toggleNode(second);
    expect(component.selection.selected.map((n) => n.value)).toEqual(['it']);
  });
});
