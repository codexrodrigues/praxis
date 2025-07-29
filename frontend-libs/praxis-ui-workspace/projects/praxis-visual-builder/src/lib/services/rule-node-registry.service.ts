import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RuleNode } from '../models/rule-builder.model';
import { RegistryError, createError, globalErrorHandler } from '../errors/visual-builder-errors';

/**
 * Registry service for managing RuleNode instances and their relationships.
 * Solves the core problem of resolving string IDs to actual RuleNode objects.
 */
@Injectable({
  providedIn: 'root'
})
export class RuleNodeRegistryService {
  private nodes = new Map<string, RuleNode>();
  private nodesSubject = new BehaviorSubject<Map<string, RuleNode>>(new Map());
  
  /**
   * Observable stream of all registered nodes
   */
  nodes$ = this.nodesSubject.asObservable();
  
  /**
   * Register a node in the registry
   */
  register(node: RuleNode): void {
    this.nodes.set(node.id, node);
    this.notifyChange();
  }
  
  /**
   * Register multiple nodes at once
   */
  registerAll(nodes: RuleNode[]): void {
    nodes.forEach(node => this.nodes.set(node.id, node));
    this.notifyChange();
  }
  
  /**
   * Unregister a node from the registry
   */
  unregister(nodeId: string): boolean {
    const result = this.nodes.delete(nodeId);
    if (result) {
      this.notifyChange();
    }
    return result;
  }
  
  /**
   * Resolve a node by its ID
   */
  resolve(nodeId: string): RuleNode | null {
    return this.nodes.get(nodeId) || null;
  }
  
  /**
   * Resolve multiple nodes by their IDs
   */
  resolveMultiple(nodeIds: string[]): RuleNode[] {
    return nodeIds
      .map(id => this.resolve(id))
      .filter(node => node !== null) as RuleNode[];
  }
  
  /**
   * Resolve children nodes for a given node
   */
  resolveChildren(node: RuleNode): RuleNode[] {
    if (!node.children || node.children.length === 0) {
      return [];
    }
    return this.resolveMultiple(node.children);
  }
  
  /**
   * Get all nodes that have the specified parent ID
   */
  getChildrenOf(parentId: string): RuleNode[] {
    return Array.from(this.nodes.values())
      .filter(node => node.parentId === parentId);
  }
  
  /**
   * Get the parent node of a given node
   */
  getParent(node: RuleNode): RuleNode | null {
    if (!node.parentId) {
      return null;
    }
    return this.resolve(node.parentId);
  }
  
  /**
   * Get all root nodes (nodes without parents)
   */
  getRootNodes(): RuleNode[] {
    return Array.from(this.nodes.values())
      .filter(node => !node.parentId);
  }
  
  /**
   * Check if a node exists in the registry
   */
  exists(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }
  
  /**
   * Get all registered node IDs
   */
  getAllIds(): string[] {
    return Array.from(this.nodes.keys());
  }
  
  /**
   * Get all registered nodes
   */
  getAllNodes(): RuleNode[] {
    return Array.from(this.nodes.values());
  }
  
  /**
   * Clear all nodes from the registry
   */
  clear(): void {
    this.nodes.clear();
    this.notifyChange();
  }
  
  /**
   * Get the size of the registry
   */
  size(): number {
    return this.nodes.size;
  }

  /**
   * Remove orphaned nodes (nodes without parents and not referenced by others)
   */
  cleanupOrphanedNodes(): string[] {
    const orphanedIds: string[] = [];
    const referencedIds = new Set<string>();
    
    // Collect all referenced node IDs
    for (const node of this.nodes.values()) {
      if (node.children) {
        node.children.forEach(childId => referencedIds.add(childId));
      }
    }
    
    // Find orphaned nodes (no parent and not referenced as children)
    for (const [id, node] of this.nodes.entries()) {
      const hasParent = node.parentId && this.nodes.has(node.parentId);
      const isReferenced = referencedIds.has(id);
      
      if (!hasParent && !isReferenced) {
        // Check if it's a root node (has children but no parent)
        const hasChildren = node.children && node.children.length > 0;
        
        if (!hasChildren) {
          orphanedIds.push(id);
        }
      }
    }
    
    // Remove orphaned nodes
    for (const id of orphanedIds) {
      this.unregister(id);
    }
    
    return orphanedIds;
  }

