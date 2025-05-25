package com.example.praxis.hr.dto;

import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import org.praxisplatform.meta.ui.model.annotation.PraxisUiProperties;
import org.praxisplatform.meta.ui.model.annotation.UISchema;
import org.praxisplatform.meta.ui.model.property.FieldControlType;

public class DepartamentoDTO {

    @UISchema(label = "ID",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private Long id;

    @UISchema(label = "Nome",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private String nome;

    @UISchema(label = "Código",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private String codigo;

    @UISchema(label = "Responsável ID",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private Long responsavelId;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public Long getResponsavelId() {
        return responsavelId;
    }

    public void setResponsavelId(Long responsavelId) {
        this.responsavelId = responsavelId;
    }
}
