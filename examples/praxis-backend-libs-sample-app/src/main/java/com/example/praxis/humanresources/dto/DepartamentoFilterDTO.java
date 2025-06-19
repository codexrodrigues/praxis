package com.example.praxis.humanresources.dto;

import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.filter.annotation.Filterable;
import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;

public class DepartamentoFilterDTO implements GenericFilterDTO {

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE)
    private String nome;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE)
    private String codigo;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.EQUAL, relation = "responsavel.id")
    private Long responsavelId;

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
