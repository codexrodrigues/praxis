package com.example.praxis.humanresources.dto;

import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.filter.annotation.Filterable;
import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO de filtro para pesquisar FolhaPagamento.
 */
public class FolhaPagamentoFilterDTO implements GenericFilterDTO {

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.EQUAL, relation = "funcionario.id")
    private Long funcionarioId;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.EQUAL)
    private Integer ano;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.EQUAL)
    private Integer mes;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.BETWEEN)
    private List<BigDecimal> salarioBruto;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.BETWEEN)
    private List<LocalDate> dataPagamento;

    public Long getFuncionarioId() {
        return funcionarioId;
    }

    public void setFuncionarioId(Long funcionarioId) {
        this.funcionarioId = funcionarioId;
    }

    public Integer getAno() {
        return ano;
    }

    public void setAno(Integer ano) {
        this.ano = ano;
    }

    public Integer getMes() {
        return mes;
    }

    public void setMes(Integer mes) {
        this.mes = mes;
    }

    public List<BigDecimal> getSalarioBruto() {
        return salarioBruto;
    }

    public void setSalarioBruto(List<BigDecimal> salarioBruto) {
        this.salarioBruto = salarioBruto;
    }

    public List<LocalDate> getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(List<LocalDate> dataPagamento) {
        this.dataPagamento = dataPagamento;
    }
}

