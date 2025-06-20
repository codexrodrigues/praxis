package com.example.praxis.humanresources.dto;

import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.filter.annotation.Filterable;
import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO de filtro para pesquisas de Ferias/Afastamentos.
 */
public class FeriasAfastamentoFilterDTO implements GenericFilterDTO {

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.EQUAL, relation = "funcionario.id")
    private Long funcionarioId;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE)
    private String tipo;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.BETWEEN)
    private List<LocalDate> dataInicio;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.BETWEEN)
    private List<LocalDate> dataFim;

    public Long getFuncionarioId() {
        return funcionarioId;
    }

    public void setFuncionarioId(Long funcionarioId) {
        this.funcionarioId = funcionarioId;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public List<LocalDate> getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(List<LocalDate> dataInicio) {
        this.dataInicio = dataInicio;
    }

    public List<LocalDate> getDataFim() {
        return dataFim;
    }

    public void setDataFim(List<LocalDate> dataFim) {
        this.dataFim = dataFim;
    }
}

