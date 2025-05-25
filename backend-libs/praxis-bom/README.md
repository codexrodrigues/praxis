# Praxis Bill of Materials (`praxis-bom`)

Este módulo, `praxis-bom`, é um Bill of Materials (BOM) para o ecossistema de bibliotecas Praxis. Um BOM é uma forma especial de POM (`<packaging>pom</packaging>`) que centraliza o gerenciamento de versões de dependências.

## 🎯 Propósito de um BOM

Utilizar um BOM ajuda a garantir a consistência das versões das bibliotecas em seu projeto. Ao invés de especificar a versão para cada dependência individualmente, você importa o BOM, e ele cuida para que todas as bibliotecas gerenciadas por ele estejam em versões compatíveis entre si.

## 🤔 Por que usar o `praxis-bom`?

Se sua aplicação utiliza múltiplos módulos da framework Praxis (por exemplo, `praxis-metadata-core` e `praxis-spring-boot-starter`), importar o `praxis-bom` garante que você está utilizando versões desses módulos que foram testadas e projetadas para funcionar em conjunto. Isso evita conflitos de versão e simplifica o gerenciamento de suas dependências Praxis.

## 🛠️ Como Usar

Para utilizar o `praxis-bom` em seu projeto Maven, siga os passos abaixo:

1.  **Importe o `praxis-bom` na seção `<dependencyManagement>` do seu `pom.xml`:**
    Isso informa ao Maven para usar as versões definidas neste BOM para quaisquer dependências gerenciadas por ele.

    ```xml
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.praxisplatform</groupId>
                <artifactId>praxis-bom</artifactId>
                <version>1.0.0-SNAPSHOT</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <!-- Outras importações de BOMs, se necessário -->
        </dependencies>
    </dependencyManagement>
    ```

2.  **Adicione as dependências dos módulos Praxis que você precisa na seção `<dependencies>`, sem especificar a versão:**
    A versão será automaticamente gerenciada pelo `praxis-bom`.

    ```xml
    <dependencies>
        <dependency>
            <groupId>org.praxisplatform</groupId>
            <artifactId>praxis-metadata-core</artifactId>
            <!-- A versão é gerenciada pelo praxis-bom -->
        </dependency>
        <dependency>
            <groupId>org.praxisplatform</groupId>
            <artifactId>praxis-spring-boot-starter</artifactId>
            <!-- A versão é gerenciada pelo praxis-bom -->
        </dependency>
        
        <!-- Outras dependências do seu projeto -->
    </dependencies>
    ```

## 📚 Módulos Gerenciados

Atualmente, o `praxis-bom` gerencia as versões dos seguintes módulos Praxis:

*   `praxis-metadata-core`
*   `praxis-metadata-springdoc`
*   `praxis-spring-boot-starter`

À medida que novos módulos forem adicionados ao ecossistema Praxis, eles também serão incluídos neste BOM.

Lembre-se de substituir `1.0.0-SNAPSHOT` pela versão desejada do `praxis-bom`.
