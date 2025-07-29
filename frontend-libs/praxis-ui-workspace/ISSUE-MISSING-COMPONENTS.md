# 🧩 ISSUE CRÍTICA: Implementação de 5 Componentes Material Faltantes

**Prioridade**: 🔴 CRÍTICA  
**Tipo**: Feature / Implementation  
**Componentes Afetados**: `@praxis/dynamic-fields`  
**Impacto**: Runtime errors bloqueiam uso em produção  

---

## 📋 Contexto

Durante a nova simulação pós-implementação da issue principal, foi identificado que **5 componentes Material** possuem interfaces completas e estão registrados no `FieldControlType`, mas **não têm implementação física**. Isso causa runtime errors quando estes tipos são utilizados em formulários.

**Status Atual**:
- ✅ Interfaces de metadata completas e documentadas
- ✅ Tipos registrados em `FieldControlType`
- ❌ **Componentes físicos não implementados**
- ❌ **Não registrados no `ComponentRegistryService`**

---

## 🎯 Objetivo

Implementar os 5 componentes Material faltantes com funcionalidade completa, integração com Angular Material 19+, e compatibilidade total com o sistema de campos dinâmicos existente.

---

## 🧩 Componentes a Implementar

> **📋 NOTA IMPORTANTE**: Nem todos os componentes devem usar `mat-form-field`. Seguir as diretrizes do Angular Material:
> 
> - ✅ **COM mat-form-field**: `input`, `textarea`, `select` (controles de entrada de texto)
> - ❌ **SEM mat-form-field**: `mat-slide-toggle`, `mat-slider`, `mat-checkbox`, `mat-radio-group` (controles interativos)
> 
> **Padrão de Layout Unificado**: Todos os componentes devem seguir a mesma estrutura visual:
> ```html
> <div class="pdx-field-container">
>   <label class="pdx-field-label">...</label>
>   <div class="pdx-field-control"><!-- componente --></div>
>   <div class="pdx-field-hints"><!-- hints e errors --></div>
> </div>
> ```

### **1. MaterialToggleComponent**

#### **Arquivo**: `projects/praxis-dynamic-fields/src/lib/components/material-toggle/`

```typescript
/**
 * @fileoverview Componente Material Toggle/Switch dinâmico
 * 
 * Implementa um switch Material Design com:
 * ✅ Integração com mat-slide-toggle (SEM mat-form-field)
 * ✅ Estados boolean e indeterminate
 * ✅ Layout consistente com outros campos
 * ✅ Acessibilidade WCAG 2.1 AA
 */

@Component({
  selector: 'pdx-material-toggle',
  standalone: true,
  template: `
    <div class="pdx-field-container pdx-toggle-container" 
         [class]="cssClasses() + ' ' + fieldCssClasses()">
      
      <!-- Field Label (consistente com outros componentes) -->
      <label class="pdx-field-label" 
             [class.required]="metadata()?.required"
             [for]="componentId() + '-toggle'">
        {{ metadata()?.label }}
        <span *ngIf="metadata()?.required" class="pdx-required-marker" aria-hidden="true">*</span>
      </label>
      
      <!-- Toggle Control Container -->
      <div class="pdx-field-control">
        <mat-slide-toggle
          [id]="componentId() + '-toggle'"
          [formControl]="formControl"
          [color]="materialColor()"
          [disabled]="effectiveDisabled()"
          [disableRipple]="metadata()?.disableRipple"
          [hideIcon]="metadata()?.hideIcon"
          [tabIndex]="metadata()?.tabIndex || 0"
          [labelPosition]="labelPosition()"
          (change)="onToggleChange($event)"
          (focus)="onToggleFocus($event)"
          (blur)="onToggleBlur($event)">
          
          <!-- Toggle internal label (se necessário) -->
          <span *ngIf="hasToggleLabel()">{{ getToggleLabel() }}</span>
        </mat-slide-toggle>
      </div>
      
      <!-- Hints and Errors Container -->
      <div class="pdx-field-hints">
        <div *ngIf="metadata()?.hint && !hasValidationError()" 
             class="pdx-field-hint" 
             [id]="componentId() + '-hint'">
          {{ metadata()?.hint }}
        </div>
        
        <div *ngIf="hasValidationError()" 
             class="pdx-field-error"
             [id]="componentId() + '-error'" 
             role="alert">
          {{ primaryErrorMessage() }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./material-toggle.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatFormFieldModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MaterialToggleComponent),
    multi: true
  }],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"toggle"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialToggleComponent 
  extends BaseDynamicFieldComponent<MaterialToggleMetadata> {

  // Computed properties específicos
  readonly materialColor = computed(() => this.metadata()?.color || 'primary');
  readonly labelPosition = computed(() => this.metadata()?.labelPosition || 'after');
  
  // Event handlers
  onToggleChange(event: MatSlideToggleChange): void { /* ... */ }
  onToggleFocus(event: FocusEvent): void { /* ... */ }
  onToggleBlur(event: FocusEvent): void { /* ... */ }
}
```

#### **Casos de Teste Obrigatórios**:
```typescript
describe('MaterialToggleComponent', () => {
  it('should toggle boolean value correctly', () => { /* ... */ });
  it('should respect color theme', () => { /* ... */ });
  it('should handle disabled state', () => { /* ... */ });
  it('should support label positioning', () => { /* ... */ });
  it('should integrate with FormControl', () => { /* ... */ });
});
```

---

### **2. MaterialSliderComponent**

#### **Arquivo**: `projects/praxis-dynamic-fields/src/lib/components/material-slider/`

```typescript
/**
 * @fileoverview Componente Material Slider dinâmico
 * 
 * Implementa um slider Material Design com:
 * ✅ Integração com mat-slider (SEM mat-form-field)
 * ✅ Range de valores configurável
 * ✅ Layout consistente com outros campos
 * ✅ Tick marks e thumb labels
 */

