package com.example.praxis.hr.dto;

import org.praxisplatform.meta.ui.model.annotation.UISchema;
import java.time.LocalDate;

public class FeriasAfastamentoDTO {

    @UISchema(label = "ID")
    private Long id;

    @UISchema(label = "Funcionário ID")
    private Long funcionarioId;

    @UISchema(label = "Tipo")
    private String tipo; // e.g., "FÉRIAS", "LICENÇA MÉDICA"

    @UISchema(label = "Data de Início")
    private LocalDate dataInicio;

    @UISchema(label = "Data de Fim")
    private LocalDate dataFim;

    @UISchema(label = "Observações")
    private String observacoes;

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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}
