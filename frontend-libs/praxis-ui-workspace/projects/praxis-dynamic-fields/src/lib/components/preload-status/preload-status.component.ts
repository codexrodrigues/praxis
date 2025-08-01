/**
 * @fileoverview Componente para exibir status do preload de componentes
 * 
 * Componente opcional para debug e monitoramento do preload.
 * Exibe informações em tempo real sobre o carregamento dos componentes.
 */

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ComponentPreloaderService, PreloadStatus } from '../../services/component-preloader.service';

@Component({
  selector: 'pdx-preload-status',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <mat-card class="preload-status-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>widgets</mat-icon>
          Status do Preload de Componentes
        </mat-card-title>
        <mat-card-subtitle>
          Sistema de carregamento antecipado - TextInputComponent
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        @if (status) {
          <!-- Progresso geral -->
          <div class="progress-section">
            <div class="progress-label">
              <span>Progresso: {{ status.progress }}%</span>
              <span class="component-count">
                {{ status.loadedComponents }}/{{ status.totalComponents }} componentes
              </span>
            </div>
            <mat-progress-bar 
              [value]="status.progress" 
              [color]="status.isPreloading ? 'primary' : 'accent'">
            </mat-progress-bar>
          </div>

          <!-- Status atual -->
          <div class="status-info">
            @if (status.isPreloading) {
              <mat-chip-set>
                <mat-chip color="primary" highlighted>
                  <mat-icon>hourglass_empty</mat-icon>
                  Carregando: {{ status.currentComponent || 'Preparando...' }}
                </mat-chip>
              </mat-chip-set>
            } @else {
              <mat-chip-set>
                <mat-chip color="accent" highlighted>
                  <mat-icon>check_circle</mat-icon>
                  Preload Concluído
                </mat-chip>
              </mat-chip-set>
            }
          </div>

          <!-- Estatísticas -->
          <div class="stats-grid">
            <div class="stat-item success">
              <mat-icon>check_circle</mat-icon>
              <span class="stat-label">Carregados</span>
              <span class="stat-value">{{ status.loadedComponents }}</span>
            </div>

            <div class="stat-item error">
              <mat-icon>error</mat-icon>
              <span class="stat-label">Falhas</span>
              <span class="stat-value">{{ status.failedComponents }}</span>
            </div>

            <div class="stat-item info">
              <mat-icon>info</mat-icon>
              <span class="stat-label">Total</span>
              <span class="stat-value">{{ status.totalComponents }}</span>
            </div>
          </div>

          <!-- Erros (se houver) -->
          @if (status.errors.length > 0) {
            <div class="errors-section">
              <h4>
                <mat-icon>warning</mat-icon>
                Erros Encontrados
              </h4>
              <div class="error-list">
                @for (error of status.errors; track error) {
                  <div class="error-item">{{ error }}</div>
                }
              </div>
            </div>
          }
        }
      </mat-card-content>

      <mat-card-actions>
        <button 
          mat-button 
          (click)="forceReload()"
          [disabled]="status?.isPreloading">
          <mat-icon>refresh</mat-icon>
          Recarregar
        </button>
        
        <button 
          mat-button 
          (click)="toggleAutoUpdate()">
          <mat-icon>{{ autoUpdate ? 'pause' : 'play_arrow' }}</mat-icon>
          Auto-update: {{ autoUpdate ? 'ON' : 'OFF' }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .preload-status-card {
      max-width: 600px;
      margin: 16px;
    }

    .progress-section {
      margin-bottom: 16px;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .component-count {
      color: rgba(0, 0, 0, 0.6);
    }

    .status-info {
      margin: 16px 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 16px 0;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.04);
    }

    .stat-item.success {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
    }

    .stat-item.error {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .stat-item.info {
      background: rgba(33, 150, 243, 0.1);
      color: #2196f3;
    }

    .stat-label {
      font-size: 12px;
      margin: 4px 0;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 500;
    }

    .errors-section {
      margin-top: 16px;
      padding: 16px;
      background: rgba(244, 67, 54, 0.05);
      border-radius: 8px;
      border-left: 4px solid #f44336;
    }

    .errors-section h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      color: #f44336;
    }

    .error-list {
      font-size: 13px;
    }

    .error-item {
      margin: 4px 0;
      padding: 4px 8px;
      background: rgba(244, 67, 54, 0.1);
      border-radius: 4px;
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
    }
  `]
})
export class PreloadStatusComponent implements OnInit, OnDestroy {

  // =============================================================================
  // DEPENDENCIES
  // =============================================================================

  private readonly preloader = inject(ComponentPreloaderService);

  // =============================================================================
  // STATE
  // =============================================================================

  status: PreloadStatus | null = null;
  autoUpdate = true;

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  ngOnInit(): void {
    if (this.autoUpdate) {
      this.subscribeToStatus();
    } else {
      this.loadCurrentStatus();
    }
  }

  ngOnDestroy(): void {
    // takeUntilDestroyed() já gerencia isso automaticamente
  }

  // =============================================================================
  // METHODS
  // =============================================================================

  /**
   * Força um novo preload
   */
  async forceReload(): Promise<void> {
    try {
      await this.preloader.forceReload();
    } catch (error) {
      console.error('Erro ao forçar reload:', error);
    }
  }

  /**
   * Toggle do auto-update
   */
  toggleAutoUpdate(): void {
    this.autoUpdate = !this.autoUpdate;
    
    if (this.autoUpdate) {
      this.subscribeToStatus();
    } else {
      this.loadCurrentStatus();
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Subscreve às atualizações de status em tempo real
   */
  private subscribeToStatus(): void {
    this.preloader.status$
      .pipe(takeUntilDestroyed())
      .subscribe(status => {
        this.status = status;
      });
  }

  /**
   * Carrega status atual uma vez
   */
  private loadCurrentStatus(): void {
    // Como status$ é um BehaviorSubject, podemos pegar o valor atual
    this.preloader.status$.pipe(takeUntilDestroyed()).subscribe(status => {
      this.status = status;
    });
  }
}