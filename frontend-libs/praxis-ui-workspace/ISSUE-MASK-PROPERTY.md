# 🎭 ISSUE: Implementar Sistema de Máscaras para Inputs Dinâmicos

**Prioridade**: 🔴 ALTA  
**Tipo**: Feature / Enhancement  
**Componentes Afetados**: `@praxis/core`, `@praxis/dynamic-fields`  
**Impacto**: Funcionalidade essencial para formulários corporativos  

---

## 📋 Contexto

A propriedade `mask` é amplamente utilizada em formulários corporativos para formatação automática de campos como CPF, CNPJ, telefone, CEP, etc. Atualmente, esta funcionalidade está sendo referenciada no código mas não está implementada, causando erros de compilação e falhas de funcionalidade.

---

## 🎯 Objetivo

Implementar um sistema completo de máscaras para os componentes de input dinâmicos, permitindo formatação automática durante a digitação e mantendo compatibilidade com Angular Material e Reactive Forms.

---

## 📝 Requisitos Funcionais

### 1. **Definir Propriedade mask em MaterialInputMetadata**

```typescript
export interface MaterialInputMetadata extends FieldMetadata {
  // ... existing properties
  
  /** 
   * Padrão de máscara para formatação automática
   * @example '000.000.000-00' para CPF
   * @example '(00) 00000-0000' para telefone
   */
  mask?: string;
  
  /** 
   * Caracteres especiais e seus patterns de validação
   * @default { '0': /[0-9]/, 'A': /[A-Za-z]/, 'S': /[A-Za-z0-9]/ }
   */
  maskPatterns?: Record<string, RegExp>;
  
  /** 
   * Se deve retornar valor sem máscara no modelo
   * @default false
   */
  unmask?: boolean;
  
  /** 
   * Caractere placeholder para posições vazias
   * @default '_'
   */
  maskPlaceholder?: string;
  
  /** 
   * Se deve mostrar máscara mesmo com campo vazio
   * @default false
   */
  showMaskTyped?: boolean;
  
  /** 
   * Se deve manter caracteres fixos ao limpar
   * @default true
   */
  keepCharPositions?: boolean;
}
```

### 2. **Máscaras Pré-definidas Comuns**

```typescript
export const MASK_PRESETS = {
  CPF: '000.000.000-00',
  CNPJ: '00.000.000/0000-00',
  CEP: '00000-000',
  TELEFONE: '(00) 0000-0000',
  CELULAR: '(00) 00000-0000',
  RG: '00.000.000-0',
  CARTAO_CREDITO: '0000 0000 0000 0000',
  DATA_BR: '00/00/0000',
  HORA: '00:00',
  MOEDA_BR: 'R$ 0.000,00',
  PLACA_VEICULO: 'AAA-0000',
  PLACA_MERCOSUL: 'AAA0A00'
} as const;
```

### 3. **Diretiva de Máscara**

```typescript
@Directive({
  selector: '[pdxMask]',
  standalone: true
})
export class MaskDirective implements OnInit, OnDestroy {
  @Input() pdxMask: string = '';
  @Input() pdxMaskPatterns?: Record<string, RegExp>;
  @Input() pdxUnmask: boolean = false;
  @Input() pdxMaskPlaceholder: string = '_';
  
  // Implementação da lógica de máscara
}
```

### 4. **Integração com MaterialInputComponent**

```typescript
@Component({
  selector: 'pdx-material-input',
  template: `
    <mat-form-field>
      <input 
        matInput
        [pdxMask]="metadata()?.mask"
        [pdxMaskPatterns]="metadata()?.maskPatterns"
        [pdxUnmask]="metadata()?.unmask"
        ...
      />
    </mat-form-field>
  `
})
export class MaterialInputComponent {
  // Integração com sistema de máscaras
}
```

---

## 🧪 Casos de Teste

### 1. **Máscaras Básicas**
```typescript
it('should format CPF correctly', () => {
  const input = '11122233344';
  const expected = '111.222.333-44';
  // teste...
});

it('should format phone with 9 digits', () => {
  const input = '11999887766';
  const expected = '(11) 99988-7766';
  // teste...
});
```

### 2. **Valor Sem Máscara**
```typescript
it('should return unmasked value when unmask=true', () => {
  const displayed = '111.222.333-44';
  const modelValue = '11122233344';
  // teste...
});
```

