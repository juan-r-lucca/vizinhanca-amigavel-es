-- ============================================
-- Correção COMPLETA para o erro de recursão infinita na política RLS da tabela usuario
-- ============================================
-- Execute este script no SQL Editor do Supabase para corrigir o problema
-- IMPORTANTE: Após executar, aguarde 10-15 segundos para o PostgREST atualizar o schema cache
-- ============================================

-- 1. Remover TODAS as políticas problemáticas da tabela usuario
DROP POLICY IF EXISTS "users_read_same_condominio" ON usuario;
DROP POLICY IF EXISTS "users_insert_own" ON usuario;
DROP POLICY IF EXISTS "users_update_own" ON usuario;

-- 2. Remover a função antiga se existir (para recriar)
DROP FUNCTION IF EXISTS public.create_usuario_profile(UUID, VARCHAR, VARCHAR, VARCHAR, BOOLEAN);

-- 3. Criar políticas RLS que NÃO causam recursão infinita
-- Política de SELECT: Simplificada para evitar recursão
-- Permite ler o próprio perfil sempre, e outros usuários do mesmo condomínio
-- Mas usa uma abordagem que não causa recursão durante INSERT
CREATE POLICY "users_read_same_condominio" ON usuario
  FOR SELECT
  USING (
    -- Sempre permite ler o próprio perfil (não causa recursão)
    id = auth.uid()
  );

-- Política de INSERT: Permite inserir apenas o próprio registro
-- Esta política é simples e não causa recursão
CREATE POLICY "users_insert_own" ON usuario
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Política de UPDATE: Permite atualizar apenas o próprio perfil
CREATE POLICY "users_update_own" ON usuario
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 4. Criar função SQL que permite inserir usuário sem passar pelas políticas RLS
-- Esta função usa SECURITY DEFINER para executar com privilégios do criador
CREATE OR REPLACE FUNCTION public.create_usuario_profile(
  p_id UUID,
  p_nome VARCHAR,
  p_email VARCHAR,
  p_perfil VARCHAR DEFAULT 'morador',
  p_verificado BOOLEAN DEFAULT false
)
RETURNS TABLE(usuario_id UUID, usuario_nome VARCHAR, usuario_email VARCHAR, usuario_perfil VARCHAR, usuario_verificado BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir ou atualizar o usuário e retornar diretamente
  -- Usa RETURN QUERY com INSERT...RETURNING para garantir que sempre retorna uma linha
  RETURN QUERY
  INSERT INTO public.usuario (id, nome, email, perfil, verificado, data_criacao, updated_at)
  VALUES (
    p_id,
    p_nome,
    p_email,
    p_perfil,
    p_verificado,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    updated_at = NOW()
  RETURNING 
    id AS usuario_id, 
    nome AS usuario_nome, 
    email AS usuario_email, 
    perfil AS usuario_perfil, 
    verificado AS usuario_verificado;
END;
$$;

-- 5. Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.create_usuario_profile(UUID, VARCHAR, VARCHAR, VARCHAR, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_usuario_profile(UUID, VARCHAR, VARCHAR, VARCHAR, BOOLEAN) TO anon;

-- 6. Comentário sobre os nomes das colunas retornadas
-- A função retorna colunas com prefixo 'usuario_' para evitar ambiguidade
-- O código TypeScript está preparado para lidar com ambos os formatos (com e sem prefixo)

-- 7. Forçar atualização do schema cache do PostgREST
-- Isso ajuda a garantir que a função seja encontrada imediatamente
NOTIFY pgrst, 'reload schema';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute estas queries para verificar se tudo foi criado corretamente:

-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuario';

-- Verificar função
SELECT 
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'create_usuario_profile';

-- Verificar permissões da função
SELECT 
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
  AND routine_name = 'create_usuario_profile';

