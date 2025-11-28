import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Agenda, AgendaCreate, AgendaUpdate } from '../models/agenda.model';
import { CrudResponse } from '../interfaces/crud.interface';

/**
 * Serviço de Agenda
 * Gerencia operações relacionadas a agendamentos de eventos, quadras e itens
 */
@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private crudService = inject(BaseCrudService);

  /**
   * Busca todos os agendamentos
   */
  async findAll(options?: any): Promise<CrudResponse<Agenda[]>> {
    const selectWithRelation = options?.select || '*, usuario:usuario!id_usuario(id, nome, unidade)';
    
    const response = await this.crudService.findAll<Agenda>('agenda', {
      ...options,
      select: selectWithRelation,
      orderBy: options?.orderBy || [{ column: 'data_inicio', ascending: true }]
    });

    // Se falhou por causa de relacionamento, tenta sem relacionamento
    if (response.error && (response.error.message?.includes('relation') || 
                           response.error.message?.includes('foreign key') ||
                           response.error.message?.includes('column'))) {
      return this.crudService.findAll<Agenda>('agenda', {
        ...options,
        select: options?.select || '*',
        orderBy: options?.orderBy || [{ column: 'data_inicio', ascending: true }]
      });
    }

    return response;
  }

  /**
   * Busca agendamento por ID
   */
  async findById(id: number): Promise<CrudResponse<Agenda>> {
    const basicResponse = await this.crudService.findById<Agenda>('agenda', id, '*');
    
    if (!basicResponse.error && basicResponse.data) {
      try {
        const responseWithRelation = await this.crudService.findById<Agenda>(
          'agenda', 
          id, 
          '*, usuario:usuario!id_usuario(id, nome, unidade)'
        );
        
        if (!responseWithRelation.error && responseWithRelation.data) {
          return responseWithRelation;
        }
        
        if (responseWithRelation.error && 
            (responseWithRelation.error.message?.includes('relation') ||
             responseWithRelation.error.message?.includes('foreign key') ||
             responseWithRelation.error.message?.includes('column') ||
             responseWithRelation.error.message?.includes('permission'))) {
          return basicResponse;
        }
      } catch (error) {
        return basicResponse;
      }
    }
    
    return basicResponse;
  }

  /**
   * Cria um novo agendamento
   */
  async create(data: AgendaCreate): Promise<CrudResponse<Agenda>> {
    return this.crudService.create<Agenda>('agenda', data);
  }

  /**
   * Atualiza um agendamento
   */
  async update(id: number, data: AgendaUpdate): Promise<CrudResponse<Agenda>> {
    const updateData: any = { ...data };
    updateData.updated_at = new Date().toISOString();
    
    return this.crudService.update<Agenda>('agenda', id, updateData);
  }

  /**
   * Deleta um agendamento
   */
  async delete(id: number): Promise<CrudResponse<Agenda>> {
    return this.crudService.delete<Agenda>('agenda', id);
  }

  /**
   * Busca agendamentos por condomínio
   */
  async findByCondominio(idCondominio: number): Promise<CrudResponse<Agenda[]>> {
    return this.findAll({
      filters: [
        { column: 'id_condominio', operator: 'eq', value: idCondominio }
      ]
    });
  }

  /**
   * Busca agendamentos por tipo
   */
  async findByTipo(idCondominio: number, tipo: 'evento' | 'quadra' | 'item'): Promise<CrudResponse<Agenda[]>> {
    return this.findAll({
      filters: [
        { column: 'id_condominio', operator: 'eq', value: idCondominio },
        { column: 'tipo', operator: 'eq', value: tipo }
      ]
    });
  }

  /**
   * Busca agendamentos por período
   */
  async findByPeriodo(
    idCondominio: number, 
    dataInicio: string, 
    dataFim: string
  ): Promise<CrudResponse<Agenda[]>> {
    return this.findAll({
      filters: [
        { column: 'id_condominio', operator: 'eq', value: idCondominio },
        { column: 'data_inicio', operator: 'gte', value: dataInicio },
        { column: 'data_fim', operator: 'lte', value: dataFim }
      ]
    });
  }

  /**
   * Verifica conflitos de agendamento
   * Retorna agendamentos que conflitam com o período especificado
   */
  async verificarConflitos(
    idCondominio: number,
    nomeRecurso: string,
    dataInicio: string,
    dataFim: string,
    excludeId?: number
  ): Promise<CrudResponse<Agenda[]>> {
    const filters: any[] = [
      { column: 'id_condominio', operator: 'eq', value: idCondominio },
      { column: 'nome_recurso', operator: 'eq', value: nomeRecurso }
    ];

    if (excludeId) {
      filters.push({ column: 'id', operator: 'neq', value: excludeId });
    }

    // Busca agendamentos que se sobrepõem ao período
    // Um agendamento conflita se:
    // - data_inicio < dataFim E data_fim > dataInicio
    const response = await this.findAll({ filters });

    if (response.error || !response.data) {
      return response;
    }

    // Filtra conflitos no lado do cliente (já que Supabase não suporta OR complexo facilmente)
    const conflitos = response.data.filter(agenda => {
      const inicioAgenda = new Date(agenda.data_inicio);
      const fimAgenda = new Date(agenda.data_fim);
      const inicioNovo = new Date(dataInicio);
      const fimNovo = new Date(dataFim);

      // Verifica sobreposição
      return inicioAgenda < fimNovo && fimAgenda > inicioNovo;
    });

    return {
      data: conflitos,
      error: null
    };
  }
}

