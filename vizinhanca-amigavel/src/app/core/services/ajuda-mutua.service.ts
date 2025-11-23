import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { AjudaMutua, AjudaMutuaCreate, AjudaMutuaUpdate } from '../models/ajuda-mutua.model';
import { CrudResponse } from '../interfaces/crud.interface';

/**
 * Serviço de Ajuda Mútua
 * Gerencia operações relacionadas a ofertas e pedidos
 */
@Injectable({
  providedIn: 'root'
})
export class AjudaMutuaService {
  private crudService = inject(BaseCrudService);

  /**
   * Busca todas as ajudas mútuas
   */
  async findAll(options?: any): Promise<CrudResponse<AjudaMutua[]>> {
    return this.crudService.findAll<AjudaMutua>('ajuda_mutua', {
      ...options,
      select: options?.select || '*, usuario:usuario(id, nome, foto_url)',
      orderBy: options?.orderBy || [{ column: 'data_criacao', ascending: false }]
    });
  }

  /**
   * Busca ajuda mútua por ID
   */
  async findById(id: number): Promise<CrudResponse<AjudaMutua>> {
    return this.crudService.findById<AjudaMutua>('ajuda_mutua', id, '*, usuario:usuario(id, nome, foto_url)');
  }

  /**
   * Cria uma nova ajuda mútua
   */
  async create(data: AjudaMutuaCreate): Promise<CrudResponse<AjudaMutua>> {
    const ajudaData = {
      ...data,
      status: data.status || 'aberto'
    };
    return this.crudService.create<AjudaMutua>('ajuda_mutua', ajudaData);
  }

  /**
   * Atualiza uma ajuda mútua
   */
  async update(id: number, data: AjudaMutuaUpdate): Promise<CrudResponse<AjudaMutua>> {
    return this.crudService.update<AjudaMutua>('ajuda_mutua', id, {
      ...data,
      data_atualizacao: new Date().toISOString()
    });
  }

  /**
   * Deleta uma ajuda mútua
   */
  async delete(id: number): Promise<CrudResponse<AjudaMutua>> {
    return this.crudService.delete<AjudaMutua>('ajuda_mutua', id);
  }

  /**
   * Busca ajudas mútuas por condomínio
   */
  async findByCondominio(idCondominio: number): Promise<CrudResponse<AjudaMutua[]>> {
    return this.findAll({
      filters: [
        { column: 'id_condominio', operator: 'eq', value: idCondominio }
      ]
    });
  }

  /**
   * Busca por tipo (oferta ou pedido)
   */
  async findByTipo(tipo: 'oferta' | 'pedido', idCondominio: number): Promise<CrudResponse<AjudaMutua[]>> {
    return this.findAll({
      filters: [
        { column: 'tipo', operator: 'eq', value: tipo },
        { column: 'id_condominio', operator: 'eq', value: idCondominio },
        { column: 'status', operator: 'eq', value: 'aberto' }
      ]
    });
  }

  /**
   * Fecha uma ajuda mútua
   */
  async fechar(id: number): Promise<CrudResponse<AjudaMutua>> {
    return this.update(id, { status: 'fechado' });
  }
}

