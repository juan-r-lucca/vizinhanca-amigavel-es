import { Condominio } from './condominio.model';

/**
 * Modelo de Usuário
 */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  unidade?: string;
  foto_url?: string;
  bio?: string;
  interesses?: string[];
  perfil: 'morador' | 'sindico' | 'portaria';
  verificado: boolean;
  metodo_verificacao?: 'comprovante' | 'convite' | 'codigo_postal';
  id_condominio?: number;
  condominio?: Condominio | null;
  data_criacao?: string;
  updated_at?: string;
}

export interface UsuarioCreate {
  nome: string;
  email: string;
  telefone?: string;
  unidade?: string;
  perfil?: 'morador' | 'sindico' | 'portaria';
  verificado?: boolean;
  id_condominio?: number;
}

export interface UsuarioUpdate {
  nome?: string;
  telefone?: string;
  unidade?: string;
  foto_url?: string;
  bio?: string;
  interesses?: string[];
  perfil?: 'morador' | 'sindico' | 'portaria';
  id_condominio?: number;
}