  /**
   * Detect circular references in the registry
   */
  detectCircularReferences(): CircularReference[] {
    const circularRefs: CircularReference[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();
    
    const detectCycle = (nodeId: string, path: string[]): void => {
      if (visiting.has(nodeId)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId);
        const cycle = path.slice(cycleStart).concat(nodeId);
        
        circularRefs.push({
          cycle,
          affectedNodes: cycle.slice(0, -1) // Remove duplicate last node
        });
        return;
      }
      
      if (visited.has(nodeId)) {
        return;
      }
      
      const node = this.nodes.get(nodeId);
      if (!node) return;
      
      visiting.add(nodeId);
      path.push(nodeId);
      
      // Check children
      if (node.children) {
        for (const childId of node.children) {
          detectCycle(childId, [...path]);
        }
      }
      
      visiting.delete(nodeId);
      visited.add(nodeId);
    };
    
    // Check all nodes
    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        detectCycle(nodeId, []);
      }
    }
    
    return circularRefs;
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): MemoryStats {
    let totalSize = 0;
    let configSize = 0;
    let childrenSize = 0;
    let metadataSize = 0;
    
    for (const node of this.nodes.values()) {
      // Estimate node size
      const nodeStr = JSON.stringify(node);
      totalSize += nodeStr.length * 2; // Rough estimate (2 bytes per char)
      
      // Break down by components
      if (node.config) {
        configSize += JSON.stringify(node.config).length * 2;
      }
      
      if (node.children) {
        childrenSize += JSON.stringify(node.children).length * 2;
      }
      
      if (node.metadata) {
        metadataSize += JSON.stringify(node.metadata).length * 2;
      }
    }
    
    return {
      totalNodes: this.nodes.size,
      estimatedSizeBytes: totalSize,
      breakdown: {
        config: configSize,
        children: childrenSize,
        metadata: metadataSize,
        other: totalSize - configSize - childrenSize - metadataSize
      }
    };
  }

  /**
   * Validate registry integrity
   */
  validateIntegrity(): RegistryIntegrityResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    
    // Check for broken references
    for (const [id, node] of this.nodes.entries()) {
      // Check parent reference
      if (node.parentId) {
        const parent = this.nodes.get(node.parentId);
        if (!parent) {
          issues.push(`Node ${id} references non-existent parent ${node.parentId}`);
        } else if (!parent.children?.includes(id)) {
          warnings.push(`Node ${id} references parent ${node.parentId}, but parent doesn't reference back`);
        }
      }
      
      // Check children references  
      if (node.children) {
        for (const childId of node.children) {
          const child = this.nodes.get(childId);
          if (!child) {
            issues.push(`Node ${id} references non-existent child ${childId}`);
          } else if (child.parentId !== id) {
            warnings.push(`Node ${id} references child ${childId}, but child doesn't reference back`);
          }
        }
      }
    }
    
    // Check for circular references
    const circularRefs = this.detectCircularReferences();
    if (circularRefs.length > 0) {
      issues.push(`Found ${circularRefs.length} circular reference(s)`);
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      circularReferences: circularRefs,
      memoryStats: this.getMemoryStats()
    };
  }

  /**
   * Perform automatic cleanup operations
   */
  performCleanup(): CleanupResult {
    const result: CleanupResult = {
      orphanedNodesRemoved: [],
      circularReferencesDetected: [],
      memoryFreed: 0
    };
    
    const initialSize = this.getMemoryStats().estimatedSizeBytes;
    
    // Remove orphaned nodes
    result.orphanedNodesRemoved = this.cleanupOrphanedNodes();
    
    // Detect (but don't automatically fix) circular references
    result.circularReferencesDetected = this.detectCircularReferences();
    
    const finalSize = this.getMemoryStats().estimatedSizeBytes;
    result.memoryFreed = initialSize - finalSize;
    
    if (result.orphanedNodesRemoved.length > 0 || result.memoryFreed > 0) {
      this.notifyChange();
    }
    
    return result;
  }
  
  /**
   * Build a tree structure starting from root nodes
   */
  buildTree(): RuleNodeTree[] {
    const rootNodes = this.getRootNodes();
    return rootNodes.map(root => this.buildNodeTree(root));
  }
  
  /**
   * Build tree structure for a specific node
   */
  buildNodeTree(node: RuleNode): RuleNodeTree {
    const children = this.resolveChildren(node);
    return {
      node,
      children: children.map(child => this.buildNodeTree(child))
    };
  }
  
  /**
   * Find nodes by a predicate function
   */
  findNodes(predicate: (node: RuleNode) => boolean): RuleNode[] {
    return Array.from(this.nodes.values()).filter(predicate);
  }
  
  /**
   * Find nodes by type
   */
  findNodesByType(type: string): RuleNode[] {
    return this.findNodes(node => node.type === type);
  }
  
  /**
   * Validate the integrity of the node graph
   */
  validateIntegrity(): RegistryValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const node of this.nodes.values()) {
      // Check if parent exists
      if (node.parentId && !this.exists(node.parentId)) {
        errors.push(`Node ${node.id} references non-existent parent ${node.parentId}`);
      }
      
      // Check if children exist
      if (node.children) {
        for (const childId of node.children) {
          if (!this.exists(childId)) {
            errors.push(`Node ${node.id} references non-existent child ${childId}`);
          }
        }
      }
      
      // Check for circular references
      if (this.hasCircularReference(node)) {
        errors.push(`Circular reference detected in node ${node.id}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Check if a node has circular references
   */
  private hasCircularReference(node: RuleNode, visited: Set<string> = new Set()): boolean {
    if (visited.has(node.id)) {
      return true;
    }
    
    visited.add(node.id);
    
    if (node.children) {
      for (const childId of node.children) {
        const child = this.resolve(childId);
        if (child && this.hasCircularReference(child, new Set(visited))) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Get observable for a specific node
   */
  getNode$(nodeId: string): Observable<RuleNode | null> {
    return this.nodes$.pipe(
      map(nodes => nodes.get(nodeId) || null)
    );
  }
  
  /**
   * Get observable for children of a node
   */
  getChildren$(nodeId: string): Observable<RuleNode[]> {
    return this.nodes$.pipe(
      map(() => {
        const node = this.resolve(nodeId);
        return node ? this.resolveChildren(node) : [];
      })
    );
  }
  
  private notifyChange(): void {
    this.nodesSubject.next(new Map(this.nodes));
  }
}

/**
 * Tree structure for representing node hierarchies
 */
export interface RuleNodeTree {
  node: RuleNode;
  children: RuleNodeTree[];
}

/**
 * Result of registry integrity validation
 */
export interface RegistryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Circular reference information
 */
export interface CircularReference {
  cycle: string[];
  affectedNodes: string[];
}

/**
 * Memory usage statistics
 */
export interface MemoryStats {
  totalNodes: number;
  estimatedSizeBytes: number;
  breakdown: {
    config: number;
    children: number;
    metadata: number;
    other: number;
  };
}

/**
 * Registry integrity validation result
 */
export interface RegistryIntegrityResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  circularReferences: CircularReference[];
  memoryStats: MemoryStats;
}

/**
 * Cleanup operation result
 */
export interface CleanupResult {
  orphanedNodesRemoved: string[];
  circularReferencesDetected: CircularReference[];
  memoryFreed: number;
}