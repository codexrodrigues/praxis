-- Cargos
INSERT INTO cargos (id, nome, nivel, descricao, salario_minimo, salario_maximo) VALUES
    (1, 'Engenheiro de Software', 'Pleno', 'Desenvolvimento de software e sistemas', 7000.00, 12000.00),
    (2, 'Analista de RH', 'Junior', 'Recrutamento e seleção, administração de pessoal', 4000.00, 7000.00),
    (3, 'Gerente de Projetos', 'Sênior', 'Gerenciamento de projetos de TI', 12000.00, 18000.00),
    (4, 'Desenvolvedor Frontend', 'Pleno', 'Implementação de interfaces web', 6000.00, 10000.00),
    (5, 'Desenvolvedor Backend', 'Pleno', 'Construção de APIs e serviços', 6000.00, 10000.00),
    (6, 'Analista Financeiro', 'Junior', 'Controle e análise financeira', 4000.00, 8000.00),
    (7, 'Analista de Dados', 'Pleno', 'Modelagem e análise de dados', 6500.00, 11000.00),
    (8, 'Gerente de Marketing', 'Sênior', 'Planejamento de campanhas e marketing', 10000.00, 16000.00),
    (9, 'Assistente Administrativo', 'Junior', 'Suporte administrativo geral', 3000.00, 5000.00),
    (10, 'Diretor de Operações', 'Executivo', 'Gestão de operações da empresa', 18000.00, 25000.00);

-- Departamentos
-- responsavel_id será atualizado após inserir funcionarios
INSERT INTO departamentos (id, nome, codigo, responsavel_id) VALUES
    (1, 'Tecnologia da Informação', 'TI', NULL),
    (2, 'Recursos Humanos', 'RH', NULL),
    (3, 'Gerenciamento de Projetos', 'GP', NULL),
    (4, 'Financeiro', 'FIN', NULL),
    (5, 'Marketing', 'MKT', NULL),
    (6, 'Administrativo', 'ADM', NULL),
    (7, 'Operações', 'OPS', NULL),
    (8, 'Dados e BI', 'DBI', NULL),
    (9, 'Atendimento ao Cliente', 'SAC', NULL),
    (10, 'Vendas', 'VEN', NULL);

-- Funcionarios
-- Campos de Endereco permanecem inline
INSERT INTO funcionarios (id, nome_completo, cpf, data_nascimento, email, telefone, salario, data_admissao, ativo, cargo_id, departamento_id, logradouro, numero, complemento, bairro, cidade, estado, cep) VALUES
    (1, 'Alice Wonderland', '111.111.111-11', '1990-05-15', 'alice.wonderland@example.com', '11999999991', 9500.00, '2022-01-10', true, 1, 1, 'Rua das Palmeiras', '123', 'Apto 101', 'Centro', 'São Paulo', 'SP', '01000-001'),
    (2, 'Bob The Builder', '222.222.222-22', '1985-08-20', 'bob.builder@example.com', '11999999992', 5500.00, '2021-07-20', true, 2, 2, 'Avenida Principal', '456', NULL, 'Vila Industrial', 'São Paulo', 'SP', '02000-002'),
    (3, 'Charles Xavier', '333.333.333-33', '1978-11-02', 'charles.xavier@example.com', '11999999993', 15000.00, '2020-03-15', true, 3, 3, 'Alameda dos Anjos', '789', 'Casa A', 'Jardins', 'São Paulo', 'SP', '03000-003'),
    (4, 'Eve Johnson', '444.444.444-44', '1992-02-10', 'eve.johnson@example.com', '11999999994', 8000.00, '2023-01-05', true, 4, 1, 'Rua Um', '10', NULL, 'Bairro A', 'São Paulo', 'SP', '04000-004'),
    (5, 'Frank Castle', '555.555.555-55', '1987-03-15', 'frank.castle@example.com', '11999999995', 8500.00, '2022-06-18', true, 5, 1, 'Rua Dois', '20', NULL, 'Bairro B', 'São Paulo', 'SP', '05000-005'),
    (6, 'Grace Hopper', '666.666.666-66', '1980-12-09', 'grace.hopper@example.com', '11999999996', 9000.00, '2021-09-10', true, 7, 8, 'Rua Tres', '30', 'Casa', 'Bairro C', 'São Paulo', 'SP', '06000-006'),
    (7, 'Henry Ford', '777.777.777-77', '1975-07-07', 'henry.ford@example.com', '11999999997', 14000.00, '2019-05-25', true, 8, 5, 'Rua Quatro', '40', NULL, 'Bairro D', 'São Paulo', 'SP', '07000-007'),
    (8, 'Irene Adler', '888.888.888-88', '1993-04-22', 'irene.adler@example.com', '11999999998', 6500.00, '2020-11-30', true, 6, 4, 'Rua Cinco', '50', 'Apto 202', 'Bairro E', 'São Paulo', 'SP', '08000-008'),
    (9, 'John Doe', '999.999.999-99', '1991-01-11', 'john.doe@example.com', '11999999999', 4000.00, '2023-03-12', true, 9, 6, 'Rua Seis', '60', NULL, 'Bairro F', 'São Paulo', 'SP', '09000-009'),
    (10, 'Karen Page', '101.010.101-01', '1988-05-05', 'karen.page@example.com', '11999999900', 5600.00, '2022-04-01', true, 2, 2, 'Rua Sete', '70', NULL, 'Bairro G', 'São Paulo', 'SP', '10000-010'),
    (11, 'Luke Cage', '202.020.202-02', '1984-08-30', 'luke.cage@example.com', '11999999901', 9000.00, '2021-08-08', true, 7, 8, 'Rua Oito', '80', NULL, 'Bairro H', 'São Paulo', 'SP', '11000-011'),
    (12, 'Mary Poppins', '303.030.303-03', '1979-12-12', 'mary.poppins@example.com', '11999999902', 15000.00, '2018-02-14', true, 3, 3, 'Rua Nove', '90', NULL, 'Bairro I', 'São Paulo', 'SP', '12000-012'),
    (13, 'Nathan Drake', '404.040.404-04', '1983-11-19', 'nathan.drake@example.com', '11999999903', 20000.00, '2017-06-30', true, 10, 7, 'Rua Dez', '100', NULL, 'Bairro J', 'São Paulo', 'SP', '13000-013'),
    (14, 'Olivia Benson', '505.050.505-05', '1986-09-09', 'olivia.benson@example.com', '11999999904', 14200.00, '2020-10-10', true, 8, 5, 'Rua Onze', '110', NULL, 'Bairro K', 'São Paulo', 'SP', '14000-014'),
    (15, 'Peter Parker', '606.060.606-06', '1995-06-01', 'peter.parker@example.com', '11999999905', 8100.00, '2023-05-20', true, 4, 1, 'Rua Doze', '120', 'Casa', 'Bairro L', 'São Paulo', 'SP', '15000-015');

