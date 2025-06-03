package com.example.praxis.hr.dto;

import org.praxisplatform.uischema.filter.annotation.Filterable;
import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;

public class FuncionarioFilterDTO implements GenericFilterDTO {

    @Filterable(operation = Filterable.FilterOperation.LIKE)
    private String nomeCompleto;

    @Filterable(operation = Filterable.FilterOperation.EQUAL)
    private String cpf;

    @Filterable(operation = Filterable.FilterOperation.EQUAL, relation = "cargo.id")
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
