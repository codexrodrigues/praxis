package org.praxisplatform.meta.ui.model.property;

/**
 * Interface que define os tipos de controle "inteligentes" (`SMART_CONTROL_TYPE`)
 * com funcionalidades automáticas específicas para necessidades corporativas.
 * Esses controles inteligentes permitem automações como busca, validação e
 * preenchimento automático, proporcionando uma experiência otimizada ao usuário.
 */
public interface SmartFieldControlType {

    /**
     * Controle para entrada de CEP, com comportamento automático de busca de endereço.
     *
     * Exemplo de uso: Campos onde é necessário capturar o CEP e automaticamente preencher
     * informações de endereço (rua, bairro, cidade) com base no valor digitado.
     */
    String SMART_CEP = "smartCep";

    /**
     * Controle para entrada de cidade, com carregamento automático de cidades disponíveis.
     *
     * Exemplo de uso: Campos onde é necessário capturar a cidade, com opções dinâmicas
     * carregadas de uma lista centralizada de cidades.
     */
    String SMART_CIDADE = "smartCidade";

    /**
     * Controle para entrada de estado, com carregamento automático de estados brasileiros.
     *
     * Exemplo de uso: Campos onde é necessário capturar o estado, com uma lista de UFs brasileiras
     * carregadas automaticamente.
     */
    String SMART_ESTADO = "smartEstado";

    /**
     * Controle para seleção de setor corporativo, com comportamento de auto-sugestão.
     *
     * Exemplo de uso: Campos onde é necessário selecionar o setor do funcionário em uma
     * lista centralizada de setores corporativos.
     */
    String SMART_SETOR = "smartSetor";

    /**
     * Controle para entrada de CPF, com validação e máscara automática.
     *
     * Exemplo de uso: Campos onde é necessário capturar o CPF do usuário, com máscara
     * e validação automática conforme o padrão brasileiro.
     */
    String SMART_CPF = "smartCpf";

    /**
     * Controle para entrada de CNPJ, com validação e máscara automática.
     *
     * Exemplo de uso: Campos onde é necessário capturar o CNPJ de uma empresa, com
     * validação e máscara automática para garantir conformidade.
     */
    String SMART_CNPJ = "smartCnpj";

    /**
     * Controle para seleção de banco, com lista dinâmica dos bancos brasileiros.
     *
     * Exemplo de uso: Campos onde é necessário capturar o banco do cliente, com uma
     * lista dinâmica de bancos registrada e mantida centralmente.
     */
    String SMART_BANCO = "smartBanco";

    /**
     * Controle para entrada de telefone, com máscara para telefone celular e fixo.
     *
     * Exemplo de uso: Campos onde é necessário capturar o número de telefone, com
     * máscara automática para DDD e número, e validação conforme o padrão brasileiro.
     */
    String SMART_TELEFONE = "smartTelefone";

    /**
     * Controle para entrada de PIS/PASEP, com validação automática.
     *
     * Exemplo de uso: Campos onde é necessário capturar o número do PIS/PASEP do usuário,
     * com validação para garantir a conformidade com o padrão.
     */
    String SMART_PIS = "smartPis";

    /**
     * Controle para entrada de matrícula corporativa, usado para cadastro de funcionários.
     *
     * Exemplo de uso: Campos onde é necessário capturar o número de matrícula do funcionário,
     * com validação e formatação específicas da empresa.
     */
    String SMART_MATRICULA = "smartMatricula";

    /**
     * Controle para entrada de placa de veículo, com máscara para o padrão brasileiro.
     *
     * Exemplo de uso: Campos onde é necessário capturar a placa de veículos, com máscara
     * e validação automática para o padrão de placas brasileiro.
     */
    String SMART_PLACA_VEICULO = "smartPlacaVeiculo";

    /**
     * Controle para entrada de dados do Funcionário, com busca por matrícula ou nome.
     *
     * Exemplo de uso: Campos onde é necessário capturar a matrícula ou o nome de um
     * funcionário e exibir automaticamente os detalhes do funcionário encontrado.
     */
    String SMART_FUNCIONARIO = "smartFuncionario";

    /**
     * Controle para entrada de dados do Cliente, com busca por ID, CPF, ou nome.
     *
     * Exemplo de uso: Campos onde é necessário capturar o ID ou nome do cliente e exibir
     * detalhes completos do cliente, como CPF, endereço e telefone.
     */
    String SMART_CLIENTE = "smartCliente";

    /**
     * Controle para entrada de dados do Produto, com busca por código ou nome.
     *
     * Exemplo de uso: Campos onde é necessário capturar o código ou o nome de um produto,
     * exibindo automaticamente as informações detalhadas, como descrição e preço.
     */
    String SMART_PRODUTO = "smartProduto";

    /**
     * Controle para entrada de dados de um Projeto, com busca por código ou título do projeto.
     *
     * Exemplo de uso: Campos onde é necessário capturar o código do projeto e exibir os
     * dados completos, como status, gerente do projeto e prazo.
     */
    String SMART_PROJETO = "smartProjeto";

    /**
     * Controle para entrada de dados de Fornecedor, com busca por CNPJ ou razão social.
     *
     * Exemplo de uso: Campos onde é necessário capturar o CNPJ ou razão social de um fornecedor,
     * exibindo informações como endereço, telefone e contato principal.
     */
    String SMART_FORNECEDOR = "smartFornecedor";

    /**
     * Controle para entrada de dados de Departamento, com busca por código ou nome do departamento.
     *
     * Exemplo de uso: Campos onde é necessário capturar o nome do departamento e exibir os
     * detalhes do departamento, como código, localização e gerente.
     */
    String SMART_DEPARTAMENTO = "smartDepartamento";

    /**
     * Controle para entrada de dados de Conta Corrente, com busca por número ou nome do titular.
     *
     * Exemplo de uso: Campos onde é necessário capturar o número da conta corrente ou o nome do
     * titular e exibir detalhes como saldo, agência e histórico de transações recentes.
     */
    String SMART_CONTA_CORRENTE = "smartContaCorrente";

    /**
     * Controle para entrada de dados de Contrato, com busca por número ou nome do contrato.
     *
     * Exemplo de uso: Campos onde é necessário capturar o número do contrato ou nome do
     * contrato e exibir detalhes como data de início, término e status atual.
     */
    String SMART_CONTRATO = "smartContrato";

}
