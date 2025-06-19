package com.example.praxis.hr.dto;

import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.filter.annotation.Filterable;
import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;

import java.math.BigDecimal;
import java.util.List;

public class CargoFilterDTO implements GenericFilterDTO {

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE)
    private String nome;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE)
    private String nivel;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE)
    private String descricao;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.BETWEEN)
    private List<BigDecimal> salario;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getNivel() {
        return nivel;
    }

    public void setNivel(String nivel) {
        this.nivel = nivel;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public List<BigDecimal> getSalario() {
        return salario;
    }

    public void setSalario(List<BigDecimal> salario) {
        this.salario = salario;
    }
}
