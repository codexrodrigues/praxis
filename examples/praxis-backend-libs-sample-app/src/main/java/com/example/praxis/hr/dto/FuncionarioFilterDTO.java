package com.example.praxis.hr.dto;

import org.praxisplatform.uischema.filter.annotation.Filterable;
import org.praxisplatform.uischema.filter.dto.GenericFilterDTO;
import org.praxisplatform.uischema.extension.annotation.UISchema;
import org.praxisplatform.uischema.FieldControlType;
import com.example.praxis.common.config.ApiRouteDefinitions;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;

public class FuncionarioFilterDTO implements GenericFilterDTO {

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE)
    private String nomeCompleto;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.EQUAL)
    private String cpf;

    @UISchema(controlType = FieldControlType.SELECT,
            endpoint = "/api/hr/cargos",
            valueField = "id",
            displayField = "nome")
    @Filterable(operation = Filterable.FilterOperation.EQUAL, relation = "cargo.id")
    private Long cargoId;

    @UISchema(controlType = FieldControlType.SELECT,
            endpoint = ApiRouteDefinitions.HR_DEPARTAMENTOS_PATH,
            valueField = "id",
            displayField = "nome")
    @Filterable(operation = Filterable.FilterOperation.EQUAL, relation = "departamento.id")
    private Long departamentoId;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE)
    private String email;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE)
    private String telefone;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.BETWEEN)
    private List<LocalDate> dataNascimento;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.BETWEEN)
    private List<BigDecimal> salario;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.BETWEEN)
    private List<LocalDate> dataAdmissao;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE, relation = "endereco.logradouro")
    private String logradouro;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE, relation = "endereco.numero")
    private String numero;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE, relation = "endereco.complemento")
    private String complemento;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE, relation = "endereco.bairro")
    private String bairro;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE, relation = "endereco.cidade")
    private String cidade;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE, relation = "endereco.estado")
    private String estado;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.LIKE, relation = "endereco.cep")
    private String cep;

    @UISchema
    @Filterable(operation = Filterable.FilterOperation.EQUAL)
    private Boolean ativo;

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

    public List<LocalDate> getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(List<LocalDate> dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public List<BigDecimal> getSalario() {
        return salario;
    }

    public void setSalario(List<BigDecimal> salario) {
        this.salario = salario;
    }

    public List<LocalDate> getDataAdmissao() {
        return dataAdmissao;
    }

    public void setDataAdmissao(List<LocalDate> dataAdmissao) {
        this.dataAdmissao = dataAdmissao;
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

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}
