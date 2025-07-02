package com.example.praxis.humanresources.dto;

import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FuncionarioDTO implements GenericFilterDTO {

    private Long id;

    @UISchema
    private String nomeCompleto;

    @UISchema
    @Schema(type = "string", format = "cpf", description = "CPF do funcionário")
    private String cpf;

    @UISchema
    @Schema(type = "string", format = "date", description = "Data de nascimento do funcionário")
    private LocalDate dataNascimento;

    @UISchema()
    @Schema(type = "string", format = "email", description = "Email do funcionário")
    private String email;

    @UISchema()
    @Schema(type = "string", format = "phone", description = "Telefone do funcionário")
    private String telefone;

    @UISchema()
    private Long cargoId;

    @UISchema()
    private Long departamentoId;

    @UISchema()
    @Schema(type = "number", format = "decimal", description = "Salário do funcionário")
    private BigDecimal salario;

    @UISchema()
    @Schema(type = "string", format = "date", description = "Data de admissão do funcionário")
    private LocalDate dataAdmissao;

    @UISchema()
    @Schema(description = "Endereço do funcionário")
    private EnderecoDTO endereco;

    @UISchema()
    @Schema(description = "Indica se o funcionário está ativo", defaultValue = "true")
    private boolean ativo = true;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