### 3. **Validação com Máscara**
```typescript
it('should validate masked input correctly', () => {
  const mask = '000.000.000-00';
  const validInput = '123.456.789-10';
  const invalidInput = 'ABC.DEF.GHI-JK';
  // teste...
});
```

---

## 📊 Exemplos de Uso

### Exemplo 1: CPF com Máscara
```typescript
const cpfField: MaterialInputMetadata = {
  name: 'cpf',
  label: 'CPF',
  controlType: 'input',
  mask: '000.000.000-00',
  unmask: true, // Valor no modelo sem pontos e traço
  required: true,
  validators: {
    pattern: /^\d{11}$/ // Valida valor sem máscara
  }
};
```

### Exemplo 2: Telefone Dinâmico
```typescript
const telefoneField: MaterialInputMetadata = {
  name: 'telefone',
  label: 'Telefone',
  controlType: 'input',
  mask: '(00) 00000-0000',
  maskPatterns: {
    '0': /[0-9]/
  },
  showMaskTyped: true,
  hint: 'Digite apenas números'
};
```

### Exemplo 3: Máscara Customizada
```typescript
const placaField: MaterialInputMetadata = {
  name: 'placa',
  label: 'Placa do Veículo',
  controlType: 'input',
  mask: 'AAA-0A00', // Placa Mercosul
  maskPatterns: {
    'A': /[A-Z]/,
    '0': /[0-9]/
  },
  textTransform: 'uppercase'
};
```

---

## 🔧 Considerações Técnicas

### 1. **Bibliotecas Sugeridas**
- **ngx-mask**: Mais popular e mantida
- **angular2-text-mask**: Alternativa robusta
- **Implementação própria**: Para controle total

### 2. **Performance**
- Usar ChangeDetectionStrategy.OnPush
- Debounce em máscaras complexas
- Lazy loading da diretiva

### 3. **Acessibilidade**
- Anunciar formato esperado via aria-label
- Manter compatibilidade com leitores de tela
- Feedback claro de erros de formato

### 4. **Integração com Validadores**
```typescript
// Validador customizado para CPF com máscara
export function cpfValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  const unmasked = value?.replace(/\D/g, '');
  
  if (!unmasked || !isValidCPF(unmasked)) {
    return { cpf: { message: 'CPF inválido' } };
  }
  
  return null;
}
```

---

## 📋 Critérios de Aceitação

- [ ] Interface `MaterialInputMetadata` atualizada com propriedades de máscara
- [ ] Diretiva `MaskDirective` implementada e testada
- [ ] Integração completa com `MaterialInputComponent`
- [ ] Máscaras pré-definidas para casos comuns brasileiros
- [ ] Suporte a valor com e sem máscara (unmask)
- [ ] Validação funciona corretamente com máscaras
- [ ] Testes unitários com cobertura > 90%
- [ ] Documentação com exemplos práticos
- [ ] Performance adequada (< 50ms para aplicar máscara)
- [ ] Compatibilidade com copy/paste

---

## 📊 Estimativa

- **Esforço**: 16-24 horas
- **Complexidade**: Média-Alta
- **Riscos**: Integração com validadores existentes

### Breakdown:
1. Definir interfaces e tipos: 2h
2. Implementar diretiva de máscara: 8h
3. Integrar com MaterialInput: 4h
4. Criar máscaras pré-definidas: 2h
5. Testes unitários: 4h
6. Documentação e exemplos: 4h

---

## 🎯 Definição de Pronto

- [ ] Código implementado seguindo padrões do projeto
- [ ] Todos os testes passando
- [ ] Documentação JSDoc completa
- [ ] Exemplos funcionais no Storybook
- [ ] Code review aprovado
- [ ] Sem breaking changes
- [ ] Máscaras brasileiras funcionando (CPF, CNPJ, CEP, etc.)

---

## 📚 Referências

- [ngx-mask Documentation](https://github.com/JsDaddy/ngx-mask)
- [Angular Text Mask](https://github.com/text-mask/text-mask)
- [Material Design - Text Fields](https://material.io/components/text-fields)
- [WCAG 2.1 - Input Formatting](https://www.w3.org/WAI/WCAG21/Understanding/input-purpose.html)

---

**Data de Criação**: 2025-07-29  
**Relacionado**: CRITICAL-ISSUES-DYNAMIC-FIELDS.md