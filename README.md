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
├── backend-libs/
│   ├── uifieldspec-core/           # Anotações, propriedades e extensões para definição de campos UI
│   └── uifieldspec-springdoc/      # Integração com SpringDoc OpenAPI para gerar metadados `x-ui`
│
├── examples/
│   └── praxis-java-api/            # Projeto de exemplo com domínio de Recursos Humanos
│
├── packages/
│   ├── praxis-ui/                  # Biblioteca Angular para renderização de formulários dinâmicos
│   └── praxis-schema-adapter/     # Parser que traduz OpenAPI + x-ui para estrutura de UI interna
│
├── docs/                           # Documentação técnica e guias de uso
└── README.md
