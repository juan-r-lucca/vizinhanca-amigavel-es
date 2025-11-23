import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { ItemAchadoPerdido, ItemAchadoPerdidoCreate, ItemAchadoPerdidoUpdate } from '../models/item-achado-perdido.model';
import { CrudResponse } from '../interfaces/crud.interface';

/**
 * Serviço de Itens Achados/Perdidos
 * Gerencia operações relacionadas a itens perdidos e achados
 */
@Injectable({
  providedIn: 'root'
})
export class ItemAchadoPerdidoService {
  private crudService = inject(BaseCrudService);

  /**
   * Busca todos os itens
   */
  async findAll(options?: any): Promise<CrudResponse<ItemAchadoPerdido[]>> {
    return this.crudService.findAll<ItemAchadoPerdido>('item_achado_perdido', {
      ...options,
      select: options?.select || '*, usuario:usuario(id, nome, foto_url)',
      orderBy: options?.orderBy || [{ column: 'data_criacao', ascending: false }]
    });
  }

  /**
   * Busca item por ID
   */
  async findById(id: number): Promise<CrudResponse<ItemAchadoPerdido>> {
    return this.crudService.findById<ItemAchadoPerdido>('item_achado_perdido', id, '*, usuario:usuario(id, nome, foto_url)');
  }

  /**
   * Cria um novo item
   */
  async create(data: ItemAchadoPerdidoCreate): Promise<CrudResponse<ItemAchadoPerdido>> {
    const itemData = {
      ...data,
      resolvido: data.resolvido || false
    };
    return this.crudService.create<ItemAchadoPerdido>('item_achado_perdido', itemData);
  }

  /**
   * Atualiza um item
   */
  async update(id: number, data: ItemAchadoPerdidoUpdate): Promise<CrudResponse<ItemAchadoPerdido>> {
    return this.crudService.update<ItemAchadoPerdido>('item_achado_perdido', id, data);
  }

  /**
   * Deleta um item
   */
  async delete(id: number): Promise<CrudResponse<ItemAchadoPerdido>> {
    return this.crudService.delete<ItemAchadoPerdido>('item_achado_perdido', id);
  }

  /**
   * Busca itens por condomínio
   */
  async findByCondominio(idCondominio: number): Promise<CrudResponse<ItemAchadoPerdido[]>> {
    return this.findAll({
      filters: [
        { column: 'id_condominio', operator: 'eq', value: idCondominio }
      ]
    });
  }

  /**
   * Busca por tipo (achado ou perdido)
   */
  async findByTipo(tipo: 'achado' | 'perdido', idCondominio: number): Promise<CrudResponse<ItemAchadoPerdido[]>> {
    return this.findAll({
      filters: [
        { column: 'tipo', operator: 'eq', value: tipo },
        { column: 'id_condominio', operator: 'eq', value: idCondominio },
        { column: 'resolvido', operator: 'eq', value: false }
      ]
    });
  }

  /**
   * Busca apenas itens não resolvidos
   */
  async findNaoResolvidos(idCondominio: number): Promise<CrudResponse<ItemAchadoPerdido[]>> {
    return this.findAll({
      filters: [
        { column: 'id_condominio', operator: 'eq', value: idCondominio },
        { column: 'resolvido', operator: 'eq', value: false }
      ]
    });
  }

  /**
   * Marca item como resolvido
   */
  async marcarComoResolvido(id: number): Promise<CrudResponse<ItemAchadoPerdido>> {
    return this.update(id, { resolvido: true });
  }
}

