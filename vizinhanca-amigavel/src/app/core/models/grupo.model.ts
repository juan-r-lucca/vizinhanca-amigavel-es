/**
 * Modelo de Grupo
 */
export interface Grupo {
  id: number;
  nome: string;
  descricao?: string;
  id_condominio: number;
  id_criador: string;
  data_criacao?: string;
  criador?: {
    id: string;
    nome: string;
  };
  membros_count?: number;
}

export interface GrupoCreate {
  nome: string;
  descricao?: string;
  id_condominio: number;
  id_criador: string;
}

export interface GrupoUpdate {
  nome?: string;
  descricao?: string;
}

/**
 * Modelo de Membro do Grupo
 */
export interface GrupoMembro {
  id: number;
  id_grupo: number;
  id_usuario: string;
  data_entrada?: string;
  usuario?: {
    id: string;
    nome: string;
    foto_url?: string;
  };
}

export interface GrupoMembroCreate {
  id_grupo: number;
  id_usuario: string;
}

