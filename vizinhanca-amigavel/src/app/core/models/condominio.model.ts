/**
 * Modelo de Condomínio
 */
export interface Condominio {
  id: number;
  nome: string;
  endereco: string;
  cep: string;
  cidade?: string;
  estado?: string;
  data_criacao?: string;
  created_at?: string;
}

export interface CondominioCreate {
  nome: string;
  endereco: string;
  cep: string;
  cidade?: string;
  estado?: string;
}

export interface CondominioUpdate {
  nome?: string;
  endereco?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
}

