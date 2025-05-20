package org.praxisplatform.meta.ui.web.controller;

import org.praxisplatform.meta.ui.filter.dto.GenericFilterDTO;
import org.praxisplatform.meta.ui.web.response.RestApiResponse;
import org.praxisplatform.meta.ui.data.service.PraxisCrudService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Links;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * Classe abstrata genérica para padronizar controllers de CRUD com HATEOAS e RestApiResponse.
 *
 * @param <E>  Entidade (ex.: TipoTelefone)
 * @param <D>  DTO correspondente (ex.: TipoTelefoneDto)
 * @param <ID> Tipo do identificador (ex.: Long, String, etc.)
 */
public abstract class AbstractPraxisCrudController<E, D extends GenericFilterDTO, ID> {

    // ------------------------------------------------------------------------
    // Base Path do OpenAPI
    // ------------------------------------------------------------------------
    @Value("${springdoc.api-docs.path:/v3/api-docs}")
    private String OPEN_API_BASE_PATH;

    @Value("${server.servlet.contextPath:}")
    private String CONTEXT_PATH;

    // ------------------------------------------------------------------------
    // Caminho para os schemas da API.
    // ------------------------------------------------------------------------
    private final String SCHEMAS_PATH = "/schemas";

    // ------------------------------------------------------------------------
    // Caminho para os schemas filtrados da API.
    // ------------------------------------------------------------------------
    public final String SCHEMAS_FILTERED_PATH = "/schemas/filtered";

    protected final PraxisCrudService<E, ID> service;

    /**
     * Retorna o serviço base (CRUD) que será usado internamente.
     */
    protected abstract PraxisCrudService<E, ID> getService();

    /**
     * Converte de entidade -> DTO.
     */
    protected abstract D toDto(E entity);

    /**
     * Converte de DTO -> entidade.
     */
    protected abstract E toEntity(D dto);

    /**
     * Retorna a classe concreta do controller (ex.: TipoTelefoneController.class)
     * para uso no método methodOn(...) do HATEOAS.
     */
    protected abstract Class<? extends AbstractPraxisCrudController<E, D, ID>> getControllerClass();

    /**
     * Extrai o identificador (ex.: entity.getId()) para montar links e location.
     */
    protected abstract ID getEntityId(E entity);

    /**
     * Extrai o identificador do DTO (ex.: dto.id()) para montar links e location.
     */
    protected abstract ID getDtoId(D dto);

    /**
     * (Opcional) Retorna o path base para fins de documentação ou links (se desejar).
     */
    protected abstract String getBasePath();


    public AbstractPraxisCrudController(PraxisCrudService<E, ID> service) {
        this.service = service;
    }

