import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Grupo, GrupoCreate, GrupoUpdate, GrupoMembro, GrupoMembroCreate } from '../models/grupo.model';
import { CrudResponse } from '../interfaces/crud.interface';

/**
 * Serviço de Grupos
 * Gerencia operações relacionadas a grupos de interesse
 */
@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private crudService = inject(BaseCrudService);

  /**
   * Busca todos os grupos
   */
  async findAll(options?: any): Promise<CrudResponse<Grupo[]>> {
    return this.crudService.findAll<Grupo>('grupo', {
      ...options,
      select: options?.select || '*, criador:usuario(id, nome)',
      orderBy: options?.orderBy || [{ column: 'data_criacao', ascending: false }]
    });
  }

  /**
   * Busca grupo por ID
   */
  async findById(id: number): Promise<CrudResponse<Grupo>> {
    return this.crudService.findById<Grupo>('grupo', id, '*, criador:usuario(id, nome)');
  }

  /**
   * Cria um novo grupo
   */
  async create(data: GrupoCreate): Promise<CrudResponse<Grupo>> {
    return this.crudService.create<Grupo>('grupo', data);
  }

  /**
   * Atualiza um grupo
   */
  async update(id: number, data: GrupoUpdate): Promise<CrudResponse<Grupo>> {
    return this.crudService.update<Grupo>('grupo', id, data);
  }

  /**
   * Deleta um grupo
   */
  async delete(id: number): Promise<CrudResponse<Grupo>> {
    return this.crudService.delete<Grupo>('grupo', id);
  }

  /**
   * Busca grupos por condomínio
   */
  async findByCondominio(idCondominio: number): Promise<CrudResponse<Grupo[]>> {
    return this.findAll({
      filters: [
        { column: 'id_condominio', operator: 'eq', value: idCondominio }
      ]
    });
  }

  /**
   * MEMBROS DO GRUPO
   */

  /**
   * Busca membros de um grupo
   */
  async findMembros(idGrupo: number): Promise<CrudResponse<GrupoMembro[]>> {
    return this.crudService.findAll<GrupoMembro>('grupo_membro', {
      filters: [
        { column: 'id_grupo', operator: 'eq', value: idGrupo }
      ],
      select: '*, usuario:usuario(id, nome, foto_url)',
      orderBy: [{ column: 'data_entrada', ascending: true }]
    });
  }

  /**
   * Adiciona membro ao grupo
   */
  async addMembro(data: GrupoMembroCreate): Promise<CrudResponse<GrupoMembro>> {
    return this.crudService.create<GrupoMembro>('grupo_membro', data);
  }

  /**
   * Remove membro do grupo
   */
  async removeMembro(idGrupo: number, idUsuario: string): Promise<CrudResponse<GrupoMembro>> {
    const response = await this.crudService.findAll<GrupoMembro>('grupo_membro', {
      filters: [
        { column: 'id_grupo', operator: 'eq', value: idGrupo },
        { column: 'id_usuario', operator: 'eq', value: idUsuario }
      ]
    });

    if (response.error || !response.data || response.data.length === 0) {
      return { data: null, error: new Error('Membro não encontrado') };
    }

    return this.crudService.delete<GrupoMembro>('grupo_membro', response.data[0].id);
  }

  /**
   * Verifica se usuário é membro do grupo
   */
  async isMembro(idGrupo: number, idUsuario: string): Promise<boolean> {
    const response = await this.crudService.findAll<GrupoMembro>('grupo_membro', {
      filters: [
        { column: 'id_grupo', operator: 'eq', value: idGrupo },
        { column: 'id_usuario', operator: 'eq', value: idUsuario }
      ]
    });

    return !response.error && response.data !== null && response.data.length > 0;
  }
}

