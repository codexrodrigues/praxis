package com.example.praxis.humanresources.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "eventos_folha")
public class EventoFolha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "folha_pagamento_id", nullable = false)
    private FolhaPagamento folhaPagamento;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private String tipo; // e.g., "ADICIONAL", "DESCONTO"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FolhaPagamento getFolhaPagamento() {
        return folhaPagamento;
    }

    public void setFolhaPagamento(FolhaPagamento folhaPagamento) {
        this.folhaPagamento = folhaPagamento;
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
