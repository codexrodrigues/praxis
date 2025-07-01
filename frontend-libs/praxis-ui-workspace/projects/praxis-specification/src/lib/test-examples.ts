/**
 * Basic test examples demonstrating praxis-specification functionality
 */

import { SpecificationFactory } from './utils/specification-factory';
import { DslExporter } from './dsl/exporter';
import { FunctionRegistry } from './registry/function-registry';

// Example domain object
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  role: string;
  createdAt: Date;
}

export function runBasicTests(): void {
  console.log('=== Praxis Specification Basic Tests ===\n');

  const user: User = {
    id: 1,
    name: 'Alice Smith',
    email: 'alice@example.com',
    age: 25,
    isActive: true,
    role: 'admin',
    createdAt: new Date('2023-01-15')
  };

  // Test 1: Basic field comparisons
  console.log('1. Basic Field Comparisons');
  console.log('==========================');
  
  const ageSpec = SpecificationFactory.greaterThan<User>('age', 18);
  console.log(`Age > 18: ${ageSpec.toDSL()}`);
  console.log(`Result: ${ageSpec.isSatisfiedBy(user)}`);
  
  const nameSpec = SpecificationFactory.startsWith<User>('name', 'A');
  console.log(`Name starts with 'A': ${nameSpec.toDSL()}`);
  console.log(`Result: ${nameSpec.isSatisfiedBy(user)}`);
  
  // Test 2: Boolean composition
  console.log('\n2. Boolean Composition');
  console.log('======================');
  
  const complexSpec = SpecificationFactory.and(
    ageSpec,
    SpecificationFactory.equals<User>('isActive', true)
  );
  console.log(`Complex spec: ${complexSpec.toDSL()}`);
  console.log(`Result: ${complexSpec.isSatisfiedBy(user)}`);
  
  // Test 3: JSON serialization
  console.log('\n3. JSON Serialization');
  console.log('====================');
  
  const json = complexSpec.toJSON();
  console.log('JSON:', JSON.stringify(json, null, 2));
  
  const reconstructed = SpecificationFactory.fromJSON<User>(json);
  console.log(`Reconstructed DSL: ${reconstructed.toDSL()}`);
  console.log(`Same result: ${reconstructed.isSatisfiedBy(user)}`);
  
  // Test 4: DSL Export with pretty printing
  console.log('\n4. DSL Export');
  console.log('=============');
  
  const exporter = new DslExporter({ prettyPrint: true });
  const prettyDsl = exporter.export(complexSpec);
  console.log('Pretty DSL:', prettyDsl);
  
  // Test 5: Function specification
  console.log('\n5. Function Specifications');
  console.log('==========================');
  
  const registry = FunctionRegistry.getInstance<User>();
  registry.register('isAdult', (user: User) => user.age >= 18);
  
  const funcSpec = SpecificationFactory.func<User>('isAdult', []);
  console.log(`Function spec: ${funcSpec.toDSL()}`);
  console.log(`Result: ${funcSpec.isSatisfiedBy(user)}`);
  
  console.log('\n✅ All basic tests completed successfully!');
}

// Export for use in browser or node
if (typeof window !== 'undefined') {
  (window as any).runBasicTests = runBasicTests;
}