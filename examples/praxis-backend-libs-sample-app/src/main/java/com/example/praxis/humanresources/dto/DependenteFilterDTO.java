package com.example.praxis.humanresources.dto;

import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.filter.annotation.Filterable;
import org.praxisplatform.uischema.filter.annotation.Filterable.FilterOperation;
import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;

import java.time.LocalDate;
import java.util.List;

public class DependenteFilterDTO implements GenericFilterDTO {

    @UISchema
    @Filterable(operation = FilterOperation.LIKE)
    private String nomeCompleto;

    @UISchema
    @Filterable(operation = FilterOperation.BETWEEN)
    private List<LocalDate> dataNascimento;

    @UISchema
    @Filterable(operation = FilterOperation.LIKE)
    private String parentesco;

    @UISchema
    @Filterable(operation = FilterOperation.EQUAL, relation = "funcionario.id")
    private Long funcionarioId;

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public List<LocalDate> getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(List<LocalDate> dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getParentesco() {
        return parentesco;
    }

    public void setParentesco(String parentesco) {
        this.parentesco = parentesco;
    }

    public Long getFuncionarioId() {
        return funcionarioId;
    }

    public void setFuncionarioId(Long funcionarioId) {
        this.funcionarioId = funcionarioId;
    }
}
