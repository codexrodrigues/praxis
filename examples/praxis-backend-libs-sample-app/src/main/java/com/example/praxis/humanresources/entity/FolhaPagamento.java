package com.example.praxis.humanresources.entity;


import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "folhas_pagamento")
public class FolhaPagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Column(nullable = false)
    private int ano;

    @Column(nullable = false)
    private int mes;

    @Column(precision = 10, scale = 2)
    private BigDecimal salarioBruto;

    @Column(precision = 10, scale = 2)
    private BigDecimal totalDescontos;

    @Column(precision = 10, scale = 2)
    private BigDecimal salarioLiquido;

    private LocalDate dataPagamento;

    @OneToMany(mappedBy = "folhaPagamento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventoFolha> eventos;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Funcionario getFuncionario() {
        return funcionario;
    }

    public void setFuncionario(Funcionario funcionario) {
        this.funcionario = funcionario;
    }

    public int getAno() {
        return ano;
    }

    public void setAno(int ano) {
        this.ano = ano;
    }

    public int getMes() {
        return mes;
    }

    public void setMes(int mes) {
        this.mes = mes;
    }

    public BigDecimal getSalarioBruto() {
        return salarioBruto;
    }

    public void setSalarioBruto(BigDecimal salarioBruto) {
        this.salarioBruto = salarioBruto;
    }

    public BigDecimal getTotalDescontos() {
        return totalDescontos;
    }

    public void setTotalDescontos(BigDecimal totalDescontos) {
        this.totalDescontos = totalDescontos;
    }

    public BigDecimal getSalarioLiquido() {
        return salarioLiquido;
    }

    public void setSalarioLiquido(BigDecimal salarioLiquido) {
        this.salarioLiquido = salarioLiquido;
    }

    public LocalDate getDataPagamento() {
        return dataPagamento;
    }

    public void setDataPagamento(LocalDate dataPagamento) {
        this.dataPagamento = dataPagamento;
    }

    public List<EventoFolha> getEventos() {
        return eventos;
    }

    public void setEventos(List<EventoFolha> eventos) {
        this.eventos = eventos;
    }
}
