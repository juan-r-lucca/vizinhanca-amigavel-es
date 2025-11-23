/**
 * Modelo de Localização no Mapa
 */
export interface LocalizacaoMapa {
  id: number;
  titulo: string;
  descricao?: string;
  tipo: 'ponto_interesse' | 'problema';
  latitude: number;
  longitude: number;
  id_usuario: string;
  id_condominio: number;
  votos?: number;
  data_criacao?: string;
  usuario?: {
    id: string;
    nome: string;
  };
}

export interface LocalizacaoMapaCreate {
  titulo: string;
  descricao?: string;
  tipo: 'ponto_interesse' | 'problema';
  latitude: number;
  longitude: number;
  id_usuario: string;
  id_condominio: number;
}

export interface LocalizacaoMapaUpdate {
  titulo?: string;
  descricao?: string;
  tipo?: 'ponto_interesse' | 'problema';
  votos?: number;
}

