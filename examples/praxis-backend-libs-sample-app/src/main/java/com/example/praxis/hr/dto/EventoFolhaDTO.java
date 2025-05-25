package com.example.praxis.hr.dto;

import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import org.praxisplatform.meta.ui.model.annotation.PraxisUiProperties;
import org.praxisplatform.meta.ui.model.annotation.UISchema;
import org.praxisplatform.meta.ui.model.property.FieldControlType;

import java.math.BigDecimal;

public class EventoFolhaDTO {

    @UISchema(label = "ID",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private Long id;

    @UISchema(label = "Folha de Pagamento ID",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private Long folhaPagamentoId;

    @UISchema(label = "Descrição",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private String descricao;

    @UISchema(label = "Tipo",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private String tipo;

    @UISchema(label = "Valor",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
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
