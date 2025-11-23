-- ============================================
-- Script SQL para criação dos Storage Buckets
-- Vizinhança Amigável
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Criar bucket para fotos de itens achados/perdidos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'achados-perdidos',
  'achados-perdidos',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para avatares de usuários (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para posts/avisos (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para documentos de verificação (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verificacao',
  'verificacao',
  false, -- Privado
  10485760, -- 10MB em bytes
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Políticas de Segurança para Storage
-- ============================================

-- Políticas para bucket 'achados-perdidos'
-- Permitir leitura pública
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'achados-perdidos');

-- Permitir upload apenas para usuários autenticados
CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'achados-perdidos' AND
  auth.role() = 'authenticated'
);

-- Permitir atualização apenas pelo próprio usuário
CREATE POLICY IF NOT EXISTS "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'achados-perdidos' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'achados-perdidos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir deleção apenas pelo próprio usuário
CREATE POLICY IF NOT EXISTS "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'achados-perdidos' AND
  auth.role() = 'authenticated'
);

-- Políticas para bucket 'avatars'
-- Permitir leitura pública
CREATE POLICY IF NOT EXISTS "Public Access Avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permitir upload apenas para usuários autenticados
CREATE POLICY IF NOT EXISTS "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- Permitir atualização apenas pelo próprio usuário
CREATE POLICY IF NOT EXISTS "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Políticas para bucket 'posts'
-- Permitir leitura pública
CREATE POLICY IF NOT EXISTS "Public Access Posts"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- Permitir upload apenas para usuários autenticados
CREATE POLICY IF NOT EXISTS "Authenticated users can upload posts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' AND
  auth.role() = 'authenticated'
);

-- Políticas para bucket 'verificacao' (privado)
-- Permitir leitura apenas pelo próprio usuário
CREATE POLICY IF NOT EXISTS "Users can read own verification"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verificacao' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir upload apenas pelo próprio usuário
CREATE POLICY IF NOT EXISTS "Users can upload own verification"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verificacao' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- FIM DO SCRIPT
-- ============================================

