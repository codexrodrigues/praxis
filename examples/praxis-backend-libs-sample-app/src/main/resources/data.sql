-- Cargos
INSERT INTO cargos (id, nome, nivel, descricao, salario_minimo, salario_maximo) VALUES
(1, 'Engenheiro de Software', 'Pleno', 'Desenvolvimento de software e sistemas', 7000.00, 12000.00),
(2, 'Analista de RH', 'Junior', 'Recrutamento e seleção, administração de pessoal', 4000.00, 7000.00),
(3, 'Gerente de Projetos', 'Sênior', 'Gerenciamento de projetos de TI', 12000.00, 18000.00);

-- Departamentos
-- responsavel_id will be updated after funcionarios are inserted
INSERT INTO departamentos (id, nome, codigo, responsavel_id) VALUES
(1, 'Tecnologia da Informação', 'TI', NULL),
(2, 'Recursos Humanos', 'RH', NULL),
(3, 'Gerenciamento de Projetos', 'GP', NULL);

-- Funcionarios
-- Embedded Endereco fields are prefixed with 'endereco_' by default if no @AttributeOverrides are specified.
-- Assuming 'logradouro', 'numero', etc. are field names in Endereco embeddable class.
INSERT INTO funcionarios (id, nome_completo, cpf, data_nascimento, email, telefone, salario, data_admissao, ativo, cargo_id, departamento_id, logradouro, numero, complemento, bairro, cidade, estado, cep) VALUES
(1, 'Alice Wonderland', '111.111.111-11', '1990-05-15', 'alice.wonderland@example.com', '11999999991', 9500.00, '2022-01-10', true, 1, 1, 'Rua das Palmeiras', '123', 'Apto 101', 'Centro', 'São Paulo', 'SP', '01000-001'),
(2, 'Bob The Builder', '222.222.222-22', '1985-08-20', 'bob.builder@example.com', '11999999992', 5500.00, '2021-07-20', true, 2, 2, 'Avenida Principal', '456', NULL, 'Vila Industrial', 'São Paulo', 'SP', '02000-002'),
(3, 'Charles Xavier', '333.333.333-33', '1978-11-02', 'charles.xavier@example.com', '11999999993', 15000.00, '2020-03-15', true, 3, 3, 'Alameda dos Anjos', '789', 'Casa A', 'Jardins', 'São Paulo', 'SP', '03000-003');

-- Update responsavel_id for departamentos
UPDATE departamentos SET responsavel_id = 3 WHERE id = 1; -- Charles Xavier as manager of TI
UPDATE departamentos SET responsavel_id = 2 WHERE id = 2; -- Bob The Builder as manager of RH (example)
UPDATE departamentos SET responsavel_id = 3 WHERE id = 3; -- Charles Xavier as manager of GP

-- Dependentes (Example for Alice Wonderland)
INSERT INTO dependentes (id, nome_completo, data_nascimento, parentesco, funcionario_id) VALUES
(1, 'Diana Prince', '2015-06-25', 'Filha', 1);

-- FolhaPagamento (Example for Alice Wonderland)
INSERT INTO folhas_pagamento (id, ano, mes, salario_bruto, total_descontos, salario_liquido, data_pagamento, funcionario_id) VALUES
(1, 2023, 10, 9500.00, 1200.00, 8300.00, '2023-11-05', 1);

-- EventoFolha (Example for Alice's FolhaPagamento)
INSERT INTO eventos_folha (id, descricao, tipo, valor, folha_pagamento_id) VALUES
(1, 'Bônus de Performance', 'ADICIONAL', 500.00, 1),
(2, 'INSS', 'DESCONTO', 700.00, 1),
(3, 'Vale Refeição', 'DESCONTO', 300.00, 1);

-- FeriasAfastamento (Example for Bob The Builder)
INSERT INTO ferias_afastamentos (id, tipo, data_inicio, data_fim, observacoes, funcionario_id) VALUES
(1, 'FÉRIAS', '2023-12-01', '2023-12-30', 'Férias anuais', 2);
