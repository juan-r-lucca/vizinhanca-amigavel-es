-- ============================================
-- Script para verificar se a função foi criada corretamente
-- ============================================
-- Execute este script no SQL Editor do Supabase para verificar a função
-- ============================================

-- Verificar se a função existe
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

-- Testar a função (substitua os valores pelos seus dados de teste)
-- Descomente e ajuste os valores abaixo para testar:
/*
SELECT * FROM public.create_usuario_profile(
  '00000000-0000-0000-0000-000000000000'::UUID,  -- Substitua pelo UUID do usuário
  'Nome Teste',
  'teste@example.com',
  'morador',
  false
);
*/

