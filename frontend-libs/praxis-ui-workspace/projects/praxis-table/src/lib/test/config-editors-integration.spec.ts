/**
 * Testes de Integração para Editores de Configuração - Unified Architecture
 * Testa todos os editores especializados e sua integração
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableConfig, TableConfigService, isTableConfigV2 } from '@praxis/core';
import { SETTINGS_PANEL_DATA } from '@praxis/settings-panel';

import { PraxisTableConfigEditor } from '../praxis-table-config-editor';
import { BehaviorConfigEditorComponent } from '../behavior-config-editor/behavior-config-editor.component';
import { ToolbarActionsEditorComponent } from '../toolbar-actions-editor/toolbar-actions-editor.component';
import { MessagesLocalizationEditorComponent } from '../messages-localization-editor/messages-localization-editor.component';
import { ColumnsConfigEditorComponent } from '../columns-config-editor/columns-config-editor.component';

describe('Config Editors Integration Tests - Unified Architecture', () => {
  let mainEditorComponent: PraxisTableConfigEditor;
  let mainEditorFixture: ComponentFixture<PraxisTableConfigEditor>;
  let configService: TableConfigService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PraxisTableConfigEditor,
        BehaviorConfigEditorComponent,
        ToolbarActionsEditorComponent,
        MessagesLocalizationEditorComponent,
        ColumnsConfigEditorComponent,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        TableConfigService,
        { provide: SETTINGS_PANEL_DATA, useValue: { columns: [] } },
      ],
    }).compileComponents();

    mainEditorFixture = TestBed.createComponent(PraxisTableConfigEditor);
    mainEditorComponent = mainEditorFixture.componentInstance;
    configService = TestBed.inject(TableConfigService);
  });

  describe('Main Config Editor Integration', () => {
    it('should initialize with basic configuration', () => {
      const config: TableConfig = {
        columns: [
          { field: 'id', header: 'ID', type: 'number' },
          { field: 'name', header: 'Nome', type: 'string' },
        ],
        behavior: {
          sorting: {
            enabled: true,
            multiSort: false,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
          pagination: {
            enabled: true,
            pageSize: 10,
            pageSizeOptions: [5, 10, 25],
            showFirstLastButtons: true,
            showPageNumbers: true,
            showPageInfo: true,
            position: 'bottom',
            style: 'default',
            strategy: 'client',
          },
        },
        toolbar: {
          visible: true,
          position: 'top',
        },
      };

      (mainEditorComponent as any).panelData = config;
      mainEditorComponent.ngOnInit();

      expect(mainEditorComponent.isV2Config).toBe(true);
      expect(mainEditorComponent.editedConfig).toEqual(config);
      expect(mainEditorComponent.canSave).toBe(false);
    });

    it('should initialize with advanced configuration', () => {
      const config: TableConfig = {
        meta: { version: '2.0.0', name: 'Advanced Config' },
        columns: [
          { field: 'id', header: 'ID', type: 'number' },
          { field: 'name', header: 'Nome', type: 'string' },
        ],
        behavior: {
          pagination: {
            enabled: true,
            pageSize: 25,
            pageSizeOptions: [10, 25, 50],
            showFirstLastButtons: false,
            showPageNumbers: true,
            showPageInfo: true,
            position: 'bottom',
            style: 'default',
            strategy: 'server',
          },
          sorting: {
            enabled: true,
            multiSort: true,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
        },
        toolbar: {
          visible: true,
          position: 'top',
        },
      };

      (mainEditorComponent as any).panelData = config;
      mainEditorComponent.ngOnInit();

      expect(mainEditorComponent.isV2Config).toBe(true);
      expect(mainEditorComponent.editedConfig).toEqual(config);
    });

    it('should detect configuration changes', () => {
      const initialConfig: TableConfig = {
        columns: [{ field: 'test', header: 'Test' }],
        behavior: {
          sorting: {
            enabled: false,
            multiSort: false,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
        },
      };

      (mainEditorComponent as any).panelData = initialConfig;
      mainEditorComponent.ngOnInit();

      // Simulate configuration change
      const modifiedConfig = {
        ...initialConfig,
        behavior: {
          ...initialConfig.behavior,
          sorting: {
            ...initialConfig.behavior!.sorting!,
            enabled: true,
          },
        },
      };

      mainEditorComponent.onBehaviorConfigChange(modifiedConfig);

      expect(mainEditorComponent.canSave).toBe(true);
      expect(mainEditorComponent.editedConfig.behavior?.sorting?.enabled).toBe(
        true,
      );
    });

    it('should handle migration button (no-op in unified architecture)', () => {
      const config: TableConfig = {
        columns: [{ field: 'test', header: 'Test' }],
        behavior: {
          sorting: {
            enabled: true,
            multiSort: false,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
        },
      };

      (mainEditorComponent as any).panelData = config;
      mainEditorComponent.ngOnInit();

      expect(mainEditorComponent.isV2Config).toBe(true);

      // Migration should be a no-op
      mainEditorComponent.onMigrateToV2();

      expect(mainEditorComponent.isV2Config).toBe(true);
      expect(isTableConfigV2(mainEditorComponent.editedConfig)).toBe(true);
    });
  });

  describe('Behavior Config Editor Integration', () => {
    let behaviorEditor: BehaviorConfigEditorComponent;
    let behaviorFixture: ComponentFixture<BehaviorConfigEditorComponent>;

    beforeEach(() => {
      behaviorFixture = TestBed.createComponent(BehaviorConfigEditorComponent);
      behaviorEditor = behaviorFixture.componentInstance;
    });

    it('should handle basic behavior configuration', () => {
      const config: TableConfig = {
        columns: [],
        behavior: {
          sorting: {
            enabled: true,
            multiSort: false,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
          filtering: {
            enabled: false,
            strategy: 'client',
            debounceTime: 300,
          },
          pagination: {
            enabled: true,
            pageSize: 20,
            pageSizeOptions: [10, 20, 50],
            showFirstLastButtons: true,
            showPageNumbers: true,
            showPageInfo: true,
            position: 'bottom',
            style: 'default',
            strategy: 'client',
          },
          selection: {
            enabled: true,
            type: 'multiple',
            mode: 'checkbox',
            allowSelectAll: true,
            checkboxPosition: 'start',
            persistSelection: false,
            persistOnDataUpdate: false,
          },
        },
      };

      behaviorEditor.config = config;
      behaviorEditor.ngOnInit();

      expect(behaviorEditor.behaviorForm.get('sortingEnabled')?.value).toBe(
        true,
      );
      expect(behaviorEditor.behaviorForm.get('filteringEnabled')?.value).toBe(
        false,
      );
      expect(behaviorEditor.behaviorForm.get('paginationEnabled')?.value).toBe(
        true,
      );
      expect(behaviorEditor.behaviorForm.get('pageSize')?.value).toBe(20);
    });

    it('should handle advanced behavior configuration', () => {
      const config: TableConfig = {
        columns: [],
        behavior: {
          pagination: {
            enabled: true,
            pageSize: 15,
            pageSizeOptions: [5, 15, 30],
            showFirstLastButtons: false,
            showPageNumbers: true,
            showPageInfo: true,
            position: 'bottom',
            style: 'default',
            strategy: 'server',
          },
          sorting: {
            enabled: true,
            multiSort: true,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
          filtering: {
            enabled: true,
            strategy: 'client',
            debounceTime: 300,
            globalFilter: {
              enabled: true,
              placeholder: 'Buscar...',
              position: 'toolbar',
            },
          },
          selection: {
            enabled: true,
            type: 'single',
            mode: 'row',
            allowSelectAll: false,
            checkboxPosition: 'start',
            persistSelection: false,
            persistOnDataUpdate: false,
          },
        },
      };

      behaviorEditor.config = config;
      behaviorEditor.ngOnInit();

      expect(behaviorEditor.behaviorForm.get('multiSort')?.value).toBe(true);
      expect(behaviorEditor.behaviorForm.get('paginationStrategy')?.value).toBe(
        'server',
      );
      expect(behaviorEditor.behaviorForm.get('selectionMode')?.value).toBe(
        'row',
      );
    });

    it('should emit configuration changes correctly', (done) => {
      const config: TableConfig = {
        columns: [],
        behavior: {
          sorting: {
            enabled: false,
            multiSort: false,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
        },
      };

      behaviorEditor.config = config;
      behaviorEditor.configChange.subscribe((updatedConfig) => {
        expect(updatedConfig.behavior?.sorting?.enabled).toBe(true);
        done();
      });

      behaviorEditor.ngOnInit();

      // Simulate user changing sorting enabled
      behaviorEditor.behaviorForm.patchValue({ sortingEnabled: true });
    });
  });

  describe('Toolbar Actions Editor Integration', () => {
    let toolbarEditor: ToolbarActionsEditorComponent;
    let toolbarFixture: ComponentFixture<ToolbarActionsEditorComponent>;

    beforeEach(() => {
      toolbarFixture = TestBed.createComponent(ToolbarActionsEditorComponent);
      toolbarEditor = toolbarFixture.componentInstance;
    });

    it('should handle basic toolbar configuration', () => {
      const config: TableConfig = {
        columns: [],
        toolbar: {
          visible: true,
          position: 'top',
          actions: [
            {
              id: 'add',
              label: 'Adicionar',
              icon: 'add',
              action: 'add',
              type: 'button',
              position: 'start',
            },
          ],
        },
        actions: {
          row: {
            enabled: true,
            position: 'end',
            width: '120px',
            display: 'icons',
            trigger: 'hover',
            actions: [
              { id: 'edit', label: 'Editar', icon: 'edit', action: 'edit' },
            ],
          },
        },
      };

      toolbarEditor.config = config;
      toolbarEditor.ngOnInit();

      expect(toolbarEditor.toolbarForm.get('toolbarVisible')?.value).toBe(true);
      expect(toolbarEditor.toolbarActions.length).toBe(1);
      expect(toolbarEditor.rowActions.length).toBe(1);
    });

    it('should handle advanced toolbar configuration', () => {
      const config: TableConfig = {
        columns: [],
        toolbar: {
          visible: true,
          position: 'top',
          title: 'Minha Tabela',
          actions: [
            {
              id: 'export',
              label: 'Exportar',
              icon: 'download',
              type: 'button',
              action: 'export',
              position: 'end',
            },
          ],
        },
        actions: {
          row: {
            enabled: true,
            position: 'end',
            width: '120px',
            display: 'icons',
            trigger: 'hover',
            actions: [
              { id: 'view', label: 'Ver', icon: 'visibility', action: 'view' },
            ],
          },
          bulk: {
            enabled: true,
            position: 'toolbar',
            actions: [
              {
                id: 'delete',
                label: 'Excluir Selecionados',
                icon: 'delete',
                action: 'deleteSelected',
              },
            ],
          },
        },
      };

      toolbarEditor.config = config;
      toolbarEditor.ngOnInit();

      expect(toolbarEditor.toolbarForm.get('toolbarTitle')?.value).toBe(
        'Minha Tabela',
      );
      expect(toolbarEditor.bulkActions.length).toBe(1);
    });

    it('should handle drag and drop reordering', () => {
      const config: TableConfig = {
        columns: [],
        toolbar: {
          visible: true,
          position: 'top',
          actions: [
            {
              id: 'action1',
              label: 'Ação 1',
              icon: 'action1',
              type: 'button',
              action: 'action1',
              position: 'start',
            },
            {
              id: 'action2',
              label: 'Ação 2',
              icon: 'action2',
              type: 'button',
              action: 'action2',
              position: 'start',
            },
          ],
        },
      };

      toolbarEditor.config = config;
      toolbarEditor.ngOnInit();

      const initialOrder = toolbarEditor.toolbarActions.map((a) => a.id);
      expect(initialOrder).toEqual(['action1', 'action2']);

      // Simulate drag and drop
      const mockEvent = {
        previousIndex: 0,
        currentIndex: 1,
      } as any;

      toolbarEditor.onToolbarActionReorder(mockEvent);

      const newOrder = toolbarEditor.toolbarActions.map((a) => a.id);
      expect(newOrder).toEqual(['action2', 'action1']);
    });
  });

  describe('Messages Localization Editor Integration', () => {
    let messagesEditor: MessagesLocalizationEditorComponent;
    let messagesFixture: ComponentFixture<MessagesLocalizationEditorComponent>;

    beforeEach(() => {
      messagesFixture = TestBed.createComponent(
        MessagesLocalizationEditorComponent,
      );
      messagesEditor = messagesFixture.componentInstance;
    });

    it('should handle basic messages configuration', () => {
      const config: TableConfig = {
        columns: [],
        messages: {
          states: {
            loading: 'Carregando dados...',
            empty: 'Nenhum registro encontrado',
            error: 'Erro ao carregar',
            noResults: 'Nenhum resultado encontrado',
            loadingMore: 'Carregando mais dados...',
          },
        },
      };

      messagesEditor.config = config;
      messagesEditor.ngOnInit();

      expect(messagesEditor.messagesForm.get('loadingMessage')?.value).toBe(
        'Carregando dados...',
      );
      expect(messagesEditor.messagesForm.get('emptyMessage')?.value).toBe(
        'Nenhum registro encontrado',
      );
    });

    it('should handle advanced messages and localization configuration', () => {
      const config: TableConfig = {
        columns: [],
        messages: {
          states: {
            loading: 'Carregando...',
            empty: 'Nenhum dado',
            error: 'Erro',
            noResults: 'Sem resultados',
            loadingMore: 'Carregando mais...',
          },
        },
        localization: {
          locale: 'pt-BR',
          direction: 'ltr',
          dateTime: {
            dateFormat: 'dd/MM/yyyy',
            timeFormat: 'HH:mm:ss',
            firstDayOfWeek: 0,
          },
          currency: {
            code: 'BRL',
            symbol: 'R$',
            position: 'before',
          },
        },
      };

      messagesEditor.config = config;
      messagesEditor.ngOnInit();

      expect(messagesEditor.messagesForm.get('loadingMoreMessage')?.value).toBe(
        'Carregando mais...',
      );
      expect(messagesEditor.messagesForm.get('locale')?.value).toBe('pt-BR');
      expect(messagesEditor.messagesForm.get('currencyCode')?.value).toBe(
        'BRL',
      );
    });

    it('should emit configuration changes with proper structure', (done) => {
      const config: TableConfig = {
        columns: [],
      };

      messagesEditor.config = config;
      messagesEditor.configChange.subscribe((updatedConfig) => {
        expect(updatedConfig.messages?.states?.loading).toBe(
          'Novo texto de carregamento',
        );
        expect(updatedConfig.localization?.locale).toBe('en-US');
        done();
      });

      messagesEditor.ngOnInit();

      // Simulate form changes
      messagesEditor.messagesForm.patchValue({
        loadingMessage: 'Novo texto de carregamento',
        locale: 'en-US',
      });
    });
  });

  describe('Columns Config Editor Integration', () => {
    let columnsEditor: ColumnsConfigEditorComponent;
    let columnsFixture: ComponentFixture<ColumnsConfigEditorComponent>;

    beforeEach(() => {
      columnsFixture = TestBed.createComponent(ColumnsConfigEditorComponent);
      columnsEditor = columnsFixture.componentInstance;
    });

    it('should handle basic columns configuration', () => {
      const config: TableConfig = {
        columns: [
          {
            field: 'id',
            header: 'ID',
            type: 'number',
            visible: true,
            sortable: true,
          },
          {
            field: 'name',
            header: 'Nome',
            type: 'string',
            visible: true,
            align: 'left',
          },
          { field: 'email', header: 'Email', type: 'string', visible: false },
        ],
      };

      columnsEditor.config = config;
      columnsEditor.ngOnInit();

      expect(columnsEditor.isV2Config).toBe(true);
      expect(columnsEditor.columns.length).toBe(3);
    });

    it('should handle advanced columns features', () => {
      const config: TableConfig = {
        columns: [
          {
            field: 'id',
            header: 'ID',
            type: 'number',
            visible: true,
            sortable: true,
            resizable: true,
            filterable: true,
            sticky: false,
          },
          {
            field: 'name',
            header: 'Nome',
            type: 'string',
            visible: true,
            resizable: true,
            filterable: true,
            sticky: true,
          },
        ],
      };

      columnsEditor.config = config;
      columnsEditor.ngOnInit();

      expect(columnsEditor.isV2Config).toBe(true);
      expect(columnsEditor.globalResizable).toBe(true);
      expect(columnsEditor.globalFilterable).toBe(true);
    });

    it('should handle column reordering', () => {
      const config: TableConfig = {
        columns: [
          { field: 'first', header: 'First' },
          { field: 'second', header: 'Second' },
          { field: 'third', header: 'Third' },
        ],
      };

      columnsEditor.config = config;
      columnsEditor.ngOnInit();

      const initialOrder = columnsEditor.columns.map((c) => c.field);
      expect(initialOrder).toEqual(['first', 'second', 'third']);

      // Simulate drag and drop from index 0 to index 2
      const mockEvent = {
        previousIndex: 0,
        currentIndex: 2,
      } as any;

      columnsEditor.onColumnReorder(mockEvent);

      const newOrder = columnsEditor.columns.map((c) => c.field);
      expect(newOrder).toEqual(['second', 'third', 'first']);
    });
  });

  describe('Cross-Editor Communication', () => {
    it('should maintain configuration consistency across editors', (done) => {
      const initialConfig: TableConfig = {
        meta: { version: '2.0.0', name: 'Test Config' },
        columns: [{ field: 'test', header: 'Test' }],
        behavior: {
          pagination: {
            enabled: true,
            pageSize: 10,
            pageSizeOptions: [5, 10, 25],
            showFirstLastButtons: true,
            showPageNumbers: true,
            showPageInfo: true,
            position: 'bottom',
            style: 'default',
            strategy: 'client',
          },
        },
        toolbar: {
          visible: false,
          position: 'top',
        },
        messages: {
          states: {
            loading: 'Loading...',
            empty: 'Nenhum dado disponível',
            error: 'Erro ao carregar dados',
            noResults: 'Nenhum resultado encontrado',
            loadingMore: 'Carregando mais dados...',
          },
        },
      };

      (mainEditorComponent as any).panelData = initialConfig;
      mainEditorComponent.ngOnInit();

      let changeCount = 0;
      const expectedChanges = 3;

      const checkChanges = () => {
        changeCount++;

        if (changeCount === expectedChanges) {
          expect(
            mainEditorComponent.editedConfig.behavior?.pagination?.pageSize,
          ).toBe(20);
          expect(mainEditorComponent.editedConfig.toolbar?.visible).toBe(true);
          expect(
            mainEditorComponent.editedConfig.messages?.states?.loading,
          ).toBe('Carregando dados...');
          done();
        }
      };

      // Simulate changes from different editors
      setTimeout(() => {
        // Change from behavior editor
        const behaviorChanged = {
          ...initialConfig,
          behavior: {
            ...initialConfig.behavior,
            pagination: {
              ...initialConfig.behavior!.pagination!,
              pageSize: 20,
            },
          },
        };
        mainEditorComponent.onBehaviorConfigChange(behaviorChanged);
        checkChanges();
      }, 10);

      setTimeout(() => {
        // Change from toolbar editor
        const toolbarChanged = {
          ...mainEditorComponent.editedConfig,
          toolbar: { visible: true, position: 'top' as const },
        };
        mainEditorComponent.onToolbarActionsConfigChange(toolbarChanged);
        checkChanges();
      }, 20);

      setTimeout(() => {
        // Change from messages editor
        const messagesChanged = {
          ...mainEditorComponent.editedConfig,
          messages: {
            ...mainEditorComponent.editedConfig.messages,
            states: {
              ...mainEditorComponent.editedConfig.messages?.states,
              loading: 'Carregando dados...',
            },
          },
        };
        mainEditorComponent.onMessagesLocalizationConfigChange(messagesChanged);
        checkChanges();
      }, 30);
    });
  });

  describe('Configuration Management', () => {
    it('should handle reset to defaults correctly', () => {
      const config: TableConfig = {
        meta: { version: '2.0.0' },
        columns: [{ field: 'test', header: 'Test' }],
      };

      (mainEditorComponent as any).panelData = config;
      mainEditorComponent.ngOnInit();

      mainEditorComponent.onResetToDefaults();

      expect(mainEditorComponent.editedConfig.columns).toEqual([]);
      expect(
        mainEditorComponent.editedConfig.behavior?.pagination?.enabled,
      ).toBe(true);
      expect(mainEditorComponent.editedConfig.behavior?.sorting?.enabled).toBe(
        true,
      );
      expect(mainEditorComponent.canSave).toBe(true);
    });

    it('should handle save operation correctly', () => {
      const config: TableConfig = {
        columns: [{ field: 'test', header: 'Test' }],
      };

      (mainEditorComponent as any).panelData = config;
      mainEditorComponent.ngOnInit();

      // Make a change to enable saving
      mainEditorComponent.onBehaviorConfigChange({
        ...config,
        behavior: {
          sorting: {
            enabled: false,
            multiSort: false,
            strategy: 'client',
            showSortIndicators: true,
            indicatorPosition: 'end',
            allowClearSort: true,
          },
        },
      });

      expect(mainEditorComponent.canSave).toBe(true);

      mainEditorComponent.onSave();

      // Should close dialog after timeout
      expect(mainEditorComponent.statusMessage).toBe(
        'Configurações salvas com sucesso!',
      );
    });

    it('should persist pagination change when saving immediately', () => {
      const config: TableConfig = {
        columns: [],
        behavior: {
          pagination: {
            enabled: true,
            pageSize: 10,
            pageSizeOptions: [5, 10],
            showFirstLastButtons: true,
            showPageNumbers: true,
            showPageInfo: true,
            position: 'bottom',
            style: 'default',
            strategy: 'client',
          },
        },
      };

      (mainEditorComponent as any).panelData = config;
      mainEditorComponent.ngOnInit();
      mainEditorFixture.detectChanges();

      const behaviorEditor = mainEditorFixture.debugElement.query(
        By.directive(BehaviorConfigEditorComponent),
      ).componentInstance as BehaviorConfigEditorComponent;

      behaviorEditor.behaviorForm.get('paginationEnabled')?.setValue(false);

      const saved = mainEditorComponent.onSave();
      expect(saved?.behavior?.pagination?.enabled).toBe(false);
    });
  });
});