-- Atualiza responsaveis dos departamentos
UPDATE departamentos SET responsavel_id = 3 WHERE id = 1;
UPDATE departamentos SET responsavel_id = 2 WHERE id = 2;
UPDATE departamentos SET responsavel_id = 3 WHERE id = 3;
UPDATE departamentos SET responsavel_id = 8 WHERE id = 4;
UPDATE departamentos SET responsavel_id = 7 WHERE id = 5;
UPDATE departamentos SET responsavel_id = 9 WHERE id = 6;
UPDATE departamentos SET responsavel_id = 13 WHERE id = 7;
UPDATE departamentos SET responsavel_id = 6 WHERE id = 8;
UPDATE departamentos SET responsavel_id = 10 WHERE id = 9;
UPDATE departamentos SET responsavel_id = 14 WHERE id = 10;

-- Dependentes
INSERT INTO dependentes (id, nome_completo, data_nascimento, parentesco, funcionario_id) VALUES
    (1, 'Diana Prince', '2015-06-25', 'Filha', 1),
    (2, 'Clark Kent', '2012-05-05', 'Filho', 1),
    (3, 'Lois Lane', '2010-09-12', 'Cônjuge', 2),
    (4, 'Jimmy Olsen', '2015-12-20', 'Filho', 2),
    (5, 'Sarah Connor', '2016-03-15', 'Filha', 3),
    (6, 'Kyle Reese', '2013-07-07', 'Cônjuge', 4),
    (7, 'Marty McFly', '2018-11-11', 'Filho', 5),
    (8, 'Doc Brown', '2014-06-06', 'Cônjuge', 6),
    (9, 'Leia Organa', '2017-02-14', 'Filha', 7),
    (10, 'Han Solo', '2015-04-22', 'Cônjuge', 8),
    (11, 'Toni Stark', '2012-03-03', 'Filho', 9),
    (12, 'Pepper Potts', '2019-05-05', 'Filha', 10),
    (13, 'Bruce Wayne', '2011-01-01', 'Filho', 11),
    (14, 'Selina Kyle', '2013-10-10', 'Cônjuge', 12),
    (15, 'Barry Allen', '2016-08-08', 'Filho', 13);

-- Folhas de Pagamento
INSERT INTO folhas_pagamento (id, ano, mes, salario_bruto, total_descontos, salario_liquido, data_pagamento, funcionario_id) VALUES
    (1, 2023, 9, 9500.00, 1200.00, 8300.00, '2023-10-05', 1),
    (2, 2023, 10, 9500.00, 1200.00, 8300.00, '2023-11-05', 1),
    (3, 2023, 10, 5500.00, 800.00, 4700.00, '2023-11-05', 2),
    (4, 2023, 10, 15000.00, 2000.00, 13000.00, '2023-11-05', 3),
    (5, 2023, 10, 8000.00, 1000.00, 7000.00, '2023-11-05', 4),
    (6, 2023, 10, 8500.00, 1100.00, 7400.00, '2023-11-05', 5),
    (7, 2023, 10, 9000.00, 1200.00, 7800.00, '2023-11-05', 6),
    (8, 2023, 10, 14000.00, 2200.00, 11800.00, '2023-11-05', 7),
    (9, 2023, 10, 6500.00, 900.00, 5600.00, '2023-11-05', 8),
    (10, 2023, 10, 4000.00, 500.00, 3500.00, '2023-11-05', 9),
    (11, 2023, 10, 5600.00, 800.00, 4800.00, '2023-11-05', 10),
    (12, 2023, 10, 9000.00, 1200.00, 7800.00, '2023-11-05', 11),
    (13, 2023, 10, 15000.00, 2000.00, 13000.00, '2023-11-05', 12),
    (14, 2023, 10, 20000.00, 3000.00, 17000.00, '2023-11-05', 13),
    (15, 2023, 10, 14200.00, 2100.00, 12100.00, '2023-11-05', 14),
    (16, 2023, 10, 8100.00, 1000.00, 7100.00, '2023-11-05', 15);

