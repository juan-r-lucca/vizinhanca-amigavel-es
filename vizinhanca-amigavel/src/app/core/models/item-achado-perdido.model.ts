/**
 * Modelo de Item Achado/Perdido
 */
export interface ItemAchadoPerdido {
  id: number;
  titulo: string;
  descricao: string;
  tipo: 'achado' | 'perdido';
  foto_url?: string;
  id_usuario: string;
  id_condominio: number;
  resolvido: boolean;
  data_criacao?: string;
  usuario?: {
    id: string;
    nome: string;
    foto_url?: string;
  };
}

export interface ItemAchadoPerdidoCreate {
  titulo: string;
  descricao: string;
  tipo: 'achado' | 'perdido';
  foto_url?: string;
  id_usuario: string;
  id_condominio: number;
  resolvido?: boolean;
}

export interface ItemAchadoPerdidoUpdate {
  titulo?: string;
  descricao?: string;
  tipo?: 'achado' | 'perdido';
  foto_url?: string;
  resolvido?: boolean;
}

