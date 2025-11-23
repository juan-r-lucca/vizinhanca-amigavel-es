-- ============================================
-- Script para Criar Condomínio e Associar Usuário Atual
-- ============================================
-- Este script cria um condomínio de exemplo e associa o usuário atualmente autenticado
-- Execute este script no SQL Editor do Supabase APÓS fazer login na aplicação
-- ============================================

-- 1. Criar um condomínio de exemplo
-- Nota: Se já existir um condomínio, o script vai usar o primeiro encontrado ou criar um novo
DO $$
DECLARE
  v_condominio_id BIGINT;
  v_user_id UUID;
BEGIN
  -- Obter o ID do usuário atualmente autenticado
  v_user_id := auth.uid();
  
  -- Verificar se há um usuário autenticado
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário autenticado. Por favor, faça login na aplicação primeiro.';
  END IF;

  -- Verificar se o usuário já existe na tabela usuario
  IF NOT EXISTS (SELECT 1 FROM usuario WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado na tabela usuario. Por favor, registre-se primeiro na aplicação.';
  END IF;

  -- Tentar encontrar um condomínio existente ou criar um novo
  SELECT id INTO v_condominio_id 
  FROM condominio 
  WHERE nome = 'Minha Comunidade'
  LIMIT 1;

  -- Se não encontrou, criar um novo condomínio
  IF v_condominio_id IS NULL THEN
    INSERT INTO condominio (nome, endereco, cep, cidade, estado)
    VALUES (
      'Minha Comunidade',
      'Rua Exemplo, 123',
      '12345-678',
      'São Paulo',
      'SP'
    )
    RETURNING id INTO v_condominio_id;
    
    RAISE NOTICE 'Condomínio criado com sucesso! ID: %', v_condominio_id;
  ELSE
    RAISE NOTICE 'Condomínio já existe. Usando ID: %', v_condominio_id;
  END IF;

  -- Associar o usuário ao condomínio e marcar como verificado
  UPDATE usuario
  SET 
    id_condominio = v_condominio_id,
    verificado = true,
    metodo_verificacao = 'convite'
  WHERE id = v_user_id;

  -- Verificar se a atualização foi bem-sucedida
  IF FOUND THEN
    RAISE NOTICE 'Usuário associado ao condomínio com sucesso!';
    RAISE NOTICE 'Usuário ID: % | Condomínio ID: % | Verificado: true', v_user_id, v_condominio_id;
  ELSE
    RAISE EXCEPTION 'Erro ao associar usuário ao condomínio.';
  END IF;

END $$;

-- ============================================
-- Script Alternativo: Criar condomínio com dados customizados
-- ============================================
-- Se você quiser criar um condomínio com dados específicos, use este script:

/*
DO $$
DECLARE
  v_condominio_id BIGINT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário autenticado.';
  END IF;

  -- Criar condomínio com seus dados
  INSERT INTO condominio (nome, endereco, cep, cidade, estado)
  VALUES (
    'Nome do Seu Condomínio',  -- Altere aqui
    'Endereço Completo',       -- Altere aqui
    '12345-678',               -- Altere aqui
    'Cidade',                  -- Altere aqui
    'SP'                       -- Altere aqui
  )
  RETURNING id INTO v_condominio_id;

  -- Associar usuário
  UPDATE usuario
  SET 
    id_condominio = v_condominio_id,
    verificado = true,
    metodo_verificacao = 'convite'
  WHERE id = v_user_id;

  RAISE NOTICE 'Condomínio criado e usuário associado! ID: %', v_condominio_id;
END $$;
*/

-- ============================================
-- Verificar se deu tudo certo
-- ============================================
-- Execute esta query para verificar se o usuário está associado:

-- SELECT 
--   u.id,
--   u.nome,
--   u.email,
--   u.id_condominio,
--   u.verificado,
--   c.nome as nome_condominio,
--   c.endereco
-- FROM usuario u
-- LEFT JOIN condominio c ON u.id_condominio = c.id
-- WHERE u.id = auth.uid();

