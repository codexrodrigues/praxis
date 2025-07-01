import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RuleBuilderService } from './rule-builder.service';
import { SpecificationBridgeService } from './specification-bridge.service';
import { RuleNode, RuleBuilderState, ExportOptions } from '../models/rule-builder.model';

export interface ExportFormat {
  id: string;
  name: string;
  description: string;
  fileExtension: string;
  mimeType: string;
  supportsMetadata: boolean;
  supportsComments: boolean;
}

export interface ExportResult {
  success: boolean;
  content: string;
  format: ExportFormat;
  filename: string;
  size: number;
  metadata?: {
    rulesCount: number;
    complexity: 'low' | 'medium' | 'high';
    exportedAt: string;
    version: string;
  };
  errors?: string[];
  warnings?: string[];
}

export interface IntegrationEndpoint {
  id: string;
  name: string;
  description: string;
  url?: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'apikey';
    credentials?: any;
  };
  supportedFormats: string[];
  responseFormat?: 'json' | 'xml' | 'text';
}

export interface IntegrationResult {
  success: boolean;
  endpoint: IntegrationEndpoint;
  response?: any;
  statusCode?: number;
  error?: string;
  timestamp: string;
}

export interface ExternalSystemConfig {
  id: string;
  name: string;
  type: 'rest-api' | 'webhook' | 'file-system' | 'database' | 'cloud-storage';
  config: any;
  endpoints: IntegrationEndpoint[];
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExportIntegrationService {
  private readonly SUPPORTED_FORMATS: ExportFormat[] = [
    {
      id: 'json',
      name: 'JSON',
      description: 'JavaScript Object Notation - Standard data interchange format',
      fileExtension: 'json',
      mimeType: 'application/json',
      supportsMetadata: true,
      supportsComments: false
    },
    {
      id: 'json-schema',
      name: 'JSON Schema',
      description: 'JSON Schema for validation and documentation',
      fileExtension: 'schema.json',
      mimeType: 'application/schema+json',
      supportsMetadata: true,
      supportsComments: true
    },
    {
      id: 'dsl',
      name: 'Domain Specific Language',
      description: 'Human-readable rule specification language',
      fileExtension: 'dsl',
      mimeType: 'text/plain',
      supportsMetadata: true,
      supportsComments: true
    },
    {
      id: 'yaml',
      name: 'YAML',
      description: 'YAML Ain\'t Markup Language - Human-readable data serialization',
      fileExtension: 'yaml',
      mimeType: 'application/x-yaml',
      supportsMetadata: true,
      supportsComments: true
    },
    {
      id: 'xml',
      name: 'XML',
      description: 'Extensible Markup Language',
      fileExtension: 'xml',
      mimeType: 'application/xml',
      supportsMetadata: true,
      supportsComments: true
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      description: 'TypeScript interface definitions',
      fileExtension: 'ts',
      mimeType: 'text/typescript',
      supportsMetadata: true,
      supportsComments: true
    },
    {
      id: 'openapi',
      name: 'OpenAPI Specification',
      description: 'OpenAPI 3.0 specification with validation rules',
      fileExtension: 'openapi.json',
      mimeType: 'application/vnd.oai.openapi+json',
      supportsMetadata: true,
      supportsComments: false
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Comma-separated values for tabular rule data',
      fileExtension: 'csv',
      mimeType: 'text/csv',
      supportsMetadata: false,
      supportsComments: false
    }
  ];

  private externalSystems: ExternalSystemConfig[] = [];

  constructor(
    private ruleBuilderService: RuleBuilderService,
    private specificationBridge: SpecificationBridgeService
  ) {}

  /**
   * Gets all supported export formats
   */
  getSupportedFormats(): ExportFormat[] {
    return [...this.SUPPORTED_FORMATS];
  }

  /**
   * Gets a specific export format by ID
   */
  getFormat(formatId: string): ExportFormat | null {
    return this.SUPPORTED_FORMATS.find(f => f.id === formatId) || null;
  }

  /**
   * Exports current rules in the specified format
   */
  exportRules(options: {
    format: string;
    includeMetadata?: boolean;
    prettyPrint?: boolean;
    includeComments?: boolean;
    customFilename?: string;
    downloadFile?: boolean;
  }): Observable<ExportResult> {
    return from(this.performExport(options));
  }

  /**
   * Exports rules to multiple formats simultaneously
   */
  exportToMultipleFormats(formats: string[], options: any = {}): Observable<ExportResult[]> {
    const exportPromises = formats.map(format => 
      this.performExport({ ...options, format })
    );

    return from(Promise.all(exportPromises));
  }

  /**
   * Integrates with external system
   */
  integrateWithSystem(
    systemId: string, 
    endpointId: string, 
    exportFormat: string,
    options: any = {}
  ): Observable<IntegrationResult> {
    return from(this.performIntegration(systemId, endpointId, exportFormat, options));
  }

  /**
   * Registers a new external system configuration
   */
  registerExternalSystem(config: ExternalSystemConfig): void {
    const existingIndex = this.externalSystems.findIndex(s => s.id === config.id);
    if (existingIndex >= 0) {
      this.externalSystems[existingIndex] = config;
    } else {
      this.externalSystems.push(config);
    }
  }

  /**
   * Gets all registered external systems
   */
  getExternalSystems(): ExternalSystemConfig[] {
    return [...this.externalSystems];
  }

  /**
   * Tests connectivity to an external system
   */
  testSystemConnectivity(systemId: string): Observable<{ success: boolean; message: string }> {
    return from(this.performConnectivityTest(systemId));
  }

  /**
   * Creates a shareable link for rules
   */
  createShareableLink(options: {
    format: string;
    expiration?: Date;
    accessLevel?: 'public' | 'protected' | 'private';
    password?: string;
  }): Observable<{ url: string; token: string; expiresAt?: Date }> {
    return from(this.generateShareableLink(options));
  }

  /**
   * Imports rules from external source
   */
  importFromExternal(source: {
    type: 'url' | 'file' | 'system';
    location: string;
    format: string;
    authentication?: any;
  }): Observable<{ success: boolean; imported: any; errors?: string[] }> {
    return from(this.performExternalImport(source));
  }

  /**
   * Private implementation methods
   */
  private async performExport(options: any): Promise<ExportResult> {
    try {
      const format = this.getFormat(options.format);
      if (!format) {
        throw new Error(`Unsupported export format: ${options.format}`);
      }

      const state = this.ruleBuilderService.getCurrentState();
      const content = await this.generateContent(format, state, options);
      const filename = options.customFilename || this.generateFilename(format);

      const result: ExportResult = {
        success: true,
        content,
        format,
        filename,
        size: new Blob([content]).size,
        metadata: this.generateExportMetadata(state)
      };

      if (options.downloadFile) {
        this.downloadFile(content, filename, format.mimeType);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        content: '',
        format: this.getFormat(options.format)!,
        filename: '',
        size: 0,
        errors: [String(error)]
      };
    }
  }

  private async generateContent(format: ExportFormat, state: RuleBuilderState, options: any): Promise<string> {
    switch (format.id) {
      case 'json':
        return this.generateJson(state, options);
      
      case 'json-schema':
        return this.generateJsonSchema(state, options);
      
      case 'dsl':
        return this.generateDsl(state, options);
      
      case 'yaml':
        return this.generateYaml(state, options);
      
      case 'xml':
        return this.generateXml(state, options);
      
      case 'typescript':
        return this.generateTypeScript(state, options);
      
      case 'openapi':
        return this.generateOpenApi(state, options);
      
      case 'csv':
        return this.generateCsv(state, options);
      
      default:
        throw new Error(`Content generation not implemented for format: ${format.id}`);
    }
  }

  private generateJson(state: RuleBuilderState, options: any): string {
    const specification = this.ruleBuilderService.toSpecification();
    if (!specification) {
      return '{}';
    }

    const jsonData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      metadata: options.includeMetadata ? this.generateExportMetadata(state) : undefined,
      specification: specification.toJSON(),
      visualRules: options.includeVisualRules ? {
        nodes: state.nodes,
        rootNodes: state.rootNodes
      } : undefined
    };

    return options.prettyPrint 
      ? JSON.stringify(jsonData, null, 2)
      : JSON.stringify(jsonData);
  }

