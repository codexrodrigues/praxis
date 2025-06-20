package com.example.praxis.humanresources.dto;

import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.filter.annotation.Filterable;
import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;

import java.math.BigDecimal;

/**
 * DTO de filtro para pesquisar EventoFolha.
 */
public class EventoFolhaFilterDTO implements GenericFilterDTO {

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.EQUAL, relation = "folhaPagamento.id")
    private Long folhaPagamentoId;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE)
    private String descricao;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE)
    private String tipo;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.BETWEEN)
    private java.util.List<BigDecimal> valor;

    public Long getFolhaPagamentoId() {
        return folhaPagamentoId;
    }

    public void setFolhaPagamentoId(Long folhaPagamentoId) {
        this.folhaPagamentoId = folhaPagamentoId;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public java.util.List<BigDecimal> getValor() {
        return valor;
    }

    public void setValor(java.util.List<BigDecimal> valor) {
        this.valor = valor;
    }
}

