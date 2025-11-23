/**
 * Modelo de Encomenda
 */
export interface Encomenda {
  id: number;
  descricao: string;
  status: 'aguardando' | 'retirada';
  id_usuario: string;
  id_condominio: number;
  data_criacao?: string;
  data_retirada?: string;
  updated_at?: string;
  usuario?: {
    id: string;
    nome: string;
    unidade?: string;
  };
}

export interface EncomendaCreate {
  descricao: string;
  status?: 'aguardando' | 'retirada';
  id_usuario: string;
  id_condominio: number;
}

export interface EncomendaUpdate {
  descricao?: string;
  status?: 'aguardando' | 'retirada';
  data_retirada?: string;
}

