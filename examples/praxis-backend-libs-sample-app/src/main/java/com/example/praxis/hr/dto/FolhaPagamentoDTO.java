package com.example.praxis.hr.dto;

import org.praxisplatform.meta.ui.model.annotation.UISchema;
import java.math.BigDecimal;
import java.time.LocalDate;

public class FolhaPagamentoDTO {

    @UISchema(label = "ID")
    private Long id;

    @UISchema(label = "Funcionário ID")
    private Long funcionarioId;

    @UISchema(label = "Ano")
    private int ano;

    @UISchema(label = "Mês")
    private int mes;

    @UISchema(label = "Salário Bruto")
    private BigDecimal salarioBruto;

    @UISchema(label = "Total de Descontos")
    private BigDecimal totalDescontos;

    @UISchema(label = "Salário Líquido")
    private BigDecimal salarioLiquido;

    @UISchema(label = "Data de Pagamento")
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
