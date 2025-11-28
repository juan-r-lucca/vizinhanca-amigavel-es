/**
 * Modelo de Agenda/Agendamento
 */
export interface Agenda {
  id: number;
  titulo: string;
  descricao?: string;
  tipo: 'evento' | 'quadra' | 'item';
  nome_recurso: string; // Nome da quadra/item/evento
  data_inicio: string;
  data_fim: string;
  id_usuario: string;
  id_condominio: number;
  data_criacao?: string;
  updated_at?: string;
  usuario?: {
    id: string;
    nome: string;
    unidade?: string;
  };
}

export interface AgendaCreate {
  titulo: string;
  descricao?: string;
  tipo: 'evento' | 'quadra' | 'item';
  nome_recurso: string;
  data_inicio: string;
  data_fim: string;
  id_usuario: string;
  id_condominio: number;
}

export interface AgendaUpdate {
  titulo?: string;
  descricao?: string;
  tipo?: 'evento' | 'quadra' | 'item';
  nome_recurso?: string;
  data_inicio?: string;
  data_fim?: string;
}

