package com.example.praxis.hr.dto;

import org.praxisplatform.meta.ui.model.annotation.UISchema;

public class EnderecoDTO {

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
    private String cep;

    // Getters and Setters
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
