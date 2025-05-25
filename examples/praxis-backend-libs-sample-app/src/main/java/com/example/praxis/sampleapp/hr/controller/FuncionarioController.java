package com.example.praxis.sampleapp.hr.controller;

import com.example.praxis.sampleapp.hr.dto.FuncionarioDTO;
import com.example.praxis.sampleapp.hr.mapper.FuncionarioMapper;
import com.example.praxis.sampleapp.hr.model.Funcionario;
import com.example.praxis.sampleapp.hr.service.FuncionarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.praxisplatform.meta.ui.web.controller.AbstractPraxisCrudController;
import org.praxisplatform.meta.ui.web.response.RestApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hr/funcionarios")
public class FuncionarioController extends AbstractPraxisCrudController<Funcionario, FuncionarioDTO, Long> {

    private final FuncionarioService funcionarioService;
    private final FuncionarioMapper funcionarioMapper;

    public FuncionarioController(FuncionarioService funcionarioService, FuncionarioMapper funcionarioMapper) {
        super(funcionarioService); // Pass service to parent
        this.funcionarioService = funcionarioService;
        this.funcionarioMapper = funcionarioMapper;
    }

    @Override
    protected FuncionarioService getService() {
        return this.funcionarioService;
    }

    @Override
    protected FuncionarioDTO toDto(Funcionario entity) {
        return this.funcionarioMapper.toDto(entity);
    }

    @Override
    protected Funcionario toEntity(FuncionarioDTO dto) {
        return this.funcionarioMapper.toEntity(dto);
    }

    @Override
    protected Class<? extends AbstractPraxisCrudController<Funcionario, FuncionarioDTO, Long>> getControllerClass() {
        return FuncionarioController.class;
    }

    @Override
    protected Long getEntityId(Funcionario entity) {
        if (entity == null) return null;
        return entity.getId();
    }

    @Override
    protected Long getDtoId(FuncionarioDTO dto) {
        if (dto == null) return null;
        return dto.getId();
    }

    @Override
    protected String getBasePath() {
        return "/api/hr/funcionarios";
    }

    @Override
    @PostMapping("/filter")
    @Operation(
            summary = "Filtrar funcionários",
            description = "Aplica filtros aos funcionários com base nos critérios fornecidos no DTO. Suporta paginação.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Lista de funcionários filtrados retornada com sucesso.",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = Page.class) // Page of EntityModel<FuncionarioDTO>
                            )
                    )
            },
            extensions = {
                @Extension(properties = {
                    @ExtensionProperty(name = "responseSchema", value = "FuncionarioDTO", parseValue = true)
                })
            }
    )
    public ResponseEntity<RestApiResponse<Page<EntityModel<FuncionarioDTO>>>> filter(
            @RequestBody(required = false) FuncionarioDTO filterDTO,
            Pageable pageable) {
        return super.filter(filterDTO, pageable);
    }

    @Override
    @GetMapping
    @Operation(
        summary = "Listar todos os funcionários",
        description = "Retorna uma lista paginada de todos os funcionários.",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Lista de funcionários retornada com sucesso.",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class)) // Page of EntityModel<FuncionarioDTO>
            )
        },
        extensions = {
            @Extension(properties = {
                @ExtensionProperty(name = "responseSchema", value = "FuncionarioDTO", parseValue = true)
            })
        }
    )
    public ResponseEntity<RestApiResponse<Page<EntityModel<FuncionarioDTO>>>> getAll(Pageable pageable) {
        return super.getAll(pageable);
    }

    @Override
    @GetMapping("/{id}")
    @Operation(
            summary = "Buscar funcionário por ID",
            description = "Retorna um funcionário específico pelo ID. Retorna 404 se não encontrado.",
            parameters = {@Parameter(name = "id", description = "ID do funcionário", required = true, schema = @Schema(type = "integer", format = "int64"))},
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Funcionário encontrado.",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = FuncionarioDTO.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "Funcionário não encontrado.")
            },
            extensions = {
                @Extension(properties = {
                    @ExtensionProperty(name = "responseSchema", value = "FuncionarioDTO", parseValue = true)
                })
            }
    )
    public ResponseEntity<RestApiResponse<FuncionarioDTO>> getById(@PathVariable Long id) {
        return super.getById(id);
    }

    @Override
    @PostMapping
    @Operation(
            summary = "Criar novo funcionário",
            description = "Cria um novo funcionário com os dados fornecidos.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "DTO do funcionário para criação",
                required = true,
                content = @Content(schema = @Schema(implementation = FuncionarioDTO.class))
            ),
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Funcionário criado com sucesso.",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = FuncionarioDTO.class))
                    )
            },
            extensions = {
                @Extension(properties = {
                    @ExtensionProperty(name = "responseSchema", value = "FuncionarioDTO", parseValue = true)
                })
            }
    )
    public ResponseEntity<RestApiResponse<FuncionarioDTO>> create(@RequestBody FuncionarioDTO dto) {
        return super.create(dto);
    }

    @Override
    @PutMapping("/{id}")
    @Operation(
            summary = "Atualizar funcionário existente",
            description = "Atualiza um funcionário existente com os dados fornecidos. Retorna 404 se não encontrado.",
            parameters = {@Parameter(name = "id", description = "ID do funcionário a ser atualizado", required = true, schema = @Schema(type = "integer", format = "int64"))},
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "DTO do funcionário para atualização",
                required = true,
                content = @Content(schema = @Schema(implementation = FuncionarioDTO.class))
            ),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Funcionário atualizado com sucesso.",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = FuncionarioDTO.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "Funcionário não encontrado.")
            },
            extensions = {
                @Extension(properties = {
                    @ExtensionProperty(name = "responseSchema", value = "FuncionarioDTO", parseValue = true)
                })
            }
    )
    public ResponseEntity<RestApiResponse<FuncionarioDTO>> update(@PathVariable Long id, @RequestBody FuncionarioDTO dto) {
        return super.update(id, dto);
    }

    @Override
    @DeleteMapping("/{id}")
    @Operation(
            summary = "Excluir funcionário por ID",
            description = "Exclui um funcionário específico pelo ID. Retorna 404 se não encontrado.",
            parameters = {@Parameter(name = "id", description = "ID do funcionário a ser excluído", required = true, schema = @Schema(type = "integer", format = "int64"))},
            responses = {
                    @ApiResponse(responseCode = "204", description = "Funcionário excluído com sucesso."),
                    @ApiResponse(responseCode = "404", description = "Funcionário não encontrado.")
            }
            // No responseSchema for delete as it typically returns 204 No Content
    )
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        super.delete(id); // Ensure this is called, super.delete(id) returns void.
        return ResponseEntity.noContent().build(); // Or let super handle response if it does.
                                                // AbstractPraxisCrudController.delete returns ResponseEntity<Void>.
    }
}
