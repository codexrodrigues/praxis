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
- ✅ **OverlayDeciderService**: Seleção automática de modal, drawer ou página

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

## 🧭 Matriz de Decisão de Overlays

O `OverlayDeciderService` do `@praxis/core` seleciona automaticamente o padrão de overlay (`modal`, `drawer`, `page`, `bottom-sheet` ou `full-screen-dialog`) com base no dispositivo, número de campos e dependências do formulário.

```ts
import { OverlayDeciderService } from "@praxis/core";

const decider = inject(OverlayDeciderService);
const decision = decider.decide({ device: "desktop", fieldCount: 18, dependencyCount: 5 });
// => { pattern: 'drawer', config: { side: 'end', width: 'min(45vw, 920px)', modal: true, footerFixed: true }, reason: 'Formulário médio...' }
```

É possível sobrescrever a matriz padrão usando `provideOverlayDecisionMatrix` na configuração da aplicação.

### Usar em seu projeto

```bash
npm install @praxis/core @praxis/table @praxis/visual-builder @praxis/specification
```

## 📝 Uso Básico

### Configuração Simples de Tabela

```typescript
import { TableConfig } from "@praxis/core";
import { PraxisTable } from "@praxis/table";

@Component({
  selector: "app-example",
  template: ` <praxis-table [config]="tableConfig" [data]="tableData"> </praxis-table> `,
})
export class ExampleComponent {
  tableConfig: TableConfig = {
    columns: [
      { field: "id", header: "ID", type: "number" },
      { field: "name", header: "Nome", type: "string" },
      { field: "email", header: "Email", type: "string" },
    ],
    behavior: {
      pagination: { enabled: true, pageSize: 10 },
      sorting: { enabled: true, multiSort: false },
      filtering: { enabled: true },
    },
  };

  tableData = [
    { id: 1, name: "João", email: "joao@example.com" },
    { id: 2, name: "Maria", email: "maria@example.com" },
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

## 🔗 Integração com Backend (Praxis Metadata Core)

O ecossistema Praxis é projetado para uma integração transparente entre o frontend e o backend. As bibliotecas do `praxis-ui-workspace` são otimizadas para consumir metadados de UI fornecidos por um backend que utiliza o **`praxis-metadata-core`**.

### Fluxo de Metadados

1.  **Definição no Backend**: Desenvolvedores backend utilizam a anotação `@UISchema` nos seus DTOs Java para definir como cada campo deve ser apresentado e validado na UI (tipo de controle, rótulo, obrigatoriedade, etc.).

    ```java
    // Exemplo de DTO no backend (praxis-metadata-core)
    public class CargoDTO {
        @UISchema(label = "Código", readOnly = true)
        private Long id;

        @UISchema(label = "Nome do Cargo", required = true)
        private String nome;
    }
    ```

2.  **Exposição via API**: O backend expõe esses metadados através de um endpoint específico, geralmente `/api/{recurso}/schemas` ou, de forma mais centralizada, em `/schemas/filtered`.

3.  **Consumo no Frontend**: A biblioteca `@praxis/core`, através do `GenericCrudService`, busca esses metadados.

    ```typescript
    // Exemplo de uso no frontend
    import { GenericCrudService } from "@praxis/core";

    @Injectable({ providedIn: "root" })
    export class CargoService extends GenericCrudService<Cargo> {
      constructor(http: HttpClient, schemaNormalizer: SchemaNormalizerService, apiUrl: ApiUrlConfig) {
        super(http, schemaNormalizer, apiUrl);
        this.configure("human-resources/cargos"); // Configura o endpoint base
      }
    }
    ```

4.  **Renderização Dinâmica**: O `GenericCrudService` utiliza o método `getFilteredSchema` para obter a configuração da UI. Essa configuração é então passada para componentes como o `<praxis-table>`, que a utiliza para renderizar colunas, filtros e formulários de edição dinamicamente, sem a necessidade de definir a estrutura no código do frontend.

    ```typescript
    // Componente que usa o serviço para obter o schema
    this.cargoService.getFilteredSchema({ path: "/api/human-resources/cargos" }).subscribe((fieldDefinitions) => {
      // As fieldDefinitions são usadas para construir a configuração da tabela
      const tableConfig = this.buildTableConfig(fieldDefinitions);
      this.tableConfig = tableConfig;
    });
    ```

### Aplicação de Exemplo

O projeto `praxis-backend-libs-sample-app` no repositório serve como uma implementação de referência completa de um backend que utiliza o `praxis-metadata-core` e expõe as APIs necessárias para alimentar o `praxis-ui-workspace`. Ele é fundamental para testar a integração e entender o fluxo de ponta a ponta.

## 🏢 Consumo via Metadados em Ambientes Corporativos

O `praxis-ui-workspace` foi pensado para organizações que padronizam suas interfaces por meio de **metadados**. A seguir algumas recomendações para adoção em ambientes corporativos:

1. **Centralize a configuração de APIs**
   - Utilize `ApiUrlConfig` ou arquivos de `environment` para definir o `baseApiUrl`.
   - Empregue variáveis de ambiente para separar staging, homologação e produção.

2. **Versione e valide os schemas**
   - Exponha endpoints versionados como `/schemas/v1` para garantir compatibilidade entre times.
   - Automatize a validação dos schemas em pipelines de CI/CD antes de disponibilizá-los.

3. **Segurança e governança**
   - Restrinja o acesso aos endpoints de metadados conforme as políticas internas.
   - Habilite logging estruturado para auditoria e troubleshooting.

4. **Experiência do usuário consistente**
   - Componentes como `PraxisDynamicForm` e `PraxisTable` aplicam automaticamente padrões de UX a partir dos metadados, garantindo consistência visual e comportamental entre aplicações.

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

### Persistência de Layout de Formulários

O layout dos formulários dinâmicos é armazenado localmente utilizando o
`localStorage`. Cada formulário é salvo com a chave
`praxis-layout-<formId>`, permitindo que o usuário mantenha personalizações
entre sessões. O serviço responsável por essa funcionalidade foi estruturado
para que, futuramente, seja possível substituir o mecanismo de persistência por
uma chamada REST sem alterar as chamadas no restante da aplicação.

### Contexto e Regras de Formulário

O `FormContextService` gerencia a lista de campos disponíveis, referências de componentes e
as regras de layout de cada formulário. Ele suporta múltiplos contextos, permitindo
compartilhar regras entre formulários sem conflitos. Para verificar condições de
visibilidade ou estilo, utilize as funções utilitárias em `form-rule.utils`.

### Editor de Layout com Drag & Drop

O `FormLayoutEditor` permite reorganizar visualmente fieldsets, linhas e campos
utilizando o módulo `DragDrop` do Angular CDK. As mudanças são emitidas por
eventos e podem ser persistidas via `FormLayoutService`. Essa abordagem facilita
o ajuste fino dos formulários sem modificar o código-fonte.

### Integração CRUD

O `PraxisDynamicForm` utiliza o `GenericCrudService` para buscar o schema e
persistir dados. É possível definir endpoints customizados para cada operação
por meio do input `customEndpoints`, permitindo integrar o formulário a APIs
diversas. Durante a submissão, eventos `FormSubmitEvent` são emitidos indicando
o resultado das operações de criação ou atualização, cabendo à aplicação exibir
as mensagens de sucesso ou erro ao usuário.

### Exemplo de Visualização de Registro

No módulo de **Funcionários** existe uma rota de exemplo que abre um formulário
em modo de visualização quando o usuário clica em uma linha da tabela. O
componente `FuncionariosListComponent` emite o evento `rowClick` para navegar até
`/funcionarios/view/:id`:

```html
<praxis-table resourcePath="funcionarios" [editModeEnabled]="true" (rowClick)="onRowClick($event)"></praxis-table>
```

```typescript
// funcionarios-list.component.ts
constructor(private router: Router) {}
onRowClick(event: { row: any }): void {
  this.router.navigate(['/funcionarios/view', event.row.id]);
}
```

A rota declara o componente `FuncionarioViewComponent`, que carrega o
`PraxisDynamicForm` em modo `view` para apresentar os dados do registro
selecionado:

```typescript
export const routes: Routes = [
  { path: "funcionarios", component: FuncionariosListComponent },
  { path: "funcionarios/view/:id", component: FuncionarioViewComponent },
  // ...demais rotas
];
```

```typescript
@Component({
  selector: "app-funcionario-view",
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, PraxisDynamicForm],
  template: ` <praxis-dynamic-form resourcePath="funcionarios" [resourceId]="id" mode="view"> </praxis-dynamic-form> `,
  styleUrl: "./funcionario-view.component.scss",
})
export class FuncionarioViewComponent {
  id: string | null = null;
  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((p) => (this.id = p.get("id")));
  }
}
```

Esse fluxo demonstra como utilizar o `PraxisDynamicForm` para visualizar uma
entidade e pode servir de base para cenários de edição ou criação.

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
