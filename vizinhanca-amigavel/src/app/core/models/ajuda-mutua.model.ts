/**
 * Modelo de Ajuda Mútua
 */
export interface AjudaMutua {
  id: number;
  titulo: string;
  descricao: string;
  tipo: 'oferta' | 'pedido';
  status: 'aberto' | 'fechado';
  id_usuario: string;
  id_condominio: number;
  data_criacao?: string;
  data_atualizacao?: string;
  usuario?: {
    id: string;
    nome: string;
    foto_url?: string;
  };
}

export interface AjudaMutuaCreate {
  titulo: string;
  descricao: string;
  tipo: 'oferta' | 'pedido';
  status?: 'aberto' | 'fechado';
  id_usuario: string;
  id_condominio: number;
}

export interface AjudaMutuaUpdate {
  titulo?: string;
  descricao?: string;
  tipo?: 'oferta' | 'pedido';
  status?: 'aberto' | 'fechado';
}

