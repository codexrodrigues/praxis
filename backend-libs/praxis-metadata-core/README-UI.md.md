# CustomOpenApiResolver: Estendendo a Geração de Esquemas OpenAPI para UI

## 1. Introdução

Esta documentação descreve o `CustomOpenApiResolver`, um componente crucial para aprimorar a geração de esquemas OpenAPI com metadados específicos para a interface do usuário (UI) dentro do ecossistema Praxis. Ele estende o comportamento padrão do `ModelResolver` do Swagger (agora OpenAPI Tools) para interpretar anotações personalizadas e de validação, enriquecendo o esquema OpenAPI resultante com informações que podem ser utilizadas para renderizar formulários e componentes de UI de forma mais inteligente e contextualmente apropriada.

O `CustomOpenApiResolver` é projetado para ser usado em aplicações Spring Boot que utilizam OpenAPI para documentação de API e desejam estender essa documentação para auxiliar na construção dinâmica de interfaces de usuário.

## 2. Objetivo Principal

O objetivo principal do `CustomOpenApiResolver` é traduzir anotações Java (tanto personalizadas quanto padrão de frameworks como Jakarta Bean Validation e OpenAPI) em metadados da extensão `x-ui` dentro do esquema OpenAPI. Esses metadados `x-ui` fornecem dicas, configurações e validações adicionais para a camada de frontend sobre como exibir e interagir com os campos de dados, indo além das capacidades básicas de descrição de schema do OpenAPI.

Isso permite que a UI seja mais dinâmica e adaptável, com menos lógica de apresentação e validação hardcoded no frontend.

## 3. Como Funciona

O `CustomOpenApiResolver` entra em ação durante o processo de geração do esquema OpenAPI, tipicamente quando uma biblioteca como `springdoc-openapi` inspeciona as classes de modelo (DTOs, entidades) para construir a documentação da API.

O fluxo principal de funcionamento pode ser resumido da seguinte forma:

1.  **Extensão do `ModelResolver`:**
    *   O `CustomOpenApiResolver` herda da classe `io.swagger.v3.core.jackson.ModelResolver`. Isso permite que ele se integre ao pipeline de processamento de modelos do OpenAPI.

2.  **Registro como Bean Spring:**
    *   A classe `UIFieldSpecConfiguration` define um bean do tipo `CustomOpenApiResolver`. Isso garante que o resolver customizado seja utilizado pelo framework OpenAPI (ex: `springdoc-openapi`) ao invés do resolver padrão, devido à configuração do Spring.

3.  **Sobrescrita do Método `applyBeanValidatorAnnotations`:**
    *   Este é o método central onde a lógica customizada é injetada. Sempre que o `ModelResolver` padrão processaria anotações de validação de bean para uma propriedade, a implementação do `CustomOpenApiResolver` é invocada.

4.  **Processamento de Anotações:**
    *   Dentro de `applyBeanValidatorAnnotations`, o resolver verifica a presença da anotação `@UISchema`.
    *   **Anotação `@UISchema`:** Se presente, seus atributos (como `label`, `controlType`, `helpText`, `order`, `group`, `extraProperties`, etc.) são lidos. O método `resolveSchema` e `processAnnotationDynamically` dentro do `CustomOpenApiResolver` são responsáveis por mapear esses atributos para as respectivas chaves na extensão `x-ui`.
    *   **Anotações Padrão (OpenAPI & Jakarta Bean Validation):** O método `processStandardAnnotations` é chamado para interpretar anotações padrão:
        *   **OpenAPI (`@Schema`):** Propriedades como `title` (mapeado para `label`), `description` (mapeado para `helpText`), `example` (mapeado para `defaultValue`), `readOnly`, `required`, `minLength`, `maxLength`, `minimum`, `maximum`, `pattern`, `enum` são processadas.
        *   **Jakarta Bean Validation:** Anotações como `@NotNull`, `@NotEmpty`, `@NotBlank` (para `required`), `@Size` (para `minLength`, `maxLength`), `@Min`, `@Max`, `@DecimalMin`, `@DecimalMax` (para `min`, `max`), `@Pattern` (para `pattern`), `@Email`, `@AssertTrue`, `@AssertFalse`, `@Past`, `@Future`, `@Positive`, `@Negative`, `@Digits` são processadas. Cada uma dessas anotações contribui para definir propriedades de UI ou de validação na extensão `x-ui`.

