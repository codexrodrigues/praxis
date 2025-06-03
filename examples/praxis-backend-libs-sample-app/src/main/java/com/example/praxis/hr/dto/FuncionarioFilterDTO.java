package com.example.praxis.hr.dto;

import org.praxisplatform.uischema.filter.annotation.Filterable;
import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;
import org.praxisplatform.uischema.extension.annotation.UISchema;

@UISchema(title = "Filtro de Funcionários", description = "Critérios de busca para funcionários.")
public class FuncionarioFilterDTO implements GenericFilterDTO {

    @Filterable(operation = Filterable.FilterOperation.LIKE)
    @UISchema(title = "Nome Completo", description = "Filtrar pelo nome completo do funcionário.")
    private String nomeCompleto;

    @Filterable(operation = Filterable.FilterOperation.EQUAL)
    @UISchema(title = "CPF", description = "Filtrar pelo CPF do funcionário.")
    private String cpf;

    @Filterable(operation = Filterable.FilterOperation.EQUAL, relation = "cargo.id")
    @UISchema(title = "ID do Cargo", description = "Filtrar pelo ID do cargo do funcionário.")
    private Long cargoId;

    // Getters and Setters
    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public Long getCargoId() {
        return cargoId;
    }

    public void setCargoId(Long cargoId) {
        this.cargoId = cargoId;
    }
}
