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
    component.metadata.set(metadata);
    fixture.detectChanges();
  });

  it('should initialize tree from metadata', () => {
    expect(component).toBeTruthy();
    expect(component.dataSource.data.length).toBe(2);
  });

  it('should select parent and its children', () => {
    const node = component.dataSource.data[0];
    component.toggleNode(node);
    expect(component.selection.isSelected(node)).toBeTrue();
    const child = node.children![0];
    expect(component.selection.isSelected(child)).toBeTrue();
  });

  it('should display node labels', () => {
    const labels = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.mat-tree-node .mdc-label'),
    ).map((el) => el.textContent?.trim());
    expect(labels).toEqual(['IT', 'HR']);
  });

  it('should render child nodes when parent expanded', () => {
    const parent = component.dataSource.data[0];
    component.treeControl.expand(parent);
    fixture.detectChanges();
    const labels = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('.mat-tree-node .mdc-label'),
    ).map((el) => el.textContent?.trim());
    expect(labels).toEqual(['IT', 'Dev', 'QA', 'HR']);
  });

  it('should mark parent indeterminate when only some children selected', () => {
    const parent = component.dataSource.data[0];
    const child = parent.children![0];
    component.toggleNode(child);
    fixture.detectChanges();
    expect(component.selection.isSelected(parent)).toBeFalse();
    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
      'mat-nested-tree-node mat-checkbox input',
    );
    expect(checkbox.indeterminate).toBeTrue();
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

  it('should render nodes from options', () => {
    const optionMeta: MaterialMultiSelectTreeMetadata = {
      controlType: FieldControlType.MULTI_SELECT_TREE,
      name: 'departments',
      label: 'Departments',
      options: [
        {
          label: 'Ops',
          value: 'ops',
          children: [{ label: 'HR', value: 'hr' }],
        },
        { label: 'Sales', value: 'sales' },
      ],
    } as any;

    component.metadata.set(optionMeta);
    component.onComponentInit();
    expect(component.dataSource.data.length).toBe(2);
    expect(component.dataSource.data[0].label).toBe('Ops');
  });

  it('should reflect preselected values via writeValue', () => {
    component.writeValue(['dev', 'qa']);
    const parent = component.dataSource.data[0];
    expect(component.selection.isSelected(parent)).toBeTrue();
    expect(component.selection.selected.map((n) => n.value).sort()).toEqual(
      ['dev', 'qa', 'it'].sort(),
    );
  });
});