-- Eventos de Folha
INSERT INTO eventos_folha (id, descricao, tipo, valor, folha_pagamento_id) VALUES
    (1, 'Bônus de Performance', 'ADICIONAL', 500.00, 1),
    (2, 'INSS', 'DESCONTO', 700.00, 1),
    (3, 'Vale Refeição', 'DESCONTO', 300.00, 1),
    (4, 'Gratificação', 'ADICIONAL', 300.00, 2),
    (5, 'INSS', 'DESCONTO', 700.00, 2),
    (6, 'Vale Alimentação', 'DESCONTO', 250.00, 3),
    (7, 'Bônus', 'ADICIONAL', 200.00, 3),
    (8, 'Vale Transporte', 'DESCONTO', 150.00, 4),
    (9, 'Bônus', 'ADICIONAL', 500.00, 4),
    (10, 'INSS', 'DESCONTO', 800.00, 5),
    (11, 'Bônus', 'ADICIONAL', 300.00, 5),
    (12, 'INSS', 'DESCONTO', 850.00, 6),
    (13, 'Bônus', 'ADICIONAL', 350.00, 6),
    (14, 'INSS', 'DESCONTO', 900.00, 7),
    (15, 'Bônus', 'ADICIONAL', 400.00, 7),
    (16, 'INSS', 'DESCONTO', 1100.00, 8),
    (17, 'Bônus', 'ADICIONAL', 500.00, 8),
    (18, 'INSS', 'DESCONTO', 750.00, 9),
    (19, 'Bônus', 'ADICIONAL', 250.00, 9),
    (20, 'INSS', 'DESCONTO', 450.00, 10),
    (21, 'Bônus', 'ADICIONAL', 150.00, 10),
    (22, 'INSS', 'DESCONTO', 600.00, 11),
    (23, 'Bônus', 'ADICIONAL', 200.00, 11),
    (24, 'INSS', 'DESCONTO', 900.00, 12),
    (25, 'Bônus', 'ADICIONAL', 300.00, 12),
    (26, 'INSS', 'DESCONTO', 1200.00, 13),
    (27, 'Bônus', 'ADICIONAL', 400.00, 13),
    (28, 'INSS', 'DESCONTO', 1400.00, 14),
    (29, 'Bônus', 'ADICIONAL', 600.00, 14),
    (30, 'INSS', 'DESCONTO', 1000.00, 15),
    (31, 'Bônus', 'ADICIONAL', 300.00, 15),
    (32, 'INSS', 'DESCONTO', 700.00, 16),
    (33, 'Bônus', 'ADICIONAL', 300.00, 16);

-- Férias e Afastamentos
INSERT INTO ferias_afastamentos (id, tipo, data_inicio, data_fim, observacoes, funcionario_id) VALUES
    (1, 'FÉRIAS', '2023-12-01', '2023-12-30', 'Férias anuais', 2),
    (2, 'FÉRIAS', '2023-07-01', '2023-07-15', 'Descanso merecido', 1),
    (3, 'LICENÇA MÉDICA', '2023-08-10', '2023-08-20', 'Cirurgia', 3),
    (4, 'FÉRIAS', '2023-09-05', '2023-09-20', 'Viagem em família', 4),
    (5, 'FÉRIAS', '2023-06-10', '2023-06-25', 'Visita aos parentes', 5),
    (6, 'LICENÇA MÉDICA', '2023-05-01', '2023-05-10', 'Tratamento de saúde', 6),
    (7, 'FÉRIAS', '2023-04-15', '2023-04-30', 'Descanso', 7),
    (8, 'FÉRIAS', '2023-03-01', '2023-03-15', 'Viagem curta', 8),
    (9, 'LICENÇA MÉDICA', '2023-02-05', '2023-02-12', 'Doença sazonal', 9),
    (10, 'FÉRIAS', '2023-01-10', '2023-01-25', 'Passeio turístico', 10),
    (11, 'FÉRIAS', '2022-12-01', '2022-12-20', 'Férias anteriores', 11),
    (12, 'LICENÇA MÉDICA', '2022-11-05', '2022-11-15', 'Fratura', 12),
    (13, 'FÉRIAS', '2022-10-10', '2022-10-25', 'Visita familiar', 13),
    (14, 'FÉRIAS', '2022-09-01', '2022-09-15', 'Viagem internacional', 14),
    (15, 'LICENÇA MÉDICA', '2022-08-20', '2022-08-30', 'Recuperação cirurgia', 15);
