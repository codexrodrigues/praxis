/**
 * DSL Linter Usage Examples
 * 
 * This file demonstrates how to use the DSL Linter component
 * of the Praxis Visual Builder for real-time code analysis.
 */

import { Injectable } from '@angular/core';
import { DslLinterComponent, DslLintError, DslLintRule, DslQuickFix } from '../components/dsl-linter.component';
import { RuleBuilderService } from '../services/rule-builder.service';

@Injectable({
  providedIn: 'root'
})
export class DslLinterExampleService {

  constructor(
    private ruleBuilderService: RuleBuilderService
  ) {}

  /**
   * Example 1: Basic DSL Linter Integration
   */
  basicLinterExample(): void {
    // Example DSL with intentional errors for demonstration
    const dslWithErrors = `
      // Example DSL with various issues
      if (${user.name} == "John Doe") {
        required(${user.email});
        visible(${user.phone}   ); // trailing whitespace
        
        if (${user.age} > 18 && ${user.status} == "active" && ${user.verified} == true && ${user.premium} == true && ${user.subscription} != null) {
          // Complex expression that exceeds recommended complexity
          enabled(${user.advancedFeatures});
        }
        
        if (${user.score} > 100) {
          // Magic number without explanation
          enabled(${user.bonusFeatures});
        }
        
        // Missing closing brace - syntax error
      `;

    // The linter will automatically detect:
    // - Syntax errors (missing closing brace)
    // - Trailing whitespace
    // - Complex expressions
    // - Magic numbers
    // - Style violations

    console.log('DSL with errors for linting:', dslWithErrors);
  }

  /**
   * Example 2: Custom Linter Rules Configuration
   */
  configureCustomRules(): DslLintRule[] {
    return [
      {
        id: 'custom-001',
        name: 'Require Field Documentation',
        description: 'All complex field references should include documentation comments',
        category: 'documentation',
        severity: 'warning',
        enabled: true,
        configurable: true,
        config: {
          minComplexity: 3,
          requiredFields: ['user.email', 'user.phone']
        }
      },
      {
        id: 'custom-002',
        name: 'Consistent Naming Convention',
        description: 'Field names should follow camelCase convention',
        category: 'style',
        severity: 'info',
        enabled: true,
        configurable: true,
        config: {
          namingPattern: '^[a-z][a-zA-Z0-9]*$',
          allowUnderscores: false
        }
      },
      {
        id: 'custom-003',
        name: 'Security Field Validation',
        description: 'Sensitive fields should include proper validation',
        category: 'security',
        severity: 'error',
        enabled: true,
        configurable: false,
        config: {
          sensitiveFields: ['password', 'ssn', 'creditCard'],
          requiredValidations: ['required', 'minLength', 'pattern']
        }
      }
    ];
  }

  /**
   * Example 3: Handling Linter Errors Programmatically
   */
  handleLinterErrors(): void {
    // Example of how to handle linter errors in your application
    const onErrorSelected = (error: DslLintError) => {
      console.log('Linter error selected:', error);
      
      // Navigate to specific line in editor
      this.navigateToLine(error.line, error.column);
      
      // Show error details in sidebar
      this.showErrorDetails(error);
      
      // Track error analytics
      this.trackLintingAnalytics('error-selected', {
        errorCode: error.code,
        severity: error.severity,
        category: error.category
      });
    };

    // Example of handling quick fix application
    const onQuickFixApplied = (event: { error: DslLintError; fix: DslQuickFix }) => {
      console.log('Quick fix applied:', event);
      
      // Update the DSL with the fix
      this.applyDslFix(event.fix);
      
      // Show success notification
      this.showNotification(`Applied fix: ${event.fix.title}`, 'success');
      
      // Track fix usage
      this.trackLintingAnalytics('quick-fix-applied', {
        errorCode: event.error.code,
        fixTitle: event.fix.title
      });
    };

    // Example of handling rule toggling
    const onRuleToggled = (event: { rule: DslLintRule; enabled: boolean }) => {
      console.log('Rule toggled:', event);
      
      // Save rule preferences
      this.saveLinterPreferences(event.rule.id, event.enabled);
      
      // Re-validate current DSL with new rule set
      this.revalidateCurrentDsl();
    };
  }

  /**
   * Example 4: Advanced Error Analysis
   */
  performAdvancedAnalysis(errors: DslLintError[]): any {
    // Analyze error patterns
    const errorAnalysis = {
      // Group errors by category
      byCategory: this.groupErrorsByCategory(errors),
      
      // Identify hotspots (lines with multiple errors)
      hotspots: this.findErrorHotspots(errors),
      
      // Calculate code quality metrics
      qualityMetrics: this.calculateQualityMetrics(errors),
      
      // Suggest refactoring opportunities
      refactoringOpportunities: this.identifyRefactoringOpportunities(errors),
      
      // Generate quality report
      qualityReport: this.generateQualityReport(errors)
    };

    return errorAnalysis;
  }

