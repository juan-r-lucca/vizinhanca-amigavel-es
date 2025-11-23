-- ============================================
-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS temporariamente para permitir cadastro
-- ============================================
-- ATENÇÃO: Esta é uma solução temporária. Use apenas para testar o cadastro.
-- Após testar, execute o script fix-usuario-rls-completo.sql para reativar RLS corretamente.
-- ============================================

-- Desabilitar RLS temporariamente na tabela usuario
ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;

-- Agora você pode criar contas sem problemas de RLS
-- Mas LEMBRE-SE: Isso remove a segurança! Use apenas para teste.

-- Para reativar RLS depois, execute:
-- ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
-- E então execute o script fix-usuario-rls-completo.sql

