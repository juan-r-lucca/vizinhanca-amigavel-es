/**
 * Modelo de Aviso/Post
 */
export interface Aviso {
  id: number;
  titulo: string;
  conteudo: string;
  tipo: 'alerta' | 'recado' | 'evento';
  prioridade: 'baixa' | 'media' | 'alta';
  id_usuario: string;
  id_condominio: number;
  likes?: number;
  comentarios?: number;
  data_criacao?: string;
  data_atualizacao?: string;
  usuario?: {
    id: string;
    nome: string;
    foto_url?: string;
  };
}

export interface AvisoCreate {
  titulo: string;
  conteudo: string;
  tipo: 'alerta' | 'recado' | 'evento';
  prioridade?: 'baixa' | 'media' | 'alta';
  id_usuario: string;
  id_condominio: number;
}

export interface AvisoUpdate {
  titulo?: string;
  conteudo?: string;
  tipo?: 'alerta' | 'recado' | 'evento';
  prioridade?: 'baixa' | 'media' | 'alta';
}

