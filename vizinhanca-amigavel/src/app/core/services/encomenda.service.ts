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
    // Tenta com relacionamento primeiro, mas se falhar, tenta sem
    const selectWithRelation = options?.select || '*, usuario:usuario!id_usuario(id, nome, unidade)';
    
    const response = await this.crudService.findAll<Encomenda>('encomenda', {
      ...options,
      select: selectWithRelation,
      orderBy: options?.orderBy || [{ column: 'data_criacao', ascending: false }]
    });

    // Se falhou por causa de relacionamento, tenta sem relacionamento
    if (response.error && (response.error.message?.includes('relation') || 
                           response.error.message?.includes('foreign key') ||
                           response.error.message?.includes('column'))) {
      return this.crudService.findAll<Encomenda>('encomenda', {
        ...options,
        select: options?.select || '*',
        orderBy: options?.orderBy || [{ column: 'data_criacao', ascending: false }]
      });
    }

    return response;
  }

  /**
   * Busca encomenda por ID
   */
  async findById(id: number): Promise<CrudResponse<Encomenda>> {
    // Tenta buscar diretamente sem relacionamento primeiro
    // Isso evita problemas com políticas RLS em relacionamentos
    const basicResponse = await this.crudService.findById<Encomenda>('encomenda', id, '*');
    
    // Se encontrou o registro básico, tenta enriquecer com relacionamento
    if (!basicResponse.error && basicResponse.data) {
      // Tenta buscar com relacionamento, mas se falhar, retorna os dados básicos
      try {
        const responseWithRelation = await this.crudService.findById<Encomenda>(
          'encomenda', 
          id, 
          '*, usuario:usuario!id_usuario(id, nome, unidade)'
        );
        
        // Se conseguiu buscar com relacionamento, retorna
        if (!responseWithRelation.error && responseWithRelation.data) {
          return responseWithRelation;
        }
        
        // Se falhou mas não é erro crítico (relacionamento), retorna os dados básicos
        if (responseWithRelation.error && 
            (responseWithRelation.error.message?.includes('relation') ||
             responseWithRelation.error.message?.includes('foreign key') ||
             responseWithRelation.error.message?.includes('column') ||
             responseWithRelation.error.message?.includes('permission'))) {
          // Retorna os dados básicos - o componente pode lidar com usuario sendo undefined
          return basicResponse;
        }
      } catch (error) {
        // Se houver exceção, retorna os dados básicos
        return basicResponse;
      }
    }
    
    // Se não encontrou o registro básico, pode ser:
    // 1. Registro não existe
    // 2. Bloqueado por RLS (usuário não verificado ou não está no mesmo condomínio)
    // A mensagem de erro já foi melhorada no BaseCrudService para indicar isso
    return basicResponse;
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