5.  **Utilização de `OpenApiUiUtils`:**
    *   O `CustomOpenApiResolver` delega grande parte da lógica de formatação, inferência e população da extensão `x-ui` para a classe utilitária `OpenApiUiUtils`.
    *   `OpenApiUiUtils` contém métodos estáticos como `populateUiLabel`, `populateUiControlType`, `determineEffectiveControlType`, `populateUiOptionsFromEnum`, `populateUiRequired`, `populateDefaultValidationMessages`, entre muitos outros. Esses métodos encapsulam as regras para:
        *   Derivar `controlType` com base no tipo de dado OpenAPI, formato, presença de enum, ou nome do campo (usando `determineEffectiveControlType`).
        *   Popular `options` a partir de listas de `enum`.
        *   Definir mensagens de validação padrão (`requiredMessage`, `minLengthMessage`, etc.) com base nas informações do campo e nas validações aplicadas.
        *   Formatar valores (ex: `formatFieldNameAsLabel`).

6.  **Geração da Extensão `x-ui`:**
    *   Todas as informações coletadas e processadas são armazenadas em um mapa que é então adicionado ao schema da propriedade sob a chave `x-ui`.
    *   O método `getUIExtensionMap` no `CustomOpenApiResolver` é usado para obter ou criar o mapa `x-ui` para uma determinada propriedade do schema.

7.  **Cache de Nomes de Propriedades:**
    *   O `CustomOpenApiResolver` utiliza mapas estáticos (`FIELD_PROPERTIES_MAP`, `VALIDATION_PROPERTIES_MAP`) para carregar nomes de propriedades das interfaces `FieldConfigProperties` e `ValidationProperties`. Isso é usado no método `getExtensionPropertyName` para mapear nomes de métodos da anotação `@UISchema` para as chaves corretas na extensão `x-ui`.

O resultado é um schema OpenAPI onde cada propriedade pode conter uma seção `x-ui` rica em metadados, pronta para ser consumida por um frontend capaz de interpretá-la.

## 4. Classes Chave Envolvidas

*   **`CustomOpenApiResolver` (`org.praxisplatform.uischema.extension.CustomOpenApiResolver`):**
    *   **Responsabilidade:** Estende `ModelResolver` para interceptar o processamento de anotações de bean. Orquestra a leitura de anotações (`@UISchema` e padrão) e a delegação para `OpenApiUiUtils` para popular a extensão `x-ui`.
    *   **Métodos Chave:** `applyBeanValidatorAnnotations`, `resolveSchema`, `processAnnotationDynamically`, `processStandardAnnotations`, `getUIExtensionMap`.

*   **`UIFieldSpecConfiguration` (`org.praxisplatform.uischema.configuration.UIFieldSpecConfiguration`):**
    *   **Responsabilidade:** Classe de configuração Spring (`@AutoConfiguration`).
    *   **Métodos Chave:** Define um bean `CustomOpenApiResolver modelResolver(ObjectMapper mapper)`. Isso garante que esta implementação customizada seja usada pelo framework OpenAPI (ex: SpringDoc) no lugar da padrão. Também configura um `ObjectMapper`.

*   **`OpenApiUiUtils` (`org.praxisplatform.uischema.util.OpenApiUiUtils`):**
    *   **Responsabilidade:** Classe utilitária com métodos estáticos que encapsulam a lógica de:
        *   Determinar tipos de controle de UI (`determineBasicControlType`, `determineSmartControlTypeByFieldName`, `determineEffectiveControlType`).
        *   Popular atributos específicos da UI (ex: `populateUiLabel`, `populateUiHelpText`, `populateUiOptionsFromEnum`).
        *   Popular atributos de validação (ex: `populateUiRequired`, `populateUiMinLength`, `populateUiPattern`).
        *   Gerar mensagens de validação padrão (`populateDefaultValidationMessages`).
        *   Formatar valores para exibição (ex: `formatFieldNameAsLabel`, `formatFileSize`).
    *   É o "motor" por trás da transformação de dados brutos e anotações em metadados `x-ui` significativos.

*   **`@UISchema` (`org.praxisplatform.uischema.extension.annotation.UISchema`):**
    *   **Responsabilidade:** Anotação personalizada que permite aos desenvolvedores fornecer metadados explícitos de UI diretamente no código Java, nos campos dos modelos.
    *   **Atributos:** `label`, `placeholder`, `helpText`, `controlType`, `dataType`, `order`, `group`, `width`, `icon`, `disabled`, `hidden`, `editable`, `sortable`, `filterable`, `numericFormatStyle`, `pattern` (via `ValidationPattern`), `extraProperties`, etc. Estes atributos têm precedência ou complementam a inferência a partir de anotações padrão.

*   **Interfaces de Constantes (ex: `FieldConfigProperties`, `ValidationProperties`):**
    *   **Responsabilidade:** Definem as strings constantes usadas como chaves dentro do mapa `x-ui` (ex: `FieldConfigProperties.CONTROL_TYPE` cujo valor é `"controlType"`). Isso promove consistência e evita erros de digitação.
    *   São utilizadas pelo `CustomOpenApiResolver` para mapear atributos da `@UISchema` e pelo `OpenApiUiUtils` ao popular o mapa `x-ui`.