  /**
   * Example 5: Custom Quick Fixes
   */
  createCustomQuickFixes(): DslQuickFix[] {
    return [
      {
        title: 'Extract Complex Expression',
        description: 'Extract complex boolean expression into a named condition',
        edits: [
          {
            range: {
              startLine: 1,
              startColumn: 1,
              endLine: 1,
              endColumn: 1
            },
            newText: '// Define complex condition\nconst isEligibleUser = '
          },
          {
            range: {
              startLine: 5,
              startColumn: 8,
              endLine: 5,
              endColumn: 45
            },
            newText: 'isEligibleUser'
          }
        ]
      },
      {
        title: 'Add Field Documentation',
        description: 'Add JSDoc-style documentation for the field',
        edits: [
          {
            range: {
              startLine: 3,
              startColumn: 1,
              endLine: 3,
              endColumn: 1
            },
            newText: '/**\n * @field user.email - User email address\n * @required true\n * @validation email format\n */\n'
          }
        ]
      },
      {
        title: 'Convert to Constant',
        description: 'Replace magic number with named constant',
        edits: [
          {
            range: {
              startLine: 1,
              startColumn: 1,
              endLine: 1,
              endColumn: 1
            },
            newText: 'const MINIMUM_AGE = 18;\n\n'
          },
          {
            range: {
              startLine: 8,
              startColumn: 25,
              endLine: 8,
              endColumn: 27
            },
            newText: 'MINIMUM_AGE'
          }
        ]
      }
    ];
  }

  /**
   * Example 6: Linter Performance Optimization
   */
  optimizeLinterPerformance(): void {
    // Configure linter for optimal performance
    const optimizedConfig = {
      // Debounce linting for real-time editing
      lintDelay: 500,
      
      // Enable only essential rules for real-time linting
      realTimeRules: [
        'syntax-001', 'syntax-002', 'syntax-003',
        'semantic-001', 'semantic-002'
      ],
      
      // Run comprehensive analysis on demand
      comprehensiveRules: [
        'style-001', 'style-002', 'style-003',
        'performance-001', 'performance-002',
        'best-practice-001', 'best-practice-002', 'best-practice-003'
      ],
      
      // Batch process large DSL files
      batchSize: 100, // lines per batch
      batchDelay: 50  // ms between batches
    };

    console.log('Optimized linter configuration:', optimizedConfig);
  }

  /**
   * Example 7: Integration with External Tools
   */
  integrateWithExternalTools(): void {
    // Example: Send linting results to external code quality service
    const sendToQualityService = (errors: DslLintError[]) => {
      const qualityData = {
        projectId: 'praxis-visual-builder',
        timestamp: new Date().toISOString(),
        errors: errors.map(error => ({
          code: error.code,
          severity: error.severity,
          category: error.category,
          line: error.line,
          column: error.column,
          message: error.message
        })),
        metrics: {
          totalErrors: errors.filter(e => e.severity === 'error').length,
          totalWarnings: errors.filter(e => e.severity === 'warning').length,
          codeQualityScore: this.calculateQualityScore(errors)
        }
      };

      // Send to external service (example)
      fetch('/api/code-quality/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qualityData)
      }).then(response => {
        console.log('Quality report sent successfully');
      }).catch(error => {
        console.error('Failed to send quality report:', error);
      });
    };

    // Example: Export linting results to various formats
    const exportResults = (errors: DslLintError[], format: 'json' | 'xml' | 'csv') => {
      switch (format) {
        case 'json':
          return JSON.stringify(errors, null, 2);
        
        case 'xml':
          return this.convertErrorsToXml(errors);
        
        case 'csv':
          return this.convertErrorsToCsv(errors);
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    };
  }

  // Helper methods (simplified implementations)
  private navigateToLine(line: number, column: number): void {
    console.log(`Navigate to line ${line}, column ${column}`);
  }

  private showErrorDetails(error: DslLintError): void {
    console.log('Show error details:', error);
  }

  private trackLintingAnalytics(event: string, data: any): void {
    console.log(`Analytics: ${event}`, data);
  }

  private applyDslFix(fix: DslQuickFix): void {
    console.log('Apply DSL fix:', fix);
  }

