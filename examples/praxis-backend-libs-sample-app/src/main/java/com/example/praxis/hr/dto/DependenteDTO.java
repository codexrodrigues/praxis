package com.example.praxis.hr.dto;

import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import org.praxisplatform.meta.ui.model.annotation.PraxisUiProperties;
import org.praxisplatform.meta.ui.model.annotation.UISchema;
import org.praxisplatform.meta.ui.model.property.FieldControlType;

import java.time.LocalDate;

public class DependenteDTO {

    @UISchema(label = "Nome Completo",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private String nomeCompleto;

    @UISchema(label = "Data de Nascimento",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private LocalDate dataNascimento;

    @UISchema(label = "Parentesco",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private String parentesco;

    @UISchema(label = "Funcionário ID",
            controlType = FieldControlType.INPUT,
            metadata = @PraxisUiProperties(properties = {
                    @ExtensionProperty(name = "readonly", value = "true"),
                    @ExtensionProperty(name = "hidden", value = "false")
            })
    )
    private Long funcionarioId;

    // Getters and Setters
    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getParentesco() {
        return parentesco;
    }

    public void setParentesco(String parentesco) {
        this.parentesco = parentesco;
    }

    public Long getFuncionarioId() {
        return funcionarioId;
    }

    public void setFuncionarioId(Long funcionarioId) {
        this.funcionarioId = funcionarioId;
    }
}
