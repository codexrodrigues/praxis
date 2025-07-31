/**
 * @fileoverview Componente Material Rating din\u00e2mico
 *
 * Implementa um sistema de avalia\u00e7\u00e3o com estrelas ou \u00edcones customizados.
 */

import { Component, computed, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialRatingMetadata } from '@praxis/core';

interface HoverState {
  hoveredIndex: number;
  isHovering: boolean;
}

interface StarConfig {
  index: number;
  value: number;
  filled: boolean;
  half: boolean;
  empty: boolean;
  hover: boolean;
}

@Component({
  selector: 'pdx-material-rating',
  standalone: true,
  templateUrl: './material-rating.component.html',
  styleUrls: ['./material-rating.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule]
})
export class MaterialRatingComponent extends BaseDynamicFieldComponent<MaterialRatingMetadata> {
  private readonly hoverState = signal<HoverState>({ hoveredIndex: -1, isHovering: false });

  readonly materialColor = computed(() => this.metadata()?.color || 'primary');
  readonly isReadonly = computed(() => this.metadata()?.readonly === true);
  readonly maxRating = computed(() => this.metadata()?.max || 5);
  readonly precision = computed(() => this.metadata()?.precision || 1);
  readonly allowHalf = computed(() => this.metadata()?.allowHalf === true);
  readonly showValueDisplay = computed(() => this.metadata()?.showValue !== false);

  readonly effectiveDisabled = computed(() => {
    const componentState = this.componentState();
    return componentState.disabled;
  });

  getAriaDescribedBy(): string {
    const parts: string[] = [];
    const metadata = this.metadata();
    
    if (metadata?.hint) {
      parts.push(`${this.componentId()}-hint`);
    }
    
    if (this.hasValidationError()) {
      parts.push(`${this.componentId()}-error`);
    }
    
    return parts.join(' ');
  }

  readonly getStars = computed(() => {
    const stars: StarConfig[] = [];
    const currentValue = this.fieldValue() || 0;
    const { hoveredIndex, isHovering } = this.hoverState();
    const max = this.maxRating();

    for (let i = 0; i < max; i++) {
      const starValue = i + 1;
      const displayValue = isHovering ? hoveredIndex + 1 : currentValue;

      stars.push({
        index: i,
        value: starValue,
        filled: displayValue >= starValue,
        half: this.allowHalf() && displayValue >= starValue - 0.5 && displayValue < starValue,
        empty: displayValue < starValue - (this.allowHalf() ? 0.5 : 0),
        hover: isHovering && i <= hoveredIndex
      });
    }

    return stars;
  });

  selectRating(value: number): void {
    if (this.effectiveDisabled() || this.isReadonly()) return;

    let newValue = value;
    if (this.allowHalf() && this.fieldValue() === value) {
      newValue = value - 0.5;
    }

    const precision = this.precision();
    newValue = Math.round(newValue / precision) * precision;
    this.setValue(newValue);
  }

  onStarHover(index: number): void {
    if (this.effectiveDisabled() || this.isReadonly()) return;
    this.hoverState.set({ hoveredIndex: index, isHovering: true });
  }

  onStarLeave(): void {
    this.hoverState.set({ hoveredIndex: -1, isHovering: false });
  }

  onStarKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectRating(index + 1);
    }
  }

  getStarAriaLabel(index: number): string {
    return `Rate ${index + 1} out of ${this.maxRating()}`;
  }

  formatRatingValue(value: number): string {
    return value?.toFixed(this.precision() < 1 ? 1 : 0) || '0';
  }

  trackByIndex(index: number): number {
    return index;
  }
}