  private showNotification(message: string, type: string): void {
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  private saveLinterPreferences(ruleId: string, enabled: boolean): void {
    const prefs = JSON.parse(localStorage.getItem('linter-preferences') || '{}');
    prefs[ruleId] = enabled;
    localStorage.setItem('linter-preferences', JSON.stringify(prefs));
  }

  private revalidateCurrentDsl(): void {
    // Trigger re-validation with current rule set
    console.log('Re-validating DSL with updated rules');
  }

  private groupErrorsByCategory(errors: DslLintError[]): Record<string, DslLintError[]> {
    return errors.reduce((groups, error) => {
      if (!groups[error.category]) {
        groups[error.category] = [];
      }
      groups[error.category].push(error);
      return groups;
    }, {} as Record<string, DslLintError[]>);
  }

  private findErrorHotspots(errors: DslLintError[]): number[] {
    const lineCounts = new Map<number, number>();
    errors.forEach(error => {
      lineCounts.set(error.line, (lineCounts.get(error.line) || 0) + 1);
    });
    
    return Array.from(lineCounts.entries())
      .filter(([line, count]) => count > 2)
      .map(([line]) => line);
  }

  private calculateQualityMetrics(errors: DslLintError[]): any {
    const totalErrors = errors.filter(e => e.severity === 'error').length;
    const totalWarnings = errors.filter(e => e.severity === 'warning').length;
    
    return {
      errorDensity: totalErrors / 100, // errors per 100 lines
      warningDensity: totalWarnings / 100,
      qualityScore: Math.max(0, 100 - (totalErrors * 10) - (totalWarnings * 5)),
      maintainabilityIndex: this.calculateMaintainabilityIndex(errors)
    };
  }

  private calculateMaintainabilityIndex(errors: DslLintError[]): number {
    // Simplified maintainability calculation
    const complexityPenalty = errors.filter(e => e.code.includes('performance')).length * 5;
    const stylePenalty = errors.filter(e => e.category === 'style').length * 2;
    const semanticPenalty = errors.filter(e => e.category === 'semantic').length * 8;
    
    return Math.max(0, 100 - complexityPenalty - stylePenalty - semanticPenalty);
  }

  private identifyRefactoringOpportunities(errors: DslLintError[]): string[] {
    const opportunities = [];
    
    if (errors.some(e => e.code === 'performance-001')) {
      opportunities.push('Consider extracting complex expressions into named conditions');
    }
    
    if (errors.some(e => e.code === 'best-practice-002')) {
      opportunities.push('Reduce nesting depth by using early returns or guard clauses');
    }
    
    if (errors.some(e => e.code === 'best-practice-001')) {
      opportunities.push('Replace magic numbers with named constants');
    }
    
    return opportunities;
  }

  private generateQualityReport(errors: DslLintError[]): any {
    const metrics = this.calculateQualityMetrics(errors);
    const categories = this.groupErrorsByCategory(errors);
    
    return {
      summary: {
        totalIssues: errors.length,
        criticalIssues: errors.filter(e => e.severity === 'error').length,
        qualityScore: metrics.qualityScore,
        grade: this.getQualityGrade(metrics.qualityScore)
      },
      categories: Object.keys(categories).map(category => ({
        name: category,
        count: categories[category].length,
        severity: this.getMostSevereCategoryLevel(categories[category])
      })),
      recommendations: this.identifyRefactoringOpportunities(errors),
      trends: {
        // This would typically compare with previous runs
        improving: metrics.qualityScore > 75,
        stable: metrics.qualityScore >= 60 && metrics.qualityScore <= 75,
        declining: metrics.qualityScore < 60
      }
    };
  }

  private calculateQualityScore(errors: DslLintError[]): number {
    return this.calculateQualityMetrics(errors).qualityScore;
  }

  private getQualityGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private getMostSevereCategoryLevel(errors: DslLintError[]): string {
    if (errors.some(e => e.severity === 'error')) return 'error';
    if (errors.some(e => e.severity === 'warning')) return 'warning';
    if (errors.some(e => e.severity === 'info')) return 'info';
    return 'hint';
  }

  private convertErrorsToXml(errors: DslLintError[]): string {
    // Simplified XML conversion
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<linting-results>\n';
    errors.forEach(error => {
      xml += `  <error code="${error.code}" severity="${error.severity}" line="${error.line}" column="${error.column}">\n`;
      xml += `    <message>${error.message}</message>\n`;
      xml += `    <category>${error.category}</category>\n`;
      xml += `  </error>\n`;
    });
    xml += '</linting-results>';
    return xml;
  }

  private convertErrorsToCsv(errors: DslLintError[]): string {
    const headers = ['Code', 'Severity', 'Line', 'Column', 'Message', 'Category'];
    const rows = errors.map(error => [
      error.code,
      error.severity,
      error.line.toString(),
      error.column.toString(),
      `"${error.message.replace(/"/g, '""')}"`,
      error.category
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

/**
 * Usage in Angular Component:
 * 
 * ```typescript
 * export class MyComponent {
 *   constructor(private linterExamples: DslLinterExampleService) {}
 * 
 *   ngOnInit() {
 *     // Set up custom linter rules
 *     const customRules = this.linterExamples.configureCustomRules();
 *     
 *     // Configure error handling
 *     this.linterExamples.handleLinterErrors();
 *     
 *     // Optimize performance
 *     this.linterExamples.optimizeLinterPerformance();
 *   }
 * 
 *   onLintingComplete(errors: DslLintError[]) {
 *     // Perform advanced analysis
 *     const analysis = this.linterExamples.performAdvancedAnalysis(errors);
 *     console.log('Advanced analysis results:', analysis);
 *   }
 * }
 * ```
 * 
 * Template usage:
 * 
 * ```html
 * <praxis-dsl-linter
 *   [dsl]="currentDsl"
 *   [autoLint]="true"
 *   [lintDelay]="500"
 *   (errorSelected)="onErrorSelected($event)"
 *   (quickFixApplied)="onQuickFixApplied($event)"
 *   (ruleToggled)="onRuleToggled($event)">
 * </praxis-dsl-linter>
 * ```
 */