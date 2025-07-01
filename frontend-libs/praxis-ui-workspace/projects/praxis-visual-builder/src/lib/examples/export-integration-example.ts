/**
 * Export and Integration Usage Examples
 * 
 * This file demonstrates how to use the export and integration features
 * of the Praxis Visual Builder.
 */

import { Injectable } from '@angular/core';
import { 
  ExportIntegrationService, 
  ExportFormat, 
  ExternalSystemConfig 
} from '../services/export-integration.service';
import { 
  WebhookIntegrationService, 
  WebhookConfig 
} from '../services/webhook-integration.service';
import { RuleBuilderService } from '../services/rule-builder.service';

@Injectable({
  providedIn: 'root'
})
export class ExportIntegrationExampleService {

  constructor(
    private exportService: ExportIntegrationService,
    private webhookService: WebhookIntegrationService,
    private ruleBuilderService: RuleBuilderService
  ) {}

  /**
   * Example 1: Basic Export to Multiple Formats
   */
  async basicExportExample(): Promise<void> {
    try {
      // Export to multiple formats simultaneously
      const formats = ['json', 'dsl', 'yaml', 'typescript'];
      const results = await this.exportService.exportToMultipleFormats(formats, {
        includeMetadata: true,
        prettyPrint: true,
        includeComments: true,
        downloadFile: true
      }).toPromise();

      results?.forEach(result => {
        if (result.success) {
          console.log(`✅ Exported ${result.format.name}: ${result.filename} (${result.size} bytes)`);
        } else {
          console.error(`❌ Failed to export ${result.format.name}:`, result.errors);
        }
      });

    } catch (error) {
      console.error('Export failed:', error);
    }
  }

  /**
   * Example 2: Advanced JSON Schema Export
   */
  async jsonSchemaExportExample(): Promise<void> {
    try {
      const result = await this.exportService.exportRules({
        format: 'json-schema',
        includeMetadata: true,
        prettyPrint: true,
        includeComments: true,
        customFilename: 'praxis-rules-schema.json'
      }).toPromise();

      if (result?.success) {
        console.log('JSON Schema generated:', result.content);
        
        // The generated schema can be used for validation in other systems
        const schema = JSON.parse(result.content);
        console.log('Schema properties:', Object.keys(schema.properties || {}));
      }

    } catch (error) {
      console.error('JSON Schema export failed:', error);
    }
  }

  /**
   * Example 3: REST API Integration
   */
  setupRestApiIntegration(): void {
    const restApiSystem: ExternalSystemConfig = {
      id: 'rules-api',
      name: 'Rules Management API',
      type: 'rest-api',
      config: {
        baseUrl: 'https://api.example.com/rules',
        timeout: 30000
      },
      endpoints: [
        {
          id: 'create-rules',
          name: 'Create Rules',
          description: 'Creates new rules in the system',
          url: 'https://api.example.com/rules',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Version': '2.0'
          },
          authentication: {
            type: 'bearer',
            credentials: {
              token: 'your-api-token-here'
            }
          },
          supportedFormats: ['json', 'yaml'],
          responseFormat: 'json'
        },
        {
          id: 'update-rules',
          name: 'Update Rules',
          description: 'Updates existing rules',
          url: 'https://api.example.com/rules/{id}',
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          authentication: {
            type: 'bearer',
            credentials: {
              token: 'your-api-token-here'
            }
          },
          supportedFormats: ['json'],
          responseFormat: 'json'
        }
      ],
      enabled: true
    };

    // Register the system
    this.exportService.registerExternalSystem(restApiSystem);

