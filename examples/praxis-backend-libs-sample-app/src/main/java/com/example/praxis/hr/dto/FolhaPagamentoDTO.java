package com.example.praxis.hr.dto;

import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import org.praxisplatform.meta.ui.model.annotation.PraxisUiProperties;
import org.praxisplatform.meta.ui.model.annotation.UISchema;
import org.praxisplatform.meta.ui.model.property.FieldControlType;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FolhaPagamentoDTO {

    @UISchema(label = "ID",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private Long id;

    @UISchema(label = "Funcionário ID",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private Long funcionarioId;

    @UISchema(label = "Ano",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private int ano;

    @UISchema(label = "Mês",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private int mes;

    @UISchema(label = "Salário Bruto",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private BigDecimal salarioBruto;

    @UISchema(label = "Total de Descontos",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private BigDecimal totalDescontos;

    @UISchema(label = "Salário Líquido",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private BigDecimal salarioLiquido;

    @UISchema(label = "Data de Pagamento",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
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
