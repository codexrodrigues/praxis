package com.example.praxis.humanresources.dto;

import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import org.praxisplatform.uischema.extension.annotation.UISchema;


import java.math.BigDecimal;

public class EventoFolhaDTO {

    @UISchema
    private Long id;

    @UISchema
    private Long folhaPagamentoId;

    @UISchema
    private String descricao;

    @UISchema
    private String tipo;

    @UISchema
    private BigDecimal valor;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
}
