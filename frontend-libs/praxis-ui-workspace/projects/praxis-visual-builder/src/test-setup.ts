// Test setup for praxis-visual-builder
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Configure the test environment
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Global test configuration
beforeEach(() => {
  // Reset any global state before each test
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000; // 30 seconds for complex tests
});

// Mock performance API if not available
if (typeof performance === 'undefined') {
  (globalThis as any).performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: () => [],
    getEntriesByName: () => [],
  };
}

// Mock console methods for cleaner test output
const originalConsole = console;
beforeAll(() => {
  spyOn(console, 'warn').and.stub();
  spyOn(console, 'error').and.stub();
  spyOn(console, 'log').and.stub();
});

afterAll(() => {
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.log = originalConsole.log;
});

// Global test utilities
(globalThis as any).testUtils = {
  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Helper to create mock field schemas
  createMockFieldSchemas: (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      name: `field${i}`,
      type: ['string', 'number', 'boolean', 'date'][i % 4],
      label: `Field ${i}`,
      description: `Test field ${i}`,
    })),

  // Helper to create mock context variables
  createMockContextVariables: (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: `${i}`,
      name: `namespace${Math.floor(i / 10)}.variable${i}`,
      type: ['string', 'number', 'boolean', 'date'][i % 4] as any,
      scope: ['user', 'session', 'env', 'global'][i % 4] as any,
      description: `Test variable ${i}`,
      example: `value${i}`,
    })),

  // Helper to generate test expressions
  generateTestExpression: (
    complexity: 'simple' | 'medium' | 'complex' = 'simple',
  ) => {
    switch (complexity) {
      case 'simple':
        return 'age > 18';
      case 'medium':
        return 'age > 18 && status == "active" && department != null';
      case 'complex':
        return '((age > 18 && age < 65) || seniority > 5) && (status == "active" || status == "pending") && contains(skills, "required")';
      default:
        return 'age > 18';
    }
  },
};

// Custom matchers for better test assertions
beforeEach(() => {
  jasmine.addMatchers({
    toBeValidExpression: () => ({
      compare: (actual: any) => {
        const isValid =
          actual &&
          typeof actual === 'object' &&
          actual.hasOwnProperty('isValid') &&
          actual.isValid === true &&
          Array.isArray(actual.issues);

        return {
          pass: isValid,
          message: isValid
            ? `Expected expression to be invalid`
            : `Expected expression to be valid, but got: ${JSON.stringify(actual)}`,
        };
      },
    }),

    toHaveValidationIssues: () => ({
      compare: (actual: any, expectedCount?: number) => {
        const hasIssues =
          actual && Array.isArray(actual.issues) && actual.issues.length > 0;

        const countMatches =
          expectedCount === undefined || actual.issues.length === expectedCount;

        return {
          pass: hasIssues && countMatches,
          message:
            hasIssues && countMatches
              ? `Expected no validation issues or different count`
              : `Expected validation issues${expectedCount ? ` (count: ${expectedCount})` : ''}, but got: ${actual.issues?.length || 0}`,
        };
      },
    }),

    toCompleteWithinTime: () => ({
      compare: (actualTime: number, expectedMaxTime: number) => {
        const withinTime = actualTime <= expectedMaxTime;

        return {
          pass: withinTime,
          message: withinTime
            ? `Expected operation to take longer than ${expectedMaxTime}ms`
            : `Expected operation to complete within ${expectedMaxTime}ms, but took ${actualTime}ms`,
        };
      },
    }),
  });
});

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection in tests:', event.reason);
    event.preventDefault();
  });
}

// Export test utilities type for TypeScript
declare global {
  namespace jasmine {
    interface Matchers<T> {
      toBeValidExpression(): boolean;
      toHaveValidationIssues(expectedCount?: number): boolean;
      toCompleteWithinTime(expectedMaxTime: number): boolean;
    }
  }

  var testUtils: {
    waitFor: (ms: number) => Promise<void>;
    createMockFieldSchemas: (count: number) => any[];
    createMockContextVariables: (count: number) => any[];
    generateTestExpression: (
      complexity?: 'simple' | 'medium' | 'complex',
    ) => string;
  };
}
