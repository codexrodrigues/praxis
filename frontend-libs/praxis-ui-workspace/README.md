# Praxis UI Workspace

> Uma suíte completa de componentes UI Angular para desenvolvimento de aplicações empresariais modernas

## 🌟 Visão Geral

O Praxis UI Workspace é um monorepo Angular que contém uma coleção de bibliotecas especializadas para criação de interfaces de usuário sofisticadas e funcionais. Focado em tabelas dinâmicas, formulários adaptativos e ferramentas de configuração visual.

## 📦 Bibliotecas Incluídas

### 🎯 Praxis Core (`@praxis/core`)
**Biblioteca central com interfaces e serviços fundamentais**

- ✅ **TableConfig Unificado**: Interface moderna e type-safe para configuração de tabelas
- ✅ **Modelos de Dados**: Definições robustas para paginação, filtros e configurações
- ✅ **Serviços Base**: TableConfigService e utilitários essenciais
- ✅ **Type Guards**: Validação e verificação de tipos em runtime

### 🗃️ Praxis Table (`@praxis/table`)
**Componente de tabela avançado com recursos empresariais**

- ✅ **Arquitetura Unificada**: Eliminação da dualidade V1/V2 
- ✅ **PraxisTable**: Componente principal otimizado e simplificado
- ✅ **Editores Especializados**: Configuration editors para diferentes aspectos
- ✅ **Performance**: Virtualização e lazy loading integrados
- ✅ **Acessibilidade**: Suporte completo a screen readers e navegação por teclado

### 🎨 Praxis Visual Builder (`@praxis/visual-builder`)
**Ferramentas visuais para criação de regras e especificações**

- ✅ **Rule Builder**: Interface visual para criação de regras de negócio
- ✅ **Template System**: Sistema de templates reutilizáveis
- ✅ **DSL Integration**: Mini-DSL para expressões complexas
- ✅ **Export Integration**: Integração com sistemas externos

### 📋 Praxis Specification (`@praxis/specification`)
**Sistema de especificações e validações**

- ✅ **Field Specifications**: Definições avançadas de campos
- ✅ **Validation Engine**: Motor de validação flexível
- ✅ **Boolean Composition**: Lógica booleana complexa
- ✅ **Metadata Management**: Gerenciamento de metadados

## 🚀 Novidades da Arquitetura Unificada

### ⚡ Principais Melhorias

1. **Eliminação da Dualidade V1/V2**
   - Interface única `TableConfig` 
   - Remoção de código legacy
   - Simplificação dramática da API

2. **Type Safety Aprimorada**
   - Interfaces mais robustas
   - IntelliSense melhorado
   - Detecção de erros em compile-time

3. **Performance Otimizada**
   - Remoção de overhead de adaptação
   - Bundle size reduzido
   - Runtime mais eficiente

4. **Developer Experience**
   - API mais intuitiva
   - Documentação consolidada
   - Debugging simplificado

## 🛠️ Instalação e Configuração

### Pré-requisitos
```bash
Node.js >= 18.0.0
Angular CLI >= 18.0.0
```

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd praxis-ui-workspace

# Instalar dependências
npm install

# Build de todas as bibliotecas
npm run build

# Executar aplicação de desenvolvimento
ng serve
```

### Usar em seu projeto
```bash
npm install @praxis/core @praxis/table @praxis/visual-builder @praxis/specification
```

## 📝 Uso Básico

### Configuração Simples de Tabela
```typescript
import { TableConfig } from '@praxis/core';
import { PraxisTable } from '@praxis/table';

@Component({
  selector: 'app-example',
  template: `
    <praxis-table 
      [config]="tableConfig"
      [data]="tableData">
    </praxis-table>
  `
})
export class ExampleComponent {
  tableConfig: TableConfig = {
    columns: [
      { field: 'id', header: 'ID', type: 'number' },
      { field: 'name', header: 'Nome', type: 'string' },
      { field: 'email', header: 'Email', type: 'string' }
    ],
    behavior: {
      pagination: { enabled: true, pageSize: 10 },
      sorting: { enabled: true, multiSort: false },
      filtering: { enabled: true }
    }
  };

