package com.example.praxis.humanresources.dto;

import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import org.praxisplatform.uischema.extension.annotation.UISchema;

import java.time.LocalDate;

public class DependenteDTO {

    @UISchema
    private String nomeCompleto;

    @UISchema
    private LocalDate dataNascimento;

    @UISchema
    private String parentesco;

    @UISchema
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
