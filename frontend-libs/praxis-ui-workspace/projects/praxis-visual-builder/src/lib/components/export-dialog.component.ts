import { Component, Inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import { 
  ExportIntegrationService, 
  ExportFormat, 
  ExportResult, 
  ExternalSystemConfig,
  IntegrationEndpoint 
} from '../services/export-integration.service';

export interface ExportDialogData {
  title?: string;
  allowMultipleFormats?: boolean;
  preselectedFormat?: string;
  showIntegrationTab?: boolean;
  showSharingTab?: boolean;
}

@Component({
  selector: 'praxis-export-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatListModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="export-dialog">
      <div mat-dialog-title class="dialog-header">
        <mat-icon>download</mat-icon>
        <span>{{ data.title || 'Export Rules' }}</span>
      </div>

      <div mat-dialog-content class="dialog-content">
        <mat-tab-group [(selectedIndex)]="activeTabIndex">
          <!-- Export Tab -->
          <mat-tab label="Export">
            <div class="tab-content">
              <form [formGroup]="exportForm" class="export-form">
                <!-- Format Selection -->
                <div class="section">
                  <h3 class="section-title">Export Format</h3>
                  
                  <div class="format-grid">
                    <mat-card 
                      *ngFor="let format of supportedFormats" 
                      class="format-card"
                      [class.selected]="isFormatSelected(format.id)"
                      (click)="selectFormat(format.id)">
                      
                      <mat-card-header>
                        <mat-card-title>{{ format.name }}</mat-card-title>
                        <mat-card-subtitle>{{ format.fileExtension }}</mat-card-subtitle>
                      </mat-card-header>
                      
                      <mat-card-content>
                        <p class="format-description">{{ format.description }}</p>
                        
                        <div class="format-features">
                          <mat-chip 
                            *ngIf="format.supportsMetadata" 
                            color="primary" 
                            size="small">
                            Metadata
                          </mat-chip>
                          <mat-chip 
                            *ngIf="format.supportsComments" 
                            color="accent" 
                            size="small">
                            Comments
                          </mat-chip>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <!-- Export Options -->
                <div class="section">
                  <h3 class="section-title">Options</h3>
                  
                  <div class="options-grid">
                    <mat-slide-toggle formControlName="includeMetadata">
                      Include Metadata
                    </mat-slide-toggle>
                    
                    <mat-slide-toggle formControlName="prettyPrint">
                      Pretty Print
                    </mat-slide-toggle>
                    
                    <mat-slide-toggle 
                      formControlName="includeComments"
                      [disabled]="!selectedFormat?.supportsComments">
                      Include Comments
                    </mat-slide-toggle>
                    
                    <mat-slide-toggle formControlName="includeVisualRules">
                      Include Visual Rules
                    </mat-slide-toggle>
                  </div>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Custom Filename</mat-label>
                    <input matInput formControlName="customFilename" placeholder="Leave empty for auto-generated">
                    <mat-hint>Will be auto-generated if not specified</mat-hint>
                  </mat-form-field>
                </div>

                <mat-divider></mat-divider>

                <!-- Multiple Format Export -->
                <div class="section" *ngIf="data.allowMultipleFormats">
                  <h3 class="section-title">Batch Export</h3>
                  
                  <mat-slide-toggle 
                    [(ngModel)]="enableBatchExport"
                    [ngModelOptions]="{standalone: true}">
                    Export to Multiple Formats
                  </mat-slide-toggle>
                  
                  <div *ngIf="enableBatchExport" class="batch-formats">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Additional Formats</mat-label>
                      <mat-select multiple formControlName="additionalFormats">
                        <mat-option 
                          *ngFor="let format of supportedFormats" 
                          [value]="format.id"
                          [disabled]="format.id === selectedFormat?.id">
                          {{ format.name }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>
              </form>

              <!-- Export Results -->
              <div *ngIf="exportResults.length > 0" class="export-results">
                <h3 class="section-title">Export Results</h3>
                
                <mat-expansion-panel *ngFor="let result of exportResults" class="result-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      <mat-icon [class]="result.success ? 'success-icon' : 'error-icon'">
                        {{ result.success ? 'check_circle' : 'error' }}
                      </mat-icon>
                      {{ result.format.name }}
                    </mat-panel-title>
                    <mat-panel-description>
                      {{ result.filename }} ({{ formatFileSize(result.size) }})
                    </mat-panel-description>
                  </mat-expansion-panel-header>
                  
                  <div class="result-details">
                    <div *ngIf="result.success" class="success-details">
                      <div class="detail-row">
                        <strong>File Size:</strong> {{ formatFileSize(result.size) }}
                      </div>
                      <div class="detail-row" *ngIf="result.metadata">
                        <strong>Rules Count:</strong> {{ result.metadata.rulesCount }}
                      </div>
                      <div class="detail-row" *ngIf="result.metadata">
                        <strong>Complexity:</strong> {{ result.metadata.complexity }}
                      </div>
                      
                      <div class="action-buttons">
                        <button mat-button (click)="downloadResult(result)">
                          <mat-icon>download</mat-icon>
                          Download
                        </button>
                        <button mat-button (click)="previewResult(result)">
                          <mat-icon>preview</mat-icon>
                          Preview
                        </button>
                        <button mat-button (click)="copyToClipboard(result.content)">
                          <mat-icon>content_copy</mat-icon>
                          Copy
                        </button>
                      </div>
                    </div>
                    
                    <div *ngIf="!result.success" class="error-details">
                      <div class="error-list">
                        <div *ngFor="let error of result.errors" class="error-item">
                          {{ error }}
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-expansion-panel>
              </div>
            </div>
          </mat-tab>

          <!-- Integration Tab -->
          <mat-tab label="Integration" *ngIf="data.showIntegrationTab">
            <div class="tab-content">
              <form [formGroup]="integrationForm" class="integration-form">
                <!-- System Selection -->
                <div class="section">
                  <h3 class="section-title">External System</h3>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Select System</mat-label>
                    <mat-select formControlName="systemId" (selectionChange)="onSystemChange($event.value)">
                      <mat-option 
                        *ngFor="let system of externalSystems" 
                        [value]="system.id">
                        {{ system.name }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <div *ngIf="selectedSystem" class="system-info">
                    <mat-card class="info-card">
                      <mat-card-content>
                        <div class="system-details">
                          <div class="detail-row">
                            <strong>Type:</strong> {{ selectedSystem.type }}
                          </div>
                          <div class="detail-row">
                            <strong>Status:</strong> 
                            <mat-chip [color]="selectedSystem.enabled ? 'primary' : 'warn'" size="small">
                              {{ selectedSystem.enabled ? 'Enabled' : 'Disabled' }}
                            </mat-chip>
                          </div>
                          <div class="detail-row">
                            <strong>Endpoints:</strong> {{ selectedSystem.endpoints.length }}
                          </div>
                        </div>
                        
                        <button mat-button 
                                color="primary" 
                                (click)="testConnectivity()"
                                [disabled]="isTestingConnectivity">
                          <mat-icon>wifi</mat-icon>
                          {{ isTestingConnectivity ? 'Testing...' : 'Test Connection' }}
                        </button>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>

                <!-- Endpoint Selection -->
                <div class="section" *ngIf="selectedSystem">
                  <h3 class="section-title">Endpoint</h3>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Select Endpoint</mat-label>
                    <mat-select formControlName="endpointId">
                      <mat-option 
                        *ngFor="let endpoint of selectedSystem.endpoints" 
                        [value]="endpoint.id">
                        {{ endpoint.name }} ({{ endpoint.method }})
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <!-- Format for Integration -->
                <div class="section">
                  <h3 class="section-title">Export Format for Integration</h3>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Format</mat-label>
                    <mat-select formControlName="integrationFormat">
                      <mat-option 
                        *ngFor="let format of supportedFormats" 
                        [value]="format.id">
                        {{ format.name }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </form>

              <!-- Integration Results -->
              <div *ngIf="integrationResults.length > 0" class="integration-results">
                <h3 class="section-title">Integration Results</h3>
                
                <div *ngFor="let result of integrationResults" class="integration-result">
                  <mat-card [class]="result.success ? 'success-card' : 'error-card'">
                    <mat-card-header>
                      <mat-card-title>
                        <mat-icon>{{ result.success ? 'check_circle' : 'error' }}</mat-icon>
                        {{ result.endpoint.name }}
                      </mat-card-title>
                      <mat-card-subtitle>
                        {{ result.timestamp | date:'medium' }}
                      </mat-card-subtitle>
                    </mat-card-header>
                    
                    <mat-card-content>
                      <div *ngIf="result.success" class="success-content">
                        <div class="detail-row">
                          <strong>Status Code:</strong> {{ result.statusCode }}
                        </div>
                        <div class="detail-row" *ngIf="result.response">
                          <strong>Response:</strong> {{ result.response.data }}
                        </div>
                      </div>
                      
                      <div *ngIf="!result.success" class="error-content">
                        <div class="error-message">{{ result.error }}</div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Sharing Tab -->
          <mat-tab label="Sharing" *ngIf="data.showSharingTab">
            <div class="tab-content">
              <form [formGroup]="sharingForm" class="sharing-form">
                <div class="section">
                  <h3 class="section-title">Create Shareable Link</h3>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Share Format</mat-label>
                    <mat-select formControlName="shareFormat">
                      <mat-option 
                        *ngFor="let format of supportedFormats" 
                        [value]="format.id">
                        {{ format.name }}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Access Level</mat-label>
                    <mat-select formControlName="accessLevel">
                      <mat-option value="public">Public</mat-option>
                      <mat-option value="protected">Protected</mat-option>
                      <mat-option value="private">Private</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Expiration Date</mat-label>
                    <input matInput type="datetime-local" formControlName="expirationDate">
                  </mat-form-field>
                  
                  <mat-form-field 
                    appearance="outline" 
                    class="full-width"
                    *ngIf="sharingForm.get('accessLevel')?.value === 'protected'">
                    <mat-label>Password</mat-label>
                    <input matInput type="password" formControlName="password">
                  </mat-form-field>
                </div>
              </form>

              <!-- Share Results -->
              <div *ngIf="shareResult" class="share-result">
                <mat-card class="share-card">
                  <mat-card-header>
                    <mat-card-title>Shareable Link Created</mat-card-title>
                  </mat-card-header>
                  
                  <mat-card-content>
                    <div class="share-url">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Share URL</mat-label>
                        <input matInput [value]="shareResult.url" readonly>
                        <button matSuffix mat-icon-button (click)="copyShareUrl()">
                          <mat-icon>content_copy</mat-icon>
                        </button>
                      </mat-form-field>
                    </div>
                    
                    <div class="share-details">
                      <div class="detail-row">
                        <strong>Token:</strong> {{ shareResult.token }}
                      </div>
                      <div class="detail-row" *ngIf="shareResult.expiresAt">
                        <strong>Expires:</strong> {{ shareResult.expiresAt | date:'medium' }}
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancel</button>
        
        <div class="action-buttons">
          <button 
            mat-button 
            color="primary"
            [disabled]="!canExport()"
            (click)="onExport()"
            *ngIf="activeTabIndex === 0">
            <mat-icon>download</mat-icon>
            Export
          </button>
          
          <button 
            mat-button 
            color="primary"
            [disabled]="!canIntegrate()"
            (click)="onIntegrate()"
            *ngIf="activeTabIndex === 1">
            <mat-icon>send</mat-icon>
            Integrate
          </button>
          
          <button 
            mat-button 
            color="primary"
            [disabled]="!canShare()"
            (click)="onCreateShare()"
            *ngIf="activeTabIndex === 2">
            <mat-icon>share</mat-icon>
            Create Link
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <mat-progress-bar 
        *ngIf="isProcessing" 
        mode="indeterminate"
        class="progress-bar">
      </mat-progress-bar>
    </div>
  `,
  styles: [`
    .export-dialog {
      width: 800px;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .dialog-content {
      flex: 1;
      overflow: hidden;
    }

    .tab-content {
      padding: 16px 0;
      height: 60vh;
      overflow-y: auto;
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      margin: 0 0 16px 0;
      color: var(--mdc-theme-primary);
      font-size: 16px;
      font-weight: 500;
    }

    .format-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .format-card {
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid transparent;
    }

    .format-card:hover {
      border-color: var(--mdc-theme-primary-container);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .format-card.selected {
      border-color: var(--mdc-theme-primary);
      background: var(--mdc-theme-primary-container);
    }

    .format-description {
      font-size: 13px;
      color: var(--mdc-theme-on-surface-variant);
      margin: 8px 0;
      min-height: 40px;
    }

    .format-features {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .batch-formats {
      margin-top: 16px;
    }

    .export-results,
    .integration-results {
      margin-top: 24px;
    }

    .result-panel {
      margin-bottom: 8px;
    }

    .success-icon {
      color: var(--mdc-theme-tertiary);
    }

    .error-icon {
      color: var(--mdc-theme-error);
    }

    .result-details {
      padding: 16px 0;
    }

    .detail-row {
      margin-bottom: 8px;
      font-size: 14px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .error-details {
      color: var(--mdc-theme-error);
    }

    .error-item {
      background: var(--mdc-theme-error-container);
      color: var(--mdc-theme-on-error-container);
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 4px;
    }

    .system-info {
      margin-top: 16px;
    }

    .info-card {
      background: var(--mdc-theme-surface-variant);
    }

    .system-details {
      margin-bottom: 16px;
    }

    .integration-result {
      margin-bottom: 16px;
    }

    .success-card {
      border-left: 4px solid var(--mdc-theme-tertiary);
    }

    .error-card {
      border-left: 4px solid var(--mdc-theme-error);
    }

    .sharing-form {
      max-width: 400px;
    }

    .share-card {
      margin-top: 16px;
      border-left: 4px solid var(--mdc-theme-primary);
    }

    .share-url {
      margin-bottom: 16px;
    }

    .dialog-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
    }

    .dialog-actions .action-buttons {
      display: flex;
      gap: 8px;
    }

    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .export-dialog {
        width: 100vw;
        height: 100vh;
        max-width: none;
        max-height: none;
      }

      .format-grid {
        grid-template-columns: 1fr;
      }

      .options-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ExportDialogComponent implements OnInit {
  exportForm: FormGroup;
  integrationForm: FormGroup;
  sharingForm: FormGroup;

  activeTabIndex = 0;
  isProcessing = false;
  enableBatchExport = false;
  isTestingConnectivity = false;

  supportedFormats: ExportFormat[] = [];
  selectedFormat: ExportFormat | null = null;
  externalSystems: ExternalSystemConfig[] = [];
  selectedSystem: ExternalSystemConfig | null = null;

  exportResults: ExportResult[] = [];
  integrationResults: any[] = [];
  shareResult: any = null;

  constructor(
    public dialogRef: MatDialogRef<ExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExportDialogData,
    private fb: FormBuilder,
    private exportService: ExportIntegrationService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.exportForm = this.createExportForm();
    this.integrationForm = this.createIntegrationForm();
    this.sharingForm = this.createSharingForm();
  }

  ngOnInit(): void {
    this.loadSupportedFormats();
    this.loadExternalSystems();
    
    if (this.data.preselectedFormat) {
      this.selectFormat(this.data.preselectedFormat);
    }
  }

  private createExportForm(): FormGroup {
    return this.fb.group({
      includeMetadata: [true],
      prettyPrint: [true],
      includeComments: [false],
      includeVisualRules: [false],
      customFilename: [''],
      additionalFormats: [[]]
    });
  }

  private createIntegrationForm(): FormGroup {
    return this.fb.group({
      systemId: ['', Validators.required],
      endpointId: ['', Validators.required],
      integrationFormat: ['json', Validators.required]
    });
  }

  private createSharingForm(): FormGroup {
    return this.fb.group({
      shareFormat: ['json', Validators.required],
      accessLevel: ['public', Validators.required],
      expirationDate: [''],
      password: ['']
    });
  }

  private loadSupportedFormats(): void {
    this.supportedFormats = this.exportService.getSupportedFormats();
  }

  private loadExternalSystems(): void {
    this.externalSystems = this.exportService.getExternalSystems();
  }

  selectFormat(formatId: string): void {
    this.selectedFormat = this.exportService.getFormat(formatId);
    
    // Update form controls based on format capabilities
    if (this.selectedFormat) {
      if (!this.selectedFormat.supportsComments) {
        this.exportForm.patchValue({ includeComments: false });
      }
    }
  }

  isFormatSelected(formatId: string): boolean {
    return this.selectedFormat?.id === formatId;
  }

  onSystemChange(systemId: string): void {
    this.selectedSystem = this.externalSystems.find(s => s.id === systemId) || null;
    this.integrationForm.patchValue({ endpointId: '' });
  }

  async testConnectivity(): Promise<void> {
    if (!this.selectedSystem) return;

    this.isTestingConnectivity = true;
    this.cdr.detectChanges();

    try {
      const result = await this.exportService.testSystemConnectivity(this.selectedSystem.id).toPromise();
      const message = result?.success ? 'Connection successful!' : `Connection failed: ${result?.message}`;
      const duration = result?.success ? 2000 : 4000;
      
      this.snackBar.open(message, 'Close', { duration });
    } catch (error) {
      this.snackBar.open(`Connection test failed: ${error}`, 'Close', { duration: 4000 });
    } finally {
      this.isTestingConnectivity = false;
      this.cdr.detectChanges();
    }
  }

  async onExport(): Promise<void> {
    if (!this.canExport()) return;

    this.isProcessing = true;
    this.exportResults = [];
    this.cdr.detectChanges();

    try {
      const formValue = this.exportForm.value;
      const formats = this.enableBatchExport 
        ? [this.selectedFormat!.id, ...formValue.additionalFormats]
        : [this.selectedFormat!.id];

      const results = await this.exportService.exportToMultipleFormats(formats, {
        includeMetadata: formValue.includeMetadata,
        prettyPrint: formValue.prettyPrint,
        includeComments: formValue.includeComments,
        includeVisualRules: formValue.includeVisualRules,
        customFilename: formValue.customFilename,
        downloadFile: true
      }).toPromise();

      this.exportResults = results || [];
      
      const successCount = this.exportResults.filter(r => r.success).length;
      this.snackBar.open(`Successfully exported ${successCount}/${this.exportResults.length} files`, 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open(`Export failed: ${error}`, 'Close', { duration: 4000 });
    } finally {
      this.isProcessing = false;
      this.cdr.detectChanges();
    }
  }

  async onIntegrate(): Promise<void> {
    if (!this.canIntegrate()) return;

    this.isProcessing = true;
    this.cdr.detectChanges();

    try {
      const formValue = this.integrationForm.value;
      const result = await this.exportService.integrateWithSystem(
        formValue.systemId,
        formValue.endpointId,
        formValue.integrationFormat
      ).toPromise();

      if (result) {
        this.integrationResults.push(result);
        const message = result.success ? 'Integration successful!' : `Integration failed: ${result.error}`;
        this.snackBar.open(message, 'Close', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open(`Integration failed: ${error}`, 'Close', { duration: 4000 });
    } finally {
      this.isProcessing = false;
      this.cdr.detectChanges();
    }
  }

  async onCreateShare(): Promise<void> {
    if (!this.canShare()) return;

    this.isProcessing = true;
    this.cdr.detectChanges();

    try {
      const formValue = this.sharingForm.value;
      const options = {
        format: formValue.shareFormat,
        accessLevel: formValue.accessLevel,
        expiration: formValue.expirationDate ? new Date(formValue.expirationDate) : undefined,
        password: formValue.password
      };

      const result = await this.exportService.createShareableLink(options).toPromise();
      this.shareResult = result;
      
      this.snackBar.open('Shareable link created!', 'Close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(`Failed to create share link: ${error}`, 'Close', { duration: 4000 });
    } finally {
      this.isProcessing = false;
      this.cdr.detectChanges();
    }
  }

  canExport(): boolean {
    return !!this.selectedFormat && !this.isProcessing;
  }

  canIntegrate(): boolean {
    return this.integrationForm.valid && !this.isProcessing;
  }

  canShare(): boolean {
    return this.sharingForm.valid && !this.isProcessing;
  }

  downloadResult(result: ExportResult): void {
    const blob = new Blob([result.content], { type: result.format.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  previewResult(result: ExportResult): void {
    // Open preview dialog or new window
    const blob = new Blob([result.content], { type: result.format.mimeType });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  copyToClipboard(content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      this.snackBar.open('Copied to clipboard!', 'Close', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Failed to copy to clipboard', 'Close', { duration: 3000 });
    });
  }

  copyShareUrl(): void {
    if (this.shareResult?.url) {
      this.copyToClipboard(this.shareResult.url);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}