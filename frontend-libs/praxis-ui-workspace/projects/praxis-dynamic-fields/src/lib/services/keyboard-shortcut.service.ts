/**
 * @fileoverview Serviço para gerenciamento de atalhos de teclado globais
 * 
 * Permite registrar e executar atalhos de teclado definidos nos componentes.
 */

import { Injectable, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface ShortcutHandler {
  callback: () => void;
  description?: string;
  componentId?: string;
  priority?: number; // Maior prioridade executa primeiro
}

export interface ShortcutInfo {
  shortcut: string;
  handlers: ShortcutHandler[];
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly shortcuts = new Map<string, ShortcutHandler[]>();
  private isListening = false;

  constructor() {
    this.startListening();
  }

  /**
   * Registra um atalho de teclado
   */
  registerShortcut(
    shortcut: string, 
    handler: ShortcutHandler
  ): () => void {
    const normalizedShortcut = this.normalizeShortcut(shortcut);
    
    if (!this.shortcuts.has(normalizedShortcut)) {
      this.shortcuts.set(normalizedShortcut, []);
    }

    const handlers = this.shortcuts.get(normalizedShortcut)!;
    handlers.push(handler);
    
    // Ordenar por prioridade (maior primeiro)
    handlers.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Retorna função para remover o atalho
    return () => {
      this.unregisterShortcut(normalizedShortcut, handler);
    };
  }

  /**
   * Remove um atalho de teclado específico
   */
  unregisterShortcut(shortcut: string, handler: ShortcutHandler): void {
    const normalizedShortcut = this.normalizeShortcut(shortcut);
    const handlers = this.shortcuts.get(normalizedShortcut);
    
    if (handlers) {
      // Fix: Use findIndex with proper object comparison instead of indexOf
      // indexOf never finds objects due to reference comparison, causing memory leaks
      const index = handlers.findIndex(h => 
        h.callback === handler.callback && 
        h.componentId === handler.componentId
      );
      if (index > -1) {
        handlers.splice(index, 1);
      }
      
      // Remove a entrada se não há mais handlers
      if (handlers.length === 0) {
        this.shortcuts.delete(normalizedShortcut);
      }
    }
  }

  /**
   * Remove todos os atalhos de um componente específico
   */
  unregisterComponentShortcuts(componentId: string): void {
    for (const [shortcut, handlers] of this.shortcuts.entries()) {
      const filteredHandlers = handlers.filter(h => h.componentId !== componentId);
      
      if (filteredHandlers.length === 0) {
        this.shortcuts.delete(shortcut);
      } else if (filteredHandlers.length !== handlers.length) {
        this.shortcuts.set(shortcut, filteredHandlers);
      }
    }
  }

  /**
   * Lista todos os atalhos registrados
   */
  getRegisteredShortcuts(): ShortcutInfo[] {
    return Array.from(this.shortcuts.entries()).map(([shortcut, handlers]) => ({
      shortcut,
      handlers: [...handlers]
    }));
  }

  /**
   * Verifica se um atalho está registrado
   */
  hasShortcut(shortcut: string): boolean {
    const normalizedShortcut = this.normalizeShortcut(shortcut);
    return this.shortcuts.has(normalizedShortcut);
  }

  /**
   * Executa manualmente um atalho (para testes)
   */
  executeShortcut(shortcut: string): boolean {
    const normalizedShortcut = this.normalizeShortcut(shortcut);
    const handlers = this.shortcuts.get(normalizedShortcut);
    
    if (handlers && handlers.length > 0) {
      // Executa o handler com maior prioridade
      handlers[0].callback();
      return true;
    }
    
    return false;
  }

  /**
   * Inicia a escuta de eventos de teclado
   */
  private startListening(): void {
    if (this.isListening) return;

    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(event => this.shouldProcessEvent(event))
      )
      .subscribe(event => {
        const shortcut = this.eventToShortcut(event);
        const handlers = this.shortcuts.get(shortcut);
        
        if (handlers && handlers.length > 0) {
          // Previne comportamento padrão apenas se há handlers
          event.preventDefault();
          event.stopPropagation();
          
          // Executa o primeiro handler (maior prioridade)
          handlers[0].callback();
        }
      });

    this.isListening = true;
  }

  /**
   * Verifica se deve processar o evento
   */
  private shouldProcessEvent(event: KeyboardEvent): boolean {
    // Ignora eventos em inputs, textareas, etc.
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    
    if (['input', 'textarea', 'select'].includes(tagName)) {
      return false;
    }
    
    // Ignora se elemento tem contenteditable
    if (target.contentEditable === 'true') {
      return false;
    }
    
    return true;
  }

  /**
   * Converte um evento de teclado em string de atalho
   */
  private eventToShortcut(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');
    
    const key = event.key.toLowerCase();
    parts.push(key);
    
    return parts.join('+');
  }

  /**
   * Normaliza uma string de atalho
   */
  private normalizeShortcut(shortcut: string): string {
    const parts = shortcut.toLowerCase()
      .split(/[\s+\-_]/)
      .filter(part => part.length > 0);
    
    // Ordenar modificadores para consistência
    const modifiers: string[] = [];
    const keys: string[] = [];
    
    for (const part of parts) {
      if (['ctrl', 'alt', 'shift', 'meta', 'cmd', 'command'].includes(part)) {
        let modifier = part;
        if (modifier === 'cmd' || modifier === 'command') {
          modifier = 'meta';
        }
        if (!modifiers.includes(modifier)) {
          modifiers.push(modifier);
        }
      } else {
        keys.push(part);
      }
    }
    
    // Ordenar modificadores
    const orderedModifiers = ['ctrl', 'alt', 'shift', 'meta']
      .filter(mod => modifiers.includes(mod));
    
    return [...orderedModifiers, ...keys].join('+');
  }

  /**
   * Converte atalho em formato legível
   */
  formatShortcut(shortcut: string): string {
    const normalized = this.normalizeShortcut(shortcut);
    const parts = normalized.split('+');
    
    return parts
      .map(part => {
        switch (part) {
          case 'ctrl': return 'Ctrl';
          case 'alt': return 'Alt';
          case 'shift': return 'Shift';
          case 'meta': return 'Cmd';
          case 'enter': return 'Enter';
          case 'escape': return 'Esc';
          case 'arrowup': return '↑';
          case 'arrowdown': return '↓';
          case 'arrowleft': return '←';
          case 'arrowright': return '→';
          default: return part.toUpperCase();
        }
      })
      .join(' + ');
  }
}