/**
 * @fileoverview Sistema de logging inteligente para componentes dinâmicos
 * 
 * Reduz spam de logs e permite controle fino sobre o que é exibido no console.
 * Especialmente útil para evitar logs repetitivos do DynamicFieldLoader.
 */

export type LoggerLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface LoggerConfig {
  /** Nível mínimo de log */
  level: LoggerLevel;
  /** Prefixos para filtrar (ex: ['DynamicFieldLoader']) */
  enabledPrefixes: string[];
  /** Prefixos para silenciar */
  silencedPrefixes: string[];
  /** Throttling para logs repetitivos */
  throttleRepetitive: boolean;
  /** Limite de logs iguais consecutivos */
  repetitiveThreshold: number;
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: 'info',
  enabledPrefixes: [],
  silencedPrefixes: ['DynamicFieldLoader'],
  throttleRepetitive: true,
  repetitiveThreshold: 3
};

class DynamicFieldsLogger {
  private config: LoggerConfig = { ...DEFAULT_CONFIG };
  private repetitiveMessages = new Map<string, number>();

  /**
   * Configura o logger globalmente
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Habilita debug para um componente específico
   */
  enableDebugFor(prefix: string): void {
    if (!this.config.enabledPrefixes.includes(prefix)) {
      this.config.enabledPrefixes.push(prefix);
    }
    const index = this.config.silencedPrefixes.indexOf(prefix);
    if (index > -1) {
      this.config.silencedPrefixes.splice(index, 1);
    }
  }

  /**
   * Silencia logs de um componente específico
   */
  silencePrefix(prefix: string): void {
    if (!this.config.silencedPrefixes.includes(prefix)) {
      this.config.silencedPrefixes.push(prefix);
    }
    const index = this.config.enabledPrefixes.indexOf(prefix);
    if (index > -1) {
      this.config.enabledPrefixes.splice(index, 1);
    }
  }

  /**
   * Log inteligente que considera configuração e throttling
   */
  log(level: LoggerLevel, message: string, data?: any): void {
    if (!this.shouldLog(level, message)) {
      return;
    }

    // Throttling para mensagens repetitivas
    if (this.config.throttleRepetitive && this.isRepetitive(message)) {
      return;
    }

    // Delegar para console nativo
    const consoleFn = this.getConsoleFn(level);
    if (data !== undefined) {
      consoleFn(message, data);
    } else {
      consoleFn(message);
    }
  }

  /**
   * Shortcuts para diferentes níveis
   */
  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  trace(message: string, data?: any): void {
    this.log('trace', message, data);
  }

  /**
   * Limpa contadores de mensagens repetitivas (útil para testes)
   */
  clearRepetitiveCounters(): void {
    this.repetitiveMessages.clear();
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  private shouldLog(level: LoggerLevel, message: string): boolean {
    // Verificar nível mínimo
    const levels: LoggerLevel[] = ['error', 'warn', 'info', 'debug', 'trace'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex > currentLevelIndex) {
      return false;
    }

    // Extrair prefixo da mensagem (texto entre [] no início)
    const prefixMatch = message.match(/^\[([^\]]+)\]/);
    const prefix = prefixMatch ? prefixMatch[1] : '';

    // Verificar se está silenciado
    if (prefix && this.config.silencedPrefixes.some(p => prefix.includes(p))) {
      return false;
    }

    // Verificar se está habilitado explicitamente
    if (this.config.enabledPrefixes.length > 0) {
      return Boolean(prefix && this.config.enabledPrefixes.some(p => prefix.includes(p)));
    }

    return true;
  }

  private isRepetitive(message: string): boolean {
    const count = this.repetitiveMessages.get(message) || 0;
    const newCount = count + 1;
    
    this.repetitiveMessages.set(message, newCount);

    // Fazer cleanup periódico para evitar vazamento de memória
    if (this.repetitiveMessages.size > 100) {
      this.cleanup();
    }

    return newCount > this.config.repetitiveThreshold;
  }

  private cleanup(): void {
    // Manter apenas as últimas 50 mensagens
    const entries = Array.from(this.repetitiveMessages.entries());
    this.repetitiveMessages.clear();
    
    entries.slice(-50).forEach(([message, count]) => {
      this.repetitiveMessages.set(message, count);
    });
  }

  private getConsoleFn(level: LoggerLevel): (...args: any[]) => void {
    switch (level) {
      case 'error': return console.error;
      case 'warn': return console.warn;
      case 'info': return console.info;
      case 'debug': return console.debug;
      case 'trace': return console.trace;
      default: return console.log;
    }
  }
}

// Instância singleton
export const logger = new DynamicFieldsLogger();

// Função de conveniência para configuração rápida
export function configureDynamicFieldsLogger(config: Partial<LoggerConfig>): void {
  logger.configure(config);
}

// Funções de conveniência para habilitar/silenciar componentes específicos
export function enableDebugForComponent(componentName: string): void {
  logger.enableDebugFor(componentName);
}

export function silenceComponent(componentName: string): void {
  logger.silencePrefix(componentName);
}

// Presets úteis para desenvolvimento
export const LoggerPresets = {
  /** Silencia logs repetitivos mas mantém erros e warnings */
  PRODUCTION: {
    level: 'warn' as LoggerLevel,
    silencedPrefixes: ['DynamicFieldLoader', 'ComponentRegistry'],
    throttleRepetitive: true,
    repetitiveThreshold: 1
  },

  /** Habilita debug para componentes específicos */
  DEVELOPMENT: {
    level: 'debug' as LoggerLevel,
    silencedPrefixes: ['DynamicFieldLoader'],
    throttleRepetitive: true,
    repetitiveThreshold: 5
  },

  /** Máximo de logs para debug profundo */
  VERBOSE: {
    level: 'trace' as LoggerLevel,
    enabledPrefixes: [],
    silencedPrefixes: [],
    throttleRepetitive: false,
    repetitiveThreshold: 999
  },

  /** Silencia quase tudo exceto erros críticos */
  SILENT: {
    level: 'error' as LoggerLevel,
    silencedPrefixes: ['DynamicFieldLoader', 'ComponentRegistry', 'ComponentPreloader'],
    throttleRepetitive: true,
    repetitiveThreshold: 1
  }
};