import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Comentario, ComentarioCreate, ComentarioUpdate } from '../models/comentario.model';
import { CrudResponse } from '../interfaces/crud.interface';

/**
 * Serviço de Comentários
 * Gerencia operações relacionadas a comentários em avisos
 */
@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private crudService = inject(BaseCrudService);

  /**
   * Busca todos os comentários de um aviso
   */
  async findByAviso(idAviso: number): Promise<CrudResponse<Comentario[]>> {
    return this.crudService.findAll<Comentario>('aviso_comentario', {
      filters: [
        { column: 'id_aviso', operator: 'eq', value: idAviso }
      ],
      select: '*, usuario:usuario(id, nome, foto_url)',
      orderBy: [{ column: 'data_criacao', ascending: true }]
    });
  }

  /**
   * Busca comentário por ID
   */
  async findById(id: number): Promise<CrudResponse<Comentario>> {
    return this.crudService.findById<Comentario>(
      'aviso_comentario',
      id,
      '*, usuario:usuario(id, nome, foto_url)'
    );
  }

  /**
   * Cria um novo comentário
   */
  async create(data: ComentarioCreate): Promise<CrudResponse<Comentario>> {
    return this.crudService.create<Comentario>('aviso_comentario', data);
  }

  /**
   * Atualiza um comentário
   */
  async update(id: number, data: ComentarioUpdate): Promise<CrudResponse<Comentario>> {
    return this.crudService.update<Comentario>('aviso_comentario', id, data);
  }

  /**
   * Deleta um comentário
   */
  async delete(id: number): Promise<CrudResponse<Comentario>> {
    return this.crudService.delete<Comentario>('aviso_comentario', id);
  }
}

