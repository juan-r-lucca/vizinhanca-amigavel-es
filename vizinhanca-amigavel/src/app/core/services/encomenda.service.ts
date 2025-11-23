import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Encomenda, EncomendaCreate, EncomendaUpdate } from '../models/encomenda.model';
import { CrudResponse } from '../interfaces/crud.interface';

/**
 * Serviço de Encomendas
 * Gerencia operações relacionadas a encomendas
 */
@Injectable({
  providedIn: 'root'
})
export class EncomendaService {
  private crudService = inject(BaseCrudService);

  /**
   * Busca todas as encomendas
   */
  async findAll(options?: any): Promise<CrudResponse<Encomenda[]>> {
    return this.crudService.findAll<Encomenda>('encomenda', {
      ...options,
      select: options?.select || '*, usuario:usuario(id, nome, unidade)',
      orderBy: options?.orderBy || [{ column: 'data_criacao', ascending: false }]
    });
  }

  /**
   * Busca encomenda por ID
   */
  async findById(id: number): Promise<CrudResponse<Encomenda>> {
    return this.crudService.findById<Encomenda>('encomenda', id, '*, usuario:usuario(id, nome, unidade)');
  }

  /**
   * Cria uma nova encomenda
   */
  async create(data: EncomendaCreate): Promise<CrudResponse<Encomenda>> {
    const encomendaData = {
      ...data,
      status: data.status || 'aguardando'
    };
    return this.crudService.create<Encomenda>('encomenda', encomendaData);
  }

  /**
   * Atualiza uma encomenda
   */
  async update(id: number, data: EncomendaUpdate): Promise<CrudResponse<Encomenda>> {
    const updateData: any = { ...data };
    if (data.status === 'retirada' && !data.data_retirada) {
      updateData.data_retirada = new Date().toISOString();
    }
    updateData.updated_at = new Date().toISOString();
    
    return this.crudService.update<Encomenda>('encomenda', id, updateData);
  }

  /**
   * Deleta uma encomenda
   */
  async delete(id: number): Promise<CrudResponse<Encomenda>> {
    return this.crudService.delete<Encomenda>('encomenda', id);
  }

  /**
   * Busca encomendas por condomínio
   */
  async findByCondominio(idCondominio: number): Promise<CrudResponse<Encomenda[]>> {
    return this.findAll({
      filters: [
        { column: 'id_condominio', operator: 'eq', value: idCondominio }
      ]
    });
  }

  /**
   * Busca encomendas aguardando retirada
   */
  async findAguardando(idCondominio: number): Promise<CrudResponse<Encomenda[]>> {
    return this.findAll({
      filters: [
        { column: 'id_condominio', operator: 'eq', value: idCondominio },
        { column: 'status', operator: 'eq', value: 'aguardando' }
      ]
    });
  }

  /**
   * Marca encomenda como retirada
   */
  async marcarComoRetirada(id: number): Promise<CrudResponse<Encomenda>> {
    return this.update(id, {
      status: 'retirada',
      data_retirada: new Date().toISOString()
    });
  }
}

