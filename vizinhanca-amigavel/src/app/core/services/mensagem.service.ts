import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Mensagem, MensagemCreate, MensagemUpdate, Conversa } from '../models/mensagem.model';
import { CrudResponse } from '../interfaces/crud.interface';

/**
 * Serviço de Mensagens
 * Gerencia operações relacionadas a mensagens diretas
 */
@Injectable({
  providedIn: 'root'
})
export class MensagemService {
  private crudService = inject(BaseCrudService);

  /**
   * Busca todas as mensagens
   */
  async findAll(options?: any): Promise<CrudResponse<Mensagem[]>> {
    return this.crudService.findAll<Mensagem>('mensagem', {
      ...options,
      select: options?.select || '*, usuario_origem:usuario!id_usuario_origem(id, nome, foto_url), usuario_destino:usuario!id_usuario_destino(id, nome, foto_url)',
      orderBy: options?.orderBy || [{ column: 'data_criacao', ascending: true }]
    });
  }

  /**
   * Busca mensagem por ID
   */
  async findById(id: number): Promise<CrudResponse<Mensagem>> {
    // Tenta com relacionamento primeiro
    const responseWithRelation = await this.crudService.findById<Mensagem>('mensagem', id, '*, usuario_origem:usuario!id_usuario_origem(id, nome, foto_url), usuario_destino:usuario!id_usuario_destino(id, nome, foto_url)');
    
    // Se falhar, tenta sem relacionamento
    if (responseWithRelation.error && (responseWithRelation.error.message?.includes('relation') || responseWithRelation.error.message?.includes('column'))) {
      return this.crudService.findById<Mensagem>('mensagem', id);
    }
    
    return responseWithRelation;
  }

  /**
   * Cria uma nova mensagem
   */
  async create(data: MensagemCreate): Promise<CrudResponse<Mensagem>> {
    const mensagemData = {
      ...data,
      lida: data.lida || false
    };
    return this.crudService.create<Mensagem>('mensagem', mensagemData);
  }

  /**
   * Atualiza uma mensagem
   */
  async update(id: number, data: MensagemUpdate): Promise<CrudResponse<Mensagem>> {
    return this.crudService.update<Mensagem>('mensagem', id, data);
  }

  /**
   * Deleta uma mensagem
   */
  async delete(id: number): Promise<CrudResponse<Mensagem>> {
    return this.crudService.delete<Mensagem>('mensagem', id);
  }

  /**
   * Busca conversa entre dois usuários
   */
  async findConversa(idUsuario1: string, idUsuario2: string): Promise<CrudResponse<Mensagem[]>> {
    return this.findAll({
      filters: [
        { column: 'id_usuario_origem', operator: 'in', value: [idUsuario1, idUsuario2] },
        { column: 'id_usuario_destino', operator: 'in', value: [idUsuario1, idUsuario2] }
      ]
    });
  }

  /**
   * Busca mensagens recebidas por um usuário
   */
  async findRecebidas(idUsuario: string): Promise<CrudResponse<Mensagem[]>> {
    return this.findAll({
      filters: [
        { column: 'id_usuario_destino', operator: 'eq', value: idUsuario }
      ]
    });
  }

  /**
   * Busca mensagens não lidas
   */
  async findNaoLidas(idUsuario: string): Promise<CrudResponse<Mensagem[]>> {
    return this.findAll({
      filters: [
        { column: 'id_usuario_destino', operator: 'eq', value: idUsuario },
        { column: 'lida', operator: 'eq', value: false }
      ]
    });
  }

  /**
   * Marca mensagens como lidas
   */
  async marcarComoLidas(idUsuario: string, idUsuarioOrigem: string): Promise<CrudResponse<Mensagem[]>> {
    const response = await this.findAll({
      filters: [
        { column: 'id_usuario_destino', operator: 'eq', value: idUsuario },
        { column: 'id_usuario_origem', operator: 'eq', value: idUsuarioOrigem },
        { column: 'lida', operator: 'eq', value: false }
      ]
    });

    if (response.error || !response.data) {
      return response;
    }

    // Atualiza todas as mensagens não lidas
    const updates = response.data.map(msg => 
      this.update(msg.id, { lida: true })
    );

    await Promise.all(updates);
    return response;
  }

  /**
   * Busca conversas do usuário
   */
  async findConversas(idUsuario: string): Promise<CrudResponse<Conversa[]>> {
    // Busca mensagens onde o usuário é origem
    const responseOrigem = await this.findAll({
      filters: [
        { column: 'id_usuario_origem', operator: 'eq', value: idUsuario }
      ]
    });

    // Busca mensagens onde o usuário é destino
    const responseDestino = await this.findAll({
      filters: [
        { column: 'id_usuario_destino', operator: 'eq', value: idUsuario }
      ]
    });

    // Combina os resultados
    const todasMensagens: Mensagem[] = [];
    
    if (!responseOrigem.error && responseOrigem.data) {
      todasMensagens.push(...responseOrigem.data);
    }
    
    if (!responseDestino.error && responseDestino.data) {
      todasMensagens.push(...responseDestino.data);
    }

    if (todasMensagens.length === 0) {
      return { data: [], error: null };
    }

    // Agrupa por usuário e retorna última mensagem
    const conversasMap = new Map<string, Conversa>();

    todasMensagens.forEach(msg => {
      const outroUsuarioId = msg.id_usuario_origem === idUsuario 
        ? msg.id_usuario_destino 
        : msg.id_usuario_origem;

      if (!conversasMap.has(outroUsuarioId)) {
        conversasMap.set(outroUsuarioId, {
          usuario: msg.id_usuario_origem === idUsuario 
            ? (msg.usuario_destino || { id: outroUsuarioId, nome: 'Usuário' })
            : (msg.usuario_origem || { id: outroUsuarioId, nome: 'Usuário' }),
          ultima_mensagem: msg,
          nao_lidas_count: 0
        });
      }

      const conversa = conversasMap.get(outroUsuarioId)!;
      if (!conversa.ultima_mensagem || 
          new Date(msg.data_criacao || '') > new Date(conversa.ultima_mensagem.data_criacao || '')) {
        conversa.ultima_mensagem = msg;
      }
    });

    // Conta não lidas
    const naoLidasResponse = await this.findNaoLidas(idUsuario);
    if (!naoLidasResponse.error && naoLidasResponse.data) {
      naoLidasResponse.data.forEach(msg => {
        const outroUsuarioId = msg.id_usuario_origem;
        const conversa = conversasMap.get(outroUsuarioId);
        if (conversa) {
          conversa.nao_lidas_count = (conversa.nao_lidas_count || 0) + 1;
        }
      });
    }

    return {
      data: Array.from(conversasMap.values()),
      error: null
    };
  }
}

