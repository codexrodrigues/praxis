# 🚀 DynamicFieldLoaderDirective - Exemplos de Uso

Esta diretiva permite renderizar campos de formulário dinamicamente baseado em metadados JSON, integrando-se perfeitamente com Angular Reactive Forms e ComponentRegistryService.

## 📋 Uso Básico

### 1. Importação e Setup

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicFieldLoaderDirective } from '@praxis/dynamic-fields';
import { FieldMetadata } from '@praxis/core';

@Component({
  selector: 'app-basic-form',
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <h2>Formulário Dinâmico</h2>
      
      <ng-container 
        dynamicFieldLoader 
        [fields]="fieldMetadata" 
        [formGroup]="userForm"
        (componentsCreated)="onComponentsReady($event)">
      </ng-container>
      
      <button type="submit" [disabled]="userForm.invalid">
        Enviar
      </button>
    </form>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, DynamicFieldLoaderDirective]
})
export class BasicFormComponent {
  userForm: FormGroup;
  fieldMetadata: FieldMetadata[] = [];

  constructor(private fb: FormBuilder) {
    this.setupForm();
  }

  private setupForm() {
    // Definir metadata dos campos
    this.fieldMetadata = [
      {
        name: 'email',
        label: 'Email',
        controlType: 'input',
        inputType: 'email',
        required: true,
        placeholder: 'Digite seu email'
      },
      {
        name: 'password',
        label: 'Senha',
        controlType: 'input',
        inputType: 'password',
        required: true,
        minLength: 8
      },
      {
        name: 'remember',
        label: 'Lembrar de mim',
        controlType: 'checkbox'
      }
    ];

    // Criar FormGroup correspondente
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [false]
    });
  }

  onComponentsReady(components: Map<string, any>) {
    console.log('Componentes criados:', components);
    
    // Exemplo: focar no primeiro campo
    const emailComponent = components.get('email');
    if (emailComponent) {
      emailComponent.instance.focus();
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log('Form Data:', this.userForm.value);
    }
  }
}
```

## 🎯 Uso Avançado - Formulário Empresarial

### 2. Formulário Complexo com Actions

```typescript
@Component({
  selector: 'app-enterprise-form',
  template: `
    <div class="enterprise-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Cadastro de Funcionário</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="employeeForm">
            <ng-container 
              dynamicFieldLoader 
              [fields]="employeeFields" 
              [formGroup]="employeeForm"
              (componentsCreated)="onEmployeeComponentsCreated($event)">
            </ng-container>
          </form>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-button (click)="saveAsDraft()">Salvar Rascunho</button>
          <button mat-raised-button color="primary" (click)="submitEmployee()">
            Cadastrar
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    DynamicFieldLoaderDirective,
    MatCardModule,
    MatButtonModule
  ]
})
export class EnterpriseFormComponent {
  employeeForm: FormGroup;
  employeeFields: FieldMetadata[] = [];
  componentRefs = new Map<string, any>();

  constructor(private fb: FormBuilder) {
    this.setupEnterpriseForm();
  }

  private setupEnterpriseForm() {
    this.employeeFields = [
      // Seção: Dados Pessoais
      {
        name: 'fullName',
        label: 'Nome Completo',
        controlType: 'input',
        required: true,
        maxLength: 100,
        group: 'personal'
      },
      {
        name: 'email',
        label: 'Email Corporativo',
        controlType: 'input',
        inputType: 'email',
        required: true,
        autocomplete: 'email'
      },
      {
        name: 'phone',
        label: 'Telefone',
        controlType: 'input',
        inputType: 'tel',
        mask: '(00) 00000-0000'
      },
      
      // Seção: Dados Profissionais
      {
        name: 'department',
        label: 'Departamento',
        controlType: 'select',
        required: true,
        endpoint: '/api/departments',
        group: 'professional'
      },
      {
        name: 'position',
        label: 'Cargo',
        controlType: 'select',
        required: true,
        dependencyFields: ['department']
      },
      {
        name: 'startDate',
        label: 'Data de Início',
        controlType: 'date',
        required: true,
        minDate: new Date()
      },
      
      // Seção: Observações
      {
        name: 'notes',
        label: 'Observações',
        controlType: 'textarea',
        maxLength: 500,
        showCharacterCount: true,
        rows: 4
      },
      
      // Ações
      {
        name: 'validateBtn',
        label: 'Validar Dados',
        controlType: 'button',
        action: 'validateForm',
        variant: 'stroked',
        icon: 'check_circle'
      },
      {
        name: 'draftBtn',
        label: 'Salvar Rascunho',
        controlType: 'button',
        action: 'saveFormDraft:employeeForm',
        variant: 'basic',
        icon: 'save_alt'
      }
    ];

    // Criar FormGroup
    this.employeeForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      department: ['', Validators.required],
      position: ['', Validators.required],
      startDate: ['', Validators.required],
      notes: ['', Validators.maxLength(500)],
      validateBtn: [''],
      draftBtn: ['']
    });

    // Setup dependencies
    this.setupFieldDependencies();
  }

  private setupFieldDependencies() {
    // Quando departamento mudar, recarregar opções de cargo
    this.employeeForm.get('department')?.valueChanges.subscribe(deptId => {
      if (deptId) {
        // Recarregar opções do campo position
        const positionComponent = this.componentRefs.get('position');
        if (positionComponent) {
          // Disparar ação para recarregar opções
          positionComponent.instance.executeAction('refreshOptions:position');
        }
      }
    });
  }

  onEmployeeComponentsCreated(components: Map<string, any>) {
    this.componentRefs = components;
    console.log('Componentes empresariais criados:', components);

    // Auto-focus no primeiro campo
    const firstComponent = components.get('fullName');
    if (firstComponent) {
      setTimeout(() => firstComponent.instance.focus(), 100);
    }
  }

  saveAsDraft() {
    // Ação será executada via built-in action do botão
    const draftBtn = this.componentRefs.get('draftBtn');
    if (draftBtn) {
      draftBtn.instance.executeAction();
    }
  }

  submitEmployee() {
    if (this.employeeForm.valid) {
      // API call via built-in action
      const apiData = {
        ...this.employeeForm.value,
        submittedAt: new Date().toISOString()
      };
      
      console.log('Submitting employee data:', apiData);
      // Implementar chamada para API de cadastro
    }
  }
}
```

## 🔄 Uso Dinâmico - Campos Configuráveis

### 3. Formulário Configurado por API

```typescript
@Component({
  selector: 'app-configurable-form',
  template: `
    <div class="configurable-form">
      <mat-toolbar>
        <span>Formulário Configurável</span>
        <span class="spacer"></span>
        <button mat-icon-button (click)="reloadConfiguration()">
          <mat-icon>refresh</mat-icon>
        </button>
      </mat-toolbar>

      <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>

      <div class="form-content" *ngIf="!loading">
        <form [formGroup]="dynamicForm">
          <ng-container 
            dynamicFieldLoader 
            [fields]="configFields" 
            [formGroup]="dynamicForm"
            (componentsCreated)="onDynamicComponentsCreated($event)">
          </ng-container>
        </form>

        <div class="form-actions">
          <button mat-button (click)="resetForm()">Limpar</button>
          <button mat-button (click)="previewData()">Preview</button>
          <button mat-raised-button color="primary" (click)="submitForm()">
            Enviar
          </button>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DynamicFieldLoaderDirective,
    MatToolbarModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    CommonModule
  ]
})
export class ConfigurableFormComponent implements OnInit {
  dynamicForm: FormGroup = new FormGroup({});
  configFields: FieldMetadata[] = [];
  loading = true;
  componentRefs = new Map<string, any>();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    await this.loadFormConfiguration();
  }

  private async loadFormConfiguration() {
    this.loading = true;
    
    try {
      // Carregar configuração do backend
      const config = await this.http.get<any>('/api/form-config/user-survey').toPromise();
      
      this.configFields = config.fields;
      this.dynamicForm = this.createFormGroupFromConfig(config.fields);
      
      console.log('Configuração carregada:', config);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      this.handleConfigurationError();
    } finally {
      this.loading = false;
    }
  }

  private createFormGroupFromConfig(fields: FieldMetadata[]): FormGroup {
    const group: any = {};

    fields.forEach(field => {
      const validators = this.buildValidators(field);
      const defaultValue = field.defaultValue || '';
      
      group[field.name] = [defaultValue, validators];
    });

    return this.fb.group(group);
  }

  private buildValidators(field: FieldMetadata): any[] {
    const validators: any[] = [];

    if (field.required) {
      validators.push(Validators.required);
    }
    
    if (field.validators?.email) {
      validators.push(Validators.email);
    }
    
    if (field.validators?.minLength) {
      validators.push(Validators.minLength(field.validators.minLength));
    }
    
    if (field.validators?.maxLength) {
      validators.push(Validators.maxLength(field.validators.maxLength));
    }

    if (field.validators?.pattern) {
      validators.push(Validators.pattern(field.validators.pattern));
    }

    return validators;
  }

  onDynamicComponentsCreated(components: Map<string, any>) {
    this.componentRefs = components;
    
    // Log dos componentes criados
    components.forEach((ref, name) => {
      console.log(`Componente ${name} criado:`, ref.instance);
    });

    // Configurar comportamentos especiais
    this.setupSpecialBehaviors();
  }

  private setupSpecialBehaviors() {
    // Exemplo: Auto-save a cada 30 segundos
    if (this.componentRefs.size > 0) {
      setInterval(() => {
        this.autoSave();
      }, 30000);
    }

    // Exemplo: Validação em tempo real para campos críticos
    const criticalFields = ['email', 'cpf', 'phone'];
    criticalFields.forEach(fieldName => {
      const component = this.componentRefs.get(fieldName);
      if (component) {
        // Adicionar validação em tempo real
        component.instance.formControl()?.valueChanges.subscribe((value: any) => {
          this.validateCriticalField(fieldName, value);
        });
      }
    });
  }

  private validateCriticalField(fieldName: string, value: any) {
    // Implementar validação específica
    console.log(`Validando campo crítico ${fieldName}:`, value);
  }

  private autoSave() {
    if (this.dynamicForm.dirty) {
      // Salvar automaticamente no localStorage
      const draftData = {
        formData: this.dynamicForm.value,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem('auto-draft-survey', JSON.stringify(draftData));
      console.log('Auto-save realizado');
    }
  }

  async reloadConfiguration() {
    await this.loadFormConfiguration();
  }

  resetForm() {
    this.dynamicForm.reset();
    
    // Executar ação de clear via componentes
    this.componentRefs.forEach(component => {
      if (component.instance.clearValue) {
        component.instance.clearValue();
      }
    });
  }

  previewData() {
    console.log('Preview dos dados:', {
      formValue: this.dynamicForm.value,
      formValid: this.dynamicForm.valid,
      formErrors: this.getFormErrors()
    });
  }

  private getFormErrors(): any {
    const errors: any = {};
    
    Object.keys(this.dynamicForm.controls).forEach(key => {
      const control = this.dynamicForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    
    return errors;
  }

  async submitForm() {
    if (this.dynamicForm.valid) {
      try {
        const response = await this.http.post('/api/form-submissions', {
          formId: 'user-survey',
          data: this.dynamicForm.value,
          metadata: {
            submittedAt: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        }).toPromise();

        console.log('Formulário enviado com sucesso:', response);
        
        // Limpar auto-save após envio bem-sucedido
        localStorage.removeItem('auto-draft-survey');
        
      } catch (error) {
        console.error('Erro ao enviar formulário:', error);
      }
    } else {
      console.warn('Formulário inválido:', this.getFormErrors());
    }
  }

  private handleConfigurationError() {
    // Configuração fallback em caso de erro
    this.configFields = [
      {
        name: 'errorFallback',
        label: 'Erro ao carregar configuração',
        controlType: 'input',
        disabled: true,
        defaultValue: 'Tente recarregar a página'
      }
    ];
    
    this.dynamicForm = this.fb.group({
      errorFallback: [{value: 'Erro de configuração', disabled: true}]
    });
  }
}
```

## 🎮 Casos de Uso Específicos

### 4. Formulário Multi-Step com Navegação

```typescript
@Component({
  selector: 'app-multi-step-form',
  template: `
    <mat-horizontal-stepper #stepper>
      <mat-step 
        *ngFor="let step of formSteps; let i = index"
        [label]="step.label"
        [completed]="isStepCompleted(i)">
        
        <form [formGroup]="getStepForm(i)">
          <ng-container 
            dynamicFieldLoader 
            [fields]="step.fields" 
            [formGroup]="getStepForm(i)"
            (componentsCreated)="onStepComponentsCreated(i, $event)">
          </ng-container>
        </form>

        <div class="step-actions">
          <button mat-button matStepperPrevious *ngIf="i > 0">
            Anterior
          </button>
          <button mat-button matStepperNext [disabled]="!isStepValid(i)">
            Próximo
          </button>
          <button mat-raised-button color="primary" *ngIf="i === formSteps.length - 1"
                  (click)="submitAllSteps()" [disabled]="!allStepsValid()">
            Finalizar
          </button>
        </div>
      </mat-step>
    </mat-horizontal-stepper>
  `
})
export class MultiStepFormComponent {
  formSteps = [
    {
      label: 'Dados Pessoais',
      fields: [/* campos do step 1 */],
      form: new FormGroup({})
    },
    {
      label: 'Endereço',
      fields: [/* campos do step 2 */],
      form: new FormGroup({})
    },
    {
      label: 'Confirmação',
      fields: [/* campos do step 3 */],
      form: new FormGroup({})
    }
  ];

  // Implementação dos métodos de controle de steps...
}
```

### 5. MaterialSelect com Busca e Chips

Exemplo de metadata utilizando os novos subcomponentes do `MaterialSelectComponent`:

```typescript
const fruitField: MaterialSelectMetadata = {
  name: 'favoriteFruits',
  label: 'Frutas Favoritas',
  controlType: 'select',
  multiple: true,
  multipleDisplay: 'chips',
  searchable: true,
  showSelectAll: true,
  options: [
    { value: 'apple', text: 'Maçã', group: 'Comuns' },
    { value: 'banana', text: 'Banana', group: 'Comuns' },
    { value: 'grape', text: 'Uva', group: 'Outras' }
  ]
};
```

## 🔧 Integração com Testes

### 5. Testando Formulários Dinâmicos

```typescript
describe('DynamicFormIntegration', () => {
  let component: MyDynamicFormComponent;
  let fixture: ComponentFixture<MyDynamicFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyDynamicFormComponent, DynamicFieldLoaderDirective]
    });
    
    fixture = TestBed.createComponent(MyDynamicFormComponent);
    component = fixture.componentInstance;
  });

  it('should create dynamic components based on metadata', async () => {
    component.fields = [
      { name: 'test', controlType: 'input', label: 'Test' }
    ];
    
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.componentRefs.has('test')).toBe(true);
  });

  it('should validate form data correctly', () => {
    component.setupValidForm();
    fixture.detectChanges();

    expect(component.dynamicForm.valid).toBe(true);
  });
});
```

## 📚 Dicas e Melhores Práticas

### ✅ **Do's (Fazer)**

1. **Sempre validar inputs**: FormGroup deve ter controls correspondentes aos field names
2. **Usar TypeScript**: Tipar FieldMetadata corretamente para melhor IntelliSense
3. **Gerenciar lifecycle**: Capturar componentsCreated para controle adicional
4. **Implementar error handling**: Tratar erros de carregamento de componentes
5. **Otimizar performance**: Usar OnPush change detection quando possível

### ❌ **Don'ts (Não Fazer)**

1. **Não modificar fields diretamente**: Sempre criar novo array para trigger change detection
2. **Não ignorar ComponentRef cleanup**: Deixar Angular gerenciar o lifecycle
3. **Não misturar estratégias**: Usar OU diretiva OU componentes manuais, não ambos
4. **Não esquecer FormControl**: Todo field deve ter control correspondente
5. **Não sobregerar metadata**: Manter configurações simples e focadas

---

**Esta diretiva transforma metadados JSON em interfaces funcionais, proporcionando máxima flexibilidade com mínima complexidade!** 🚀