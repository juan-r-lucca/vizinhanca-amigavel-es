-- ============================================
-- Correção para o erro de recursão infinita na política RLS da tabela usuario
-- ============================================
-- Execute este script no SQL Editor do Supabase para corrigir o problema
-- IMPORTANTE: Após executar, aguarde 5-10 segundos para o PostgREST atualizar o schema cache
-- ============================================

-- 1. Remover a política problemática de INSERT (se existir)
DROP POLICY IF EXISTS "users_insert_own" ON usuario;

-- 2. Remover a função antiga se existir (para recriar)
DROP FUNCTION IF EXISTS public.create_usuario_profile(UUID, VARCHAR, VARCHAR, VARCHAR, BOOLEAN);

-- 3. Criar uma função que permite inserir usuário sem passar pelas políticas RLS
-- Esta função usa SECURITY DEFINER para executar com privilégios do criador
-- IMPORTANTE: A ordem dos parâmetros é importante para o PostgREST
CREATE OR REPLACE FUNCTION public.create_usuario_profile(
  p_id UUID,
  p_nome VARCHAR,
  p_email VARCHAR,
  p_perfil VARCHAR DEFAULT 'morador',
  p_verificado BOOLEAN DEFAULT false
)
RETURNS TABLE(id UUID, nome VARCHAR, email VARCHAR, perfil VARCHAR, verificado BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    updated_at = NOW();
  
  RETURN QUERY
  SELECT u.id, u.nome, u.email, u.perfil, u.verificado
  FROM public.usuario u
  WHERE u.id = p_id;
END;
$$;

-- 4. Criar política que permite usar a função para usuários autenticados
-- Esta política é mais simples e não causa recursão
CREATE POLICY "users_insert_own" ON usuario
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- 5. Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.create_usuario_profile(UUID, VARCHAR, VARCHAR, VARCHAR, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_usuario_profile(UUID, VARCHAR, VARCHAR, VARCHAR, BOOLEAN) TO anon;

-- 6. Forçar atualização do schema cache do PostgREST
-- Isso ajuda a garantir que a função seja encontrada imediatamente
NOTIFY pgrst, 'reload schema';

-- ============================================
-- NOTA IMPORTANTE:
-- ============================================
-- Após executar este script, você precisará modificar o código TypeScript
-- para usar esta função ao invés de INSERT direto na tabela usuario.
-- 
-- A função será chamada via RPC (Remote Procedure Call) do Supabase.
-- ============================================