    // Test connectivity
    this.exportService.testSystemConnectivity(restApiSystem.id).subscribe(result => {
      console.log('Connectivity test:', result);
    });
  }

  /**
   * Example 4: Webhook Integration for Real-time Updates
   */
  setupWebhookIntegration(): void {
    const webhookConfig: WebhookConfig = {
      id: 'rules-webhook',
      name: 'Rules Update Webhook',
      url: 'https://your-app.com/webhooks/rules',
      method: 'POST',
      headers: {
        'X-Webhook-Source': 'praxis-visual-builder',
        'X-API-Key': 'your-webhook-secret'
      },
      authentication: {
        type: 'apikey',
        credentials: {
          headerName: 'X-API-Key',
          apiKey: 'your-webhook-secret'
        }
      },
      format: 'json',
      events: [
        {
          type: 'rule-added',
          description: 'Triggered when a new rule is added',
          enabled: true
        },
        {
          type: 'rule-updated',
          description: 'Triggered when a rule is modified',
          enabled: true
        },
        {
          type: 'rule-deleted',
          description: 'Triggered when a rule is deleted',
          enabled: true
        },
        {
          type: 'validation-changed',
          description: 'Triggered when validation status changes',
          enabled: false
        }
      ],
      enabled: true,
      retryConfig: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2
      },
      filtering: {
        includeMetadata: true,
        minRuleCount: 1,
        ruleTypes: ['field', 'boolean-group', 'function']
      }
    };

    // Register the webhook
    this.webhookService.registerWebhook(webhookConfig);

    // Test the webhook
    this.webhookService.testWebhook(webhookConfig.id).subscribe(delivery => {
      console.log('Webhook test result:', delivery);
    });

    // Monitor webhook statistics
    this.webhookService.webhookStats$.subscribe(stats => {
      const webhookStats = stats[webhookConfig.id];
      if (webhookStats) {
        console.log(`Webhook stats: ${webhookStats.successfulDeliveries}/${webhookStats.totalDeliveries} successful`);
      }
    });
  }

  /**
   * Example 5: Cloud Storage Integration
   */
  setupCloudStorageIntegration(): void {
    const cloudStorage: ExternalSystemConfig = {
      id: 'aws-s3',
      name: 'AWS S3 Storage',
      type: 'cloud-storage',
      config: {
        region: 'us-east-1',
        bucket: 'my-rules-bucket'
      },
      endpoints: [
        {
          id: 'upload-rules',
          name: 'Upload Rules to S3',
          description: 'Uploads rules to AWS S3 bucket',
          url: 'https://my-rules-bucket.s3.amazonaws.com/',
          method: 'PUT',
          authentication: {
            type: 'basic',
            credentials: {
              username: 'access-key-id',
              password: 'secret-access-key'
            }
          },
          supportedFormats: ['json', 'yaml', 'xml'],
          responseFormat: 'xml'
        }
      ],
      enabled: true
    };

    this.exportService.registerExternalSystem(cloudStorage);
  }

  /**
   * Example 6: Database Integration
   */
  setupDatabaseIntegration(): void {
    const database: ExternalSystemConfig = {
      id: 'postgres-db',
      name: 'PostgreSQL Rules Database',
      type: 'database',
      config: {
        host: 'localhost',
        port: 5432,
        database: 'rules_db',
        schema: 'public'
      },
      endpoints: [
        {
          id: 'insert-rules',
          name: 'Insert Rules',
          description: 'Inserts rules into database',
          url: 'https://api.example.com/db/rules',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          authentication: {
            type: 'basic',
            credentials: {
              username: 'db_user',
              password: 'db_password'
            }
          },
          supportedFormats: ['json'],
          responseFormat: 'json'
        }
      ],
      enabled: true
    };

    this.exportService.registerExternalSystem(database);
  }

  /**
   * Example 7: Automated Integration Pipeline
   */
  async setupAutomatedPipeline(): Promise<void> {
    // Subscribe to rule changes and automatically export/integrate
    this.ruleBuilderService.stateChanged$.subscribe(async () => {
      const state = this.ruleBuilderService.getCurrentState();
      
      // Only proceed if we have rules and they're valid
      if (state.rootNodes.length > 0 && state.validationErrors.length === 0) {
        try {
          // 1. Export to JSON for API
          const jsonResult = await this.exportService.exportRules({
            format: 'json',
            includeMetadata: true,
            prettyPrint: false
          }).toPromise();

          if (jsonResult?.success) {
            // 2. Send to REST API
            await this.exportService.integrateWithSystem(
              'rules-api',
              'create-rules',
              'json'
            ).toPromise();

            // 3. Export to YAML for configuration management
            const yamlResult = await this.exportService.exportRules({
              format: 'yaml',
              includeMetadata: true,
              includeComments: true
            }).toPromise();

            if (yamlResult?.success) {
              // 4. Upload to cloud storage
              await this.exportService.integrateWithSystem(
                'aws-s3',
                'upload-rules',
                'yaml'
              ).toPromise();
            }
          }

        } catch (error) {
          console.error('Automated pipeline failed:', error);
        }
      }
    });
  }

  /**
   * Example 8: Shareable Links for Collaboration
   */
  async createShareableLinkExample(): Promise<void> {
    try {
      // Create a public shareable link
      const publicLink = await this.exportService.createShareableLink({
        format: 'json',
        accessLevel: 'public',
        expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }).toPromise();

      console.log('Public share link:', publicLink?.url);

      // Create a protected shareable link
      const protectedLink = await this.exportService.createShareableLink({
        format: 'dsl',
        accessLevel: 'protected',
        password: 'secure-password-123',
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }).toPromise();

      console.log('Protected share link:', protectedLink?.url);

    } catch (error) {
      console.error('Share link creation failed:', error);
    }
  }

  /**
   * Example 9: Import from External Sources
   */
  async importFromExternalExample(): Promise<void> {
    try {
      // Import from URL
      const urlImport = await this.exportService.importFromExternal({
        type: 'url',
        location: 'https://api.example.com/rules/export',
        format: 'json',
        authentication: {
          type: 'bearer',
          token: 'api-token'
        }
      }).toPromise();

      if (urlImport?.success) {
        console.log('Successfully imported from URL');
      }

      // Import from file (would be triggered by file input in UI)
      const fileContent = `{
        "version": "1.0",
        "rules": [
          {
            "id": "imported-rule",
            "type": "field",
            "config": {
              "field": "name",
              "operator": "equals",
              "value": "Test"
            }
          }
        ]
      }`;

      const fileImport = await this.exportService.importFromExternal({
        type: 'file',
        location: fileContent,
        format: 'json'
      }).toPromise();

      if (fileImport?.success) {
        console.log('Successfully imported from file');
      }

    } catch (error) {
      console.error('Import failed:', error);
    }
  }

  /**
   * Example 10: Custom Format Export
   */
  async customFormatExample(): Promise<void> {
    // Get the raw specification for custom processing
    const specification = this.ruleBuilderService.toSpecification();
    
    if (specification) {
      // Convert to custom format (e.g., for specific third-party system)
      const customFormat = {
        format: 'custom-system-v1',
        timestamp: new Date().toISOString(),
        rules: this.convertToCustomFormat(specification.toJSON()),
        metadata: {
          source: 'praxis-visual-builder',
          version: '1.0.0'
        }
      };

      // Export as JSON
      const result = await this.exportService.exportRules({
        format: 'json',
        includeMetadata: false,
        prettyPrint: true
      }).toPromise();

      if (result?.success) {
        // Replace content with custom format
        const customContent = JSON.stringify(customFormat, null, 2);
        console.log('Custom format export:', customContent);
      }
    }
  }

  private convertToCustomFormat(specificationJson: any): any {
    // Custom conversion logic for third-party system
    // This is where you'd implement format-specific transformations
    return {
      conditions: specificationJson,
      customField1: 'value1',
      customField2: 'value2'
    };
  }
}

/**
 * Usage in Angular Component:
 * 
 * ```typescript
 * export class MyComponent {
 *   constructor(private examples: ExportIntegrationExampleService) {}
 * 
 *   ngOnInit() {
 *     // Set up integrations
 *     this.examples.setupRestApiIntegration();
 *     this.examples.setupWebhookIntegration();
 *     this.examples.setupAutomatedPipeline();
 *   }
 * 
 *   async onExportClick() {
 *     await this.examples.basicExportExample();
 *   }
 * 
 *   async onShareClick() {
 *     await this.examples.createShareableLinkExample();
 *   }
 * }
 * ```
 */