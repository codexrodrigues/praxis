// Main entry point for praxis-specification library
export * from './specification';
export * from './dsl';
export * from './registry';
export * from './context';
export * from './utils';

// Re-export commonly used classes for convenience
export { SpecificationFactory } from './utils/specification-factory';
export { DslParser } from './dsl/parser';
export { DslExporter } from './dsl/exporter';
export { FunctionRegistry } from './registry/function-registry';
export { TransformRegistry } from './registry/transform-registry';
