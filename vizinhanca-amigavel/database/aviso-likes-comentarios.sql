-- ============================================
-- Tabelas para Likes e Comentários de Avisos
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Tabela de Likes de Avisos
CREATE TABLE IF NOT EXISTS aviso_like (
  id BIGSERIAL PRIMARY KEY,
  id_aviso BIGINT NOT NULL REFERENCES aviso(id) ON DELETE CASCADE,
  id_usuario UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  data_criacao TIMESTAMP DEFAULT NOW(),
  UNIQUE(id_aviso, id_usuario)
);

-- Tabela de Comentários de Avisos
CREATE TABLE IF NOT EXISTS aviso_comentario (
  id BIGSERIAL PRIMARY KEY,
  conteudo TEXT NOT NULL,
  id_aviso BIGINT NOT NULL REFERENCES aviso(id) ON DELETE CASCADE,
  id_usuario UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_aviso_like_aviso ON aviso_like(id_aviso);
CREATE INDEX IF NOT EXISTS idx_aviso_like_usuario ON aviso_like(id_usuario);
CREATE INDEX IF NOT EXISTS idx_aviso_comentario_aviso ON aviso_comentario(id_aviso);
CREATE INDEX IF NOT EXISTS idx_aviso_comentario_usuario ON aviso_comentario(id_usuario);
CREATE INDEX IF NOT EXISTS idx_aviso_comentario_data ON aviso_comentario(data_criacao);

-- Função para atualizar contador de likes
CREATE OR REPLACE FUNCTION update_aviso_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE aviso SET likes = (
      SELECT COUNT(*) FROM aviso_like WHERE id_aviso = NEW.id_aviso
    ) WHERE id = NEW.id_aviso;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE aviso SET likes = (
      SELECT COUNT(*) FROM aviso_like WHERE id_aviso = OLD.id_aviso
    ) WHERE id = OLD.id_aviso;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador de likes automaticamente
DROP TRIGGER IF EXISTS trigger_update_aviso_likes_count ON aviso_like;
CREATE TRIGGER trigger_update_aviso_likes_count
  AFTER INSERT OR DELETE ON aviso_like
  FOR EACH ROW
  EXECUTE FUNCTION update_aviso_likes_count();

-- Função para atualizar contador de comentários
CREATE OR REPLACE FUNCTION update_aviso_comentarios_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE aviso SET comentarios = (
      SELECT COUNT(*) FROM aviso_comentario WHERE id_aviso = NEW.id_aviso
    ) WHERE id = NEW.id_aviso;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE aviso SET comentarios = (
      SELECT COUNT(*) FROM aviso_comentario WHERE id_aviso = OLD.id_aviso
    ) WHERE id = OLD.id_aviso;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador de comentários automaticamente
DROP TRIGGER IF EXISTS trigger_update_aviso_comentarios_count ON aviso_comentario;
CREATE TRIGGER trigger_update_aviso_comentarios_count
  AFTER INSERT OR DELETE ON aviso_comentario
  FOR EACH ROW
  EXECUTE FUNCTION update_aviso_comentarios_count();

-- Ativar RLS nas tabelas
ALTER TABLE aviso_like ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviso_comentario ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para aviso_like
-- Usuários podem ver likes de avisos do mesmo condomínio
CREATE POLICY "aviso_like_read_same_condominio" ON aviso_like
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    id_aviso IN (
      SELECT id FROM aviso 
      WHERE id_condominio = (
        SELECT id_condominio FROM usuario WHERE id = auth.uid()
      )
    )
  );

-- Usuários podem criar likes
CREATE POLICY "aviso_like_insert" ON aviso_like
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    id_usuario = auth.uid() AND
    id_aviso IN (
      SELECT id FROM aviso 
      WHERE id_condominio = (
        SELECT id_condominio FROM usuario WHERE id = auth.uid()
      )
    )
  );

-- Usuários podem deletar seus próprios likes
CREATE POLICY "aviso_like_delete_own" ON aviso_like
  FOR DELETE
  USING (id_usuario = auth.uid());

-- Políticas RLS para aviso_comentario
-- Usuários podem ver comentários de avisos do mesmo condomínio
CREATE POLICY "aviso_comentario_read_same_condominio" ON aviso_comentario
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    id_aviso IN (
      SELECT id FROM aviso 
      WHERE id_condominio = (
        SELECT id_condominio FROM usuario WHERE id = auth.uid()
      )
    )
  );

-- Usuários verificados podem criar comentários
CREATE POLICY "aviso_comentario_insert" ON aviso_comentario
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    id_usuario = auth.uid() AND
    (SELECT verificado FROM usuario WHERE id = auth.uid()) = TRUE AND
    id_aviso IN (
      SELECT id FROM aviso 
      WHERE id_condominio = (
        SELECT id_condominio FROM usuario WHERE id = auth.uid()
      )
    )
  );

-- Usuários podem atualizar seus próprios comentários
CREATE POLICY "aviso_comentario_update_own" ON aviso_comentario
  FOR UPDATE
  USING (id_usuario = auth.uid())
  WITH CHECK (id_usuario = auth.uid());

-- Usuários podem deletar seus próprios comentários
CREATE POLICY "aviso_comentario_delete_own" ON aviso_comentario
  FOR DELETE
  USING (id_usuario = auth.uid());

