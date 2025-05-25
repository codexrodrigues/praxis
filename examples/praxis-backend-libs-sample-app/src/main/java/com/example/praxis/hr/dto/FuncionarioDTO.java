package com.example.praxis.hr.dto;

import org.praxisplatform.meta.ui.model.annotation.UISchema;
import java.math.BigDecimal;
import java.time.LocalDate;

public class FuncionarioDTO {

    @UISchema(label = "Nome Completo")
    private String nomeCompleto;

    @UISchema(label = "CPF")
    private String cpf;

    @UISchema(label = "Data de Nascimento")
    private LocalDate dataNascimento;

    @UISchema(label = "Email")
    private String email;

    @UISchema(label = "Telefone")
    private String telefone;

    @UISchema(label = "Cargo ID")
    private Long cargoId;

    @UISchema(label = "Departamento ID")
    private Long departamentoId;

    @UISchema(label = "Salário")
    private BigDecimal salario;

    @UISchema(label = "Data de Admissão")
    private LocalDate dataAdmissao;

    @UISchema(label = "Endereço")
    private EnderecoDTO endereco;

    @UISchema(label = "Ativo", defaultValue = "true")
    private boolean ativo = true;

    // Getters and Setters
    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public Long getCargoId() {
        return cargoId;
    }

    public void setCargoId(Long cargoId) {
        this.cargoId = cargoId;
    }

    public Long getDepartamentoId() {
        return departamentoId;
    }

    public void setDepartamentoId(Long departamentoId) {
        this.departamentoId = departamentoId;
    }

    public BigDecimal getSalario() {
        return salario;
    }

    public void setSalario(BigDecimal salario) {
        this.salario = salario;
    }

    public LocalDate getDataAdmissao() {
        return dataAdmissao;
    }

    public void setDataAdmissao(LocalDate dataAdmissao) {
        this.dataAdmissao = dataAdmissao;
    }

    public EnderecoDTO getEndereco() {
        return endereco;
    }

    public void setEndereco(EnderecoDTO endereco) {
        this.endereco = endereco;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }
}
