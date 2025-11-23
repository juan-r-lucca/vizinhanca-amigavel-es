import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Aviso, AvisoCreate, AvisoUpdate } from '../models/aviso.model';
import { CrudResponse } from '../interfaces/crud.interface';

/**
 * Serviço de Avisos/Posts
 * Gerencia operações relacionadas ao mural da comunidade
 */
@Injectable({
  providedIn: 'root'
})
export class AvisoService {
  private crudService = inject(BaseCrudService);

  /**
   * Busca todos os avisos
   */
  async findAll(options?: any): Promise<CrudResponse<Aviso[]>> {
    return this.crudService.findAll<Aviso>('aviso', {
      ...options,
      select: options?.select || '*, usuario:usuario(id, nome, foto_url)',
      orderBy: options?.orderBy || [{ column: 'data_criacao', ascending: false }]
    });
  }

  /**
   * Busca aviso por ID
   */
  async findById(id: number): Promise<CrudResponse<Aviso>> {
    return this.crudService.findById<Aviso>('aviso', id, '*, usuario:usuario(id, nome, foto_url)');
  }

  /**
   * Cria um novo aviso
   */
  async create(data: AvisoCreate): Promise<CrudResponse<Aviso>> {
    const avisoData = {
      ...data,
      prioridade: data.prioridade || 'media',
      likes: 0,
      comentarios: 0
    };
    return this.crudService.create<Aviso>('aviso', avisoData);
  }

  /**
   * Atualiza um aviso
   */
  async update(id: number, data: AvisoUpdate): Promise<CrudResponse<Aviso>> {
    return this.crudService.update<Aviso>('aviso', id, {
      ...data,
      data_atualizacao: new Date().toISOString()
    });
  }

  /**
   * Deleta um aviso
   */
  async delete(id: number): Promise<CrudResponse<Aviso>> {
    return this.crudService.delete<Aviso>('aviso', id);
  }

  /**
   * Busca avisos por condomínio
   */
  async findByCondominio(idCondominio: number): Promise<CrudResponse<Aviso[]>> {
    return this.findAll({
      filters: [
        { column: 'id_condominio', operator: 'eq', value: idCondominio }
      ]
    });
  }

  /**
   * Busca avisos por tipo
   */
  async findByTipo(tipo: 'alerta' | 'recado' | 'evento', idCondominio: number): Promise<CrudResponse<Aviso[]>> {
    return this.findAll({
      filters: [
        { column: 'tipo', operator: 'eq', value: tipo },
        { column: 'id_condominio', operator: 'eq', value: idCondominio }
      ]
    });
  }

  /**
   * Busca avisos por prioridade
   */
  async findByPrioridade(prioridade: 'baixa' | 'media' | 'alta', idCondominio: number): Promise<CrudResponse<Aviso[]>> {
    return this.findAll({
      filters: [
        { column: 'prioridade', operator: 'eq', value: prioridade },
        { column: 'id_condominio', operator: 'eq', value: idCondominio }
      ]
    });
  }

  /**
   * Verifica se o usuário curtiu um aviso
   */
  async hasUserLiked(avisoId: number, userId: string): Promise<boolean> {
    const response = await this.crudService.findAll<any>('aviso_like', {
      filters: [
        { column: 'id_aviso', operator: 'eq', value: avisoId },
        { column: 'id_usuario', operator: 'eq', value: userId }
      ]
    });
    return !response.error && !!response.data && response.data.length > 0;
  }

  /**
   * Adiciona ou remove like de um aviso
   */
  async toggleLike(avisoId: number, userId: string): Promise<CrudResponse<Aviso>> {
    const hasLiked = await this.hasUserLiked(avisoId, userId);
    
    if (hasLiked) {
      // Remove like
      const likeResponse = await this.crudService.findAll<any>('aviso_like', {
        filters: [
          { column: 'id_aviso', operator: 'eq', value: avisoId },
          { column: 'id_usuario', operator: 'eq', value: userId }
        ]
      });
      
      if (likeResponse.error || !likeResponse.data || likeResponse.data.length === 0) {
        return { error: new Error('Erro ao buscar like'), data: null };
      }
      
      const deleteResponse = await this.crudService.delete('aviso_like', likeResponse.data[0].id);
      if (deleteResponse.error) {
        return { error: deleteResponse.error, data: null };
      }
    } else {
      // Adiciona like
      const createResponse = await this.crudService.create<any>('aviso_like', {
        id_aviso: avisoId,
        id_usuario: userId
      });
      
      if (createResponse.error) {
        return { error: createResponse.error, data: null };
      }
    }
    
    // Recarrega o aviso atualizado
    return this.findById(avisoId);
  }

  /**
   * Incrementa likes de um aviso (método legado - usar toggleLike)
   */
  async incrementLikes(id: number): Promise<CrudResponse<Aviso>> {
    const response = await this.findById(id);
    if (response.error || !response.data) {
      return response;
    }

    const currentLikes = response.data.likes || 0;
    return this.update(id, { likes: currentLikes + 1 } as any);
  }
}

