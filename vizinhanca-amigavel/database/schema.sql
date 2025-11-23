-- ============================================
-- Script SQL para criação das tabelas do projeto Vizinhança Amigável
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Tabela de Condomínios
CREATE TABLE IF NOT EXISTS condominio (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  endereco TEXT NOT NULL,
  cep VARCHAR(10) NOT NULL,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  data_criacao TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Usuários
-- Nota: O id deve corresponder ao UUID do auth.users do Supabase
CREATE TABLE IF NOT EXISTS usuario (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  unidade VARCHAR(50),
  foto_url TEXT,
  bio TEXT,
  interesses TEXT[],
  perfil VARCHAR(50) DEFAULT 'morador' CHECK (perfil IN ('morador', 'sindico', 'portaria')),
  verificado BOOLEAN DEFAULT FALSE,
  metodo_verificacao VARCHAR(50) CHECK (metodo_verificacao IN ('comprovante', 'convite', 'codigo_postal')),
  id_condominio BIGINT REFERENCES condominio(id) ON DELETE SET NULL,
  data_criacao TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Avisos/Posts
CREATE TABLE IF NOT EXISTS aviso (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('alerta', 'recado', 'evento')),
  prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta')),
  id_usuario UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  id_condominio BIGINT NOT NULL REFERENCES condominio(id) ON DELETE CASCADE,
  likes INT DEFAULT 0,
  comentarios INT DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de Encomendas
CREATE TABLE IF NOT EXISTS encomenda (
  id BIGSERIAL PRIMARY KEY,
  descricao TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'retirada')),
  id_usuario UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  id_condominio BIGINT NOT NULL REFERENCES condominio(id) ON DELETE CASCADE,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_retirada TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Ajuda Mútua
CREATE TABLE IF NOT EXISTS ajuda_mutua (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('oferta', 'pedido')),
  status VARCHAR(50) DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado')),
  id_usuario UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  id_condominio BIGINT NOT NULL REFERENCES condominio(id) ON DELETE CASCADE,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de Grupos
CREATE TABLE IF NOT EXISTS grupo (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  id_condominio BIGINT NOT NULL REFERENCES condominio(id) ON DELETE CASCADE,
  id_criador UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de Membros do Grupo
CREATE TABLE IF NOT EXISTS grupo_membro (
  id BIGSERIAL PRIMARY KEY,
  id_grupo BIGINT NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
  id_usuario UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  data_entrada TIMESTAMP DEFAULT NOW(),
  UNIQUE(id_grupo, id_usuario)
);

-- Tabela de Mensagens Diretas
CREATE TABLE IF NOT EXISTS mensagem (
  id BIGSERIAL PRIMARY KEY,
  conteudo TEXT NOT NULL,
  id_usuario_origem UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  id_usuario_destino UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  lida BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de Localizações no Mapa
CREATE TABLE IF NOT EXISTS localizacao_mapa (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('ponto_interesse', 'problema')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  id_usuario UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  id_condominio BIGINT NOT NULL REFERENCES condominio(id) ON DELETE CASCADE,
  votos INT DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- Tabela de Itens Achado/Perdido
CREATE TABLE IF NOT EXISTS item_achado_perdido (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('achado', 'perdido')),
  foto_url TEXT,
  id_usuario UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  id_condominio BIGINT NOT NULL REFERENCES condominio(id) ON DELETE CASCADE,
  resolvido BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Índices para Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_usuario_condominio ON usuario(id_condominio);
CREATE INDEX IF NOT EXISTS idx_usuario_verificado ON usuario(verificado);
CREATE INDEX IF NOT EXISTS idx_aviso_condominio ON aviso(id_condominio);
CREATE INDEX IF NOT EXISTS idx_aviso_usuario ON aviso(id_usuario);
CREATE INDEX IF NOT EXISTS idx_aviso_data ON aviso(data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_aviso_tipo ON aviso(tipo);
CREATE INDEX IF NOT EXISTS idx_encomenda_condominio ON encomenda(id_condominio);
CREATE INDEX IF NOT EXISTS idx_encomenda_status ON encomenda(status);
CREATE INDEX IF NOT EXISTS idx_mensagem_destino ON mensagem(id_usuario_destino);
CREATE INDEX IF NOT EXISTS idx_mensagem_origem ON mensagem(id_usuario_origem);
CREATE INDEX IF NOT EXISTS idx_mensagem_lida ON mensagem(lida);
CREATE INDEX IF NOT EXISTS idx_grupo_condominio ON grupo(id_condominio);
CREATE INDEX IF NOT EXISTS idx_grupo_membro_grupo ON grupo_membro(id_grupo);
CREATE INDEX IF NOT EXISTS idx_grupo_membro_usuario ON grupo_membro(id_usuario);
CREATE INDEX IF NOT EXISTS idx_localizacao_condominio ON localizacao_mapa(id_condominio);
CREATE INDEX IF NOT EXISTS idx_item_condominio ON item_achado_perdido(id_condominio);
CREATE INDEX IF NOT EXISTS idx_item_resolvido ON item_achado_perdido(resolvido);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- IMPORTANTE: Ative RLS nas tabelas após criar as políticas

-- Ativar RLS nas tabelas
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviso ENABLE ROW LEVEL SECURITY;
ALTER TABLE encomenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajuda_mutua ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupo ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupo_membro ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE localizacao_mapa ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_achado_perdido ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIO
-- Usuários podem ler apenas dados de usuários do mesmo condomínio
CREATE POLICY "users_read_same_condominio" ON usuario
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      id_condominio = (
        SELECT id_condominio FROM usuario WHERE id = auth.uid()
      ) OR
      id = auth.uid()
    )
  );

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "users_update_own" ON usuario
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Usuários podem inserir seu próprio registro
CREATE POLICY "users_insert_own" ON usuario
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Políticas para AVISO/POSTS
-- Ler posts do próprio condomínio
CREATE POLICY "avisos_read_same_condominio" ON aviso
  FOR SELECT
  USING (
    id_condominio IN (
      SELECT id_condominio FROM usuario WHERE id = auth.uid() AND verificado = true
    )
  );

-- Criar posts se verificado
CREATE POLICY "avisos_create_verified" ON aviso
  FOR INSERT
  WITH CHECK (
    id_usuario = auth.uid() AND
    id_usuario IN (
      SELECT id FROM usuario WHERE verificado = true
    )
  );

-- Atualizar apenas os próprios posts
CREATE POLICY "avisos_update_own" ON aviso
  FOR UPDATE
  USING (id_usuario = auth.uid());

-- Deletar apenas os próprios posts
CREATE POLICY "avisos_delete_own" ON aviso
  FOR DELETE
  USING (id_usuario = auth.uid());

-- Políticas para MENSAGENS
-- Ler mensagens onde o usuário é remetente ou destinatário
CREATE POLICY "mensagens_read_own" ON mensagem
  FOR SELECT
  USING (
    id_usuario_origem = auth.uid() OR
    id_usuario_destino = auth.uid()
  );

-- Criar mensagens se verificado
CREATE POLICY "mensagens_create_verified" ON mensagem
  FOR INSERT
  WITH CHECK (
    id_usuario_origem = auth.uid() AND
    id_usuario_origem IN (
      SELECT id FROM usuario WHERE verificado = true
    )
  );

-- Atualizar apenas mensagens recebidas (para marcar como lida)
CREATE POLICY "mensagens_update_received" ON mensagem
  FOR UPDATE
  USING (id_usuario_destino = auth.uid());

-- Políticas para ENCOMENDA
-- Ler encomendas do próprio condomínio
CREATE POLICY "encomendas_read_same_condominio" ON encomenda
  FOR SELECT
  USING (
    id_condominio IN (
      SELECT id_condominio FROM usuario WHERE id = auth.uid() AND verificado = true
    )
  );

-- Criar encomendas se verificado
CREATE POLICY "encomendas_create_verified" ON encomenda
  FOR INSERT
  WITH CHECK (
    id_usuario = auth.uid() AND
    id_usuario IN (
      SELECT id FROM usuario WHERE verificado = true
    )
  );

-- Políticas para AJUDA_MUTUA
-- Ler ajudas mútuas do próprio condomínio
CREATE POLICY "ajuda_mutua_read_same_condominio" ON ajuda_mutua
  FOR SELECT
  USING (
    id_condominio IN (
      SELECT id_condominio FROM usuario WHERE id = auth.uid() AND verificado = true
    )
  );

-- Criar apenas se verificado
CREATE POLICY "ajuda_mutua_create_verified" ON ajuda_mutua
  FOR INSERT
  WITH CHECK (
    id_usuario = auth.uid() AND
    id_usuario IN (
      SELECT id FROM usuario WHERE verificado = true
    )
  );

-- Atualizar apenas os próprios
CREATE POLICY "ajuda_mutua_update_own" ON ajuda_mutua
  FOR UPDATE
  USING (id_usuario = auth.uid());

-- Políticas para GRUPO
-- Ler grupos do próprio condomínio
CREATE POLICY "grupos_read_same_condominio" ON grupo
  FOR SELECT
  USING (
    id_condominio IN (
      SELECT id_condominio FROM usuario WHERE id = auth.uid() AND verificado = true
    )
  );

-- Criar grupos se verificado
CREATE POLICY "grupos_create_verified" ON grupo
  FOR INSERT
  WITH CHECK (
    id_criador = auth.uid() AND
    id_criador IN (
      SELECT id FROM usuario WHERE verificado = true
    )
  );

-- Políticas para GRUPO_MEMBRO
-- Ler membros dos grupos que o usuário participa
CREATE POLICY "grupo_membro_read_own" ON grupo_membro
  FOR SELECT
  USING (
    id_usuario = auth.uid() OR
    id_grupo IN (
      SELECT id_grupo FROM grupo_membro WHERE id_usuario = auth.uid()
    )
  );

-- Adicionar membros aos grupos que o usuário participa
CREATE POLICY "grupo_membro_insert_verified" ON grupo_membro
  FOR INSERT
  WITH CHECK (
    id_usuario IN (
      SELECT id FROM usuario WHERE verificado = true
    )
  );

-- Remover apenas a si mesmo ou se for criador do grupo
CREATE POLICY "grupo_membro_delete_own" ON grupo_membro
  FOR DELETE
  USING (
    id_usuario = auth.uid() OR
    id_grupo IN (
      SELECT id FROM grupo WHERE id_criador = auth.uid()
    )
  );

-- Políticas para LOCALIZACAO_MAPA
-- Ler localizações do próprio condomínio
CREATE POLICY "localizacao_read_same_condominio" ON localizacao_mapa
  FOR SELECT
  USING (
    id_condominio IN (
      SELECT id_condominio FROM usuario WHERE id = auth.uid() AND verificado = true
    )
  );

-- Criar localizações se verificado
CREATE POLICY "localizacao_create_verified" ON localizacao_mapa
  FOR INSERT
  WITH CHECK (
    id_usuario = auth.uid() AND
    id_usuario IN (
      SELECT id FROM usuario WHERE verificado = true
    )
  );

-- Políticas para ITEM_ACHADO_PERDIDO
-- Ler itens do próprio condomínio
CREATE POLICY "item_read_same_condominio" ON item_achado_perdido
  FOR SELECT
  USING (
    id_condominio IN (
      SELECT id_condominio FROM usuario WHERE id = auth.uid() AND verificado = true
    )
  );

-- Criar itens se verificado
CREATE POLICY "item_create_verified" ON item_achado_perdido
  FOR INSERT
  WITH CHECK (
    id_usuario = auth.uid() AND
    id_usuario IN (
      SELECT id FROM usuario WHERE verificado = true
    )
  );

-- Atualizar apenas os próprios itens
CREATE POLICY "item_update_own" ON item_achado_perdido
  FOR UPDATE
  USING (id_usuario = auth.uid());

-- ============================================
-- Funções úteis (opcionais)
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at em usuario
CREATE TRIGGER update_usuario_updated_at BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em encomenda
CREATE TRIGGER update_encomenda_updated_at BEFORE UPDATE ON encomenda
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Dados de teste (opcional - descomente se quiser)
-- ============================================

-- Inserir um condomínio de exemplo
-- INSERT INTO condominio (nome, endereco, cep, cidade, estado) 
-- VALUES ('Condomínio Residencial Exemplo', 'Rua Exemplo, 123', '12345-678', 'São Paulo', 'SP');

-- ============================================
-- FIM DO SCRIPT
-- ============================================