  tableData = [
    { id: 1, name: 'João', email: 'joao@example.com' },
    { id: 2, name: 'Maria', email: 'maria@example.com' }
  ];
}
```

### Editor Visual de Configuração
```typescript
import { PraxisTableConfigEditor } from '@praxis/table';

// Abrir editor de configuração
openConfigEditor() {
  const dialogRef = this.dialog.open(PraxisTableConfigEditor, {
    data: { config: this.tableConfig },
    width: '90vw',
    height: '90vh'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.tableConfig = result;
    }
  });
}
```

## 🧪 Testes

### Executar todos os testes
```bash
npm test
```

### Testes por biblioteca
```bash
# Core
ng test praxis-core

# Table
ng test praxis-table

# Visual Builder
ng test praxis-visual-builder

# Specification
ng test praxis-specification
```

### Coverage
```bash
npm run test:coverage
```

## 🏗️ Build e Deploy

### Build de produção
```bash
# Build de todas as bibliotecas
npm run build

# Build da aplicação principal
ng build --configuration=production
```

### Publicação (NPM)
```bash
# Build e publish de uma biblioteca específica
cd dist/praxis-core
npm publish

cd ../praxis-table  
npm publish

cd ../praxis-visual-builder
npm publish

cd ../praxis-specification
npm publish
```

## 🔧 Desenvolvimento

### Adicionando uma nova funcionalidade
1. Escolha a biblioteca apropriada
2. Crie componente/serviço na pasta correspondente
3. Adicione testes
4. Atualize exports no `public-api.ts`
5. Documente as mudanças

### Estrutura do Projeto
```
praxis-ui-workspace/
├── projects/
│   ├── praxis-core/           # Interface e serviços base
│   ├── praxis-table/          # Componentes de tabela
│   ├── praxis-visual-builder/ # Ferramentas visuais
│   └── praxis-specification/  # Sistema de especificações
├── src/                       # Aplicação demo/teste
├── docs/                      # Documentação detalhada
└── ARCHITECTURE-UNIFICATION.md # Detalhes da arquitetura
```

## 📚 Documentação

### Guias Detalhados
- [**Architecture Unification**](./ARCHITECTURE-UNIFICATION.md) - Detalhes da unificação V1/V2
- [**Integration Plan**](./INTEGRATION-PLAN.md) - Plano de integração
- [**Integration Example**](./INTEGRATION-EXAMPLE.md) - Exemplos práticos

### API Reference
- [Praxis Core API](./projects/praxis-core/README.md)
- [Praxis Table API](./projects/praxis-table/README.md)
- [Visual Builder API](./projects/praxis-visual-builder/README.md)
- [Specification API](./projects/praxis-specification/README.md)

## 🤝 Contribuição

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Guidelines
- Seguir convenções de código Angular
- Adicionar testes para novas funcionalidades
- Manter documentação atualizada
- Usar commits semânticos

## 📊 Status do Projeto

### ✅ Funcionalidades Implementadas
- Arquitetura unificada TableConfig
- Componente PraxisTable otimizado
- Editores de configuração especializados
- Sistema de validação robusto
- Suite completa de testes
- Documentação abrangente

### 🔄 Em Desenvolvimento
- Enhanced accessibility features
- Performance optimizations
- Advanced export options
- Mobile responsiveness improvements

### 📋 Roadmap
- Plugin architecture
- Theme customization
- Advanced filtering
- Real-time collaboration features

## 🛡️ Compatibilidade

### Versões Suportadas
- **Angular**: 18.x+
- **TypeScript**: 5.0+
- **Node.js**: 18.x+

### Navegadores
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 🙋‍♂️ Suporte

### Como Obter Ajuda
- 📖 Consulte a [documentação](./docs/)
- 🐛 Reporte bugs via [Issues](../../issues)
- 💬 Discussões via [Discussions](../../discussions)
- 📧 Contato direto: [suporte@praxis.com](mailto:suporte@praxis.com)

---

**Desenvolvido com ❤️ pela equipe Praxis**  
**Versão**: 2.0.0 (Unified Architecture)  
**Última atualização**: Janeiro 2025