package com.example.praxis.humanresources.dto;

import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;

public class DepartamentoDTO implements GenericFilterDTO {

    @UISchema
    private Long id;

    @UISchema
    private String nome;

    @UISchema
    private String codigo;

    @UISchema
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
