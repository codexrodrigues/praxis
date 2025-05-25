package com.example.praxis.sampleapp.hr.dto;

import org.praxisplatform.meta.ui.filter.dto.GenericFilterDTO;
import org.praxisplatform.meta.ui.annotation.field.UISchema;
import org.praxisplatform.meta.ui.annotation.field.UIExtension;
import org.praxisplatform.meta.ui.annotation.field.ExtensionProperty;
import org.praxisplatform.meta.ui.config.FieldConfigProperty;
import org.praxisplatform.meta.ui.config.FieldControlType;

// Assuming these extensions exist, if not, will use UIExtension as fallback
import org.praxisplatform.meta.ui.annotation.validation.UICPFExtension;
import org.praxisplatform.meta.ui.annotation.validation.UIEmailExtension;
import org.praxisplatform.meta.ui.annotation.validation.UIDataExtension;
import org.praxisplatform.meta.ui.annotation.validation.UIMoedaExtension;
import org.praxisplatform.meta.ui.annotation.validation.UITelefoneExtension;
import org.praxisplatform.meta.ui.annotation.validation.UICepExtension;
// UINomeProprioExtension is not a standard Praxis annotation, will use UIExtension

import java.math.BigDecimal;
import java.time.LocalDate;

public class FuncionarioDTO extends GenericFilterDTO {

    @UISchema(label = "ID", accessMode = UISchema.AccessMode.READ_ONLY)
    private Long id;

    @UISchema(label = "Nome Completo", description = "Nome completo do funcionário")
    @UIExtension(properties = {
        @ExtensionProperty(name = FieldConfigProperty.CONTROL_TYPE, value = FieldControlType.TEXT_INPUT)
        // Assuming a 'nomeProprio' validation or mask could be handled by a custom frontend component
        // or a more generic validation mechanism if UINomeProprioExtension is not available.
    })
    private String nomeCompleto;

    @UISchema(label = "CPF")
    @UICPFExtension // Assuming this exists and provides CPF specific formatting/validation
    private String cpf;

    @UISchema(label = "Data de Nascimento")
    @UIDataExtension
    private LocalDate dataNascimento;

    @UISchema(label = "Email")
    @UIEmailExtension
    private String email;

    @UISchema(label = "Telefone")
    @UITelefoneExtension // Assuming this exists for phone number formatting
    private String telefone;

    @UISchema(label = "Salário")
    @UIMoedaExtension // Assuming this exists for currency formatting
    private BigDecimal salario;

    @UISchema(label = "Data de Admissão")
    @UIDataExtension
    private LocalDate dataAdmissao;

    @UISchema(label = "Ativo")
    private Boolean ativo;

    @UISchema(label = "Cargo ID")
    // In a real scenario, this would likely be a lookup/dropdown.
    // @UIExtension(properties = {
    //     @ExtensionProperty(name = FieldConfigProperty.CONTROL_TYPE, value = FieldControlType.SELECT),
    //     @ExtensionProperty(name = FieldConfigProperty.OPTIONS_URL, value = "/api/hr/cargos/lookup")
    // })
    private Long cargoId;

    @UISchema(label = "Cargo", accessMode = UISchema.AccessMode.READ_ONLY)
    private String nomeCargo;

    @UISchema(label = "Departamento ID")
    // Similar to cargoId, this would be a lookup.
    // @UIExtension(properties = {
    //     @ExtensionProperty(name = FieldConfigProperty.CONTROL_TYPE, value = FieldControlType.SELECT),
    //     @ExtensionProperty(name = FieldConfigProperty.OPTIONS_URL, value = "/api/hr/departamentos/lookup")
    // })
    private Long departamentoId;

    @UISchema(label = "Departamento", accessMode = UISchema.AccessMode.READ_ONLY)
    private String nomeDepartamento;

    // Address Fields
    @UISchema(label = "Logradouro")
    private String logradouro;

    @UISchema(label = "Número")
    private String numero;

    @UISchema(label = "Complemento")
    private String complemento;

    @UISchema(label = "Bairro")
    private String bairro;

    @UISchema(label = "Cidade")
    private String cidade;

    @UISchema(label = "Estado")
    private String estado;

    @UISchema(label = "CEP")
    @UICepExtension // Assuming this exists for CEP formatting/validation
    private String cep;

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

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Long getCargoId() {
        return cargoId;
    }

    public void setCargoId(Long cargoId) {
        this.cargoId = cargoId;
    }

    public String getNomeCargo() {
        return nomeCargo;
    }

    public void setNomeCargo(String nomeCargo) {
        this.nomeCargo = nomeCargo;
    }

    public Long getDepartamentoId() {
        return departamentoId;
    }

    public void setDepartamentoId(Long departamentoId) {
        this.departamentoId = departamentoId;
    }

    public String getNomeDepartamento() {
        return nomeDepartamento;
    }

    public void setNomeDepartamento(String nomeDepartamento) {
        this.nomeDepartamento = nomeDepartamento;
    }

    public String getLogradouro() {
        return logradouro;
    }

    public void setLogradouro(String logradouro) {
        this.logradouro = logradouro;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }
}
