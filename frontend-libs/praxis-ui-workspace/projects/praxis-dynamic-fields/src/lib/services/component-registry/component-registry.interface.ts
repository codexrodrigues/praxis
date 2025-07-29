/**
 * Interfaces essenciais para o sistema de registro de componentes
 * Versão ultra-simplificada sem metadados redundantes
 */

import { Type } from '@angular/core';
import { FieldControlType } from '@praxis/core';

// =============================================================================
// INTERFACES ESSENCIAIS
// =============================================================================

/**
 * Registro de um componente no sistema com cache inteligente
 */
export interface ComponentRegistration<T = any> {
  /** Factory para carregamento lazy */
  factory: () => Promise<Type<T>>;
  
  /** Componente em cache após carregamento */
  cached?: Type<T>;
  
  /** Timestamp do cache para validação TTL */
  cachedAt?: number;
  
  /** Contador de tentativas de carregamento */
  loadAttempts?: number;
  
  /** Último erro de carregamento */
  lastError?: Error;
}

// Configurações do cache
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutos em desenvolvimento
export const MAX_LOAD_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // 1 segundo

/**
 * Interface do serviço de registro
 */
export interface IComponentRegistry {
  /**
   * Registra um novo componente
   */
  register<T>(
    type: FieldControlType, 
    factory: () => Promise<Type<T>>
  ): void;
  
  /**
   * Obtém um componente registrado
   */
  getComponent<T>(type: FieldControlType): Promise<Type<T> | null>;
  
  /**
   * Verifica se um tipo está registrado
   */
  isRegistered(type: FieldControlType): boolean;
  
  /**
   * Lista tipos registrados
   */
  getRegisteredTypes(): FieldControlType[];
}

// =============================================================================
// TIPOS AUXILIARES
// =============================================================================

/**
 * Resultado de carregamento de componente
 */
export interface ComponentLoadResult<T = any> {
  /** Componente carregado */
  component: Type<T> | null;
  
  /** Sucesso no carregamento */
  success: boolean;
  
  /** Erro se houver */
  error?: Error;
}

/**
 * Estatísticas do registro
 */
export interface RegistryStats {
  /** Número de componentes registrados */
  registeredComponents: number;
  
  /** Número de componentes em cache */
  cachedComponents: number;
  
  /** Tipos registrados */
  registeredTypes: FieldControlType[];
}