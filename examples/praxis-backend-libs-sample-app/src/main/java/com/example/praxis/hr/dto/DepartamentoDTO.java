package com.example.praxis.hr.dto;

import org.praxisplatform.meta.ui.model.annotation.UISchema;

public class DepartamentoDTO {

    @UISchema(label = "ID")
    private Long id;

    @UISchema(label = "Nome")
    private String nome;

    @UISchema(label = "Código")
    private String codigo;

    @UISchema(label = "Responsável ID")
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
