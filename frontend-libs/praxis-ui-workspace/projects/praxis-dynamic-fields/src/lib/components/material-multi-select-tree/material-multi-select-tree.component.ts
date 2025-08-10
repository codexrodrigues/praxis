import { Component, EventEmitter, forwardRef, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {
  MaterialMultiSelectTreeMetadata,
  MaterialTreeNode,
} from '@praxis/core';
import { SimpleBaseInputComponent } from '../../base/simple-base-input.component';

/**
 * Material wrapper for hierarchical multi select using `mat-tree`.
 *
 * Supports recursive selection with checkboxes and optional
 * "select all" helper. Values are emitted as array of node values.
 */
@Component({
  selector: 'pdx-material-multi-select-tree',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTreeModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <div class="pdx-multi-select-tree-wrapper">
      @if (label) {
        <label class="pdx-tree-label">{{ label }}</label>
      }

      @if (selectAll()) {
        <mat-checkbox
          class="pdx-select-all"
          [checked]="isAllSelected()"
          (change)="toggleSelectAll()"
        >
          Selecionar todos
        </mat-checkbox>
      }

      <mat-tree [dataSource]="dataSource" [treeControl]="treeControl">
        <mat-tree-node *matTreeNodeDef="let node; when: hasChild">
          <div class="pdx-tree-node">
            <button mat-icon-button matTreeNodeToggle>
              <mat-icon class="mat-icon-rtl-mirror">
                {{
                  treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right'
                }}
              </mat-icon>
            </button>
            <mat-checkbox
              [checked]="selection.isSelected(node)"
              [indeterminate]="descendantsPartiallySelected(node)"
              (change)="toggleNode(node)"
              [disabled]="isNodeDisabled(node)"
            >
              {{ node.label }}
            </mat-checkbox>
          </div>
        </mat-tree-node>

        <mat-tree-node *matTreeNodeDef="let node">
          <div class="pdx-tree-node">
            <mat-checkbox
              [checked]="selection.isSelected(node)"
              (change)="toggleNode(node)"
              [disabled]="isNodeDisabled(node)"
            >
              {{ node.label }}
            </mat-checkbox>
          </div>
        </mat-tree-node>
      </mat-tree>

      @if (
        errorMessage() &&
        internalControl.invalid &&
        (internalControl.dirty || internalControl.touched)
      ) {
        <div class="pdx-error">{{ errorMessage() }}</div>
      }

      @if (metadata()?.hint && !hasValidationError()) {
        <div class="pdx-hint">{{ metadata()!.hint }}</div>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialMultiSelectTreeComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'componentCssClasses()',
    '[attr.data-field-type]': '"multi-select-tree"',
    '[attr.data-field-name]': 'metadata()?.name',
    '[attr.data-component-id]': 'componentId()',
  },
})
export class MaterialMultiSelectTreeComponent extends SimpleBaseInputComponent {
  /** Tree control managing expansion state */
  readonly treeControl = new NestedTreeControl<MaterialTreeNode>(
    (node) => node.children ?? [],
  );
  /** Data source bound to the tree */
  readonly dataSource = new MatTreeNestedDataSource<MaterialTreeNode>();
  /** Selection model for nodes */
  readonly selection = new SelectionModel<MaterialTreeNode>(true);

  private readonly parentMap = new Map<
    MaterialTreeNode,
    MaterialTreeNode | null
  >();
  private readonly valueMap = new Map<any, MaterialTreeNode>();

  /** Show select all option */
  readonly selectAll = signal<boolean>(false);
  /** Maximum allowed selections */
  readonly maxSelections = signal<number | null>(null);
  /** Emits whenever the selection changes */
  readonly selectionChange = new EventEmitter<any[]>();

  override onComponentInit(): void {
    const meta = this.metadata() as MaterialMultiSelectTreeMetadata | null;
    if (meta) {
      this.setTreeMetadata(meta);
    }
  }

  /** Configure component metadata */
  setTreeMetadata(metadata: MaterialMultiSelectTreeMetadata): void {
    const { options, nodes: rawNodes, ...rest } = metadata as any;
    const nodes = this.normalizeNodes(rawNodes ?? options ?? []);
    this.dataSource.data = nodes;
    this.selection.clear();
    this.parentMap.clear();
    this.valueMap.clear();
    this.buildParentMap(nodes, null);
    this.selectAll.set(!!metadata.selectAll);
    this.maxSelections.set(metadata.maxSelections ?? null);
    super.setMetadata({ ...rest, nodes });

  }

  private normalizeNodes(nodes: any[]): MaterialTreeNode[] {
    return nodes.map((n) => ({
      label: n.label ?? n.name ?? n.text ?? '',
      value: n.value,
      disabled: n.disabled,
      children: n.children ? this.normalizeNodes(n.children) : undefined,
    }));
  }

  /** Whether a node has children */
  hasChild = (_: number, node: MaterialTreeNode) =>
    !!node.children && node.children.length > 0;

  /** Toggle selection state of a node and its descendants */
  toggleNode(node: MaterialTreeNode): void {
    const willSelect = !this.selection.isSelected(node);
    if (willSelect && this.maxSelections()) {
      const nodesToSelect = [node, ...this.getDescendants(node)].filter(
        (n) => !this.selection.isSelected(n) && !this.isNodeDisabled(n),
      ).length;
      if (
        this.selection.selected.length + nodesToSelect >
        this.maxSelections()!
      ) {
        return;
      }
    }

    this.selection.toggle(node);
    const isSelected = this.selection.isSelected(node);
    this.toggleDescendants(node, isSelected);
    this.updateAllParents(node);
    this.emitValue();
  }

  private toggleDescendants(node: MaterialTreeNode, selected: boolean): void {
    node.children?.forEach((child) => {
      if (selected) {
        this.selection.select(child);
      } else {
        this.selection.deselect(child);
      }
      this.toggleDescendants(child, selected);
    });
  }

  private updateAllParents(node: MaterialTreeNode): void {
    let parent = this.getParent(node);
    while (parent) {
      this.updateParentSelection(parent);
      parent = this.getParent(parent);
    }
  }

  private updateParentSelection(node: MaterialTreeNode): void {
    const descendants = this.getDescendants(node);
    if (descendants.every((d) => this.selection.isSelected(d))) {
      this.selection.select(node);
    } else {
      this.selection.deselect(node);
    }
  }

  private getDescendants(node: MaterialTreeNode): MaterialTreeNode[] {
    const descendants: MaterialTreeNode[] = [];
    node.children?.forEach((child) => {
      descendants.push(child, ...this.getDescendants(child));
    });
    return descendants;
  }

  private getParent(node: MaterialTreeNode): MaterialTreeNode | null {
    return this.parentMap.get(node) ?? null;
  }

  private buildParentMap(
    nodes: MaterialTreeNode[],
    parent: MaterialTreeNode | null,
  ): void {
    nodes.forEach((n) => {
      this.parentMap.set(n, parent);
      this.valueMap.set(n.value, n);
      if (n.children) {
        this.buildParentMap(n.children, n);
      }
    });
  }

  /** Whether descendants of a node are partially selected */
  descendantsPartiallySelected(node: MaterialTreeNode): boolean {
    const descendants = this.getDescendants(node);
    const someSelected = descendants.some((d) => this.selection.isSelected(d));
    return (
      someSelected && !descendants.every((d) => this.selection.isSelected(d))
    );
  }

  private emitValue(): void {
    const values = this.selection.selected.map((n) => n.value);
    this.setValue(values);
    this.selectionChange.emit(values);
  }

  override writeValue(value: any): void {
    super.writeValue(value);
    this.selection.clear();
    if (Array.isArray(value)) {
      value.forEach((val) => {
        const node = this.valueMap.get(val);
        if (node) {
          this.selection.select(node);
          this.toggleDescendants(node, true);
          this.updateAllParents(node);
        }
      });
    }
  }

  /** Toggle select all nodes */
  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selectAllRecursive(this.dataSource.data);
    }
    this.emitValue();
  }

  private selectAllRecursive(nodes: MaterialTreeNode[]): void {
    for (const node of nodes) {
      if (!this.isNodeDisabled(node)) {
        this.selection.select(node);
      }
      if (node.children) {
        this.selectAllRecursive(node.children);
      }
      if (
        this.maxSelections() &&
        this.selection.selected.length >= this.maxSelections()!
      ) {
        return;
      }
    }
  }

  /** Check if all enabled nodes are selected */
  isAllSelected(): boolean {
    const nodes = this.getAllEnabledNodes(this.dataSource.data);
    return nodes.length > 0 && nodes.every((n) => this.selection.isSelected(n));
  }

  private getAllEnabledNodes(nodes: MaterialTreeNode[]): MaterialTreeNode[] {
    const list: MaterialTreeNode[] = [];
    nodes.forEach((n) => {
      if (!this.isNodeDisabled(n)) {
        list.push(n);
      }
      if (n.children) {
        list.push(...this.getAllEnabledNodes(n.children));
      }
    });
    return list;
  }

  /** Disable node when maxSelections reached */
  isNodeDisabled(node: MaterialTreeNode): boolean {
    if (node.disabled) return true;
    if (!this.maxSelections()) return false;
    const isSelected = this.selection.isSelected(node);
    return (
      !isSelected && this.selection.selected.length >= this.maxSelections()!
    );
  }

  /** CSS hook */
  protected override getSpecificCssClasses(): string[] {
    return ['pdx-multi-select-tree'];
  }
}
