/**
 * Modelo de Mensagem Direta
 */
export interface Mensagem {
  id: number;
  conteudo: string;
  id_usuario_origem: string;
  id_usuario_destino: string;
  lida: boolean;
  data_criacao?: string;
  usuario_origem?: {
    id: string;
    nome: string;
    foto_url?: string;
  };
  usuario_destino?: {
    id: string;
    nome: string;
    foto_url?: string;
  };
}

export interface MensagemCreate {
  conteudo: string;
  id_usuario_origem: string;
  id_usuario_destino: string;
  lida?: boolean;
}

export interface MensagemUpdate {
  lida?: boolean;
}

/**
 * Interface para conversas
 */
export interface Conversa {
  usuario: {
    id: string;
    nome: string;
    foto_url?: string;
  };
  ultima_mensagem?: Mensagem;
  nao_lidas_count?: number;
}