## 5. Exemplo de Funcionamento (Conceitual)

Considere uma propriedade de uma classe Java anotada da seguinte forma:

```java
import org.praxisplatform.uischema.FieldControlType;
import org.praxisplatform.uischema.extension.annotation.UISchema;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

// ...

@Schema(description = "Nome completo do cliente.")
@UISchema(label = "Nome do Cliente",
          helpText = "Insira o nome completo conforme documento.",
          controlType = FieldControlType.INPUT,
          order = 10,
          group = "Dados Pessoais")
@NotNull(message = "O nome do cliente não pode ser nulo.")
@Size(min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres.")
private String nomeCliente;
```

O `CustomOpenApiResolver` processaria essas anotações e geraria um fragmento de esquema OpenAPI similar a:

```yaml
# openapi.yaml (ou JSON)
components:
  schemas:
    MeuModeloDTO:
      type: object
      properties:
        nomeCliente:
          type: string
          description: "Nome completo do cliente." # Da @Schema
          x-ui:
            label: "Nome do Cliente"               # Da @UISchema
            helpText: "Insira o nome completo conforme documento." # Da @UISchema
            controlType: "INPUT"                   # Da @UISchema (valor do enum FieldControlType.INPUT)
            order: "10"                            # Da @UISchema
            group: "Dados Pessoais"                # Da @UISchema
            required: true                         # Inferido de @NotNull
            minLength: 3                           # Inferido de @Size
            maxLength: 100                         # Inferido de @Size
            # Mensagens de OpenApiUiUtils.populateDefaultValidationMessages
            requiredMessage: "O nome do cliente não pode ser nulo." # Da @NotNull(message)
            # Se @Size não tivesse 'message', seriam geradas mensagens padrão:
            # minLengthMessage: "O campo Nome do Cliente deve ter no mínimo 3 caracteres"
            # maxLengthMessage: "O campo Nome do Cliente deve ter no máximo 100 caracteres"
            # Se @Size tivesse 'message' genérica, ela poderia ser usada ou dividida se OpenApiUiUtils tiver lógica para tal.
            # Atualmente, OpenApiUiUtils.populateUiMinLength/MaxLength usa a mensagem da anotação se não começar com '{'.
            # E populateDefaultValidationMessages gera mensagens mais específicas se não houver uma já.
```

## 6. Principais Funcionalidades da Extensão `x-ui` Populadas

O `CustomOpenApiResolver`, com a ajuda crucial do `OpenApiUiUtils`, popula uma variedade de propriedades dentro da extensão `x-ui`. Algumas das mais importantes incluem (referenciando `FieldConfigProperties` e `ValidationProperties`):

*   **Configuração Geral do Campo:**
    *   `FieldConfigProperties.LABEL` (`label`): Rótulo amigável.
    *   `FieldConfigProperties.NAME` (`name`): Nome do campo.
    *   `FieldConfigProperties.PLACEHOLDER` (`placeholder`): Texto de exemplo.
    *   `FieldConfigProperties.HELP_TEXT` (`helpText`): Texto de ajuda adicional.
    *   `FieldConfigProperties.CONTROL_TYPE` (`controlType`): Tipo de controle de UI (ex: `INPUT`, `SELECT`, `TEXTAREA`).
    *   `FieldConfigProperties.TYPE` (`dataType`): Tipo de dado semântico (ex: `TEXT`, `NUMBER`, `DATE`).
    *   `FieldConfigProperties.DEFAULT_VALUE` (`defaultValue`): Valor padrão.
    *   `FieldConfigProperties.READ_ONLY` (`readOnly`): Somente leitura.
    *   `FieldConfigProperties.DISABLED` (`disabled`): Desabilitado.
    *   `FieldConfigProperties.HIDDEN` (`hidden`): Oculto.
    *   `FieldConfigProperties.EDITABLE` (`editable`): Editável (em tabelas).
    *   `FieldConfigProperties.SORTABLE` (`sortable`): Coluna ordenável.
    *   `FieldConfigProperties.FILTERABLE` (`filterable`): Coluna filtrável.
    *   `FieldConfigProperties.WIDTH` (`width`): Largura.
    *   `FieldConfigProperties.ORDER` (`order`): Ordem de exibição.
    *   `FieldConfigProperties.GROUP` (`group`): Agrupamento lógico.
    *   `FieldConfigProperties.ICON` (`icon`): Ícone.
    *   `FieldConfigProperties.OPTIONS` (`options`): Opções para `SELECT`, `MULTI_SELECT`.

