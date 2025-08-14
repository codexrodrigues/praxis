/**
 * Demo file showcasing @praxis/specification functionality
 * This demonstrates all the Phase 1 features working together
 */

import { SpecificationFactory } from './utils/specification-factory';
import { DslParser } from './dsl/parser';
import { DslExporter } from './dsl/exporter';
import { FunctionRegistry } from './registry/function-registry';
import { TransformRegistry } from './registry/transform-registry';
import { ComparisonOperator } from './specification/comparison-operator';
import { DefaultContextProvider } from './context/context-provider';

// Example domain object
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  role: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export class PraxisSpecificationDemo {
  
  static runDemo(): void {
    console.log('=== Praxis Specification Demo ===\n');
    
    // Sample user data
    const users: User[] = [
      {
        id: 1,
        name: 'Alice Smith',
        email: 'alice@example.com',
        age: 25,
        isActive: true,
        role: 'admin',
        createdAt: new Date('2023-01-15'),
        lastLoginAt: new Date('2024-01-20')
      },
      {
        id: 2,
        name: 'Bob Johnson',
        email: 'bob@test.com',
        age: 35,
        isActive: false,
        role: 'user',
        createdAt: new Date('2022-05-10'),
        lastLoginAt: new Date('2023-12-01')
      },
      {
        id: 3,
        name: 'Carol Williams',
        email: 'carol@example.com',
        age: 28,
        isActive: true,
        role: 'user',
        createdAt: new Date('2023-08-20')
      }
    ];

    this.demoBasicComparisons(users);
    this.demoBooleanComposition(users);
    this.demoCardinality(users);
    this.demoFunctions(users);
    this.demoFieldToField(users);
    this.demoJSONSerialization();
    this.demoDSLExport();
    this.demoDSLParsing();
  }

  private static demoBasicComparisons(users: User[]): void {
    console.log('1. Basic Field Comparisons');
    console.log('==========================');
    
    // Age greater than 30
    const ageSpec = SpecificationFactory.greaterThan<User>('age', 30);
    console.log(`Age > 30: ${ageSpec.toDSL()}`);
    console.log('Results:', users.filter(u => ageSpec.isSatisfiedBy(u)).map(u => u.name));
    
    // Name starts with 'A'
    const nameSpec = SpecificationFactory.startsWith<User>('name', 'A');
    console.log(`Name starts with 'A': ${nameSpec.toDSL()}`);
    console.log('Results:', users.filter(u => nameSpec.isSatisfiedBy(u)).map(u => u.name));
    
    // Role in admin or manager
    const roleSpec = SpecificationFactory.isIn<User>('role', ['admin', 'manager']);
    console.log(`Role in [admin, manager]: ${roleSpec.toDSL()}`);
    console.log('Results:', users.filter(u => roleSpec.isSatisfiedBy(u)).map(u => u.name));
    
    console.log('');
  }

  private static demoBooleanComposition(users: User[]): void {
    console.log('2. Boolean Composition');
    console.log('=====================');
    
    // Active users over 25
    const activeAndOlder = SpecificationFactory.and(
      SpecificationFactory.equals<User>('isActive', true),
      SpecificationFactory.greaterThan<User>('age', 25)
    );
    console.log(`Active AND age > 25: ${activeAndOlder.toDSL()}`);
    console.log('Results:', users.filter(u => activeAndOlder.isSatisfiedBy(u)).map(u => u.name));
    
    // Admin or age over 30
    const adminOrOlder = SpecificationFactory.or(
      SpecificationFactory.equals<User>('role', 'admin'),
      SpecificationFactory.greaterThan<User>('age', 30)
    );
    console.log(`Admin OR age > 30: ${adminOrOlder.toDSL()}`);
    console.log('Results:', users.filter(u => adminOrOlder.isSatisfiedBy(u)).map(u => u.name));
    
    // Not admin
    const notAdmin = SpecificationFactory.not(
      SpecificationFactory.equals<User>('role', 'admin')
    );
    console.log(`NOT admin: ${notAdmin.toDSL()}`);
    console.log('Results:', users.filter(u => notAdmin.isSatisfiedBy(u)).map(u => u.name));
    
    console.log('');
  }

  private static demoCardinality(users: User[]): void {
    console.log('3. Cardinality Specifications');
    console.log('============================');
    
    // At least 2 of: age > 25, active, name contains 'a'
    const atLeastSpec = SpecificationFactory.atLeast(2, [
      SpecificationFactory.greaterThan<User>('age', 25),
      SpecificationFactory.equals<User>('isActive', true),
      SpecificationFactory.contains<User>('name', 'a')
    ]);
    console.log(`At least 2 conditions: ${atLeastSpec.toDSL()}`);
    console.log('Results:', users.filter(u => atLeastSpec.isSatisfiedBy(u)).map(u => u.name));
    
    console.log('');
  }

  private static demoFunctions(users: User[]): void {
    console.log('4. Custom Functions');
    console.log('==================');
    
    // Register custom function
    const registry = FunctionRegistry.getInstance<User>();
    registry.register('daysSinceCreated', (user: User) => {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - user.createdAt.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });
    
    registry.register('hasRecentLogin', (user: User, dayThreshold: number) => {
      if (!user.lastLoginAt) return false;
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - user.lastLoginAt.getTime());
      const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return daysDiff <= dayThreshold;
    });
    
    const funcSpec = SpecificationFactory.func<User>('hasRecentLogin', [60]);
    console.log(`Has recent login (60 days): ${funcSpec.toDSL()}`);
    console.log('Results:', users.filter(u => funcSpec.isSatisfiedBy(u)).map(u => u.name));
    
    console.log('');
  }

  private static demoFieldToField(users: User[]): void {
    console.log('5. Field-to-Field Comparisons');
    console.log('=============================');
    
    // Name length > email length (with transforms)
    const fieldToFieldSpec = SpecificationFactory.fieldToField<User>(
      'name',
      ComparisonOperator.GREATER_THAN,
      'email',
      ['length'],
      ['length']
    );
    console.log(`Name length > email length: ${fieldToFieldSpec.toDSL()}`);
    console.log('Results:', users.filter(u => fieldToFieldSpec.isSatisfiedBy(u)).map(u => u.name));
    
    console.log('');
  }

  private static demoJSONSerialization(): void {
    console.log('6. JSON Serialization');
    console.log('====================');
    
    const complexSpec = SpecificationFactory.and(
      SpecificationFactory.greaterThan<User>('age', 18),
      SpecificationFactory.or(
        SpecificationFactory.equals<User>('role', 'admin'),
        SpecificationFactory.startsWith<User>('name', 'A')
      )
    );
    
    const json = complexSpec.toJSON();
    console.log('JSON representation:');
    console.log(JSON.stringify(json, null, 2));
    
    // Reconstruct from JSON
    const reconstructed = SpecificationFactory.fromJSON<User>(json);
    console.log(`Reconstructed DSL: ${reconstructed.toDSL()}`);
    
    console.log('');
  }

  private static demoDSLExport(): void {
    console.log('7. DSL Export with Pretty Printing');
    console.log('==================================');
    
    const complexSpec = SpecificationFactory.and(
      SpecificationFactory.greaterThan<User>('age', 18),
      SpecificationFactory.or(
        SpecificationFactory.equals<User>('role', 'admin'),
        SpecificationFactory.and(
          SpecificationFactory.startsWith<User>('name', 'A'),
          SpecificationFactory.equals<User>('isActive', true)
        )
      ),
      SpecificationFactory.not(
        SpecificationFactory.contains<User>('email', 'test')
      )
    );
    
    const exporter = new DslExporter({ 
      prettyPrint: true, 
      indentSize: 2,
      maxLineLength: 50
    });
    
    console.log('Pretty-printed DSL:');
    console.log(exporter.export(complexSpec));
    
    console.log('');
  }

  private static demoDSLParsing(): void {
    console.log('8. DSL Parsing');
    console.log('=============');
    
    const parser = new DslParser<User>();
    
    try {
      // Simple expression
      const dsl1 = 'age > 18 && isActive == true';
      const spec1 = parser.parse(dsl1);
      console.log(`Parsed: ${dsl1}`);
      console.log(`Back to DSL: ${spec1.toDSL()}`);
      
      // Expression with functions
      const dsl2 = 'startsWith(name, "A") && age > 25';
      const spec2 = parser.parse(dsl2);
      console.log(`Parsed: ${dsl2}`);
      console.log(`Back to DSL: ${spec2.toDSL()}`);
      
    } catch (error) {
      console.log('Parsing error:', error);
    }
    
    console.log('');
  }
}

// Example usage
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).PraxisSpecificationDemo = PraxisSpecificationDemo;
} else {
  // Node environment
  PraxisSpecificationDemo.runDemo();
}