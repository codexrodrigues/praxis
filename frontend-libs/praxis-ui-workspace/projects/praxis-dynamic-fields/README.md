# Praxis Dynamic Fields

Sistema simplificado de campos dinâmicos para aplicações corporativas Angular com Material Design.

## ✨ Características

- **Registro Simplificado**: Sistema de registro de componentes focado no essencial
- **Lazy Loading**: Carregamento sob demanda com cache inteligente
- **Material Design**: Componentes baseados no Angular Material
- **Color Picker**: Novo componente de seleção de cores com suporte a paleta e canvas
- **Novos Componentes**: Toggle, Slider, Time Picker e Rating
- **Material Select Modular**: Fragmentado em subcomponentes (SearchInput, OptionsList e Chips)
- **TypeScript**: Totalmente tipado com integração do `@praxis/core`
- **Corporativo**: Adequado para cenários empresariais

## 🏗️ Arquitetura

### Sistema de Registro

```typescript
import { ComponentRegistryService } from '@praxis/dynamic-fields';
import { FieldControlType } from '@praxis/core';

// Obter componente usando constantes
const component = await registry.getComponent(FieldControlType.INPUT);

// Verificar registro
const isRegistered = registry.isRegistered(FieldControlType.INPUT);
```

### Componentes Suportados

O sistema usa as constantes do `@praxis/core` para garantir consistência:

- `FieldControlType.INPUT` - Campo de texto Material Design
- `FieldControlType.TEXTAREA` - Área de texto Material Design  
- `FieldControlType.SELECT` - Campo de seleção Material Design
- `FieldControlType.CHECKBOX` - Caixa de seleção Material Design
- `FieldControlType.RADIO` - Botão de rádio Material Design
- `FieldControlType.DATE_PICKER` - Seletor de data Material Design
- `FieldControlType.EMAIL_INPUT` - Campo de email
- `FieldControlType.PASSWORD` - Campo de senha
- `FieldControlType.CURRENCY_INPUT` - Campo monetário
- `FieldControlType.NUMERIC_TEXT_BOX` - Campo numérico
- `FieldControlType.MULTI_SELECT` - Seleção múltipla
- `FieldControlType.AUTO_COMPLETE` - Auto completar
- `FieldControlType.DATE_TIME_PICKER` - Data e hora
- `FieldControlType.DATE_RANGE` - Intervalo de datas
- `FieldControlType.FILE_UPLOAD` - Upload de arquivos
- `FieldControlType.TOGGLE` - Interruptor Material Design
- `FieldControlType.SLIDER` - Slider Material Design
- `FieldControlType.TIME_PICKER` - Seletor de horário
- `FieldControlType.RATING` - Classificação por estrelas
- `FieldControlType.COLOR_PICKER` - Seletor de cores

## 🧩 MaterialSelectComponent

O `MaterialSelectComponent` agora está dividido em subcomponentes menores para facilitar manutenção e testes:

- **SelectSearchInputComponent** - Campo de busca opcional exibido dentro do painel.
- **SelectOptionsListComponent** - Lista de opções com suporte a grupos e virtualização.
- **SelectChipsComponent** - Exibe as opções selecionadas como chips quando `multipleDisplay` é `"chips"`.

Esses subcomponentes são utilizados internamente pelo select e não exigem alterações na utilização normal do componente.

## 📦 Instalação

```bash
npm install @praxis/dynamic-fields
```

## 🚀 Uso Básico

```typescript
import { ComponentRegistryService } from '@praxis/dynamic-fields';
import { FieldControlType } from '@praxis/core';

@Component({
  selector: 'app-dynamic-form',
  template: `<ng-container #dynamicContainer></ng-container>`
})
export class DynamicFormComponent {
  @ViewChild('dynamicContainer', { read: ViewContainerRef }) 
  container!: ViewContainerRef;

  constructor(private registry: ComponentRegistryService) {}

  async loadField(type: FieldControlType) {
    const component = await this.registry.getComponent(type);
    if (component) {
      this.container.createComponent(component);
    }
  }

  // Exemplo prático
  async loadInputField() {
    await this.loadField(FieldControlType.INPUT);
  }

  async loadDatePicker() {
    await this.loadField(FieldControlType.DATE_PICKER);
  }

  async loadColorPicker() {
    await this.loadField(FieldControlType.COLOR_PICKER);
  }
}
```

## 🔧 Registrar Componente Customizado

```typescript
import { FieldControlType } from '@praxis/core';

// Registrar componente customizado - SUPER SIMPLES!
registry.register(
  'customField' as FieldControlType,
  () => import('./custom-field.component').then(m => m.CustomFieldComponent)
);

// Uso posterior
const customComponent = await registry.getComponent('customField' as FieldControlType);
```

## 📊 Estatísticas

```typescript
const stats = registry.getStats();
console.log(stats);
// {
//   registeredComponents: 7,
//   cachedComponents: 3,
//   registeredTypes: ['input', 'select', ...]
// }
```

## 🛠️ API

### ComponentRegistryService

#### Métodos Principais

- `register<T>(type, factory)` - Registra componente (ultra-simples!)
- `getComponent<T>(type)` - Obtém componente (async)
- `isRegistered(type)` - Verifica se está registrado
- `getRegisteredTypes()` - Lista tipos registrados

#### Métodos Utilitários

- `getStats()` - Estatísticas do registro
- `clearCache(type?)` - Limpa cache
- `unregister(type)` - Remove componente
- `preload(types[])` - Pré-carrega componentes

### Interfaces

```typescript
interface RegistryStats {
  registeredComponents: number;
  cachedComponents: number;
  registeredTypes: FieldControlType[];
}

interface ComponentRegistration {
  factory: () => Promise<Type<any>>;
  cached?: Type<any>;
}
```

## 🎯 Integração com @praxis/core

Esta biblioteca usa os tipos e metadados do `@praxis/core`:

- `FieldControlType` - Tipos de controle unificados
- `UnifiedFieldMetadata` - Sistema de metadados corporativo
- `MaterialInputMetadata`, `MaterialSelectMetadata`, etc. - Metadados específicos

## 📋 Desenvolvimento

```bash
# Build da biblioteca
ng build praxis-dynamic-fields

# Testes
ng test praxis-dynamic-fields

# Lint
ng lint praxis-dynamic-fields
```

## 🏷️ Versão

**Versão atual**: Sistema simplificado pós-refatoração
**Dependências**: `@praxis/core`, `@angular/material`
**Angular**: 19+
**TypeScript**: 5.8+

---

*Sistema desenvolvido seguindo as diretrizes do CLAUDE.md - focado no essencial, sem complexidades desnecessárias.*