*   **Validações e Mensagens (prefixo `ValidationProperties`):**
    *   `ValidationProperties.REQUIRED` (`required`): Campo obrigatório.
    *   `ValidationProperties.REQUIRED_MESSAGE` (`requiredMessage`): Mensagem para obrigatório.
    *   `ValidationProperties.MIN_LENGTH` (`minLength`): Comprimento mínimo.
    *   `ValidationProperties.MIN_LENGTH_MESSAGE` (`minLengthMessage`): Mensagem para comprimento mínimo.
    *   `ValidationProperties.MAX_LENGTH` (`maxLength`): Comprimento máximo.
    *   `ValidationProperties.MAX_LENGTH_MESSAGE` (`maxLengthMessage`): Mensagem para comprimento máximo.
    *   `ValidationProperties.MIN` (`min`): Valor mínimo.
    *   `ValidationProperties.MAX` (`max`): Valor máximo.
    *   `ValidationProperties.RANGE_MESSAGE` (`rangeMessage`): Mensagem para intervalo min/max.
    *   `ValidationProperties.PATTERN` (`pattern`): Expressão regular.
    *   `ValidationProperties.PATTERN_MESSAGE` (`patternMessage`): Mensagem para padrão.

*   **Configurações Numéricas Específicas (prefixo `FieldConfigProperties`):**
    *   `FieldConfigProperties.NUMERIC_FORMAT` (`numericFormat`): Formato (ex: `PERCENT`, `CURRENCY`).
    *   `FieldConfigProperties.NUMERIC_MIN` (`numericMin`): Mínimo para input numérico.
    *   `FieldConfigProperties.NUMERIC_MAX` (`numericMax`): Máximo para input numérico.
    *   `FieldConfigProperties.NUMERIC_STEP` (`numericStep`): Incremento/decremento para input numérico.

*   **Configurações de Arquivo (prefixo `ValidationProperties`):**
    *   `ValidationProperties.ALLOWED_FILE_TYPES` (`allowedFileTypes`): Tipos de arquivo permitidos.
    *   `ValidationProperties.FILE_TYPE_MESSAGE` (`fileTypeMessage`): Mensagem para tipos de arquivo.
    *   `ValidationProperties.MAX_FILE_SIZE` (`maxFileSize`): Tamanho máximo de arquivo.
    *   (Nota: A mensagem para `maxFileSize` historicamente usava a chave `maxLengthMessage`).

## 7. Customização e Extensibilidade

O design do `CustomOpenApiResolver` e `OpenApiUiUtils` oferece várias formas de customização:

*   **Anotação `@UISchema`:**
    *   **Prioridade:** Os valores definidos em `@UISchema` geralmente têm precedência sobre os inferidos de anotações padrão.
    *   **`extraProperties`:** O atributo `extraProperties` em `@UISchema` (`ExtensionProperty[]`) permite adicionar quaisquer pares chave-valor arbitrários ao mapa `x-ui`, oferecendo um mecanismo de escape para configurações não cobertas diretamente pelos atributos da anotação.
    *   **Controle Fino:** Permite ajustar a UI campo a campo diretamente no modelo.

*   **`OpenApiUiUtils`:**
    *   **Centralização da Lógica:** A maior parte da lógica de inferência e mapeamento está nesta classe. Modificações ou extensões aos seus métodos (ex: `determineEffectiveControlType`, `populateDefaultValidationMessages`) podem alterar globalmente como as propriedades `x-ui` são geradas.
    *   **Novas Funções de Mapeamento:** Podem ser adicionados novos métodos para lidar com formatos OpenAPI customizados ou para inferir novas propriedades `x-ui`.

*   **`CustomOpenApiResolver`:**
    *   **Novas Anotações:** Poderia ser estendido para reconhecer e processar novas anotações (além de `@UISchema` e das padrão) se um novo conjunto de metadados de UI precisar ser introduzido.
    *   **Lógica de Processamento:** A lógica nos métodos `processStandardAnnotations` ou `processAnnotationDynamically` pode ser ajustada para mudar como as anotações existentes são interpretadas.

*   **Configuração de `ObjectMapper`:**
    *   O `CustomOpenApiResolver` recebe um `ObjectMapper`. A configuração deste `ObjectMapper` (feita em `UIFieldSpecConfiguration`) pode influenciar como certos tipos de dados (ex: datas, enums) são serializados quando usados como `defaultValue` ou em `options`.

## 8. Conclusão

O `CustomOpenApiResolver` é uma peça fundamental para criar uma ponte rica em informações entre o backend (onde os modelos de dados e as regras de validação são definidos) e o frontend (onde a interface do usuário é apresentada e interage com o usuário). Ao traduzir anotações Java em uma extensão `x-ui` detalhada e estruturada dentro do schema OpenAPI, ele habilita a construção de UIs de forma mais dinâmica, consistente e baseada em metadados. Isso reduz a duplicação de lógica de validação, minimiza a necessidade de configurações de UI hardcoded no frontend e promove uma arquitetura mais coesa e manutenível para aplicações web modernas.
```
