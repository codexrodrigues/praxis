package com.example.praxis.humanresources.dto;

import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import org.praxisplatform.uischema.extension.annotation.UISchema;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FolhaPagamentoDTO {

    @UISchema
    private Long id;

    @UISchema
    private Long funcionarioId;

    @UISchema
    private int ano;

    @UISchema
    private int mes;

    @UISchema
    private BigDecimal salarioBruto;

    @UISchema
    private BigDecimal totalDescontos;

    @UISchema
    private BigDecimal salarioLiquido;

    @UISchema
    private LocalDate dataPagamento;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFuncionarioId() {
        return funcionarioId;
    }

    public void setFuncionarioId(Long funcionarioId) {
        this.funcionarioId = funcionarioId;
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
}
