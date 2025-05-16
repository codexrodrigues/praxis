# Praxis

**Praxis** é uma plataforma open source para geração dinâmica de formulários e interfaces baseadas em metadados enriquecidos. Com integração entre **Java + Spring Boot** e **Angular**, o framework permite definir telas diretamente a partir de anotações e schemas, sem a necessidade de codificação manual repetitiva.

---

## 🚀 Visão geral

Com o **Praxis**, você pode:

- Gerar formulários, grids e filtros dinamicamente a partir de DTOs Java anotados
- Persistir e aplicar layouts customizados via JSON
- Reutilizar componentes UI com base em metadados padronizados (`@UISchema`, `@UIExtension`, etc.)
- Integrar com endpoints REST para CRUD completo, filtros e paginação
- Reduzir drasticamente o tempo de entrega de telas corporativas

---

## 📦 Estrutura do repositório

```bash
praxis/
├── apps/
│   └── demo-angular-app/           # ✅ Projeto Angular real com menus, formulários, grids
│
├── backend-libs/
│   ├── uifieldspec-core/           # Anotações, propriedades e extensões Java
│   └── uifieldspec-springdoc/      # Integração com SpringDoc
│
├── examples/
│   └── praxis-java-api/            # Projeto Spring Boot com domínio RH (DTOs + endpoints)
│
├── packages/
│   ├── praxis-ui/                  # Lib Angular de componentes visuais
│   └── praxis-schema-adapter/     # Serviço de parsing e normalização de metadados
│
├── docs/
│   └── getting-started.md
└── README.md

praxis-ui/ – Camada de apresentação
Contém os componentes visuais, templates, layouts e bindings.

DynamicFormComponent, DynamicFieldComponent

Componentes input, radio, date, select, etc.

FormLayoutComponent, FormFieldRendererService

Lida com reatividade, validação, exibição, eventos

Usa Angular/Kendo UI/Tailwind/etc.

📌 Não sabe nem se o metadado veio do Java ou de um arquivo JSON fixo.


praxis-schema-adapter/ – Camada de transformação
Responsável por converter schemas (ex: OpenAPI + x-ui) em objetos compatíveis com a UI.

Faz o parsing de schemas OpenAPI com extensões x-ui

Gera FieldMetadata[], FormLayout, Validators, etc.

Pode suportar outras fontes no futuro (JSONForms, GraphQL, config YAML)

Lida com complexidade de leitura, normalização, fallback, cache

Permite testes unitários do parser isoladamente

📌 Não depende de Angular — pode até ser usado em Node, SSR ou ferramentas CLI.