@Component({
  selector: 'pdx-material-slider',
  standalone: true,
  template: `
    <div class="pdx-field-container pdx-slider-container" 
         [class]="cssClasses() + ' ' + fieldCssClasses()">
      
      <!-- Field Label -->
      <label class="pdx-field-label" 
             [class.required]="metadata()?.required"
             [for]="componentId() + '-slider'">
        {{ metadata()?.label }}
        <span *ngIf="metadata()?.required" class="pdx-required-marker" aria-hidden="true">*</span>
      </label>
      
      <!-- Slider Control Container -->
      <div class="pdx-field-control">
        <!-- Current Value Display -->
        <div *ngIf="showCurrentValue()" class="pdx-slider-value">
          {{ formatValue(fieldValue()) }}
        </div>
        
        <!-- Material Slider -->
        <mat-slider
          [id]="componentId() + '-slider'"
          [min]="metadata()?.min || 0"
          [max]="metadata()?.max || 100"
          [step]="metadata()?.step || 1"
          [disabled]="effectiveDisabled()"
          [color]="materialColor()"
          [vertical]="metadata()?.vertical"
          [invert]="metadata()?.invert"
          [tickInterval]="metadata()?.tickInterval"
          class="pdx-slider-control">
          
          <input 
            matSliderThumb
            [formControl]="formControl"
            [displayWith]="thumbLabelFormatter"
            [aria-describedby]="getAriaDescribedBy()"
            (valueChange)="onSliderChange($event)"
            (focus)="onSliderFocus($event)"
            (blur)="onSliderBlur($event)">
        </mat-slider>
        
        <!-- Min/Max labels -->
        <div class="pdx-slider-labels" *ngIf="showMinMaxLabels()">
          <span class="pdx-slider-min">{{ formatValue(metadata()?.min || 0) }}</span>
          <span class="pdx-slider-max">{{ formatValue(metadata()?.max || 100) }}</span>
        </div>
      </div>
      
      <!-- Hints and Errors Container -->
      <div class="pdx-field-hints">
        <div *ngIf="metadata()?.hint && !hasValidationError()" 
             class="pdx-field-hint" 
             [id]="componentId() + '-hint'">
          {{ metadata()?.hint }}
        </div>
        
        <div *ngIf="hasValidationError()" 
             class="pdx-field-error"
             [id]="componentId() + '-error'" 
             role="alert">
          {{ primaryErrorMessage() }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./material-slider.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatFormFieldModule
  ]
})
export class MaterialSliderComponent 
  extends BaseDynamicFieldComponent<MaterialSliderMetadata> {

  // Computed properties
  readonly materialColor = computed(() => this.metadata()?.color || 'primary');
  readonly showCurrentValue = computed(() => this.metadata()?.showCurrentValue !== false);
  readonly showMinMaxLabels = computed(() => this.metadata()?.showMinMaxLabels !== false);
  
  // Thumb label formatter
  readonly thumbLabelFormatter = (value: number): string => {
    const format = this.metadata()?.valueFormat;
    return format ? format.replace('{value}', value.toString()) : value.toString();
  };
  
  // Event handlers
  onSliderChange(value: number): void { /* ... */ }
  formatValue(value: number): string { /* ... */ }
}
```

#### **Casos de Teste Obrigatórios**:
```typescript
describe('MaterialSliderComponent', () => {
  it('should respect min/max boundaries', () => { /* ... */ });
  it('should apply step increments correctly', () => { /* ... */ });
  it('should format thumb labels', () => { /* ... */ });
  it('should handle vertical orientation', () => { /* ... */ });
  it('should show tick marks when configured', () => { /* ... */ });
});
```

---

### **3. MaterialTimePickerComponent**

#### **Arquivo**: `projects/praxis-dynamic-fields/src/lib/components/material-timepicker/`

```typescript
/**
 * @fileoverview Componente Material Time Picker dinâmico
 * 
 * Implementa um seletor de tempo com:
 * ✅ Interface de relógio Material (COM mat-form-field - input de texto)
 * ✅ Formato 12h/24h configurável
 * ✅ Validação de range de tempo
 * ✅ Input manual + picker visual
 */

@Component({
  selector: 'pdx-material-timepicker',
  standalone: true,
  template: `
    <div class="pdx-field-container pdx-timepicker-container" 
         [class]="cssClasses() + ' ' + fieldCssClasses()">
      
      <!-- Time Input with mat-form-field (é um input de texto) -->
      <mat-form-field [appearance]="materialAppearance()" 
                      [color]="materialColor()"
                      class="pdx-timepicker-field">
        <mat-label>{{ metadata()?.label }}</mat-label>
        
        <!-- Time Input -->
        <input 
          matInput
          [id]="componentId() + '-input'"
          [formControl]="formControl"
          [placeholder]="getTimePlaceholder()"
          [readonly]="metadata()?.readonly"
          [disabled]="effectiveDisabled()"
          [attr.aria-describedby]="getAriaDescribedBy()"
          (focus)="onInputFocus($event)"
          (blur)="onInputBlur($event)"
          (input)="onTimeInput($event)">
        
        <!-- Required marker -->
        <mat-label *ngIf="metadata()?.required">
          {{ metadata()?.label }}
          <span class="pdx-required-marker" aria-hidden="true">*</span>
        </mat-label>
        
        <!-- Clock Icon -->
        <mat-icon matSuffix 
                  class="pdx-time-icon" 
                  [class.disabled]="effectiveDisabled()"
                  [attr.aria-label]="'Abrir seletor de horário'"
                  tabindex="0"
                  (click)="openTimePicker()"
                  (keydown.enter)="openTimePicker()"
                  (keydown.space)="openTimePicker()">
          access_time
        </mat-icon>
        
        <!-- Hint -->
        <mat-hint *ngIf="metadata()?.hint && !hasValidationError()" 
                  [id]="componentId() + '-hint'">
          {{ metadata()?.hint }}
        </mat-hint>
        
        <!-- Errors -->
        <mat-error *ngIf="hasValidationError()" 
                   [id]="componentId() + '-error'">
          {{ primaryErrorMessage() }}
        </mat-error>
      </mat-form-field>
      
      <!-- Time Picker Overlay -->
      <div *ngIf="isPickerOpen()" 
           class="pdx-time-picker-overlay"
           (click)="closeTimePicker()">
        <div class="pdx-time-picker-dialog" (click)="$event.stopPropagation()">
          
          <!-- Digital Display -->
          <div class="pdx-time-display">
            <span [class.active]="activeUnit() === 'hour'" (click)="setActiveUnit('hour')">
              {{ displayHour() }}
            </span>
            <span class="separator">:</span>
            <span [class.active]="activeUnit() === 'minute'" (click)="setActiveUnit('minute')">
              {{ displayMinute() }}
            </span>
            <div *ngIf="timeFormat() === 12" class="pdx-ampm-toggle">
              <button mat-button [class.active]="isAM()" (click)="setAMPM('AM')">AM</button>
              <button mat-button [class.active]="!isAM()" (click)="setAMPM('PM')">PM</button>
            </div>
          </div>
          
          <!-- Clock Face -->
          <div class="pdx-clock-face">
            <div class="pdx-clock-center"></div>
            <div class="pdx-clock-hand" [style.transform]="getHandTransform()"></div>
            
            <!-- Hour/Minute Numbers -->
            <div *ngFor="let item of getClockNumbers(); trackBy: trackByIndex" 
                 class="pdx-clock-number"
                 [class.active]="item.active"
                 [style.transform]="item.transform"
                 (click)="selectClockValue(item.value)">
              {{ item.display }}
            </div>
          </div>
          
          <!-- Actions -->
          <div class="pdx-time-picker-actions">
            <button mat-button (click)="closeTimePicker()">Cancelar</button>
            <button mat-button color="primary" (click)="confirmTime()">OK</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./material-timepicker.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class MaterialTimePickerComponent 
  extends BaseDynamicFieldComponent<MaterialTimePickerMetadata> {

  // State management
  private readonly pickerState = signal({
    isOpen: false,
    activeUnit: 'hour' as 'hour' | 'minute',
    selectedHour: 0,
    selectedMinute: 0,
    isPM: false
  });
  
  // Computed properties
  readonly timeFormat = computed(() => this.metadata()?.timeFormat || 24);
  readonly isPickerOpen = computed(() => this.pickerState().isOpen);
  readonly activeUnit = computed(() => this.pickerState().activeUnit);
  
  // Methods
  openTimePicker(): void { /* ... */ }
  closeTimePicker(): void { /* ... */ }
  getClockNumbers(): ClockNumber[] { /* ... */ }
  selectClockValue(value: number): void { /* ... */ }
  confirmTime(): void { /* ... */ }
  
  private parseTimeString(timeStr: string): TimeValue { /* ... */ }
  private formatTimeValue(time: TimeValue): string { /* ... */ }
  private validateTimeRange(time: TimeValue): boolean { /* ... */ }
}

interface ClockNumber {
  value: number;
  display: string;
  transform: string;
  active: boolean;
}

interface TimeValue {
  hour: number;
  minute: number;
  second?: number;
}
```

---

### **4. MaterialRatingComponent**

#### **Arquivo**: `projects/praxis-dynamic-fields/src/lib/components/material-rating/`

```typescript
/**
 * @fileoverview Componente Material Rating dinâmico
 * 
 * Implementa um sistema de avaliação com:
 * ✅ Estrelas ou ícones customizados (SEM mat-form-field)
 * ✅ Rating fracionário (0.5, 0.1)
 * ✅ Layout consistente com outros campos
 * ✅ Hover effects e feedback visual
 */

@Component({
  selector: 'pdx-material-rating',
  standalone: true,
  template: `
    <div class="pdx-field-container pdx-rating-container" 
         [class]="cssClasses() + ' ' + fieldCssClasses()">
      
      <!-- Field Label -->
      <label class="pdx-field-label" 
             [class.required]="metadata()?.required"
             [for]="componentId() + '-rating'">
        {{ metadata()?.label }}
        <span *ngIf="metadata()?.required" class="pdx-required-marker" aria-hidden="true">*</span>
      </label>
      
      <!-- Rating Control Container -->
      <div class="pdx-field-control">
        <!-- Rating Stars -->
        <div class="pdx-rating-stars" 
             [id]="componentId() + '-rating'"
             [class.readonly]="isReadonly()"
             [class.disabled]="effectiveDisabled()"
             role="radiogroup"
             [attr.aria-label]="'Rating from 0 to ' + (metadata()?.max || 5)"
             [attr.aria-describedby]="getAriaDescribedBy()">
          
          <button *ngFor="let star of getStars(); trackBy: trackByIndex"
                  type="button"
                  class="pdx-rating-star"
                  [class.filled]="star.filled"
                  [class.half]="star.half"
                  [class.empty]="star.empty"
                  [class.hover]="star.hover"
                  [disabled]="effectiveDisabled() || isReadonly()"
                  [attr.aria-label]="getStarAriaLabel(star.index)"
                  [attr.aria-checked]="star.filled"
                  role="radio"
                  (click)="selectRating(star.value)"
                  (mouseenter)="onStarHover(star.index)"
                  (mouseleave)="onStarLeave()"
                  (keydown)="onStarKeyDown($event, star.index)">
            
            <!-- Filled Icon -->
            <mat-icon *ngIf="star.filled" [color]="materialColor()">
              {{ metadata()?.icon || 'star' }}
            </mat-icon>
            
            <!-- Half Icon -->
            <mat-icon *ngIf="star.half" [color]="materialColor()" class="pdx-half-star">
              {{ metadata()?.icon || 'star' }}
            </mat-icon>
            
            <!-- Empty Icon -->
            <mat-icon *ngIf="star.empty" class="pdx-empty-star">
              {{ metadata()?.emptyIcon || 'star_border' }}
            </mat-icon>
          </button>
        </div>
        
        <!-- Current Value Display -->
        <div *ngIf="showValueDisplay()" class="pdx-rating-value">
          {{ formatRatingValue(fieldValue()) }} / {{ metadata()?.max || 5 }}
        </div>
      </div>
      
      <!-- Hints and Errors Container -->
      <div class="pdx-field-hints">
        <div *ngIf="metadata()?.hint && !hasValidationError()" 
             class="pdx-field-hint" 
             [id]="componentId() + '-hint'">
          {{ metadata()?.hint }}
        </div>
        
        <div *ngIf="hasValidationError()" 
             class="pdx-field-error"
             [id]="componentId() + '-error'" 
             role="alert">
          {{ primaryErrorMessage() }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./material-rating.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule
  ]
})
export class MaterialRatingComponent 
  extends BaseDynamicFieldComponent<MaterialRatingMetadata> {

  // State for hover effects
  private readonly hoverState = signal({
    hoveredIndex: -1,
    isHovering: false
  });
  
  // Computed properties
  readonly materialColor = computed(() => this.metadata()?.color || 'primary');
  readonly isReadonly = computed(() => this.metadata()?.readonly === true);
  readonly maxRating = computed(() => this.metadata()?.max || 5);
  readonly precision = computed(() => this.metadata()?.precision || 1);
  readonly allowHalf = computed(() => this.metadata()?.allowHalf === true);
  readonly showValueDisplay = computed(() => this.metadata()?.showValue !== false);
  
  // Generate star configuration
  readonly getStars = computed(() => {
    const stars: StarConfig[] = [];
    const currentValue = this.fieldValue() || 0;
    const hoveredIndex = this.hoverState().hoveredIndex;
    const isHovering = this.hoverState().isHovering;
    const maxRating = this.maxRating();
    
    for (let i = 0; i < maxRating; i++) {
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
  
  // Event handlers
  selectRating(value: number): void {
    if (this.effectiveDisabled() || this.isReadonly()) return;
    
    let newValue = value;
    
    // Handle half-star ratings
    if (this.allowHalf() && this.fieldValue() === value) {
      newValue = value - 0.5;
    }
    
    // Apply precision
    const precision = this.precision();
    newValue = Math.round(newValue / precision) * precision;
    
    this.setValue(newValue);
  }
  
  onStarHover(index: number): void {
    if (this.effectiveDisabled() || this.isReadonly()) return;
    
    this.hoverState.set({
      hoveredIndex: index,
      isHovering: true
    });
  }
  
  onStarLeave(): void {
    this.hoverState.set({
      hoveredIndex: -1,
      isHovering: false
    });
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

interface StarConfig {
  index: number;
  value: number;
  filled: boolean;
  half: boolean;
  empty: boolean;
  hover: boolean;
}
```

---

### **5. MaterialColorPickerComponent**

#### **Arquivo**: `projects/praxis-dynamic-fields/src/lib/components/material-colorpicker/`

```typescript
/**
 * @fileoverview Componente Material Color Picker dinâmico
 * 
 * Implementa um seletor de cores com:
 * ✅ Paleta de cores predefinidas
 * ✅ Color wheel customizado
 * ✅ Suporte a múltiplos formatos (hex, rgb, hsl)
 * ✅ Input manual de cor
 */

@Component({
  selector: 'pdx-material-colorpicker',
  standalone: true,
  template: `
    <div class="pdx-colorpicker-container" [class]="cssClasses() + ' ' + fieldCssClasses()">
      
      <mat-form-field [appearance]="materialAppearance()" [color]="materialColor()">
        <mat-label>{{ metadata()?.label }}</mat-label>
        
        <!-- Color Input with Preview -->
        <input 
          matInput
          [formControl]="formControl"
          [placeholder]="getColorPlaceholder()"
          [readonly]="metadata()?.readonly"
          [disabled]="effectiveDisabled()"
          (focus)="onInputFocus($event)"
          (blur)="onInputBlur($event)"
          (input)="onColorInput($event)">
        
        <!-- Color Preview -->
        <div matPrefix class="pdx-color-preview" 
             [style.background-color]="currentColor()"
             (click)="openColorPicker()">
        </div>
        
        <!-- Picker Icon -->
        <mat-icon matSuffix 
                  class="pdx-picker-icon" 
                  (click)="openColorPicker()"
                  [class.disabled]="effectiveDisabled()">
          palette
        </mat-icon>
        
        <!-- Hint -->
        <mat-hint *ngIf="metadata()?.hint">{{ metadata()?.hint }}</mat-hint>
        
        <!-- Errors -->
        <mat-error *ngIf="hasValidationError()">
          {{ primaryErrorMessage() }}
        </mat-error>
      </mat-form-field>
      
      <!-- Color Picker Dialog -->
      <div *ngIf="isPickerOpen()" 
           class="pdx-colorpicker-overlay"
           (click)="closeColorPicker()">
        <div class="pdx-colorpicker-dialog" 
             [class]="getPickerVariantClass()"
             (click)="$event.stopPropagation()">
          
          <!-- Current Color Preview -->
          <div class="pdx-current-color">
            <div class="pdx-color-display" [style.background-color]="currentColor()"></div>
            <span class="pdx-color-value">{{ formatColorValue(currentColor()) }}</span>
          </div>
          
          <!-- Preset Colors -->
          <div *ngIf="hasPresetColors()" class="pdx-preset-colors">
            <h4>Cores Predefinidas</h4>
            <div class="pdx-color-grid">
              <button *ngFor="let color of getPresetColors(); trackBy: trackByColor"
                      type="button"
                      class="pdx-preset-color"
                      [class.selected]="isColorSelected(color)"
                      [style.background-color]="color"
                      [attr.aria-label]="'Selecionar cor ' + color"
                      (click)="selectPresetColor(color)">
              </button>
            </div>
          </div>
          
          <!-- Custom Color Picker -->
          <div *ngIf="allowCustomColors()" class="pdx-custom-color-picker">
            <h4>Cor Personalizada</h4>
            
            <!-- Color Wheel/Square -->
            <div class="pdx-color-selector">
              <canvas #colorCanvas
                      class="pdx-color-canvas"
                      width="200"
                      height="200"
                      (mousedown)="onCanvasMouseDown($event)"
                      (mousemove)="onCanvasMouseMove($event)"
                      (mouseup)="onCanvasMouseUp($event)">
              </canvas>
              <div class="pdx-color-cursor" [style.transform]="getCursorTransform()"></div>
            </div>
            
            <!-- Hue Slider -->
            <div class="pdx-hue-slider">
              <input type="range" 
                     min="0" 
                     max="360" 
                     [value]="currentHue()"
                     (input)="onHueChange($event)"
                     class="pdx-hue-input">
            </div>
            
            <!-- Alpha Slider -->
            <div *ngIf="showAlpha()" class="pdx-alpha-slider">
              <input type="range" 
                     min="0" 
                     max="1" 
                     step="0.01"
                     [value]="currentAlpha()"
                     (input)="onAlphaChange($event)"
                     class="pdx-alpha-input">
            </div>
          </div>
          
          <!-- Manual Input -->
          <div *ngIf="showInput()" class="pdx-color-inputs">
            <mat-form-field *ngIf="supportsFormat('hex')">
              <mat-label>HEX</mat-label>
              <input matInput [(ngModel)]="hexValue" (blur)="onManualColorChange('hex', $event)">
            </mat-form-field>
            
            <div *ngIf="supportsFormat('rgb')" class="pdx-rgb-inputs">
              <mat-form-field>
                <mat-label>R</mat-label>
                <input matInput type="number" min="0" max="255" [(ngModel)]="rgbValue.r">
              </mat-form-field>
              <mat-form-field>
                <mat-label>G</mat-label>
                <input matInput type="number" min="0" max="255" [(ngModel)]="rgbValue.g">
              </mat-form-field>
              <mat-form-field>
                <mat-label>B</mat-label>
                <input matInput type="number" min="0" max="255" [(ngModel)]="rgbValue.b">
              </mat-form-field>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="pdx-colorpicker-actions">
            <button mat-button (click)="closeColorPicker()">Cancelar</button>
            <button mat-button (click)="clearColor()">Limpar</button>
            <button mat-button color="primary" (click)="confirmColor()">OK</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./material-colorpicker.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class MaterialColorPickerComponent 
  extends BaseDynamicFieldComponent<MaterialColorPickerMetadata> {

  @ViewChild('colorCanvas', { static: false }) colorCanvas?: ElementRef<HTMLCanvasElement>;
  
  // Color state management
  private readonly colorState = signal<ColorState>({
    isPickerOpen: false,
    currentColor: '#000000',
    hue: 0,
    saturation: 100,
    lightness: 50,
    alpha: 1,
    isSelecting: false
  });
  
  // Color format utilities
  private colorUtils = new ColorUtilityService();
  
  // Computed properties
  readonly currentColor = computed(() => this.colorState().currentColor);
  readonly isPickerOpen = computed(() => this.colorState().isPickerOpen);
  readonly hasPresetColors = computed(() => Boolean(this.metadata()?.presetColors?.length));
  readonly allowCustomColors = computed(() => this.metadata()?.allowCustomColors !== false);
  readonly showAlpha = computed(() => this.metadata()?.showAlpha === true);
  readonly showInput = computed(() => this.metadata()?.showInput !== false);
  
  // Methods
  openColorPicker(): void { /* ... */ }
  closeColorPicker(): void { /* ... */ }
  selectPresetColor(color: string): void { /* ... */ }
  onCanvasMouseDown(event: MouseEvent): void { /* ... */ }
  confirmColor(): void { /* ... */ }
  
  private initializeColorCanvas(): void { /* ... */ }
  private updateColorFromCanvas(x: number, y: number): void { /* ... */ }
  private formatColorValue(color: string): string { /* ... */ }
}

interface ColorState {
  isPickerOpen: boolean;
  currentColor: string;
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  isSelecting: boolean;
}
```

---

## 📋 Tarefas Detalhadas

### **Para CADA Componente**:

1. **📁 Estrutura de Arquivos**:
   ```
   components/material-[component]/
   ├── material-[component].component.ts
   ├── material-[component].component.html (se separado)
   ├── material-[component].component.scss
   ├── material-[component].component.spec.ts
   └── index.ts (re-exports)
   ```

2. **🔧 Implementação Base**:
   - [ ] Estender `BaseDynamicFieldComponent<T>`
   - [ ] Implementar `ControlValueAccessor`
   - [ ] Usar computed properties para reatividade
   - [ ] Adicionar host bindings apropriados

3. **🎨 Integração Material**:
   - [ ] Usar componentes Angular Material correspondentes
   - [ ] Implementar theming (color, appearance, density)
   - [ ] Suportar todas as variantes Material

4. **♿ Acessibilidade**:
   - [ ] ARIA labels e descriptions
   - [ ] Suporte completo a teclado
   - [ ] Screen reader compatibility
   - [ ] Focus management

5. **🧪 Testes**:
   - [ ] Testes unitários (>90% cobertura)
   - [ ] Testes de integração com FormControl
   - [ ] Testes de acessibilidade
   - [ ] Testes E2E para interações complexas

6. **📝 Documentação**:
   - [ ] JSDoc completo em todas as interfaces
   - [ ] Exemplos de uso no código
   - [ ] Storybook stories (se disponível)

### **Registro no ComponentRegistry**:

```typescript
// Em component-registry.service.ts - adicionar registros:

// Toggle
this.register(
  FieldControlTypeEnum.TOGGLE,
  () => import('../../components/material-toggle/material-toggle.component').then(m => m.MaterialToggleComponent)
);

// Slider  
this.register(
  FieldControlTypeEnum.SLIDER,
  () => import('../../components/material-slider/material-slider.component').then(m => m.MaterialSliderComponent)
);

// Time Picker
this.register(
  FieldControlTypeEnum.TIME_PICKER,
  () => import('../../components/material-timepicker/material-timepicker.component').then(m => m.MaterialTimePickerComponent)
);

// Rating
this.register(
  FieldControlTypeEnum.RATING,
  () => import('../../components/material-rating/material-rating.component').then(m => m.MaterialRatingComponent)
);

// Color Picker
this.register(
  FieldControlTypeEnum.COLOR_PICKER,
  () => import('../../components/material-colorpicker/material-colorpicker.component').then(m => m.MaterialColorPickerComponent)
);
```

---

## 🧪 Casos de Teste Críticos

### **Cenário de Validação Completa**:
```typescript
describe('All Missing Components Integration', () => {
  const testForm: FieldMetadata[] = [
    {
      name: 'notifications',
      label: 'Receber Notificações',
      controlType: FieldControlType.TOGGLE,
      defaultValue: true
    },
    {
      name: 'volume',
      label: 'Volume',
      controlType: FieldControlType.SLIDER,
      min: 0,
      max: 100,
      step: 5
    },
    {
      name: 'reminder',
      label: 'Lembrete',
      controlType: FieldControlType.TIME_PICKER,
      timeFormat: 24
    },
    {
      name: 'satisfaction',
      label: 'Satisfação',
      controlType: FieldControlType.RATING,
      max: 5,
      allowHalf: true
    },
    {
      name: 'theme',
      label: 'Cor do Tema',
      controlType: FieldControlType.COLOR_PICKER,
      format: 'hex'
    }
  ];
  
  it('should render all components without errors', () => {
    // Todos os componentes devem renderizar
    expect(component.find('pdx-material-toggle')).toExist();
    expect(component.find('pdx-material-slider')).toExist();
    expect(component.find('pdx-material-timepicker')).toExist();
    expect(component.find('pdx-material-rating')).toExist();
    expect(component.find('pdx-material-colorpicker')).toExist();
  });
  
  it('should integrate with FormControl correctly', () => {
    // Todos devem ter FormControl funcionais
  });
  
  it('should validate according to metadata rules', () => {
    // Validações específicas de cada tipo
  });
});
```

---

## 📊 Critérios de Aceitação

### **Funcionalidade**:
- [ ] Todos os 5 componentes renderizam sem erros
- [ ] Integração completa com `BaseDynamicFieldComponent`
- [ ] Todas as propriedades de metadata funcionais
- [ ] Validação correta com Angular Forms
- [ ] Estados de disabled/readonly respeitados

### **Qualidade**:
- [ ] Cobertura de testes > 90% por componente
- [ ] Zero warnings do TypeScript
- [ ] Performance adequada (< 100ms para renderizar)
- [ ] Memória gerenciada corretamente (sem leaks)

### **UX/Design**:
- [ ] Consistência visual com Material Design 3
- [ ] Responsive design em todos os breakpoints
- [ ] Acessibilidade WCAG 2.1 AA compliant
- [ ] Feedback visual claro para todas as ações

### **Integração**:
- [ ] Componentes registrados no `ComponentRegistryService`
- [ ] Exports atualizados no `public-api.ts`
- [ ] Documentação atualizada
- [ ] Exemplos funcionais criados

---

## 📊 Estimativa

- **Esforço Total**: 60-80 horas
- **Prazo Recomendado**: 2-3 sprints
- **Desenvolvedores**: 2-3 especialistas Angular

### **Breakdown por Componente**:
1. **MaterialToggleComponent**: 8-10h (mais simples)
2. **MaterialSliderComponent**: 10-12h (configurações múltiplas)
3. **MaterialRatingComponent**: 12-14h (lógica de hover/half-stars)
4. **MaterialTimePickerComponent**: 16-20h (interface complexa)
5. **MaterialColorPickerComponent**: 20-24h (mais complexo)

### **Tarefas Transversais**:
- Testes integrados: 8h
- Documentação: 6h
- Code review e refinamentos: 8h

---

## 🎯 Definição de Pronto

- [ ] Todos os 5 componentes implementados e funcionais
- [ ] Formulário de teste com todos os componentes renderiza perfeitamente
- [ ] 100% dos testes passando
- [ ] Code review aprovado por arquiteto
- [ ] Documentação técnica completa
- [ ] Zero regressões em componentes existentes
- [ ] Performance benchmarks atendidos
- [ ] Acessibilidade validada

---

## 📚 Referências Técnicas

- [Angular Material Components](https://material.angular.io/components)
- [Material Design 3 Specifications](https://m3.material.io/)
- [Angular Reactive Forms](https://angular.io/guide/reactive-forms)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Canvas API for Color Picker](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

**Data de Criação**: 2025-07-29  
**Relacionado**: CRITICAL-ISSUES-DYNAMIC-FIELDS.md (implementação principal)  
**Dependências**: Interfaces de metadata já implementadas  
**Bloqueador para**: Uso completo em produção