  private generateJsonSchema(state: RuleBuilderState, options: any): string {
    const schema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'https://praxis-platform.org/schemas/rules',
      title: 'Praxis Rules Schema',
      description: 'Schema for Praxis rule specifications',
      type: 'object',
      properties: this.generateSchemaProperties(state),
      required: this.generateSchemaRequired(state),
      additionalProperties: false
    };

    return options.prettyPrint 
      ? JSON.stringify(schema, null, 2)
      : JSON.stringify(schema);
  }

  private generateDsl(state: RuleBuilderState, options: any): string {
    const parts: string[] = [];

    if (options.includeComments) {
      parts.push('# Praxis Rules DSL Export');
      parts.push(`# Generated at: ${new Date().toISOString()}`);
      parts.push(`# Rules count: ${Object.keys(state.nodes).length}`);
      parts.push('');
    }

    for (const rootNodeId of state.rootNodes) {
      const rootNode = this.buildCompleteRuleNode(rootNodeId, state.nodes);
      if (rootNode) {
        try {
          const dsl = this.specificationBridge.exportToDsl(rootNode, {
            includeMetadata: options.includeMetadata,
            prettyPrint: options.prettyPrint
          });
          parts.push(dsl);
          parts.push('');
        } catch (error) {
          if (options.includeComments) {
            parts.push(`# Error exporting rule ${rootNodeId}: ${error}`);
          }
        }
      }
    }

    return parts.join('\n');
  }

  private generateYaml(state: RuleBuilderState, options: any): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      metadata: options.includeMetadata ? this.generateExportMetadata(state) : undefined,
      rules: state.rootNodes.map(nodeId => {
        const node = this.buildCompleteRuleNode(nodeId, state.nodes);
        return this.convertNodeToYamlObject(node);
      }).filter(Boolean)
    };

    // Simple YAML generation (in production, use a proper YAML library)
    return this.objectToYaml(data, 0);
  }

  private generateXml(state: RuleBuilderState, options: any): string {
    const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
    
    if (options.includeComments) {
      lines.push('<!-- Praxis Rules XML Export -->');
      lines.push(`<!-- Generated at: ${new Date().toISOString()} -->`);
    }

    lines.push('<praxis-rules version="1.0">');

    if (options.includeMetadata) {
      const metadata = this.generateExportMetadata(state);
      lines.push('  <metadata>');
      lines.push(`    <rulesCount>${metadata.rulesCount}</rulesCount>`);
      lines.push(`    <complexity>${metadata.complexity}</complexity>`);
      lines.push(`    <exportedAt>${metadata.exportedAt}</exportedAt>`);
      lines.push(`    <version>${metadata.version}</version>`);
      lines.push('  </metadata>');
    }

    lines.push('  <rules>');
    for (const rootNodeId of state.rootNodes) {
      const node = this.buildCompleteRuleNode(rootNodeId, state.nodes);
      if (node) {
        lines.push(this.nodeToXml(node, 4));
      }
    }
    lines.push('  </rules>');
    lines.push('</praxis-rules>');

    return lines.join('\n');
  }

  private generateTypeScript(state: RuleBuilderState, options: any): string {
    const lines: string[] = [];

    if (options.includeComments) {
      lines.push('/**');
      lines.push(' * Praxis Rules TypeScript Export');
      lines.push(` * Generated at: ${new Date().toISOString()}`);
      lines.push(` * Rules count: ${Object.keys(state.nodes).length}`);
      lines.push(' */');
      lines.push('');
    }

    lines.push('export interface PraxisRules {');
    lines.push('  version: string;');
    lines.push('  rules: Rule[];');
    if (options.includeMetadata) {
      lines.push('  metadata?: RuleMetadata;');
    }
    lines.push('}');
    lines.push('');

    lines.push('export interface Rule {');
    lines.push('  id: string;');
    lines.push('  type: RuleType;');
    lines.push('  label?: string;');
    lines.push('  config: RuleConfig;');
    lines.push('  children?: Rule[];');
    lines.push('  metadata?: ValidationMetadata;');
    lines.push('}');
    lines.push('');

    lines.push('export type RuleType =');
    const uniqueTypes = new Set(Object.values(state.nodes).map(node => node.type));
    const typeArray = Array.from(uniqueTypes).map(type => `  | '${type}'`);
    lines.push(typeArray.join('\n'));
    lines.push(';');

    return lines.join('\n');
  }

  private generateOpenApi(state: RuleBuilderState, options: any): string {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: 'Praxis Rules API',
        description: 'API specification with embedded rule validations',
        version: '1.0.0'
      },
      paths: {},
      components: {
        schemas: this.generateOpenApiSchemas(state)
      }
    };

    return options.prettyPrint 
      ? JSON.stringify(spec, null, 2)
      : JSON.stringify(spec);
  }

  private generateCsv(state: RuleBuilderState, options: any): string {
    const headers = ['ID', 'Type', 'Label', 'Field', 'Operator', 'Value', 'Parent ID'];
    const rows: string[][] = [headers];

    const processNode = (node: RuleNode, parentId?: string) => {
      const row = [
        node.id,
        node.type,
        node.label || '',
        String(node.config?.field || ''),
        String(node.config?.operator || ''),
        String(node.config?.value || ''),
        parentId || ''
      ];
      rows.push(row);

      if (node.children) {
        node.children.forEach(child => {
          if (typeof child === 'object') {
            processNode(child as RuleNode, node.id);
          }
        });
      }
    };

    for (const rootNodeId of state.rootNodes) {
      const node = this.buildCompleteRuleNode(rootNodeId, state.nodes);
      if (node) {
        processNode(node);
      }
    }

    return rows.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  private async performIntegration(
    systemId: string, 
    endpointId: string, 
    exportFormat: string, 
    options: any
  ): Promise<IntegrationResult> {
    try {
      const system = this.externalSystems.find(s => s.id === systemId);
      if (!system) {
        throw new Error(`External system not found: ${systemId}`);
      }

      const endpoint = system.endpoints.find(e => e.id === endpointId);
      if (!endpoint) {
        throw new Error(`Endpoint not found: ${endpointId}`);
      }

      const exportResult = await this.performExport({ format: exportFormat, ...options });
      if (!exportResult.success) {
        throw new Error(`Export failed: ${exportResult.errors?.join(', ')}`);
      }

      const response = await this.sendToEndpoint(endpoint, exportResult.content, exportFormat);

      return {
        success: true,
        endpoint,
        response,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        endpoint: {} as IntegrationEndpoint,
        error: String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  private async sendToEndpoint(endpoint: IntegrationEndpoint, content: string, format: string): Promise<any> {
    if (!endpoint.url) {
      throw new Error('Endpoint URL is required');
    }

    const headers: Record<string, string> = {
      'Content-Type': this.getFormat(format)?.mimeType || 'application/json',
      ...endpoint.headers
    };

    // Add authentication headers if configured
    if (endpoint.authentication) {
      switch (endpoint.authentication.type) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${endpoint.authentication.credentials.token}`;
          break;
        case 'basic':
          const encoded = btoa(`${endpoint.authentication.credentials.username}:${endpoint.authentication.credentials.password}`);
          headers['Authorization'] = `Basic ${encoded}`;
          break;
        case 'apikey':
          headers[endpoint.authentication.credentials.headerName] = endpoint.authentication.credentials.apiKey;
          break;
      }
    }

    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers,
      body: endpoint.method !== 'GET' ? content : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      status: response.status,
      data: await response.text()
    };
  }

  private async performConnectivityTest(systemId: string): Promise<{ success: boolean; message: string }> {
    try {
      const system = this.externalSystems.find(s => s.id === systemId);
      if (!system) {
        return { success: false, message: `System not found: ${systemId}` };
      }

      // Test first available endpoint
      if (system.endpoints.length === 0) {
        return { success: false, message: 'No endpoints configured' };
      }

      const endpoint = system.endpoints[0];
      if (!endpoint.url) {
        return { success: false, message: 'No URL configured for endpoint' };
      }

      const response = await fetch(endpoint.url, { method: 'HEAD' });
      return { 
        success: response.ok, 
        message: response.ok ? 'Connection successful' : `HTTP ${response.status}` 
      };
    } catch (error) {
      return { success: false, message: String(error) };
    }
  }

  private async generateShareableLink(options: any): Promise<{ url: string; token: string; expiresAt?: Date }> {
    // Mock implementation - in production, this would integrate with a sharing service
    const token = this.generateToken();
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/shared/${token}`;

    return {
      url,
      token,
      expiresAt: options.expiration
    };
  }

  private async performExternalImport(source: any): Promise<{ success: boolean; imported: any; errors?: string[] }> {
    try {
      let content: string;

      switch (source.type) {
        case 'url':
          const response = await fetch(source.location);
          content = await response.text();
          break;
        
        case 'file':
          // Would be handled by file input in the UI
          content = source.location;
          break;
        
        default:
          throw new Error(`Unsupported import source type: ${source.type}`);
      }

      this.ruleBuilderService.import(content, { format: source.format });

      return {
        success: true,
        imported: { contentLength: content.length, format: source.format }
      };
    } catch (error) {
      return {
        success: false,
        imported: null,
        errors: [String(error)]
      };
    }
  }

  // Utility methods

  private buildCompleteRuleNode(nodeId: string, allNodes: Record<string, RuleNode>): RuleNode | null {
    const node = allNodes[nodeId];
    if (!node) return null;

    return {
      ...node,
      children: node.children?.map(childId => {
        if (typeof childId === 'string') {
          return this.buildCompleteRuleNode(childId, allNodes);
        }
        return childId;
      }).filter(Boolean) as RuleNode[]
    };
  }

  private generateExportMetadata(state: RuleBuilderState) {
    const rulesCount = Object.keys(state.nodes).length;
    const complexity = rulesCount > 20 ? 'high' : rulesCount > 10 ? 'medium' : 'low';

    return {
      rulesCount,
      complexity: complexity as 'low' | 'medium' | 'high',
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  private generateFilename(format: ExportFormat): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `praxis-rules-${timestamp}.${format.fileExtension}`;
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Additional helper methods for specific format generation...
  private generateSchemaProperties(state: RuleBuilderState): any {
    // Implementation for JSON Schema properties
    return {};
  }

  private generateSchemaRequired(state: RuleBuilderState): string[] {
    // Implementation for JSON Schema required fields
    return [];
  }

  private convertNodeToYamlObject(node: RuleNode | null): any {
    if (!node) return null;
    return {
      id: node.id,
      type: node.type,
      label: node.label,
      config: node.config,
      children: node.children?.map(child => 
        typeof child === 'object' ? this.convertNodeToYamlObject(child as RuleNode) : child
      ).filter(Boolean),
      metadata: node.metadata
    };
  }

  private objectToYaml(obj: any, indent: number): string {
    // Simple YAML serialization - use proper YAML library in production
    const spaces = '  '.repeat(indent);
    let result = '';

    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      
      result += `${spaces}${key}:`;
      
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          result += '\n';
          value.forEach(item => {
            result += `${spaces}  - `;
            if (typeof item === 'object') {
              result += '\n' + this.objectToYaml(item, indent + 2);
            } else {
              result += `${item}\n`;
            }
          });
        } else {
          result += '\n' + this.objectToYaml(value, indent + 1);
        }
      } else {
        result += ` ${value}\n`;
      }
    }

    return result;
  }

  private nodeToXml(node: RuleNode, indent: number): string {
    const spaces = ' '.repeat(indent);
    let xml = `${spaces}<rule id="${node.id}" type="${node.type}">`;
    
    if (node.label) {
      xml += `\n${spaces}  <label>${this.escapeXml(node.label)}</label>`;
    }
    
    if (node.config) {
      xml += `\n${spaces}  <config>${this.escapeXml(JSON.stringify(node.config))}</config>`;
    }
    
    if (node.children && node.children.length > 0) {
      xml += `\n${spaces}  <children>`;
      node.children.forEach(child => {
        if (typeof child === 'object') {
          xml += '\n' + this.nodeToXml(child as RuleNode, indent + 4);
        }
      });
      xml += `\n${spaces}  </children>`;
    }
    
    xml += `\n${spaces}</rule>`;
    return xml;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private generateOpenApiSchemas(state: RuleBuilderState): any {
    // Implementation for OpenAPI schema generation
    return {
      Rule: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          label: { type: 'string' },
          config: { type: 'object' }
        }
      }
    };
  }
}