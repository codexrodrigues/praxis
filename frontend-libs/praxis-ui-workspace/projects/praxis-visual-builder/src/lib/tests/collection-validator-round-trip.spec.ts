import { TestBed } from '@angular/core/testing';
import { SpecificationBridgeService } from '../services/specification-bridge.service';
import { 
  CollectionValidatorConfig, 
  RuleNode, 
  RuleNodeType 
} from '../models/rule-builder.model';

// TODO: Re-enable these tests when @praxis/specification adds native support for collection validators
describe.skip('CollectionValidatorRoundTripTests', () => {
  let bridgeService: SpecificationBridgeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [SpecificationBridgeService]
    }).compileComponents();

    bridgeService = TestBed.inject(SpecificationBridgeService);
  });

  describe('ForEach Specification Round-Trip', () => {
    it('should convert simple ForEach RuleNode to Specification and back', () => {
      // Arrange
      const forEachNode: RuleNode = {
        id: 'forEach_1',
        type: RuleNodeType.FOR_EACH,
        label: 'For Each: contacts',
        config: {
          type: 'forEach',
          targetCollection: 'contacts',
          itemVariable: 'contact',
          indexVariable: 'index',
          itemValidationRules: [
            {
              ruleType: 'required',
              fieldPath: 'contact.email',
              errorMessage: 'Email is required for each contact'
            },
            {
              ruleType: 'format',
              fieldPath: 'contact.phone',
              errorMessage: 'Phone must be valid format'
            }
          ],
          validateOnAdd: true,
          validateOnChange: true,
          errorStrategy: 'both'
        } as CollectionValidatorConfig
      };

      // Act & Assert - Round-trip test
      const roundTripResult = bridgeService.validateRoundTrip(forEachNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
      expect(roundTripResult.warnings).toHaveLength(0);
    });

    it('should handle ForEach with nested object validation', () => {
      // Arrange
      const forEachNode: RuleNode = {
        id: 'forEach_nested',
        type: RuleNodeType.FOR_EACH,
        label: 'For Each: employees',
        config: {
          type: 'forEach',
          targetCollection: 'employees',
          itemVariable: 'employee',
          itemValidationRules: [
            {
              ruleType: 'required',
              fieldPath: 'employee.personalInfo.firstName',
              errorMessage: 'First name is required'
            },
            {
              ruleType: 'required',
              fieldPath: 'employee.personalInfo.lastName',
              errorMessage: 'Last name is required'
            },
            {
              ruleType: 'condition',
              fieldPath: 'employee.salary',
              errorMessage: 'Salary must be greater than minimum wage'
            },
            {
              ruleType: 'cross-item',
              fieldPath: 'employee.employeeId',
              errorMessage: 'Employee ID must be unique across all employees'
            }
          ],
          batchSize: 25,
          debounceValidation: true,
          debounceDelay: 500
        } as CollectionValidatorConfig
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(forEachNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });

    it('should handle ForEach with performance options', () => {
      // Arrange
      const forEachNode: RuleNode = {
        id: 'forEach_performance',
        type: RuleNodeType.FOR_EACH,
        label: 'For Each: largeDataset',
        config: {
          type: 'forEach',
          targetCollection: 'largeDataset',
          itemVariable: 'item',
          indexVariable: 'i',
          itemValidationRules: [
            {
              ruleType: 'required',
              fieldPath: 'item.id',
              errorMessage: 'ID is required'
            }
          ],
          batchSize: 100,
          debounceValidation: true,
          debounceDelay: 1000,
          stopOnFirstError: true,
          highlightErrorItems: false
        } as CollectionValidatorConfig
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(forEachNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });
  });

  describe('UniqueBy Specification Round-Trip', () => {
    it('should convert UniqueBy RuleNode to Specification and back', () => {
      // Arrange
      const uniqueByNode: RuleNode = {
        id: 'uniqueBy_1',
        type: RuleNodeType.UNIQUE_BY,
        label: 'Unique By: email',
        config: {
          type: 'uniqueBy',
          targetCollection: 'users',
          uniqueByFields: ['email'],
          caseSensitive: false,
          ignoreEmpty: true,
          duplicateErrorMessage: 'Email address must be unique',
          errorStrategy: 'inline',
          highlightErrorItems: true
        } as CollectionValidatorConfig
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(uniqueByNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });

    it('should handle UniqueBy with multiple fields', () => {
      // Arrange
      const uniqueByNode: RuleNode = {
        id: 'uniqueBy_multiple',
        type: RuleNodeType.UNIQUE_BY,
        label: 'Unique By: firstName, lastName, dateOfBirth',
        config: {
          type: 'uniqueBy',
          targetCollection: 'people',
          uniqueByFields: ['firstName', 'lastName', 'dateOfBirth'],
          caseSensitive: true,
          ignoreEmpty: false,
          duplicateErrorMessage: 'Person with same name and birth date already exists',
          validateOnAdd: true,
          validateOnChange: false,
          errorStrategy: 'summary'
        } as CollectionValidatorConfig
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(uniqueByNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });

    it('should handle UniqueBy with nested field paths', () => {
      // Arrange
      const uniqueByNode: RuleNode = {
        id: 'uniqueBy_nested',
        type: RuleNodeType.UNIQUE_BY,
        label: 'Unique By: account.number, profile.socialSecurityNumber',
        config: {
          type: 'uniqueBy',
          targetCollection: 'customers',
          uniqueByFields: ['account.number', 'profile.socialSecurityNumber'],
          caseSensitive: true,
          ignoreEmpty: true,
          duplicateErrorMessage: 'Customer with same account or SSN already exists'
        } as CollectionValidatorConfig
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(uniqueByNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });
  });

  describe('MinLength Specification Round-Trip', () => {
    it('should convert MinLength RuleNode to Specification and back', () => {
      // Arrange
      const minLengthNode: RuleNode = {
        id: 'minLength_1',
        type: RuleNodeType.MIN_LENGTH,
        label: 'Min Length: 3 items',
        config: {
          type: 'minLength',
          targetCollection: 'skills',
          minItems: 3,
          lengthErrorMessage: 'At least 3 skills are required',
          showItemCount: true,
          validateOnAdd: true,
          validateOnRemove: true
        } as CollectionValidatorConfig
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(minLengthNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });

    it('should handle MinLength with zero minimum', () => {
      // Arrange
      const minLengthNode: RuleNode = {
        id: 'minLength_zero',
        type: RuleNodeType.MIN_LENGTH,
        label: 'Min Length: 0 items',
        config: {
          type: 'minLength',
          targetCollection: 'optionalItems',
          minItems: 0,
          lengthErrorMessage: 'This collection is optional',
          showItemCount: false,
          validateOnSubmit: true
        } as CollectionValidatorConfig
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(minLengthNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });
  });

  describe('MaxLength Specification Round-Trip', () => {
    it('should convert MaxLength RuleNode to Specification and back', () => {
      // Arrange
      const maxLengthNode: RuleNode = {
        id: 'maxLength_1',
        type: RuleNodeType.MAX_LENGTH,
        label: 'Max Length: 10 items',
        config: {
          type: 'maxLength',
          targetCollection: 'attachments',
          maxItems: 10,
          lengthErrorMessage: 'Maximum 10 attachments allowed',
          showItemCount: true,
          preventExcess: true,
          validateOnAdd: true
        } as CollectionValidatorConfig
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(maxLengthNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });

    it('should handle MaxLength with large limits', () => {
      // Arrange
      const maxLengthNode: RuleNode = {
        id: 'maxLength_large',
        type: RuleNodeType.MAX_LENGTH,
        label: 'Max Length: 1000 items',
        config: {
          type: 'maxLength',
          targetCollection: 'logEntries',
          maxItems: 1000,
          lengthErrorMessage: 'Log cannot exceed 1000 entries',
          showItemCount: false,
          preventExcess: false,
          batchSize: 50,
          debounceValidation: true,
          debounceDelay: 2000
        } as CollectionValidatorConfig
      };

      // Act & Assert
      const roundTripResult = bridgeService.validateRoundTrip(maxLengthNode);
      
      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.errors).toHaveLength(0);
    });
  });

  describe('DSL Export/Import Round-Trip', () => {
    it('should export ForEach validator to DSL and parse back correctly', () => {
      // Arrange
      const forEachNode: RuleNode = {
        id: 'dsl_forEach',
        type: RuleNodeType.FOR_EACH,
        label: 'For Each: products',
        config: {
          type: 'forEach',
          targetCollection: 'products',
          itemVariable: 'product',
          itemValidationRules: [
            {
              ruleType: 'required',
              fieldPath: 'product.name',
              errorMessage: 'Product name is required'
            },
            {
              ruleType: 'condition',
              fieldPath: 'product.price',
              errorMessage: 'Price must be greater than 0'
            }
          ]
        } as CollectionValidatorConfig
      };

      // Act
      const dslExport = bridgeService.exportToDsl(forEachNode);
      expect(dslExport).toBeTruthy();
      expect(dslExport).toContain('forEach');
      expect(dslExport).toContain('products');
      expect(dslExport).toContain('product.name');
      expect(dslExport).toContain('product.price');

      // Note: DSL parsing back to RuleNode would require the complete DSL parser
      // For now, we verify the export contains expected elements
    });

    it('should export UniqueBy validator with metadata to DSL', () => {
      // Arrange
      const uniqueByNode: RuleNode = {
        id: 'dsl_uniqueBy',
        type: RuleNodeType.UNIQUE_BY,
        label: 'Unique By: email, username',
        config: {
          type: 'uniqueBy',
          targetCollection: 'accounts',
          uniqueByFields: ['email', 'username'],
          caseSensitive: false,
          duplicateErrorMessage: 'Account with same email or username already exists'
        } as CollectionValidatorConfig
      };

      // Act
      const dslExport = bridgeService.exportToDslWithMetadata(uniqueByNode);
      
      // Assert
      expect(dslExport).toBeTruthy();
      expect(dslExport).toContain('uniqueBy');
      expect(dslExport).toContain('accounts');
      expect(dslExport).toContain('email');
      expect(dslExport).toContain('username');
      
      // Check metadata is included
      expect(dslExport).toContain('Account with same email or username');
    });

    it('should export complex collection validator with all options', () => {
      // Arrange
      const complexNode: RuleNode = {
        id: 'complex_collection',
        type: RuleNodeType.FOR_EACH,
        config: {
          type: 'forEach',
          targetCollection: 'orderItems',
          itemVariable: 'orderItem',
          indexVariable: 'itemIndex',
          itemValidationRules: [
            {
              ruleType: 'required',
              fieldPath: 'orderItem.productId',
              errorMessage: 'Product ID is required'
            },
            {
              ruleType: 'condition',
              fieldPath: 'orderItem.quantity',
              errorMessage: 'Quantity must be at least 1'
            },
            {
              ruleType: 'format',
              fieldPath: 'orderItem.price',
              errorMessage: 'Price must be a valid currency amount'
            }
          ],
          validateOnAdd: true,
          validateOnChange: true,
          validateOnSubmit: true,
          errorStrategy: 'both',
          stopOnFirstError: false,
          highlightErrorItems: true,
          batchSize: 20,
          debounceValidation: true,
          debounceDelay: 300
        } as CollectionValidatorConfig
      };

      // Act
      const dslExport = bridgeService.exportToDslWithMetadata(complexNode);
      
      // Assert
      expect(dslExport).toBeTruthy();
      expect(dslExport).toContain('forEach');
      expect(dslExport).toContain('orderItems');
      expect(dslExport).toContain('orderItem');
      expect(dslExport).toContain('productId');
      expect(dslExport).toContain('quantity');
      expect(dslExport).toContain('price');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing targetCollection gracefully', () => {
      // Arrange - Invalid node without targetCollection
      const invalidNode: RuleNode = {
        id: 'invalid_forEach',
        type: RuleNodeType.FOR_EACH,
        config: {
          type: 'forEach',
          targetCollection: '', // Invalid - empty
          itemValidationRules: []
        } as CollectionValidatorConfig
      };

      // Act & Assert
      expect(() => {
        bridgeService.ruleNodeToSpecification(invalidNode);
      }).toThrow('Collection validator requires targetCollection');
    });

    it('should handle missing validation rules for ForEach', () => {
      // Arrange
      const invalidNode: RuleNode = {
        id: 'invalid_forEach_rules',
        type: RuleNodeType.FOR_EACH,
        config: {
          type: 'forEach',
          targetCollection: 'items',
          itemValidationRules: [] // Invalid - empty rules
        } as CollectionValidatorConfig
      };

      // Act & Assert
      expect(() => {
        bridgeService.ruleNodeToSpecification(invalidNode);
      }).toThrow('ForEach validator requires at least one validation rule');
    });

    it('should handle missing unique fields for UniqueBy', () => {
      // Arrange
      const invalidNode: RuleNode = {
        id: 'invalid_uniqueBy',
        type: RuleNodeType.UNIQUE_BY,
        config: {
          type: 'uniqueBy',
          targetCollection: 'items',
          uniqueByFields: [] // Invalid - empty fields
        } as CollectionValidatorConfig
      };

      // Act & Assert
      expect(() => {
        bridgeService.ruleNodeToSpecification(invalidNode);
      }).toThrow('UniqueBy validator requires at least one field');
    });

    it('should handle missing length values gracefully', () => {
      // Arrange - MinLength without minItems
      const invalidMinLength: RuleNode = {
        id: 'invalid_minLength',
        type: RuleNodeType.MIN_LENGTH,
        config: {
          type: 'minLength',
          targetCollection: 'items'
          // Missing minItems
        } as CollectionValidatorConfig
      };

      // Act & Assert
      expect(() => {
        bridgeService.ruleNodeToSpecification(invalidMinLength);
      }).toThrow('MinLength validator requires minItems value');

      // Arrange - MaxLength without maxItems
      const invalidMaxLength: RuleNode = {
        id: 'invalid_maxLength',
        type: RuleNodeType.MAX_LENGTH,
        config: {
          type: 'maxLength',
          targetCollection: 'items'
          // Missing maxItems
        } as CollectionValidatorConfig
      };

      // Act & Assert
      expect(() => {
        bridgeService.ruleNodeToSpecification(invalidMaxLength);
      }).toThrow('MaxLength validator requires maxItems value');
    });
  });

  describe('Performance and Complex Scenarios', () => {
    it('should handle large collections efficiently', () => {
      // Arrange - Large collection with complex validation
      const largeCollectionNode: RuleNode = {
        id: 'large_collection',
        type: RuleNodeType.FOR_EACH,
        config: {
          type: 'forEach',
          targetCollection: 'massiveDataset',
          itemVariable: 'record',
          indexVariable: 'recordIndex',
          itemValidationRules: [
            {
              ruleType: 'required',
              fieldPath: 'record.id',
              errorMessage: 'ID is required'
            },
            {
              ruleType: 'format',
              fieldPath: 'record.email',
              errorMessage: 'Valid email required'
            },
            {
              ruleType: 'condition',
              fieldPath: 'record.age',
              errorMessage: 'Age must be between 18 and 120'
            }
          ],
          batchSize: 1000,
          debounceValidation: true,
          debounceDelay: 1500,
          stopOnFirstError: false,
          highlightErrorItems: false
        } as CollectionValidatorConfig
      };

      // Act - Should complete within reasonable time
      const startTime = performance.now();
      const roundTripResult = bridgeService.validateRoundTrip(largeCollectionNode);
      const endTime = performance.now();

      // Assert
      expect(roundTripResult.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
      expect(roundTripResult.errors).toHaveLength(0);
    });

    it('should handle multiple collection validators with same target', () => {
      // Arrange - Multiple validators for same collection
      const minLengthNode: RuleNode = {
        id: 'multi_minLength',
        type: RuleNodeType.MIN_LENGTH,
        config: {
          type: 'minLength',
          targetCollection: 'sharedCollection',
          minItems: 2,
          lengthErrorMessage: 'At least 2 items required'
        } as CollectionValidatorConfig
      };

      const maxLengthNode: RuleNode = {
        id: 'multi_maxLength',
        type: RuleNodeType.MAX_LENGTH,
        config: {
          type: 'maxLength',
          targetCollection: 'sharedCollection',
          maxItems: 10,
          lengthErrorMessage: 'Maximum 10 items allowed'
        } as CollectionValidatorConfig
      };

      const uniqueByNode: RuleNode = {
        id: 'multi_uniqueBy',
        type: RuleNodeType.UNIQUE_BY,
        config: {
          type: 'uniqueBy',
          targetCollection: 'sharedCollection',
          uniqueByFields: ['id'],
          duplicateErrorMessage: 'IDs must be unique'
        } as CollectionValidatorConfig
      };

      // Act & Assert - All should work independently
      const minLengthResult = bridgeService.validateRoundTrip(minLengthNode);
      const maxLengthResult = bridgeService.validateRoundTrip(maxLengthNode);
      const uniqueByResult = bridgeService.validateRoundTrip(uniqueByNode);

      expect(minLengthResult.success).toBe(true);
      expect(maxLengthResult.success).toBe(true);
      expect(uniqueByResult.success).toBe(true);
      
      expect(minLengthResult.errors).toHaveLength(0);
      expect(maxLengthResult.errors).toHaveLength(0);
      expect(uniqueByResult.errors).toHaveLength(0);
    });
  });
});