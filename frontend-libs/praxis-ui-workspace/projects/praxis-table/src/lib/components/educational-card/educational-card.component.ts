import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EducationalCardsService, TabCardKey } from '../../services/educational-cards.service';

@Component({
  selector: 'educational-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  template: `
    <mat-card *ngIf="isVisible" class="educational-card" [class.compact]="compact">
      <mat-card-header>
        <mat-icon mat-card-avatar class="card-icon">{{ icon }}</mat-icon>
        <mat-card-title>{{ title }}</mat-card-title>
        <div class="card-actions">
          <button mat-icon-button 
                  class="hide-card-button"
                  (click)="onHideCard()"
                  matTooltip="Não mostrar novamente"
                  matTooltipPosition="left">
            <mat-icon>visibility_off</mat-icon>
          </button>
        </div>
      </mat-card-header>
      <mat-card-content>
        <div class="card-content">
          <p class="main-description">{{ description }}</p>
          
          <div *ngIf="benefits.length > 0" class="benefits-section">
            <p class="benefits-title">✨ <strong>O que você pode fazer:</strong></p>
            <ul class="benefits-list">
              <li *ngFor="let benefit of benefits">{{ benefit }}</li>
            </ul>
          </div>
          
          <div *ngIf="tips.length > 0" class="tips-section">
            <p class="tips-title">💡 <strong>Dicas:</strong></p>
            <ul class="tips-list">
              <li *ngFor="let tip of tips">{{ tip }}</li>
            </ul>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .educational-card {
      margin-bottom: 24px;
      background: linear-gradient(135deg, var(--mat-sys-primary-container) 0%, var(--mat-sys-surface-container-low) 100%);
      border-left: 4px solid var(--mat-sys-primary);
      flex-shrink: 0;
      position: relative;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .educational-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .educational-card.compact {
      margin-bottom: 16px;
    }

    .educational-card .mat-mdc-card-header {
      padding-bottom: 8px;
      position: relative;
    }

    .card-icon {
      background-color: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      font-size: 20px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .educational-card .mat-mdc-card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--mat-sys-on-surface);
      margin: 0;
    }

    .card-actions {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    .hide-card-button {
      opacity: 0.7;
      transition: opacity 0.2s ease;
      color: var(--mat-sys-on-surface-variant);
    }

    .hide-card-button:hover {
      opacity: 1;
      background-color: var(--mat-sys-surface-container-high);
    }

    .card-content {
      color: var(--mat-sys-on-surface);
      line-height: 1.6;
    }

    .main-description {
      margin: 0 0 16px 0;
      font-size: 0.95rem;
      color: var(--mat-sys-on-surface);
    }

    .benefits-section,
    .tips-section {
      margin-top: 16px;
    }

    .benefits-title,
    .tips-title {
      margin: 0 0 8px 0;
      font-size: 0.9rem;
      color: var(--mat-sys-primary);
    }

    .benefits-list,
    .tips-list {
      margin: 0;
      padding-left: 20px;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .benefits-list li,
    .tips-list li {
      margin-bottom: 4px;
    }

    .benefits-list li::marker {
      color: var(--mat-sys-primary);
    }

    .tips-list li::marker {
      color: var(--mat-sys-secondary);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .educational-card .mat-mdc-card-title {
        font-size: 1rem;
        padding-right: 40px;
      }

      .main-description,
      .benefits-list,
      .tips-list {
        font-size: 0.85rem;
      }
    }
  `]
})
export class EducationalCardComponent implements OnInit {
  @Input() tabKey!: TabCardKey;
  @Input() icon!: string;
  @Input() title!: string;
  @Input() description!: string;
  @Input() benefits: string[] = [];
  @Input() tips: string[] = [];
  @Input() compact = false;

  @Output() cardHidden = new EventEmitter<TabCardKey>();

  isVisible = true;

  constructor(
    private cardsService: EducationalCardsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isVisible = this.cardsService.isCardVisible(this.tabKey);
    this.cdr.markForCheck();
  }

  onHideCard(): void {
    this.cardsService.hideCard(this.tabKey);
    this.isVisible = false;
    this.cardHidden.emit(this.tabKey);
    this.cdr.markForCheck();
  }
}