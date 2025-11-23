import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase.service';
import {
  CrudResponse,
  QueryOptions,
  FilterOptions,
  OrderOptions,
  PaginationOptions
} from '../interfaces/crud.interface';

/**
 * Serviço genérico de CRUD para Supabase
 * 
 * Este serviço fornece métodos genéricos para operações CRUD (Create, Read, Update, Delete)
 * em qualquer tabela do Supabase, com suporte a filtros, ordenação, paginação e contagem.
 * 
 * @example
 * ```typescript
 * // Injetar o serviço
 * constructor(private crudService: BaseCrudService) {}
 * 
 * // Buscar todos os registros
 * async getUsers() {
 *   const response = await this.crudService.findAll<User>('users');
 *   if (response.error) {
 *     console.error(response.error);
 *     return;
 *   }
 *   console.log(response.data);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class BaseCrudService {
  private supabaseService = inject(SupabaseService);
  
  /**
   * Obtém o cliente Supabase
   */
  private get client(): SupabaseClient {
    return this.supabaseService.getClient();
  }

  /**
   * Busca todos os registros de uma tabela
   * 
   * @param tableName - Nome da tabela
   * @param options - Opções de consulta (filtros, ordenação, paginação)
   * @returns Promise com os dados e possíveis erros
   * 
   * @example
   * ```typescript
   * // Buscar todos os usuários
   * const response = await this.crudService.findAll<User>('users');
   * 
   * // Com filtros e ordenação
   * const response = await this.crudService.findAll<User>('users', {
   *   filters: [{ column: 'active', operator: 'eq', value: true }],
   *   orderBy: [{ column: 'created_at', ascending: false }],
   *   pagination: { page: 1, pageSize: 10 }
   * });
   * ```
   */
  async findAll<T = any>(
    tableName: string,
    options?: QueryOptions
  ): Promise<CrudResponse<T[]>> {
    try {
      let query = this.client.from(tableName).select(options?.select || '*');

      // Aplicar filtros
      if (options?.filters && options.filters.length > 0) {
        query = this.applyFilters(query, options.filters);
      }

      // Aplicar ordenação
      if (options?.orderBy && options.orderBy.length > 0) {
        query = this.applyOrderBy(query, options.orderBy);
      }

      // Aplicar paginação
      if (options?.pagination) {
        query = this.applyPagination(query, options.pagination);
      }

      // Contagem
      let countResult: number | undefined;
      if (options?.count) {
        const countType = options.count === true ? 'exact' : options.count;
        const countQuery = this.client.from(tableName).select('*', { count: countType, head: true });
        const { count } = await countQuery;
        countResult = count || undefined;
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: new Error(error.message), count: countResult };
      }

      return { data: data as T[], error: null, count: countResult };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Busca um único registro por ID
   * 
   * @param tableName - Nome da tabela
   * @param id - ID do registro
   * @param select - Colunas a serem selecionadas (opcional)
   * @returns Promise com o dado e possíveis erros
   * 
   * @example
   * ```typescript
   * const response = await this.crudService.findById<User>('users', '123');
   * if (response.data) {
   *   console.log(response.data);
   * }
   * ```
   */
  async findById<T = any>(
    tableName: string,
    id: string | number,
    select?: string
  ): Promise<CrudResponse<T>> {
    try {
      // Não usar .single() para evitar erro 406 quando retorna 0 linhas
      // Em vez disso, buscar e verificar se encontrou
      let query = this.client
        .from(tableName)
        .select(select || '*')
        .eq('id', id)
        .limit(1);

      const { data, error } = await query;

      if (error) {
        return { data: null, error: new Error(error.message) };
      }
      
      // Se não encontrou nenhum registro, retorna erro apropriado
      if (!data || data.length === 0) {
        return {
          data: null,
          error: new Error(`Registro não encontrado na tabela ${tableName} com id ${id}`)
        };
      }
      
      // Retorna o primeiro resultado
      const result = data[0];
      return { data: result as T, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Cria um novo registro
   * 
   * @param tableName - Nome da tabela
   * @param data - Dados do novo registro
   * @param select - Colunas a serem retornadas (opcional)
   * @returns Promise com o dado criado e possíveis erros
   * 
   * @example
   * ```typescript
   * const newUser = { name: 'John', email: 'john@example.com' };
   * const response = await this.crudService.create<User>('users', newUser);
   * if (response.data) {
   *   console.log('User created:', response.data);
   * }
   * ```
   */
  async create<T = any>(
    tableName: string,
    data: Partial<T>,
    select?: string
  ): Promise<CrudResponse<T>> {
    try {
      // Não usar .single() para evitar erro quando retorna múltiplos resultados
      let query = this.client
        .from(tableName)
        .insert(data as any)
        .select(select || '*')
        .limit(1);

      const { data: insertedData, error } = await query;

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      // Se não retornou dados, retorna erro
      if (!insertedData || insertedData.length === 0) {
        return {
          data: null,
          error: new Error(`Falha ao criar registro na tabela ${tableName}`)
        };
      }

      // Retorna o primeiro resultado
      return { data: insertedData[0] as T, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Cria múltiplos registros
   * 
   * @param tableName - Nome da tabela
   * @param data - Array de dados dos novos registros
   * @param select - Colunas a serem retornadas (opcional)
   * @returns Promise com os dados criados e possíveis erros
   * 
   * @example
   * ```typescript
   * const users = [
   *   { name: 'John', email: 'john@example.com' },
   *   { name: 'Jane', email: 'jane@example.com' }
   * ];
   * const response = await this.crudService.createMany<User>('users', users);
   * ```
   */
  async createMany<T = any>(
    tableName: string,
    data: Partial<T>[],
    select?: string
  ): Promise<CrudResponse<T[]>> {
    try {
      let query = this.client
        .from(tableName)
        .insert(data as any)
        .select(select || '*');

      const { data: insertedData, error } = await query;

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: insertedData as T[], error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Atualiza um registro por ID
   * 
   * @param tableName - Nome da tabela
   * @param id - ID do registro
   * @param data - Dados a serem atualizados
   * @param select - Colunas a serem retornadas (opcional)
   * @returns Promise com o dado atualizado e possíveis erros
   * 
   * @example
   * ```typescript
   * const updates = { name: 'John Updated' };
   * const response = await this.crudService.update<User>('users', '123', updates);
   * ```
   */
  async update<T = any>(
    tableName: string,
    id: string | number,
    data: Partial<T>,
    select?: string
  ): Promise<CrudResponse<T>> {
    try {
      // Não usar .single() para evitar erro quando retorna 0 ou múltiplos resultados
      let query = this.client
        .from(tableName)
        .update(data as any)
        .eq('id', id)
        .select(select || '*')
        .limit(1);

      const { data: updatedData, error } = await query;

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      // Se não encontrou nenhum registro, retorna erro apropriado
      if (!updatedData || updatedData.length === 0) {
        return {
          data: null,
          error: new Error(`Registro não encontrado na tabela ${tableName} com id ${id}`)
        };
      }

      // Retorna o primeiro resultado
      return { data: updatedData[0] as T, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Atualiza múltiplos registros baseado em filtros
   * 
   * @param tableName - Nome da tabela
   * @param filters - Filtros para identificar os registros
   * @param data - Dados a serem atualizados
   * @param select - Colunas a serem retornadas (opcional)
   * @returns Promise com os dados atualizados e possíveis erros
   * 
   * @example
   * ```typescript
   * const filters = [{ column: 'active', operator: 'eq', value: false }];
   * const updates = { active: true };
   * const response = await this.crudService.updateMany<User>('users', filters, updates);
   * ```
   */
  async updateMany<T = any>(
    tableName: string,
    filters: FilterOptions[],
    data: Partial<T>,
    select?: string
  ): Promise<CrudResponse<T[]>> {
    try {
      let query: any = this.client.from(tableName).update(data as any);

      // Aplicar filtros
      if (filters.length > 0) {
        query = this.applyFilters(query, filters);
      }

      query = query.select(select || '*');

      const { data: updatedData, error } = await query;

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: (updatedData || []) as T[], error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Deleta um registro por ID
   * 
   * @param tableName - Nome da tabela
   * @param id - ID do registro
   * @returns Promise com o dado deletado e possíveis erros
   * 
   * @example
   * ```typescript
   * const response = await this.crudService.delete<User>('users', '123');
   * ```
   */
  async delete<T = any>(
    tableName: string,
    id: string | number
  ): Promise<CrudResponse<T>> {
    try {
      // Não usar .single() para evitar erro quando retorna 0 ou múltiplos resultados
      const { data, error } = await this.client
        .from(tableName)
        .delete()
        .eq('id', id)
        .select()
        .limit(1);

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      // Se não encontrou nenhum registro, retorna erro apropriado
      if (!data || data.length === 0) {
        return {
          data: null,
          error: new Error(`Registro não encontrado na tabela ${tableName} com id ${id}`)
        };
      }

      // Retorna o primeiro resultado
      return { data: data[0] as T, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Deleta múltiplos registros baseado em filtros
   * 
   * @param tableName - Nome da tabela
   * @param filters - Filtros para identificar os registros
   * @returns Promise com os dados deletados e possíveis erros
   * 
   * @example
   * ```typescript
   * const filters = [{ column: 'active', operator: 'eq', value: false }];
   * const response = await this.crudService.deleteMany<User>('users', filters);
   * ```
   */
  async deleteMany<T = any>(
    tableName: string,
    filters: FilterOptions[]
  ): Promise<CrudResponse<T[]>> {
    try {
      let query = this.client.from(tableName).delete();

      // Aplicar filtros
      if (filters.length > 0) {
        query = this.applyFilters(query, filters);
      }

      const { data, error } = await query.select();

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as T[], error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Aplica filtros à query
   */
  private applyFilters(query: any, filters: FilterOptions[]): any {
    filters.forEach(filter => {
      const operator = filter.operator || 'eq';
      
      switch (operator) {
        case 'eq':
          query = query.eq(filter.column, filter.value);
          break;
        case 'neq':
          query = query.neq(filter.column, filter.value);
          break;
        case 'gt':
          query = query.gt(filter.column, filter.value);
          break;
        case 'gte':
          query = query.gte(filter.column, filter.value);
          break;
        case 'lt':
          query = query.lt(filter.column, filter.value);
          break;
        case 'lte':
          query = query.lte(filter.column, filter.value);
          break;
        case 'like':
          query = query.like(filter.column, filter.value);
          break;
        case 'ilike':
          query = query.ilike(filter.column, filter.value);
          break;
        case 'is':
          query = query.is(filter.column, filter.value);
          break;
        case 'in':
          query = query.in(filter.column, filter.value);
          break;
        case 'contains':
          query = query.contains(filter.column, filter.value);
          break;
        case 'textSearch':
          query = query.textSearch(filter.column, filter.value);
          break;
        default:
          query = query.eq(filter.column, filter.value);
      }
    });

    return query;
  }

  /**
   * Aplica ordenação à query
   */
  private applyOrderBy(query: any, orderBy: OrderOptions[]): any {
    orderBy.forEach(order => {
      query = query.order(order.column, {
        ascending: order.ascending !== false
      });
    });

    return query;
  }

  /**
   * Aplica paginação à query
   */
  private applyPagination(query: any, pagination: PaginationOptions): any {
    if (pagination.page !== undefined && pagination.pageSize !== undefined) {
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      query = query.range(from, to);
    } else if (pagination.offset !== undefined && pagination.limit !== undefined) {
      query = query.range(
        pagination.offset,
        pagination.offset + pagination.limit - 1
      );
    }

    return query;
  }
}

