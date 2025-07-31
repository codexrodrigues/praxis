import { Component, ElementRef, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatFormFieldAppearance } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemePalette } from '@angular/material/core';

import { BaseDynamicFieldComponent } from '../../base/base-dynamic-field.component';
import { MaterialColorPickerMetadata } from '@praxis/core';

interface ColorState {
  isPickerOpen: boolean;
  currentColor: string;
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  isSelecting: boolean;
  cursorX: number;
  cursorY: number;
}

@Component({
  selector: 'pdx-material-colorpicker',
  standalone: true,
  templateUrl: './material-colorpicker.component.html',
  styleUrls: ['./material-colorpicker.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"colorpicker"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialColorPickerComponent extends BaseDynamicFieldComponent<MaterialColorPickerMetadata> {
  @ViewChild('colorCanvas', { static: false }) colorCanvas?: ElementRef<HTMLCanvasElement>;

  private readonly colorState = signal<ColorState>({
    isPickerOpen: false,
    currentColor: '#000000',
    hue: 0,
    saturation: 100,
    lightness: 50,
    alpha: 1,
    isSelecting: false,
    cursorX: 0,
    cursorY: 0
  });

  readonly currentColor = computed(() => this.colorState().currentColor);
  readonly isPickerOpen = computed(() => this.colorState().isPickerOpen);
  readonly showAlpha = computed(() => this.metadata()?.showAlpha === true);
  readonly hasPresetColors = computed(() => Boolean(this.metadata()?.presetColors?.length));
  readonly allowCustomColors = computed(() => this.metadata()?.allowCustomColors !== false);
  readonly showInput = computed(() => this.metadata()?.showInput !== false);

  /** Appearance configuration */
  readonly materialAppearance = computed(() => {
    return (this.metadata()?.materialDesign?.appearance || 'outline') as MatFormFieldAppearance;
  });

  /** Material theme color */
  readonly materialColor = computed(() => {
    return (this.metadata()?.materialDesign?.color || 'primary') as ThemePalette;
  });

  /** Disabled state considering disabledInteractive */
  readonly isDisabledInteractive = computed(() => {
    const metadata = this.metadata();
    const state = this.componentState();
    return state.disabled && metadata?.disabledInteractive === true;
  });

  readonly effectiveDisabled = computed(() => {
    const state = this.componentState();
    return state.disabled && !this.isDisabledInteractive();
  });

  openColorPicker(): void {
    if (this.effectiveDisabled()) return;
    this.colorState.update(s => ({ ...s, isPickerOpen: true }));
    setTimeout(() => this.initializeColorCanvas());
  }

  closeColorPicker(): void {
    this.colorState.update(s => ({ ...s, isPickerOpen: false, isSelecting: false }));
  }

  clearColor(): void {
    this.setValue(null);
    this.colorState.update(s => ({ ...s, currentColor: '#000000' }));
  }

  confirmColor(): void {
    this.setValue(this.colorState().currentColor);
    this.closeColorPicker();
  }

  selectPresetColor(color: string): void {
    this.colorState.update(s => ({ ...s, currentColor: color }));
  }

  onColorInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.colorState.update(s => ({ ...s, currentColor: value }));
  }

  onCanvasMouseDown(event: MouseEvent): void {
    this.colorState.update(s => ({ ...s, isSelecting: true }));
    this.updateColorFromCanvas(event.offsetX, event.offsetY);
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (!this.colorState().isSelecting) return;
    this.updateColorFromCanvas(event.offsetX, event.offsetY);
  }

  onCanvasMouseUp(): void {
    this.colorState.update(s => ({ ...s, isSelecting: false }));
  }

  onHueChange(event: Event): void {
    const hue = parseInt((event.target as HTMLInputElement).value, 10);
    this.colorState.update(s => ({ ...s, hue }));
    this.drawColorCanvas();
  }

  onAlphaChange(event: Event): void {
    const alpha = parseFloat((event.target as HTMLInputElement).value);
    this.colorState.update(s => ({ ...s, alpha }));
  }

  isColorSelected(color: string): boolean {
    return this.colorState().currentColor.toLowerCase() === color.toLowerCase();
  }

  trackByColor(_: number, color: string): string {
    return color;
  }

  getPresetColors(): string[] {
    return this.metadata()?.presetColors || [];
  }

  getColorPlaceholder(): string {
    return this.metadata()?.format?.toUpperCase() || 'HEX';
  }

  getCursorTransform(): string {
    const { cursorX, cursorY } = this.colorState();
    return `translate(${cursorX - 5}px, ${cursorY - 5}px)`;
  }

  private initializeColorCanvas(): void {
    this.drawColorCanvas();
  }

  private drawColorCanvas(): void {
    if (!this.colorCanvas) return;
    const canvas = this.colorCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hue = this.colorState().hue;
    const width = canvas.width;
    const height = canvas.height;

    const gradientSat = ctx.createLinearGradient(0, 0, width, 0);
    gradientSat.addColorStop(0, 'white');
    gradientSat.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
    ctx.fillStyle = gradientSat;
    ctx.fillRect(0, 0, width, height);

    const gradientVal = ctx.createLinearGradient(0, 0, 0, height);
    gradientVal.addColorStop(0, 'rgba(0,0,0,0)');
    gradientVal.addColorStop(1, 'black');
    ctx.fillStyle = gradientVal;
    ctx.fillRect(0, 0, width, height);
  }

  private updateColorFromCanvas(x: number, y: number): void {
    if (!this.colorCanvas) return;
    const canvas = this.colorCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b] = data;
    const color = `rgba(${r},${g},${b},${this.colorState().alpha})`;
    this.colorState.update(s => ({ ...s, currentColor: color, cursorX: x, cursorY: y }));
  }
}
