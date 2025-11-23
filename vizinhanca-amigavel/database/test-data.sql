-- ============================================
-- Script de Dados de Teste
-- ============================================
-- Execute este script APÓS criar as tabelas e APÓS registrar usuários
-- ============================================

-- IMPORTANTE: Antes de executar, você precisa:
-- 1. Ter criado as tabelas (schema.sql)
-- 2. Ter registrado pelo menos um usuário via aplicação
-- 3. Obter o UUID do usuário em auth.users
-- 4. Atualizar os IDs abaixo com valores reais

-- ============================================
-- 1. Criar um Condomínio de Teste
-- ============================================

INSERT INTO condominio (nome, endereco, cep, cidade, estado) 
VALUES 
  ('Condomínio Residencial Primavera', 'Rua das Flores, 100', '01310-100', 'São Paulo', 'SP'),
  ('Edifício Central', 'Avenida Principal, 500', '04567-890', 'São Paulo', 'SP')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. Associar Usuário ao Condomínio e Verificar
-- ============================================
-- Substitua 'SEU_USER_ID_AQUI' pelo UUID real do usuário em auth.users
-- Você pode encontrar o ID no Dashboard do Supabase > Authentication > Users

-- Exemplo (descomente e ajuste):
-- UPDATE usuario 
-- SET id_condominio = 1, verificado = true 
-- WHERE id = 'SEU_USER_ID_AQUI';

-- ============================================
-- 3. Criar Avisos de Teste
-- ============================================
-- Execute apenas após ter usuários verificados e associados a condomínios

-- Exemplo (descomente e ajuste os IDs):
/*
INSERT INTO aviso (titulo, conteudo, tipo, prioridade, id_usuario, id_condominio)
VALUES 
  (
    'Reunião de Condomínio',
    'A próxima reunião de condomínio será no dia 15/12 às 19h no salão de festas.',
    'evento',
    'media',
    'SEU_USER_ID_AQUI',
    1
  ),
  (
    'Alerta de Segurança',
    'Observado carro suspeito na portaria. Favor redobrar atenção.',
    'alerta',
    'alta',
    'SEU_USER_ID_AQUI',
    1
  ),
  (
    'Vaga de Estacionamento',
    'Alguém tem uma vaga disponível para alugar?',
    'recado',
    'baixa',
    'SEU_USER_ID_AQUI',
    1
  );
*/

-- ============================================
-- 4. Criar Grupos de Teste
-- ============================================
/*
INSERT INTO grupo (nome, descricao, id_condominio, id_criador)
VALUES 
  (
    'Grupo dos Pais',
    'Grupo para pais compartilharem dicas e organizarem atividades para as crianças',
    1,
    'SEU_USER_ID_AQUI'
  ),
  (
    'Clube do Livro',
    'Grupo de leitura e discussão de livros',
    1,
    'SEU_USER_ID_AQUI'
  );
*/

-- ============================================
-- 5. Criar Encomendas de Teste
-- ============================================
/*
INSERT INTO encomenda (descricao, status, id_usuario, id_condominio)
VALUES 
  (
    'Pacote da Amazon',
    'aguardando',
    'SEU_USER_ID_AQUI',
    1
  ),
  (
    'Encomenda dos Correios',
    'aguardando',
    'SEU_USER_ID_AQUI',
    1
  );
*/

-- ============================================
-- 6. Criar Ajudas Mútuas de Teste
-- ============================================
/*
INSERT INTO ajuda_mutua (titulo, descricao, tipo, status, id_usuario, id_condominio)
VALUES 
  (
    'Empresto furadeira',
    'Tenho uma furadeira que posso emprestar. Está disponível.',
    'oferta',
    'aberto',
    'SEU_USER_ID_AQUI',
    1
  ),
  (
    'Preciso de ajuda para mudança',
    'Preciso de ajuda para mover alguns móveis no próximo sábado.',
    'pedido',
    'aberto',
    'SEU_USER_ID_AQUI',
    1
  );
*/

-- ============================================
-- 7. Criar Itens Achados/Perdidos de Teste
-- ============================================
/*
INSERT INTO item_achado_perdido (titulo, descricao, tipo, id_usuario, id_condominio)
VALUES 
  (
    'Chave encontrada',
    'Encontrei uma chave na portaria. Quem perdeu?',
    'achado',
    'SEU_USER_ID_AQUI',
    1
  ),
  (
    'Gato perdido',
    'Meu gato saiu de casa. É um gato laranja com listras. Por favor, avisem se virem.',
    'perdido',
    'SEU_USER_ID_AQUI',
    1
  );
*/

-- ============================================
-- 8. Criar Localizações no Mapa de Teste
-- ============================================
/*
INSERT INTO localizacao_mapa (titulo, descricao, tipo, latitude, longitude, id_usuario, id_condominio)
VALUES 
  (
    'Buraco na calçada',
    'Há um buraco perigoso na calçada da entrada principal',
    'problema',
    -23.550520,
    -46.633308,
    'SEU_USER_ID_AQUI',
    1
  ),
  (
    'Feira de Orgânicos',
    'Toda quinta-feira tem feira de produtos orgânicos aqui',
    'ponto_interesse',
    -23.550520,
    -46.633308,
    'SEU_USER_ID_AQUI',
    1
  );
*/

-- ============================================
-- COMO ENCONTRAR SEU USER ID
-- ============================================
-- 1. Acesse o Dashboard do Supabase
-- 2. Vá em Authentication > Users
-- 3. Clique no usuário desejado
-- 4. Copie o UUID (User UID)
-- 5. Substitua 'SEU_USER_ID_AQUI' nos scripts acima

-- ============================================
-- VERIFICAÇÃO RÁPIDA
-- ============================================
-- Execute estas queries para verificar se os dados foram inseridos:

-- SELECT * FROM condominio;
-- SELECT * FROM usuario;
-- SELECT COUNT(*) FROM aviso;
-- SELECT COUNT(*) FROM grupo;
-- SELECT COUNT(*) FROM encomenda;

