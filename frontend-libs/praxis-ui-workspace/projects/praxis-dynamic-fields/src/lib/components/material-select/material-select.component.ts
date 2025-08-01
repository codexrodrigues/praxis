/**
 * @fileoverview Componente Material Select dinâmico
 * 
 * Select avançado com suporte a:
 * ✅ Seleção única e múltipla
 * ✅ Busca e filtração em tempo real  
 * ✅ Carregamento de dados dinâmico
 * ✅ Agrupamento de opções
 * ✅ Virtualização para grandes listas
 * ✅ Chips para seleção múltipla
 */

import { 
  Component, 
  ElementRef, 
  forwardRef,
  ViewChild,
  AfterViewInit,
  computed,
  signal,
  effect
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { BaseDynamicListComponent } from '../../base/base-dynamic-list.component';
import { MaterialSelectMetadata, FieldOption, ComponentMetadata } from '@praxis/core';
import { SelectSearchInputComponent } from './select-search-input.component';
import { SelectOptionsListComponent } from './select-options-list.component';
import { SelectChipsComponent } from './select-chips.component';
import { GenericCrudService } from '@praxis/core';
import { DynamicComponentService } from '../../services/dynamic-component.service';

// =============================================================================
// TYPE HELPERS PARA INDEX SIGNATURE SAFETY
// =============================================================================

interface ExtendedSelectMetadata extends ComponentMetadata {
  enableGroups?: boolean;
  multipleDisplay?: string;
  showSelectAll?: boolean;
}

function safeSelectMetadata(metadata: ComponentMetadata | null | undefined): ExtendedSelectMetadata {
  return (metadata || {}) as ExtendedSelectMetadata;
}

// =============================================================================
// INTERFACES ESPECÍFICAS DO SELECT
// =============================================================================

interface SelectState {
  panelOpen: boolean;
  searchTerm: string;
  selectedOptions: FieldOption[];
  optionGroups: { [key: string]: FieldOption[] };
  virtualScrollEnabled: boolean;
  allSelected: boolean;
}

// =============================================================================
// COMPONENTE MATERIAL SELECT
// =============================================================================

@Component({
  selector: 'pdx-material-select',
  standalone: true,
  templateUrl: './material-select.component.html',
  styleUrls: ['./material-select.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatDividerModule,
    ScrollingModule,
    SelectSearchInputComponent,
    SelectOptionsListComponent,
    SelectChipsComponent
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaterialSelectComponent),
      multi: true
    },
    DynamicComponentService
  ],
  host: {
    '[class]': 'cssClasses() + " " + fieldCssClasses()',
    '[attr.data-field-type]': '"select"',
    '[attr.data-field-name]': 'metadata()?.name'
  }
})
export class MaterialSelectComponent 
  extends BaseDynamicListComponent<MaterialSelectMetadata> 
  implements AfterViewInit {

  // =============================================================================
  // VIEW CHILDREN
  // =============================================================================

  @ViewChild('selectElement', { static: false })
  private selectElement?: ElementRef;

  @ViewChild(SelectSearchInputComponent, { static: false })
  private searchInputCmp?: SelectSearchInputComponent;

  // =============================================================================
  // SIGNALS ESPECÍFICOS DO SELECT
  // =============================================================================

  /** Estado específico do select */
  protected readonly selectState = signal<SelectState>({
    panelOpen: false,
    searchTerm: '',
    selectedOptions: [],
    optionGroups: {},
    virtualScrollEnabled: false,
    allSelected: false
  });

  // =============================================================================
  // COMPUTED PROPERTIES
  // =============================================================================

  /** Configuração da aparência do Material */
  readonly materialAppearance = computed(() => {
    const metadata = this.metadata();
    return metadata?.materialDesign?.appearance || 'outline';
  });

  /** Cor do tema Material */
  readonly materialColor = computed(() => {
    const metadata = this.metadata();
    return metadata?.materialDesign?.color || 'primary';
  });

  /** Comportamento do float label */
  readonly floatLabelBehavior = computed(() => {
    const metadata = this.metadata();
    return metadata?.materialDesign?.floatLabel || 'auto';
  });

  /** Verifica se é seleção múltipla */
  readonly isMultiple = computed(() => {
    return this.metadata()?.multiple || false;
  });

  /** Verifica se busca está habilitada */
  readonly isSearchEnabled = computed(() => {
    return this.metadata()?.searchable || false;
  });

  /** Opções filtradas por busca */
  readonly filteredOptions = computed(() => {
    const searchTerm = this.selectState().searchTerm.toLowerCase();
    const visibleItems = this.visibleItems();
    
    if (!searchTerm) return visibleItems;
    
    return visibleItems.filter(option => 
      option.text.toLowerCase().includes(searchTerm) ||
      option.value.toString().toLowerCase().includes(searchTerm)
    );
  });

  /** Opções agrupadas */
  readonly groupedOptions = computed(() => {
    const options = this.filteredOptions();
    const metadata = safeSelectMetadata(this.metadata());
    
    if (!metadata?.enableGroups) {
      return { '': options };
    }

    const groups: { [key: string]: FieldOption[] } = {};
    
    options.forEach(option => {
      const groupKey = option.group || 'Outros';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(option);
    });

    return groups;
  });

  /** Deve usar virtualização */
  readonly shouldUseVirtualization = computed(() => {
    const options = this.filteredOptions();
    return options.length > 100 || this.virtualizationConfig().enabled;
  });

  /** Texto de exibição para seleção múltipla */
  readonly multipleSelectionText = computed(() => {
    const selected = this.selectState().selectedOptions;
    const metadata = safeSelectMetadata(this.metadata());
    
    if (selected.length === 0) return '';
    
    if (selected.length === 1) {
      return selected[0].text;
    }
    
    if (metadata?.multipleDisplay === 'count') {
      return `${selected.length} items selecionados`;
    }
    
    if (selected.length <= 3) {
      return selected.map(opt => opt.text).join(', ');
    }
    
    return `${selected[0].text} e mais ${selected.length - 1}`;
  });

  /** Verifica se todos estão selecionados */
  readonly allOptionsSelected = computed(() => {
    const available = this.filteredOptions();
    const selected = this.selectState().selectedOptions;
    
    return available.length > 0 && 
           available.every(opt => 
             selected.some(sel => sel.value === opt.value)
           );
  });

  /** CSS classes específicas do select */
  readonly selectSpecificClasses = computed(() => {
    const classes: string[] = [];
    const state = this.selectState();
    const metadata = safeSelectMetadata(this.metadata());
    
    if (this.isMultiple()) {
      classes.push('pdx-select-multiple');
    }
    
    if (this.isSearchEnabled()) {
      classes.push('pdx-select-searchable');
    }
    
    if (state.panelOpen) {
      classes.push('pdx-select-open');
    }
    
    if (metadata?.showSelectAll && this.isMultiple()) {
      classes.push('pdx-select-has-select-all');
    }
    
    return classes.join(' ');
  });

  // =============================================================================
  // LIFECYCLE
  // =============================================================================

  protected override onComponentInit(): void {
    super.onComponentInit();
    this.initializeSelectState();
    this.setupSelectionEffects();
  }

  ngAfterViewInit(): void {
    this.setupSelectEventListeners();
  }

  // =============================================================================
  // MÉTODOS PÚBLICOS
  // =============================================================================

  /**
   * Abre o painel do select
   */
  openPanel(): void {
    if (this.selectElement) {
      // Triggering mat-select open programmatically
      (this.selectElement.nativeElement as any).open();
    }
  }

  /**
   * Fecha o painel do select
   */
  closePanel(): void {
    if (this.selectElement) {
      (this.selectElement.nativeElement as any).close();
    }
  }

  /**
   * Seleciona todas as opções (múltipla seleção)
   */
  selectAll(): void {
    if (!this.isMultiple()) return;
    
    const allOptions = this.filteredOptions();
    this.updateSelectedOptions(allOptions);
    
    this.log('debug', 'All options selected', { count: allOptions.length });
  }

  /**
   * Limpa todas as seleções
   */
  clearAll(): void {
    this.updateSelectedOptions([]);
    this.log('debug', 'All selections cleared');
  }

  /**
   * Toggle de seleção de todas as opções
   */
  toggleSelectAll(): void {
    if (this.allOptionsSelected()) {
      this.clearAll();
    } else {
      this.selectAll();
    }
  }

  // =============================================================================
  // EVENTOS DO SELECT
  // =============================================================================

  onSelectionChange(event: any): void {
    const selectedValues = Array.isArray(event.value) ? event.value : [event.value];
    const allOptions = this.listDataState().items;
    
    const selectedOptions = selectedValues
      .map((value: any) => allOptions.find(opt => opt.value === value))
      .filter(Boolean) as FieldOption[];
    
    this.updateSelectedOptions(selectedOptions);
  }

  onPanelOpened(): void {
    this.updateSelectState({ panelOpen: true });
    
    // Focar na busca se habilitada
    if (this.isSearchEnabled() && this.searchInputCmp) {
      setTimeout(() => {
        this.searchInputCmp?.focus();
      });
    }
  }

  onPanelClosed(): void {
    this.updateSelectState({ 
      panelOpen: false,
      searchTerm: '' // Limpar busca ao fechar
    });
  }

  // =============================================================================
  // EVENTOS DE BUSCA
  // =============================================================================

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerm = target.value;
    
    this.updateSelectState({ searchTerm });
    this.setSearchTerm(searchTerm);
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    // Prevenir que certas teclas fechem o painel
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
      event.stopPropagation();
    }
    
    if (event.key === 'Escape') {
      this.clearSearch();
      this.closePanel();
    }
  }

  override clearSearch(): void {
    this.updateSelectState({ searchTerm: '' });
    this.setSearchTerm('');
    
    this.searchInputCmp?.clearInput();
  }

  // =============================================================================
  // EVENTOS DE CHIPS (seleção múltipla)
  // =============================================================================

  onChipRemoved(option: FieldOption): void {
    const currentSelected = this.selectState().selectedOptions;
    const newSelected = currentSelected.filter(sel => sel.value !== option.value);
    
    this.updateSelectedOptions(newSelected);
  }

  // =============================================================================
  // EVENTOS DE LABEL
  // =============================================================================

  updateLabelText(event: Event): void {
    const target = event.target as HTMLInputElement;
    const editState = this.labelEditingState();
    
    this.labelEditingState.set({
      ...editState,
      currentLabel: target.value
    });
  }

  onLabelDoubleClick(): void {
    if (!this.componentState().disabled) {
      this.startLabelEditing();
    }
  }

  onLabelEditorBlur(): void {
    this.finishLabelEditing();
  }

  onLabelEditorKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.finishLabelEditing();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelLabelEditing();
    }
  }

  editingLabel = computed(() => {
    const editState = this.labelEditingState();
    return editState.isEditing ? editState.currentLabel : '';
  });

  selectedValues = computed(() => {
    return this.selectState().selectedOptions.map(o => o.value);
  });

  retryDataLoad(): void {
    this.loadData();
  }

  // =============================================================================
  // MÉTODOS PRIVADOS
  // =============================================================================

  private initializeSelectState(): void {
    const metadata = this.metadata();
    if (!metadata) return;

    // Configurar virtualização baseada no número estimado de opções
    const estimatedOptions = metadata.options?.length || 0;
    const virtualScrollEnabled = estimatedOptions > 100 || 
                                this.virtualizationConfig().enabled;

    this.updateSelectState({
      virtualScrollEnabled,
      searchTerm: '',
      selectedOptions: [],
      optionGroups: {},
      allSelected: false
    });
  }

  private setupSelectionEffects(): void {
    // Effect para sincronizar seleção com valor do campo
    effect(() => {
      const fieldValue = this.fieldValue();
      const allOptions = this.listDataState().items;
      
      if (fieldValue !== null && fieldValue !== undefined) {
        let selectedOptions: FieldOption[];
        
        if (Array.isArray(fieldValue)) {
          selectedOptions = fieldValue
            .map(value => allOptions.find(opt => opt.value === value))
            .filter(Boolean) as FieldOption[];
        } else {
          const option = allOptions.find(opt => opt.value === fieldValue);
          selectedOptions = option ? [option] : [];
        }
        
        this.updateSelectState({ selectedOptions });
      } else {
        this.updateSelectState({ selectedOptions: [] });
      }
    });
  }

  private setupSelectEventListeners(): void {
    // Listeners adicionais se necessário
  }

  private updateSelectedOptions(selectedOptions: FieldOption[]): void {
    this.updateSelectState({ selectedOptions });
    
    // Atualizar valor do campo
    let newValue: any;
    
    if (this.isMultiple()) {
      newValue = selectedOptions.map(opt => opt.value);
    } else {
      newValue = selectedOptions.length > 0 ? selectedOptions[0].value : null;
    }
    
    this.setValue(newValue);
    
    // Verificar se todos estão selecionados
    const allSelected = this.allOptionsSelected();
    this.updateSelectState({ allSelected });
  }

  private updateSelectState(changes: Partial<SelectState>): void {
    const current = this.selectState();
    this.selectState.set({ ...current, ...changes });
  }

  // =============================================================================
  // MÉTODO DE COMPARAÇÃO PARA MAT-SELECT
  // =============================================================================

  compareOptions(option1: any, option2: any): boolean {
    return option1 === option2;
  }

  // =============================================================================
  // TRACKBY FUNCTIONS PARA PERFORMANCE
  // =============================================================================

  trackByValue(index: number, option: FieldOption): any {
    return option.value;
  }

  trackByGroup(index: number, group: { key: string; options: FieldOption[] }): string {
    return group.key;
  }
}