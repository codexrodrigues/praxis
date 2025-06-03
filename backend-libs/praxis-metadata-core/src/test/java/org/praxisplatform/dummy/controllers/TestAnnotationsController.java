package org.praxisplatform.dummy.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.praxisplatform.uischema.FieldControlType;
import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;
import org.praxisplatform.uischema.rest.response.RestApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("test")
@Tag(name = "Testes de Anotações", description = "Endpoints para testar anotações UISchema")
public class TestAnnotationsController {

    @GetMapping("all")
    @Operation(summary = "Obter formulário de teste", description = "Retorna um DTO com anotações UISchema para teste")
    public ResponseEntity<RestApiResponse<TestDTO>> getTestForm() {
        TestDTO dto = new TestDTO();
        dto.setNome("Exemplo de nome");
        dto.setSenha("123456");
        dto.setEmail("teste@exemplo.com");
        dto.setNumero(42);

        return ResponseEntity.ok(RestApiResponse.success(dto, null));
    }

    //Obter uma lista de exemplos de DTOs com anotações UISchema

    @GetMapping("listar-exemplos")
    @Operation(summary = "Listar exemplos de DTOs", description = "Retorna uma lista de exemplos de DTOs com anotações UISchema")
    public ResponseEntity<RestApiResponse<List<TestDTO>>> listExamples() {
        List<TestDTO> examples = List.of(
                new TestDTO("Exemplo 1", "senha1", "email1@exemplo.com", 10),
                new TestDTO("Exemplo 2", "senha2", "email2@exemplo.com", 20)
        );
        return ResponseEntity.ok(RestApiResponse.success(examples, null));
    }


    @PostMapping
    @Operation(summary = "Enviar formulário de teste", description = "Recebe um DTO com dados de teste")
    public ResponseEntity<RestApiResponse<String>> submitForm(@RequestBody TestDTO dto) {
        return ResponseEntity.ok(RestApiResponse.success("Formulário recebido com sucesso: " + dto.getNome(), null));
    }

    @GetMapping("list")
    @Operation(summary = "Listar exemplos", description = "Retorna uma lista de exemplos para testar")
    public ResponseEntity<RestApiResponse<List<TestDTO>>> getList() {
        List<TestDTO> examples = List.of(
                new TestDTO("Exemplo 1", "senha1", "email1@exemplo.com", 10),
                new TestDTO("Exemplo 2", "senha2", "email2@exemplo.com", 20)
        );
        return ResponseEntity.ok(RestApiResponse.success(examples, null));
    }

    public static class TestDTO implements GenericFilterDTO {
        @UISchema(
                controlType = FieldControlType.INPUT
        )
        @Schema(
                title = "Nome completo",
                description = "Nome do usuário, deve conter o nome completo",
                example = "João da Silva",
                minLength = 3,
                maxLength = 100
        )
        private String nome;

        @UISchema(
                controlType = FieldControlType.PASSWORD
        )
        @Schema(
                title = "Senha de acesso",
                description = "Senha do usuário, mínimo 6 caracteres",
                example = "abc123",
                minLength = 6
        )
        private String senha;

        @UISchema(
                controlType = FieldControlType.EMAIL_INPUT
        )
        @Schema(
                title = "E-mail",
                description = "E-mail válido do usuário",
                example = "usuario@email.com",
                format = "email"
        )
        private String email;

        @UISchema(
                controlType = FieldControlType.NUMERIC_TEXT_BOX
        )
        @Schema(
                title = "Número",
                description = "Número de identificação do usuário (0 a 100)",
                example = "10",
                minimum = "0",
                maximum = "100",
                type = "integer",
                format = "int32"
        )
        private Integer numero;

        // Construtores
        public TestDTO() {}

        public TestDTO(String nome, String senha, String email, Integer numero) {
            this.nome = nome;
            this.senha = senha;
            this.email = email;
            this.numero = numero;
        }

        // Getters e setters
        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getSenha() {
            return senha;
        }

        public void setSenha(String senha) {
            this.senha = senha;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Integer getNumero() {
            return numero;
        }

        public void setNumero(Integer numero) {
            this.numero = numero;
        }
    }
}
