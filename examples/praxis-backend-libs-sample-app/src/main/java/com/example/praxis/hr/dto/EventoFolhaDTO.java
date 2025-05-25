package com.example.praxis.hr.dto;

import org.praxisplatform.meta.ui.model.annotation.UISchema;
import java.math.BigDecimal;

public class EventoFolhaDTO {

    @UISchema(label = "ID")
    private Long id;

    @UISchema(label = "Folha de Pagamento ID")
    private Long folhaPagamentoId;

    @UISchema(label = "Descrição")
    private String descricao;

    @UISchema(label = "Tipo")
    private String tipo;

    @UISchema(label = "Valor")
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
