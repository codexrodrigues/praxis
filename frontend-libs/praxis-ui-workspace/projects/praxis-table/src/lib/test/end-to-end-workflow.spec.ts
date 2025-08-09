/**
 * Testes End-to-End para Workflow Completo V2
 * Simula cenários reais de uso da arquitetura
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  TableConfig,
  TableConfigService,
  ColumnDefinition,
} from '@praxis/core';
import { GenericCrudService } from '@praxis/core';

import { PraxisTable } from '../praxis-table';
import { PraxisTableConfigEditor } from '../praxis-table-config-editor';

// Mock data for testing
const SAMPLE_EMPLOYEE_DATA = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@empresa.com',
    department: 'TI',
    salary: 5000,
    active: true,
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    department: 'RH',
    salary: 4500,
    active: true,
  },
  {
    id: 3,
    name: 'Pedro Costa',
    email: 'pedro@empresa.com',
    department: 'Vendas',
    salary: 4000,
    active: false,
  },
  {
    id: 4,
    name: 'Ana Oliveira',
    email: 'ana@empresa.com',
    department: 'Marketing',
    salary: 4200,
    active: true,
  },
  {
    id: 5,
    name: 'Carlos Pereira',
    email: 'carlos@empresa.com',
    department: 'TI',
    salary: 5500,
    active: true,
  },
];

describe('End-to-End Workflow Tests', () => {
  let tableComponent: PraxisTable;
  let tableFixture: ComponentFixture<PraxisTable>;
  let editorComponent: PraxisTableConfigEditor;
  let editorFixture: ComponentFixture<PraxisTableConfigEditor>;
  let configService: TableConfigService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PraxisTable,
        PraxisTableConfigEditor,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        TableConfigService,
        { provide: GenericCrudService, useValue: { configure: () => {} } },
        {
          provide: MatDialogRef,
          useValue: {
            close: jasmine.createSpy('close'),
            afterClosed: () => ({ subscribe: () => {} }),
          },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { config: null },
        },
      ],
    }).compileComponents();

    tableFixture = TestBed.createComponent(PraxisTable);
    tableComponent = tableFixture.componentInstance;

    editorFixture = TestBed.createComponent(PraxisTableConfigEditor);
    editorComponent = editorFixture.componentInstance;

    configService = TestBed.inject(TableConfigService);
  });

  describe('Complete User Journey - Table Configuration', () => {
    it('should handle complete workflow from basic to advanced configuration', async () => {
      // STEP 1: User starts with basic configuration
      const initialConfig: TableConfig = {
        columns: [
          {
            field: 'id',
            header: 'ID',
            type: 'number',
            visible: true,
            width: '80px',
          },
          { field: 'name', header: 'Nome', type: 'string', visible: true },
          { field: 'email', header: 'Email', type: 'string', visible: true },
          {
            field: 'department',
            header: 'Departamento',
            type: 'string',
            visible: true,
          },
          { field: 'salary', header: 'Salário', type: 'number', visible: true },
          { field: 'active', header: 'Ativo', type: 'boolean', visible: true },
        ],
        behavior: {
          sorting: { enabled: true },
          filtering: { enabled: false },
          pagination: {
            enabled: true,
            pageSize: 10,
            pageSizeOptions: [5, 10, 25],
            showFirstLastButtons: true,
          },
          selection: {
            enabled: true,
            type: 'single',
          },
        },
        toolbar: {
          visible: true,
          actions: [
            {
              id: 'add',
              label: 'Adicionar',
              icon: 'add',
              type: 'button',
              action: 'add',
              position: 'start',
            },
          ],
        },
        messages: {
          states: {
            loading: 'Carregando funcionários...',
            empty: 'Nenhum funcionário encontrado',
            error: 'Erro ao carregar dados',
          },
        },
      };

      // STEP 2: Initialize table with basic config
      tableComponent.config = initialConfig;
      tableFixture.detectChanges();

      expect(tableComponent.getSortingEnabled()).toBe(true);
      expect(tableComponent.getPaginationEnabled()).toBe(true);
      expect(tableComponent.getPaginationPageSize()).toBe(10);

      // STEP 3: User opens config editor to customize table
      editorComponent.data = { config: initialConfig };
      editorComponent.ngOnInit();
      editorFixture.detectChanges();

      expect(editorComponent.editedConfig).toEqual(initialConfig);

      // STEP 4: User enhances configuration with advanced features

      // 4a. Add advanced pagination settings
      const enhancedPagination = {
        ...initialConfig,
        behavior: {
          ...initialConfig.behavior,
          pagination: {
            enabled: true,
            pageSize: 15,
            pageSizeOptions: [10, 15, 25, 50],
            showFirstLastButtons: true,
            showPageNumbers: true,
            showPageInfo: true,
            position: 'bottom',
            style: 'compact',
            strategy: 'client',
          },
        },
      };
      editorComponent.onBehaviorConfigChange(enhancedPagination);

      // 5b. Add advanced toolbar with search
      const enhancedToolbar = {
        ...(editorComponent.editedConfig as TableConfigV2),
        toolbar: {
          visible: true,
          position: 'top' as const,
          title: 'Gerenciamento de Funcionários',
          subtitle: 'Lista completa de funcionários da empresa',
          actions: [
            {
              id: 'add',
              label: 'Adicionar',
              icon: 'add',
              type: 'button' as const,
              action: 'add',
              position: 'start' as const,
            },
            {
              id: 'export',
              label: 'Exportar',
              icon: 'download',
              type: 'button' as const,
              action: 'export',
              position: 'end' as const,
            },
          ],
          search: {
            enabled: true,
            placeholder: 'Pesquisar funcionários...',
            position: 'center' as const,
            realtime: true,
            delay: 300,
          },
        },
      };
      editorComponent.onToolbarActionsConfigChange(enhancedToolbar);

      // 5c. Add bulk actions and row actions
      const enhancedActions = {
        ...(editorComponent.editedConfig as TableConfigV2),
        actions: {
          row: {
            enabled: true,
            position: 'end' as const,
            actions: [
              {
                id: 'view',
                label: 'Visualizar',
                icon: 'visibility',
                action: 'view',
              },
              { id: 'edit', label: 'Editar', icon: 'edit', action: 'edit' },
              {
                id: 'delete',
                label: 'Excluir',
                icon: 'delete',
                action: 'delete',
              },
            ],
          },
          bulk: {
            enabled: true,
            actions: [
              {
                id: 'activate',
                label: 'Ativar Selecionados',
                icon: 'check_circle',
                action: 'activateSelected',
              },
              {
                id: 'deactivate',
                label: 'Desativar Selecionados',
                icon: 'cancel',
                action: 'deactivateSelected',
              },
              {
                id: 'export',
                label: 'Exportar Selecionados',
                icon: 'download',
                action: 'exportSelected',
              },
            ],
          },
        },
      };
      editorComponent.onToolbarActionsConfigChange(enhancedActions);

      // 5d. Customize messages and localization
      const enhancedMessages = {
        ...(editorComponent.editedConfig as TableConfigV2),
        messages: {
          states: {
            loading: 'Carregando funcionários...',
            empty: 'Nenhum funcionário cadastrado',
            error: 'Erro ao carregar lista de funcionários',
            noResults: 'Nenhum funcionário encontrado com os filtros aplicados',
            loadingMore: 'Carregando mais funcionários...',
          },
          actions: {
            confirmations: {
              delete: 'Tem certeza que deseja excluir este funcionário?',
              deleteMultiple:
                'Tem certeza que deseja excluir os funcionários selecionados?',
              save: 'Deseja salvar as alterações feitas?',
            },
            success: {
              save: 'Funcionário salvo com sucesso!',
              delete: 'Funcionário excluído com sucesso!',
              export: 'Dados exportados com sucesso!',
            },
            errors: {
              save: 'Erro ao salvar funcionário',
              delete: 'Erro ao excluir funcionário',
              network: 'Erro de conexão. Verifique sua internet.',
            },
          },
        },
        localization: {
          locale: 'pt-BR',
          direction: 'ltr' as const,
          dateTime: {
            dateFormat: 'dd/MM/yyyy',
            timeFormat: 'HH:mm',
            firstDayOfWeek: 0,
          },
          currency: {
            code: 'BRL',
            symbol: 'R$',
            position: 'before' as const,
            precision: 2,
          },
        },
      };
      editorComponent.onMessagesLocalizationConfigChange(enhancedMessages);

      // 5e. Enhance columns with V2 features
      const enhancedColumns = {
        ...(editorComponent.editedConfig as TableConfigV2),
        columns: [
          {
            field: 'id',
            header: 'ID',
            type: 'number',
            visible: true,
            width: '80px',
            sortable: true,
            filterable: false,
            resizable: false,
            sticky: true,
            align: 'center',
          },
          {
            field: 'name',
            header: 'Nome Completo',
            type: 'string',
            visible: true,
            sortable: true,
            filterable: true,
            resizable: true,
            sticky: false,
            align: 'left',
          },
          {
            field: 'email',
            header: 'Email',
            type: 'string',
            visible: true,
            sortable: true,
            filterable: true,
            resizable: true,
            align: 'left',
          },
          {
            field: 'department',
            header: 'Departamento',
            type: 'string',
            visible: true,
            sortable: true,
            filterable: true,
            resizable: true,
            align: 'center',
          },
          {
            field: 'salary',
            header: 'Salário',
            type: 'number',
            visible: true,
            sortable: true,
            filterable: false,
            resizable: true,
            align: 'right',
          },
          {
            field: 'active',
            header: 'Status',
            type: 'boolean',
            visible: true,
            sortable: true,
            filterable: true,
            resizable: false,
            align: 'center',
          },
        ] as ColumnDefinition[],
      };
      editorComponent.onColumnsConfigChange(enhancedColumns);

      // STEP 6: User saves the enhanced V2 configuration
      expect(editorComponent.canSave).toBe(true);

      const finalConfig = editorComponent.editedConfig as TableConfigV2;

      // Verify all enhancements are present
      expect(finalConfig.meta?.version).toBe('2.0.0');
      expect(finalConfig.behavior?.pagination?.pageSize).toBe(15);
      expect(finalConfig.toolbar?.title).toBe('Gerenciamento de Funcionários');
      expect(finalConfig.toolbar?.search?.enabled).toBe(true);
      expect(finalConfig.actions?.row?.enabled).toBe(true);
      expect(finalConfig.actions?.bulk?.enabled).toBe(true);
      expect(finalConfig.messages?.states?.loading).toBe(
        'Carregando funcionários...',
      );
      expect(finalConfig.localization?.locale).toBe('pt-BR');
      expect(finalConfig.columns[0].sticky).toBe(true);

      // STEP 7: Apply enhanced configuration back to table
      tableComponent.config = finalConfig;
      tableFixture.detectChanges();

      // Verify table reflects all enhancements
      expect(tableComponent.getSortingEnabled()).toBe(true);
      expect(tableComponent.getPaginationPageSize()).toBe(15);
      expect(tableComponent.isFeatureAvailable('multiSort')).toBe(true);
      expect(tableComponent.isFeatureAvailable('bulkActions')).toBe(true);
    });
  });

  describe('Real-world Configuration Scenarios', () => {
    it('should handle e-commerce product table configuration', () => {
      const ecommerceConfig: TableConfigV2 = {
        meta: {
          version: '2.0.0',
          name: 'Products Management',
          description: 'Product catalog management table',
        },
        columns: [
          {
            field: 'sku',
            header: 'SKU',
            type: 'string',
            visible: true,
            width: '120px',
            sticky: true,
          },
          {
            field: 'name',
            header: 'Product Name',
            type: 'string',
            visible: true,
            resizable: true,
          },
          {
            field: 'category',
            header: 'Category',
            type: 'string',
            visible: true,
            filterable: true,
          },
          {
            field: 'price',
            header: 'Price',
            type: 'number',
            visible: true,
            align: 'right',
          },
          {
            field: 'stock',
            header: 'Stock',
            type: 'number',
            visible: true,
            align: 'center',
          },
          {
            field: 'status',
            header: 'Status',
            type: 'string',
            visible: true,
            filterable: true,
          },
        ],
        behavior: {
          pagination: {
            enabled: true,
            pageSize: 25,
            pageSizeOptions: [10, 25, 50, 100],
            strategy: 'server',
            showPageNumbers: true,
          },
          sorting: {
            enabled: true,
            multiSort: true,
            defaultSort: { column: 'name', direction: 'asc' },
          },
          filtering: {
            enabled: true,
            globalFilter: { enabled: true, placeholder: 'Search products...' },
          },
          selection: {
            enabled: true,
            type: 'multiple',
            mode: 'checkbox',
          },
        },
        toolbar: {
          visible: true,
          title: 'Product Catalog',
          actions: [
            {
              id: 'add',
              label: 'Add Product',
              icon: 'add',
              type: 'button',
              action: 'add',
              position: 'start',
            },
            {
              id: 'import',
              label: 'Import CSV',
              icon: 'upload',
              type: 'button',
              action: 'import',
              position: 'start',
            },
            {
              id: 'export',
              label: 'Export',
              icon: 'download',
              type: 'button',
              action: 'export',
              position: 'end',
            },
          ],
          search: {
            enabled: true,
            placeholder: 'Search products...',
            position: 'center',
            realtime: true,
            delay: 250,
          },
        },
        actions: {
          row: {
            enabled: true,
            actions: [
              { id: 'view', label: 'View', icon: 'visibility', action: 'view' },
              { id: 'edit', label: 'Edit', icon: 'edit', action: 'edit' },
              {
                id: 'duplicate',
                label: 'Duplicate',
                icon: 'content_copy',
                action: 'duplicate',
              },
              {
                id: 'delete',
                label: 'Delete',
                icon: 'delete',
                action: 'delete',
              },
            ],
          },
          bulk: {
            enabled: true,
            actions: [
              {
                id: 'activate',
                label: 'Activate Selected',
                icon: 'check_circle',
                action: 'activateSelected',
              },
              {
                id: 'deactivate',
                label: 'Deactivate Selected',
                icon: 'cancel',
                action: 'deactivateSelected',
              },
              {
                id: 'updatePrices',
                label: 'Bulk Price Update',
                icon: 'attach_money',
                action: 'bulkPriceUpdate',
              },
              {
                id: 'exportSelected',
                label: 'Export Selected',
                icon: 'download',
                action: 'exportSelected',
              },
            ],
          },
        },
        appearance: {
          density: 'comfortable',
          borders: { showRowBorders: true, showColumnBorders: false },
          elevation: { level: 1 },
        },
        export: {
          enabled: true,
          formats: ['csv', 'xlsx', 'pdf'],
          defaultFormat: 'xlsx',
        },
      };

      tableComponent.config = ecommerceConfig;
      tableFixture.detectChanges();

      expect(tableComponent.isFeatureAvailable('multiSort')).toBe(true);
      expect(tableComponent.isFeatureAvailable('bulkActions')).toBe(true);
      expect(tableComponent.getSortingEnabled()).toBe(true);
      expect(tableComponent.getPaginationPageSize()).toBe(25);
    });

    it('should handle financial reports table configuration', () => {
      const financialConfig: TableConfigV2 = {
        meta: {
          version: '2.0.0',
          name: 'Financial Reports',
          description: 'Monthly financial data analysis',
        },
        columns: [
          {
            field: 'period',
            header: 'Period',
            type: 'string',
            visible: true,
            sticky: true,
            width: '100px',
          },
          {
            field: 'revenue',
            header: 'Revenue',
            type: 'number',
            visible: true,
            align: 'right',
          },
          {
            field: 'expenses',
            header: 'Expenses',
            type: 'number',
            visible: true,
            align: 'right',
          },
          {
            field: 'profit',
            header: 'Profit',
            type: 'number',
            visible: true,
            align: 'right',
          },
          {
            field: 'margin',
            header: 'Margin %',
            type: 'number',
            visible: true,
            align: 'right',
          },
          {
            field: 'growth',
            header: 'Growth %',
            type: 'number',
            visible: true,
            align: 'right',
          },
        ],
        behavior: {
          pagination: {
            enabled: true,
            pageSize: 12, // Monthly data
            pageSizeOptions: [12, 24, 36],
            strategy: 'client',
          },
          sorting: {
            enabled: true,
            multiSort: false,
            defaultSort: { column: 'period', direction: 'desc' },
          },
          filtering: {
            enabled: true,
            globalFilter: { enabled: false },
          },
          selection: {
            enabled: false,
          },
        },
        toolbar: {
          visible: true,
          title: 'Financial Dashboard',
          subtitle: 'Monthly Performance Analysis',
          actions: [
            {
              id: 'refresh',
              label: 'Refresh Data',
              icon: 'refresh',
              type: 'button',
              action: 'refresh',
              position: 'start',
            },
            {
              id: 'chart',
              label: 'View Chart',
              icon: 'bar_chart',
              type: 'button',
              action: 'showChart',
              position: 'end',
            },
            {
              id: 'export',
              label: 'Export Report',
              icon: 'file_download',
              type: 'button',
              action: 'exportReport',
              position: 'end',
            },
          ],
        },
        appearance: {
          density: 'compact',
          borders: { showRowBorders: true, showColumnBorders: true },
          elevation: { level: 2 },
        },
        localization: {
          locale: 'pt-BR',
          currency: {
            code: 'BRL',
            symbol: 'R$',
            position: 'before',
            precision: 2,
          },
          number: {
            thousandsSeparator: '.',
            decimalSeparator: ',',
            defaultPrecision: 2,
          },
        },
        messages: {
          states: {
            loading: 'Carregando dados financeiros...',
            empty: 'Nenhum dado financeiro disponível',
            error: 'Erro ao carregar relatório financeiro',
          },
        },
      };

      tableComponent.config = financialConfig;
      tableFixture.detectChanges();

      expect(tableComponent.getSortingEnabled()).toBe(true);
      expect(tableComponent.getPaginationPageSize()).toBe(12);
    });

    it('should handle user management admin table', () => {
      const userManagementConfig: TableConfigV2 = {
        meta: {
          version: '2.0.0',
          name: 'User Management',
          description: 'System users administration',
        },
        columns: [
          {
            field: 'id',
            header: 'ID',
            type: 'number',
            visible: true,
            width: '60px',
            sticky: true,
          },
          {
            field: 'avatar',
            header: 'Avatar',
            type: 'string',
            visible: true,
            width: '80px',
            sortable: false,
          },
          {
            field: 'username',
            header: 'Username',
            type: 'string',
            visible: true,
            filterable: true,
          },
          {
            field: 'email',
            header: 'Email',
            type: 'string',
            visible: true,
            filterable: true,
          },
          {
            field: 'role',
            header: 'Role',
            type: 'string',
            visible: true,
            filterable: true,
          },
          {
            field: 'department',
            header: 'Department',
            type: 'string',
            visible: true,
            filterable: true,
          },
          {
            field: 'lastLogin',
            header: 'Last Login',
            type: 'string',
            visible: true,
            sortable: true,
          },
          {
            field: 'status',
            header: 'Status',
            type: 'string',
            visible: true,
            filterable: true,
            width: '100px',
          },
        ],
        behavior: {
          pagination: {
            enabled: true,
            pageSize: 20,
            pageSizeOptions: [10, 20, 50, 100],
            strategy: 'server',
            showPageNumbers: true,
            showPageInfo: true,
          },
          sorting: {
            enabled: true,
            multiSort: true,
            defaultSort: { column: 'username', direction: 'asc' },
          },
          filtering: {
            enabled: true,
            globalFilter: {
              enabled: true,
              placeholder: 'Search users by name, email, or department...',
            },
          },
          selection: {
            enabled: true,
            type: 'multiple',
            mode: 'checkbox',
          },
          resizing: {
            enabled: true,
          },
        },
        toolbar: {
          visible: true,
          title: 'User Management',
          subtitle: 'Manage system users and permissions',
          actions: [
            {
              id: 'addUser',
              label: 'Add User',
              icon: 'person_add',
              type: 'button',
              action: 'addUser',
              position: 'start',
            },
            {
              id: 'importUsers',
              label: 'Import Users',
              icon: 'upload',
              type: 'button',
              action: 'importUsers',
              position: 'start',
            },
            {
              id: 'exportUsers',
              label: 'Export Users',
              icon: 'download',
              type: 'button',
              action: 'exportUsers',
              position: 'end',
            },
            {
              id: 'settings',
              label: 'Settings',
              icon: 'settings',
              type: 'button',
              action: 'settings',
              position: 'end',
            },
          ],
          search: {
            enabled: true,
            placeholder: 'Search users...',
            position: 'center',
            realtime: true,
            delay: 300,
          },
        },
        actions: {
          row: {
            enabled: true,
            position: 'end',
            actions: [
              {
                id: 'viewProfile',
                label: 'View Profile',
                icon: 'visibility',
                action: 'viewProfile',
              },
              {
                id: 'editUser',
                label: 'Edit User',
                icon: 'edit',
                action: 'editUser',
              },
              {
                id: 'resetPassword',
                label: 'Reset Password',
                icon: 'lock_reset',
                action: 'resetPassword',
              },
              {
                id: 'toggleStatus',
                label: 'Toggle Status',
                icon: 'toggle_on',
                action: 'toggleStatus',
              },
              {
                id: 'deleteUser',
                label: 'Delete User',
                icon: 'delete',
                action: 'deleteUser',
              },
            ],
          },
          bulk: {
            enabled: true,
            actions: [
              {
                id: 'activateUsers',
                label: 'Activate Selected',
                icon: 'check_circle',
                action: 'activateUsers',
              },
              {
                id: 'deactivateUsers',
                label: 'Deactivate Selected',
                icon: 'block',
                action: 'deactivateUsers',
              },
              {
                id: 'changeRole',
                label: 'Change Role',
                icon: 'group',
                action: 'changeRole',
              },
              {
                id: 'sendInvite',
                label: 'Send Invites',
                icon: 'mail',
                action: 'sendInvite',
              },
              {
                id: 'exportSelected',
                label: 'Export Selected',
                icon: 'download',
                action: 'exportSelected',
              },
            ],
          },
        },
        messages: {
          states: {
            loading: 'Loading users...',
            empty: 'No users found',
            error: 'Failed to load users',
            noResults: 'No users match your search criteria',
          },
          actions: {
            confirmations: {
              delete: 'Are you sure you want to delete this user?',
              deleteMultiple:
                'Are you sure you want to delete the selected users?',
              deactivate: 'This will deactivate the user account. Continue?',
            },
            success: {
              save: 'User saved successfully!',
              delete: 'User deleted successfully!',
              activate: 'Users activated successfully!',
            },
            errors: {
              save: 'Failed to save user',
              delete: 'Failed to delete user',
              network: 'Network error. Please try again.',
            },
          },
        },
        appearance: {
          density: 'comfortable',
          borders: { showRowBorders: true, showColumnBorders: false },
          elevation: { level: 1 },
        },
      };

      tableComponent.config = userManagementConfig;
      tableFixture.detectChanges();

      expect(tableComponent.isFeatureAvailable('bulkActions')).toBe(true);
      expect(tableComponent.isFeatureAvailable('multiSort')).toBe(true);
      expect(tableComponent.getPaginationPageSize()).toBe(20);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle rapid configuration changes without memory leaks', async () => {
      const baseConfig: TableConfigV2 = {
        meta: { version: '2.0.0' },
        columns: [{ field: 'test', header: 'Test' }],
      };

      // Simulate rapid configuration changes
      for (let i = 0; i < 100; i++) {
        const modifiedConfig = {
          ...baseConfig,
          behavior: {
            pagination: { enabled: true, pageSize: 10 + i },
          },
        };

        tableComponent.config = modifiedConfig;
        tableFixture.detectChanges();

        // Small delay to simulate real user interaction
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      // Verify the table is still functional
      expect(tableComponent.getPaginationPageSize()).toBe(109);
      expect(tableComponent.getSortingEnabled()).toBe(true);
    });

    it('should maintain performance with large datasets and complex configurations', () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@company.com`,
        department: `Dept ${(i % 10) + 1}`,
        role: `Role ${(i % 5) + 1}`,
        active: i % 3 === 0,
        salary: 3000 + i * 10,
        joinDate: new Date(2020 + (i % 4), i % 12, (i % 28) + 1).toISOString(),
      }));

      const complexConfig: TableConfigV2 = {
        meta: { version: '2.0.0', name: 'Performance Test' },
        columns: [
          {
            field: 'id',
            header: 'ID',
            type: 'number',
            visible: true,
            sortable: true,
            filterable: true,
          },
          {
            field: 'name',
            header: 'Name',
            type: 'string',
            visible: true,
            sortable: true,
            filterable: true,
          },
          {
            field: 'email',
            header: 'Email',
            type: 'string',
            visible: true,
            sortable: true,
            filterable: true,
          },
          {
            field: 'department',
            header: 'Department',
            type: 'string',
            visible: true,
            sortable: true,
            filterable: true,
          },
          {
            field: 'role',
            header: 'Role',
            type: 'string',
            visible: true,
            sortable: true,
            filterable: true,
          },
          {
            field: 'active',
            header: 'Active',
            type: 'boolean',
            visible: true,
            sortable: true,
            filterable: true,
          },
          {
            field: 'salary',
            header: 'Salary',
            type: 'number',
            visible: true,
            sortable: true,
            filterable: false,
          },
          {
            field: 'joinDate',
            header: 'Join Date',
            type: 'string',
            visible: true,
            sortable: true,
            filterable: true,
          },
        ],
        behavior: {
          pagination: {
            enabled: true,
            pageSize: 50,
            pageSizeOptions: [25, 50, 100, 200],
            strategy: 'client',
          },
          sorting: {
            enabled: true,
            multiSort: true,
          },
          filtering: {
            enabled: true,
            globalFilter: { enabled: true },
          },
          selection: {
            enabled: true,
            type: 'multiple',
          },
        },
      };

      const startTime = performance.now();

      tableComponent.config = complexConfig;
      tableComponent.data = largeDataset;
      tableFixture.detectChanges();

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (this is a rough benchmark)
      expect(renderTime).toBeLessThan(5000); // Less than 5 seconds
      expect(tableComponent.getPaginationPageSize()).toBe(50);
    });

    it('should handle error states gracefully', () => {
      // Test with invalid configuration
      const invalidConfig = {
        meta: { version: '2.0.0' },
        columns: null, // Invalid
        behavior: 'invalid', // Invalid
      } as any;

      expect(() => {
        tableComponent.config = invalidConfig;
        tableFixture.detectChanges();
      }).not.toThrow();

      // Should fallback to default behavior
      expect(tableComponent.getSortingEnabled()).toBeDefined();
      expect(tableComponent.getPaginationEnabled()).toBeDefined();
    });
  });

  describe('Accessibility and UX', () => {
    it('should maintain accessibility features across V1 and V2 configurations', () => {
      const accessibleConfig: TableConfigV2 = {
        meta: { version: '2.0.0' },
        columns: [
          { field: 'id', header: 'ID', type: 'number', visible: true },
          { field: 'name', header: 'Name', type: 'string', visible: true },
        ],
        accessibility: {
          announceChanges: true,
          focusManagement: {
            trapFocus: true,
            restoreFocus: true,
            focusFirstCell: true,
          },
          screenReader: {
            rowSelectionAnnouncement: 'Row {rowNumber} selected',
            sortingAnnouncement: 'Column {columnName} sorted {direction}',
            paginationAnnouncement: 'Page {pageNumber} of {totalPages}',
          },
          keyboard: {
            navigationEnabled: true,
            shortcuts: {
              nextPage: 'PageDown',
              previousPage: 'PageUp',
              firstPage: 'Home',
              lastPage: 'End',
            },
          },
        },
      };

      tableComponent.config = accessibleConfig;
      tableFixture.detectChanges();

      // Verify accessibility features are applied
      const tableElement = tableFixture.nativeElement.querySelector('table');
      expect(tableElement).toBeTruthy();

      // Check for ARIA attributes
      expect(tableElement.getAttribute('role')).toBeTruthy();
    });

    it('should provide consistent user experience during configuration changes', async () => {
      const initialConfig: TableConfig = {
        columns: [{ field: 'test', header: 'Test' }],
        gridOptions: { sortable: true },
      };

      tableComponent.config = initialConfig;
      tableFixture.detectChanges();

      const initialSortState = tableComponent.getSortingEnabled();
      expect(initialSortState).toBe(true);

      // Migrate to V2 and verify UX consistency
      const migratedConfig = configService.migrateToV2(initialConfig);
      expect(migratedConfig.success).toBe(true);

      tableComponent.config = migratedConfig.config!;
      tableFixture.detectChanges();

      const postMigrationSortState = tableComponent.getSortingEnabled();
      expect(postMigrationSortState).toBe(initialSortState);
    });
  });
});
