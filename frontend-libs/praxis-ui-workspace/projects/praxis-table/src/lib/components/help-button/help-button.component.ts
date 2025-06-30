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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EducationalCardsService, TabCardKey } from '../../services/educational-cards.service';

@Component({
  selector: 'help-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <button *ngIf="!isCardVisible"
            mat-icon-button 
            class="help-button"
            (click)="onShowHelp()"
            [matTooltip]="tooltipText"
            matTooltipPosition="below">
      <mat-icon>help_outline</mat-icon>
    </button>
  `,
  styles: [`
    .help-button {
      color: var(--mat-sys-primary);
      background-color: var(--mat-sys-primary-container);
      transition: all 0.2s ease;
      opacity: 0.8;
    }

    .help-button:hover {
      opacity: 1;
      background-color: var(--mat-sys-primary-container);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
  `]
})
export class HelpButtonComponent implements OnInit {
  @Input() tabKey!: TabCardKey;
  @Input() tooltipText = 'Mostrar informações sobre esta seção';

  @Output() helpRequested = new EventEmitter<TabCardKey>();

  isCardVisible = true;

  constructor(
    private cardsService: EducationalCardsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateVisibility();
  }

  onShowHelp(): void {
    this.cardsService.showCard(this.tabKey);
    this.updateVisibility();
    this.helpRequested.emit(this.tabKey);
  }

  updateVisibility(): void {
    this.isCardVisible = this.cardsService.isCardVisible(this.tabKey);
    this.cdr.markForCheck();
  }
}