    /**
     * Endpoint para filtrar entidades.
     *
     * @param filterDTO DTO de filtro
     * @param pageable  Informações de paginação
     * @return Página de entidades filtradas
     */
    @PostMapping("/filter")
    @Operation(
            summary = "Filtrar registros",
            description = "Aplica filtros aos registros com base nos critérios fornecidos no DTO. Suporta paginação.",
            parameters = {
                    @Parameter(
                            name = "filterDTO",
                            description = "Objeto contendo os critérios de filtro",
                            required = true,
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = GenericFilterDTO.class) // Substituir pelo DTO genérico
                            )
                    ),
                    @Parameter(
                            name = "pageable",
                            description = "Informações de paginação, como página e tamanho",
                            required = false
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Lista de registros filtrados retornada com sucesso.",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class) // Página de EntityModel<D>
                            )
                    )
            }
    )
    public ResponseEntity<RestApiResponse<Page<EntityModel<D>>>> filter(
            @RequestBody D filterDTO,
            Pageable pageable
    ) {
        Page<E> page = getService().filter(filterDTO, pageable);

        Page<EntityModel<D>> entityModels = page.map(entity -> toEntityModel(toDto(entity)));

        Links links = Links.of(linkToAll(), linkToUiSchema("/filter", "post"));

        var response = RestApiResponse.success(entityModels, links);
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------------------------
    // Métodos de CRUD
    // -------------------------------------------------------------------------

    @GetMapping("/all")
    @Operation(summary = "Listar todos os registros", description = "Retorna todos os registros.")
    public ResponseEntity<RestApiResponse<List<EntityModel<D>>>> getAll() {
        List<E> entities = getService().findAll();

        List<EntityModel<D>> entityModels = entities.stream()
                .map(this::toDto)
                .map(this::toEntityModel)
                .toList();

        Links links = Links.of(
                linkToFilter(),
                linkToUiSchema("/all", "get")
        );

        var response = RestApiResponse.success(entityModels, links);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Buscar registro por ID",
            description = "Retorna um registro específico pelo ID fornecido. Retorna 404 se o registro não for encontrado.",
            parameters = {
                    @Parameter(
                            name = "id",
                            description = "ID do registro a ser buscado",
                            required = true,
                            example = "123"
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Registro encontrado com sucesso.",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Object.class) // Substituir pelo DTO genérico, se aplicável
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Registro não encontrado para o ID fornecido."
                    )
            }
    )
    public ResponseEntity<RestApiResponse<D>> getById(@PathVariable ID id) {
        // Se não existir, o service pode lançar ResourceNotFoundException
        E entity = getService().findById(id);
        D dto = toDto(entity);

        Links links = Links.of(
                linkToSelf(id),
                linkToAll(),
                linkToFilter(),
                linkToUpdate(id),
                linkToDelete(id),
                linkToUiSchema("/{id}", "get")
        );

        var response = RestApiResponse.success(dto, links);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Criar novo registro", description = "Cria um novo registro.")
    public ResponseEntity<RestApiResponse<D>> create(@RequestBody D dto) {
        E entityToSave = toEntity(dto);
        E savedEntity = getService().save(entityToSave);
        D savedDto = toDto(savedEntity);

        ID newId = getEntityId(savedEntity);
        Link selfLink = linkToSelf(newId);

        Links links = Links.of(
                selfLink,
                linkToAll(),
                linkToFilter(),
                linkToDelete(newId),
                linkToUiSchema("/", "post")
        );

        var response = RestApiResponse.success(savedDto, links);
        return ResponseEntity.created(selfLink.toUri()).body(response);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Atualizar registro existente",
            description = "Atualiza um registro específico pelo ID fornecido. Retorna o registro atualizado ou um erro se não for encontrado.",
            parameters = {
                    @Parameter(
                            name = "id",
                            description = "ID do registro a ser atualizado",
                            required = true,
                            example = "123"
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Registro atualizado com sucesso.",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Object.class) // Substituir pelo DTO genérico, se aplicável
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Registro não encontrado para o ID fornecido."
                    )
            }
    )
    public ResponseEntity<RestApiResponse<D>> update(@PathVariable ID id, @RequestBody D dto) {
        E entityToUpdate = toEntity(dto);
        E updatedEntity = getService().update(id, entityToUpdate);
        D updatedDto = toDto(updatedEntity);

        Links links = Links.of(
                linkToSelf(id),
                linkToAll(),
                linkToFilter(),
                linkToUpdate(id),
                linkToDelete(id),
                linkToUiSchema("/{id}", "put")
        );

        var response = RestApiResponse.success(updatedDto, links);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Excluir registro",
            description = "Remove o registro pelo ID fornecido. Retorna 204 se bem-sucedido ou 404 se não encontrado.",
            parameters = {
                    @Parameter(
                            name = "id",
                            description = "ID do registro a ser excluído",
                            required = true,
                            example = "123"
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Registro excluído com sucesso."
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Registro não encontrado."
                    )
            }
    )
    public ResponseEntity<Void> delete(@PathVariable ID id) {
        getService().deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(SCHEMAS_PATH)
    @Operation(
            summary = "Obter esquema da entidade para configuração dinâmica",
            description = """
                        Este endpoint retorna informações detalhadas sobre o esquema de dados da entidade atual.
                        Os dados retornados são baseados na documentação OpenAPI e incluem configurações específicas para interfaces dinâmicas, 
                        como formulários e grids.
                    
                        O endpoint redireciona automaticamente para o controlador responsável por processar 
                        e filtrar os esquemas OpenAPI, fornecendo os parâmetros corretos para o recurso atual.
                    """,
            responses = {
                    @ApiResponse(
                            responseCode = "302",
                            description = "Redireciona para o endpoint de esquemas com os parâmetros corretos."
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Caso o esquema da entidade não seja encontrado."
                    ),
                    @ApiResponse(
                            responseCode = "500",
                            description = "Erro interno ao processar a solicitação."
                    )
            }
    )
    public ResponseEntity<Void> getSchema() {
        // Constrói o link para o endpoint de metadados
        Link metadataLink = linkToUiSchema("/filter", "post");

        // Retorna um redirecionamento HTTP para o link montado
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(metadataLink.getHref()))
                .build();
    }

    // -------------------------------------------------------------------------
    // Métodos auxiliares de HATEOAS
    // -------------------------------------------------------------------------
    protected EntityModel<D> toEntityModel(D dto) {
        ID id = getDtoId(dto);
        return EntityModel.of(
                dto,
                linkToSelf(id),
                linkToCreate(),
                linkToUpdate(id),
                linkToDelete(id)
        );
    }

    /**
     * Link para GET /{id}.
     */
    protected Link linkToSelf(ID id) {
        return WebMvcLinkBuilder.linkTo(
                WebMvcLinkBuilder.methodOn(getControllerClass()).getById(id)
        ).withSelfRel();
    }

    /**
     * Link para GET /all.
     */
    protected Link linkToAll() {
        return WebMvcLinkBuilder.linkTo(
                WebMvcLinkBuilder.methodOn(getControllerClass()).getAll()
        ).withRel("all");
    }

    /**
     * Link para GET /filter.
     */
    protected Link linkToFilter() {
        return WebMvcLinkBuilder.linkTo(
                WebMvcLinkBuilder.methodOn(getControllerClass()).filter(null, null)
        ).withRel("filter");
    }

    /**
     * Link para POST /.
     */
    protected Link linkToCreate() {
        return WebMvcLinkBuilder.linkTo(
                WebMvcLinkBuilder.methodOn(getControllerClass()).create(null)
        ).withRel("create");
    }

    /**
     * Link para PUT /{id}.
     */
    protected Link linkToUpdate(ID id) {
        return WebMvcLinkBuilder.linkTo(
                WebMvcLinkBuilder.methodOn(getControllerClass()).update(id, null)
        ).withRel("update");
    }

    /**
     * Link para DELETE /{id}.
     */
    protected Link linkToDelete(ID id) {
        return WebMvcLinkBuilder.linkTo(
                WebMvcLinkBuilder.methodOn(getControllerClass()).delete(id)
        ).withRel("delete");
    }

    /**
     * Link para documentação (ex.: Swagger UI).
     */
    protected Link linkToDocs() {
        String docsUrl = String.format("%s%s", OPEN_API_BASE_PATH, getBasePath());
        return Link.of(docsUrl, "docs");
    }

    /**
     * Gera um link HATEOAS para a documentação filtrada de um schema específico da API, baseado no caminho e na operação HTTP fornecidos.
     * <p>
     * Este método constrói uma URL relativa que aponta para o endpoint de documentação filtrada, permitindo que os consumidores
     * da API acessem a descrição detalhada do schema correspondente a uma operação específica em um determinado caminho.
     *
     * <p><strong>Exemplo de Uso:</strong></p>
     * <pre>{@code
     * // Gerar link para a operação GET no caminho "/dados-pessoa-fisica/all"
     * Link docsLink = linkToUiSchema("/all", "get");
     * }</pre>
     *
     * @param methodPath O caminho específico do método dentro da API para o qual a documentação do schema é necessária.
     *                   Deve começar com "/" e representar um dos endpoints existentes (por exemplo, "/filter", "/all", "/{id}").
     *                   <p><strong>Exemplos:</strong></p>
     *                   <ul>
     *                       <li><code>"/filter"</code> para a operação de filtro de registros.</li>
     *                       <li><code>"/all"</code> para listar todos os registros.</li>
     *                       <li><code>"/{id}"</code> para operações específicas de um registro identificado por ID.</li>
     *                   </ul>
     * @param operation  A operação HTTP associada ao caminho fornecido. Deve ser um dos métodos válidos do HTTP, como
     *                   <code>"get"</code>, <code>"post"</code>, <code>"put"</code>, <code>"delete"</code>, etc.
     *                   <p><strong>Exemplos:</strong></p>
     *                   <ul>
     *                       <li><code>"get"</code> para operações de leitura.</li>
     *                       <li><code>"post"</code> para operações de criação.</li>
     *                       <li><code>"put"</code> para operações de atualização.</li>
     *                       <li><code>"delete"</code> para operações de exclusão.</li>
     *                   </ul>
     * @return Um objeto {@link Link} contendo a URL relativa para a documentação filtrada do schema correspondente à operação e caminho fornecidos.
     * O rel deste link é definido como <code>"schema"</code>, indicando que ele aponta para a documentação do schema.
     * @throws IllegalArgumentException Se o {@code methodPath} estiver vazio ou malformado.
     * @throws IllegalStateException    Se ocorrer um erro ao construir a URL para a documentação filtrada.
     * @see Link
     * @see UriComponentsBuilder
     */
    protected Link linkToUiSchema(String methodPath, String operation) {
        // Validação básica dos parâmetros
        if (methodPath == null || methodPath.trim().isEmpty()) {
            throw new IllegalArgumentException("O parâmetro 'methodPath' não pode ser nulo ou vazio.");
        }
        if (operation == null || operation.trim().isEmpty()) {
            throw new IllegalArgumentException("O parâmetro 'operation' não pode ser nulo ou vazio.");
        }

        // Constrói o caminho completo combinando o path base com o método específico
        String fullPath = getBasePath();
        if (!methodPath.startsWith("/")) {
            fullPath += "/" + methodPath;
        } else {
            fullPath += methodPath;
        }

        try {
            // Utiliza UriComponentsBuilder para construir a URL relativa para a documentação filtrada
            String docsPath = UriComponentsBuilder.fromPath(CONTEXT_PATH + SCHEMAS_FILTERED_PATH)
                    .queryParam("path", fullPath)
                    .queryParam("operation", operation.toLowerCase())
                    .build()
                    .toUriString();

            // Retorna o Link HATEOAS com rel definido como "schema"
            return Link.of(docsPath, "schema");
        } catch (Exception e) {
            throw new IllegalStateException("Não foi possível construir o link para a documentação filtrada.", e);
        }
    }

}
