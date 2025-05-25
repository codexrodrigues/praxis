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
│   ├── praxis-bom/
│   ├── praxis-metadata-core/
│   ├── praxis-metadata-springdoc/
│   └── praxis-spring-boot-starter/
│
├── docs/
│   └── getting-started.md
└── README.md

---

## 📚 Módulos `backend-libs`

Os módulos `backend-libs` são o coração da plataforma Praxis no lado do servidor, fornecendo as ferramentas necessárias para definir e expor metadados de UI.

### `praxis-bom` (Bill of Materials)

Este módulo funciona como um **Bill of Materials (BOM)**. Ele centraliza o gerenciamento das versões das bibliotecas Praxis, garantindo que todas as dependências sejam compatíveis entre si. Ao incluir o `praxis-bom` no seu projeto, você não precisa especificar as versões de cada artefato Praxis individualmente.

### `praxis-metadata-core`

É o módulo central que fornece as anotações e interfaces Java para a definição de metadados de UI. Ele inclui:

-   **Anotações Principais**: `@UISchema` para definir a estrutura geral de um formulário ou grid, e `@UIExtension` para adicionar propriedades específicas de componentes.
-   **Metadados Dinâmicos**: Permite a criação de especificações de UI que podem ser processadas em tempo de execução para gerar interfaces dinâmicas.
-   **Capacidades de Filtragem**: Oferece funcionalidades para definir filtros dinâmicos baseados nos metadados.

### `praxis-metadata-springdoc`

Este módulo integra os metadados de UI do Praxis com o SpringDoc (uma biblioteca popular para gerar documentação OpenAPI a partir de aplicações Spring Boot). Suas principais funções são:

-   **Exposição de Schemas Enriquecidos**: Cria um endpoint (normalmente em `/schemas/filtered` ou similar) que serve a especificação OpenAPI da sua API, enriquecida com as extensões `x-ui` (definidas pelo `praxis-metadata-core`).
-   **Contrato para o Frontend**: Permite que aplicações frontend (como as construídas com Angular e `praxis-ui`) consumam esses schemas para renderizar formulários, grids e outros componentes dinamicamente.

### `praxis-spring-boot-starter`

O `praxis-spring-boot-starter` simplifica a integração do Praxis em aplicações Spring Boot. Ele realiza a auto-configuração dos componentes essenciais e gerencia as dependências necessárias, facilitando o uso dos módulos `praxis-metadata-core` e `praxis-metadata-springdoc`. Com este starter, a configuração inicial da plataforma Praxis no backend é significativamente reduzida.

---

## 🔗 Integração dos Módulos `backend-libs`

Os módulos `backend-libs` são projetados para funcionar em conjunto de forma coesa:

1.  **`praxis-bom`**: Garante que você esteja utilizando versões compatíveis de todos os módulos Praxis.
2.  **`praxis-metadata-core`**: Você utiliza suas anotações nos seus DTOs e entidades Java para definir como a UI deve ser gerada.
3.  **`praxis-metadata-springdoc`**: Se você estiver usando Spring Boot e SpringDoc, este módulo expõe automaticamente os metadados definidos pelo `praxis-metadata-core` através de um endpoint OpenAPI.
4.  **`praxis-spring-boot-starter`**: Facilita a inclusão e configuração de todos esses componentes em uma aplicação Spring Boot, tornando o processo de setup mais rápido e menos propenso a erros.

Essa arquitetura modular permite que o frontend obtenha todas as informações necessárias para renderizar interfaces complexas diretamente da API, com base nas definições de metadados do backend.

---

*Conceitualmente, a plataforma também pode incluir componentes frontend (como `praxis-ui` para Angular e `praxis-schema-adapter` para normalização de metadados), mas estes não estão presentes neste repositório.*
