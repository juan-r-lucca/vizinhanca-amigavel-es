/**
 * Modelo de Comentário
 */
export interface Comentario {
  id: number;
  conteudo: string;
  id_aviso: number;
  id_usuario: string;
  data_criacao?: string;
  data_atualizacao?: string;
  usuario?: {
    id: string;
    nome: string;
    foto_url?: string;
  };
}

export interface ComentarioCreate {
  conteudo: string;
  id_aviso: number;
  id_usuario: string;
}

export interface ComentarioUpdate {
  conteudo?: string;
}

/**
 * Modelo de Like
 */
export interface AvisoLike {
  id: number;
  id_aviso: number;
  id_usuario: string;
  data_criacao?: string;
}

