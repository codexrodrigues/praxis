import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, interval } from 'rxjs';
import { filter, switchMap, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RuleBuilderService } from './rule-builder.service';
import { ExportIntegrationService } from './export-integration.service';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'apikey';
    credentials: any;
  };
  format: string;
  events: WebhookEvent[];
  enabled: boolean;
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
  filtering?: {
    includeMetadata: boolean;
    minRuleCount?: number;
    maxRuleCount?: number;
    ruleTypes?: string[];
  };
}

export interface WebhookEvent {
  type: 'rule-added' | 'rule-updated' | 'rule-deleted' | 'rules-imported' | 'rules-exported' | 'validation-changed';
  description: string;
  enabled: boolean;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  url: string;
  payload: any;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  lastAttempt?: Date;
  nextRetry?: Date;
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  };
  error?: string;
  createdAt: Date;
  deliveredAt?: Date;
}

export interface WebhookStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  pendingDeliveries: number;
  successRate: number;
  lastDelivery?: Date;
  averageResponseTime?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebhookIntegrationService {
  private webhooks: WebhookConfig[] = [];
  private deliveries: WebhookDelivery[] = [];
  private deliveryQueue = new Subject<WebhookDelivery>();
  private statusUpdates = new BehaviorSubject<Record<string, WebhookStats>>({});

  private readonly SUPPORTED_EVENTS: WebhookEvent[] = [
    {
      type: 'rule-added',
      description: 'Triggered when a new rule is added',
      enabled: true
    },
    {
      type: 'rule-updated',
      description: 'Triggered when an existing rule is modified',
      enabled: true
    },
    {
      type: 'rule-deleted',
      description: 'Triggered when a rule is removed',
      enabled: true
    },
    {
      type: 'rules-imported',
      description: 'Triggered when rules are imported from external source',
      enabled: false
    },
    {
      type: 'rules-exported',
      description: 'Triggered when rules are exported',
      enabled: false
    },
    {
      type: 'validation-changed',
      description: 'Triggered when validation status changes',
      enabled: false
    }
  ];

  public readonly webhookStats$ = this.statusUpdates.asObservable();

  constructor(
    private ruleBuilderService: RuleBuilderService,
    private exportService: ExportIntegrationService
  ) {
    this.initializeWebhookProcessing();
    this.subscribeToRuleChanges();
  }

  /**
   * Registers a new webhook configuration
   */
  registerWebhook(config: WebhookConfig): void {
    const existingIndex = this.webhooks.findIndex(w => w.id === config.id);
    if (existingIndex >= 0) {
      this.webhooks[existingIndex] = config;
    } else {
      this.webhooks.push(config);
    }
    this.updateStats();
  }

  /**
   * Removes a webhook configuration
   */
  unregisterWebhook(webhookId: string): void {
    this.webhooks = this.webhooks.filter(w => w.id !== webhookId);
    this.updateStats();
  }

  /**
   * Gets all registered webhooks
   */
  getWebhooks(): WebhookConfig[] {
    return [...this.webhooks];
  }

  /**
   * Gets a specific webhook by ID
   */
  getWebhook(webhookId: string): WebhookConfig | null {
    return this.webhooks.find(w => w.id === webhookId) || null;
  }

  /**
   * Updates webhook configuration
   */
  updateWebhook(webhookId: string, updates: Partial<WebhookConfig>): void {
    const webhook = this.webhooks.find(w => w.id === webhookId);
    if (webhook) {
      Object.assign(webhook, updates);
      this.updateStats();
    }
  }

  /**
   * Enables or disables a webhook
   */
  toggleWebhook(webhookId: string, enabled: boolean): void {
    this.updateWebhook(webhookId, { enabled });
  }

  /**
   * Tests a webhook by sending a test payload
   */
  testWebhook(webhookId: string): Observable<WebhookDelivery> {
    const webhook = this.getWebhook(webhookId);
    if (!webhook) {
      throw new Error(`Webhook not found: ${webhookId}`);
    }

    const testDelivery: WebhookDelivery = {
      id: this.generateDeliveryId(),
      webhookId,
      event: 'test',
      url: webhook.url,
      payload: {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook delivery',
          webhook: {
            id: webhook.id,
            name: webhook.name
          }
        }
      },
      status: 'pending',
      attempts: 0,
      createdAt: new Date()
    };

    return this.deliverWebhook(testDelivery);
  }

  /**
   * Gets delivery history for a webhook
   */
  getDeliveryHistory(webhookId: string, limit = 50): WebhookDelivery[] {
    return this.deliveries
      .filter(d => d.webhookId === webhookId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Gets overall delivery statistics
   */
  getDeliveryStats(webhookId?: string): WebhookStats {
    const relevantDeliveries = webhookId 
      ? this.deliveries.filter(d => d.webhookId === webhookId)
      : this.deliveries;

    const totalDeliveries = relevantDeliveries.length;
    const successfulDeliveries = relevantDeliveries.filter(d => d.status === 'delivered').length;
    const failedDeliveries = relevantDeliveries.filter(d => d.status === 'failed').length;
    const pendingDeliveries = relevantDeliveries.filter(d => d.status === 'pending' || d.status === 'retrying').length;

    const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;
    
    const lastDelivery = relevantDeliveries
      .filter(d => d.deliveredAt)
      .sort((a, b) => (b.deliveredAt?.getTime() || 0) - (a.deliveredAt?.getTime() || 0))[0]?.deliveredAt;

    return {
      totalDeliveries,
      successfulDeliveries,
      failedDeliveries,
      pendingDeliveries,
      successRate,
      lastDelivery
    };
  }

  /**
   * Retries failed deliveries
   */
  retryFailedDeliveries(webhookId?: string): void {
    const failedDeliveries = this.deliveries.filter(d => 
      d.status === 'failed' && 
      (!webhookId || d.webhookId === webhookId)
    );

    failedDeliveries.forEach(delivery => {
      delivery.status = 'pending';
      delivery.nextRetry = undefined;
      this.deliveryQueue.next(delivery);
    });
  }

  /**
   * Clears delivery history
   */
  clearDeliveryHistory(webhookId?: string): void {
    if (webhookId) {
      this.deliveries = this.deliveries.filter(d => d.webhookId !== webhookId);
    } else {
      this.deliveries = [];
    }
    this.updateStats();
  }

  /**
   * Gets supported webhook events
   */
  getSupportedEvents(): WebhookEvent[] {
    return [...this.SUPPORTED_EVENTS];
  }

  /**
   * Manually triggers a webhook for testing
   */
  triggerWebhook(webhookId: string, eventType: string, payload: any): Observable<WebhookDelivery> {
    const webhook = this.getWebhook(webhookId);
    if (!webhook) {
      throw new Error(`Webhook not found: ${webhookId}`);
    }

    const delivery: WebhookDelivery = {
      id: this.generateDeliveryId(),
      webhookId,
      event: eventType,
      url: webhook.url,
      payload: this.preparePayload(webhook, eventType, payload),
      status: 'pending',
      attempts: 0,
      createdAt: new Date()
    };

    return this.deliverWebhook(delivery);
  }

  /**
   * Private implementation methods
   */
  private initializeWebhookProcessing(): void {
    // Process delivery queue
    this.deliveryQueue.pipe(
      debounceTime(100), // Batch deliveries
      switchMap(delivery => this.deliverWebhook(delivery)),
      catchError((error, caught) => {
        console.error('Webhook delivery error:', error);
        return caught;
      })
    ).subscribe();

    // Retry failed deliveries periodically
    interval(60000).pipe( // Check every minute
      switchMap(() => this.processRetries())
    ).subscribe();
  }

  private subscribeToRuleChanges(): void {
    // Subscribe to rule builder state changes
    this.ruleBuilderService.stateChanged$.pipe(
      debounceTime(1000), // Debounce rapid changes
      distinctUntilChanged()
    ).subscribe(() => {
      this.handleRuleChange('rule-updated');
    });

    // Subscribe to validation errors
    this.ruleBuilderService.validationErrors$.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => 
        JSON.stringify(prev) === JSON.stringify(curr)
      )
    ).subscribe(errors => {
      this.handleValidationChange(errors);
    });
  }

  private handleRuleChange(eventType: string): void {
    const activeWebhooks = this.webhooks.filter(w => 
      w.enabled && 
      w.events.some(e => e.type === eventType && e.enabled)
    );

    for (const webhook of activeWebhooks) {
      if (this.shouldTriggerWebhook(webhook, eventType)) {
        const payload = this.generateEventPayload(eventType);
        this.queueDelivery(webhook, eventType, payload);
      }
    }
  }

  private handleValidationChange(errors: any[]): void {
    this.handleRuleChange('validation-changed');
  }

  private shouldTriggerWebhook(webhook: WebhookConfig, eventType: string): boolean {
    // Apply filtering rules
    if (webhook.filtering) {
      const state = this.ruleBuilderService.getCurrentState();
      const ruleCount = Object.keys(state.nodes).length;

      if (webhook.filtering.minRuleCount && ruleCount < webhook.filtering.minRuleCount) {
        return false;
      }

      if (webhook.filtering.maxRuleCount && ruleCount > webhook.filtering.maxRuleCount) {
        return false;
      }

      if (webhook.filtering.ruleTypes && webhook.filtering.ruleTypes.length > 0) {
        const hasMatchingType = Object.values(state.nodes).some(node => 
          webhook.filtering!.ruleTypes!.includes(node.type)
        );
        if (!hasMatchingType) {
          return false;
        }
      }
    }

    return true;
  }

  private generateEventPayload(eventType: string): any {
    const state = this.ruleBuilderService.getCurrentState();
    
    return {
      event: eventType,
      timestamp: new Date().toISOString(),
      data: {
        rulesCount: Object.keys(state.nodes).length,
        rootNodes: state.rootNodes.length,
        isDirty: state.isDirty,
        mode: state.mode,
        validationErrors: state.validationErrors?.length || 0
      }
    };
  }

  private queueDelivery(webhook: WebhookConfig, eventType: string, payload: any): void {
    const delivery: WebhookDelivery = {
      id: this.generateDeliveryId(),
      webhookId: webhook.id,
      event: eventType,
      url: webhook.url,
      payload: this.preparePayload(webhook, eventType, payload),
      status: 'pending',
      attempts: 0,
      createdAt: new Date()
    };

    this.deliveries.push(delivery);
    this.deliveryQueue.next(delivery);
  }

  private preparePayload(webhook: WebhookConfig, eventType: string, data: any): any {
    const basePayload = {
      webhook: {
        id: webhook.id,
        name: webhook.name
      },
      event: eventType,
      timestamp: new Date().toISOString(),
      data
    };

    // Add rules data if requested
    if (webhook.filtering?.includeMetadata) {
      try {
        const exportResult = this.exportService.exportRules({
          format: webhook.format,
          includeMetadata: true,
          prettyPrint: false
        });

        // Note: This is simplified - in practice you'd want to handle the Observable properly
        basePayload.data.rules = JSON.parse('{}'); // Placeholder
      } catch (error) {
        console.warn('Failed to include rules in webhook payload:', error);
      }
    }

    return basePayload;
  }

  private deliverWebhook(delivery: WebhookDelivery): Observable<WebhookDelivery> {
    return new Observable(observer => {
      this.sendWebhookRequest(delivery).then(result => {
        const updatedDelivery = { ...delivery, ...result };
        this.updateDelivery(updatedDelivery);
        observer.next(updatedDelivery);
        observer.complete();
      }).catch(error => {
        const failedDelivery: WebhookDelivery = {
          ...delivery,
          status: 'failed',
          error: String(error),
          lastAttempt: new Date(),
          attempts: delivery.attempts + 1
        };

        // Schedule retry if configured
        const webhook = this.getWebhook(delivery.webhookId);
        if (webhook?.retryConfig && failedDelivery.attempts < webhook.retryConfig.maxRetries) {
          failedDelivery.status = 'retrying';
          failedDelivery.nextRetry = new Date(
            Date.now() + webhook.retryConfig.retryDelay * Math.pow(webhook.retryConfig.backoffMultiplier, failedDelivery.attempts - 1)
          );
        }

        this.updateDelivery(failedDelivery);
        observer.next(failedDelivery);
        observer.complete();
      });
    });
  }

  private async sendWebhookRequest(delivery: WebhookDelivery): Promise<Partial<WebhookDelivery>> {
    const webhook = this.getWebhook(delivery.webhookId);
    if (!webhook) {
      throw new Error(`Webhook configuration not found: ${delivery.webhookId}`);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Praxis-VisualBuilder-Webhook/1.0',
      ...webhook.headers
    };

    // Add authentication headers
    if (webhook.authentication) {
      switch (webhook.authentication.type) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${webhook.authentication.credentials.token}`;
          break;
        case 'basic':
          const encoded = btoa(`${webhook.authentication.credentials.username}:${webhook.authentication.credentials.password}`);
          headers['Authorization'] = `Basic ${encoded}`;
          break;
        case 'apikey':
          headers[webhook.authentication.credentials.headerName] = webhook.authentication.credentials.apiKey;
          break;
      }
    }

    const startTime = Date.now();
    
    const response = await fetch(delivery.url, {
      method: webhook.method,
      headers,
      body: JSON.stringify(delivery.payload)
    });

    const responseTime = Date.now() - startTime;
    const responseBody = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      status: 'delivered',
      attempts: delivery.attempts + 1,
      lastAttempt: new Date(),
      deliveredAt: new Date(),
      response: {
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody
      }
    };
  }

  private updateDelivery(delivery: WebhookDelivery): void {
    const index = this.deliveries.findIndex(d => d.id === delivery.id);
    if (index >= 0) {
      this.deliveries[index] = delivery;
    }
    this.updateStats();
  }

  private processRetries(): Observable<any> {
    const now = new Date();
    const retriesToProcess = this.deliveries.filter(d => 
      d.status === 'retrying' && 
      d.nextRetry && 
      d.nextRetry <= now
    );

    retriesToProcess.forEach(delivery => {
      delivery.status = 'pending';
      delivery.nextRetry = undefined;
      this.deliveryQueue.next(delivery);
    });

    return new Observable(observer => observer.complete());
  }

  private updateStats(): void {
    const stats: Record<string, WebhookStats> = {};
    
    for (const webhook of this.webhooks) {
      stats[webhook.id] = this.getDeliveryStats(webhook.id);
    }

    this.statusUpdates.next(stats);
  }

  private generateDeliveryId(): string {
    return `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}