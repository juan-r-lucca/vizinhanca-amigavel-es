import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Condominio, CondominioCreate, CondominioUpdate } from '../models/condominio.model';
import { CrudResponse } from '../interfaces/crud.interface';
import { UsuarioService } from './usuario.service';
import { AuthService } from './auth.service';
import { SupabaseService } from '../../supabase.service';

/**
 * Serviço de Condomínio
 * Gerencia operações relacionadas a condomínios
 */
@Injectable({
  providedIn: 'root'
})
export class CondominioService {
  private crudService = inject(BaseCrudService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);

  /**
   * Busca todos os condomínios
   */
  async findAll(): Promise<CrudResponse<Condominio[]>> {
    return this.crudService.findAll<Condominio>('condominio', {
      orderBy: [{ column: 'nome', ascending: true }]
    });
  }

  /**
   * Busca condomínio por ID
   */
  async findById(id: number): Promise<CrudResponse<Condominio>> {
    return this.crudService.findById<Condominio>('condominio', id);
  }

  /**
   * Cria um novo condomínio
   */
  async create(data: CondominioCreate): Promise<CrudResponse<Condominio>> {
    return this.crudService.create<Condominio>('condominio', data);
  }

  /**
   * Atualiza um condomínio
   */
  async update(id: number, data: CondominioUpdate): Promise<CrudResponse<Condominio>> {
    return this.crudService.update<Condominio>('condominio', id, data);
  }

  /**
   * Deleta um condomínio
   */
  async delete(id: number): Promise<CrudResponse<Condominio>> {
    return this.crudService.delete<Condominio>('condominio', id);
  }

  /**
   * Busca condomínio por CEP
   */
  async findByCep(cep: string): Promise<CrudResponse<Condominio[]>> {
    return this.crudService.findAll<Condominio>('condominio', {
      filters: [
        { column: 'cep', operator: 'eq', value: cep }
      ]
    });
  }

  /**
   * Cria um condomínio e associa o usuário atual automaticamente
   * 
   * @param data - Dados do condomínio a ser criado
   * @param autoAssociate - Se true (padrão), associa automaticamente o usuário atual ao condomínio
   * @returns Promise com o condomínio criado e possíveis erros
   * 
   * @example
   * ```typescript
   * const response = await condominioService.createAndAssociate({
   *   nome: 'Meu Condomínio',
   *   endereco: 'Rua Exemplo, 123',
   *   cep: '12345-678',
   *   cidade: 'São Paulo',
   *   estado: 'SP'
   * });
   * ```
   */
  async createAndAssociate(
    data: CondominioCreate,
    autoAssociate: boolean = true
  ): Promise<CrudResponse<{ condominio: Condominio; usuarioAtualizado: boolean }>> {
    try {
      // Verificar se o usuário está autenticado
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        return {
          data: null,
          error: new Error('Usuário não autenticado. Faça login primeiro.')
        };
      }

      // Criar o condomínio
      const createResponse = await this.create(data);
      if (createResponse.error || !createResponse.data) {
        return {
          data: null,
          error: createResponse.error || new Error('Erro ao criar condomínio')
        };
      }

      const condominio = createResponse.data;
      let usuarioAtualizado = false;

      // Se autoAssociate for true, associar o usuário ao condomínio
      if (autoAssociate) {
        const updateResponse = await this.usuarioService.update(currentUser.id, {
          id_condominio: condominio.id
        });

        if (updateResponse.error) {
          // Condomínio foi criado mas falhou ao associar usuário
          return {
            data: {
              condominio,
              usuarioAtualizado: false
            },
            error: new Error(
              `Condomínio criado com sucesso, mas falhou ao associar usuário: ${updateResponse.error.message}`
            )
          };
        }

        usuarioAtualizado = true;

        // Recarregar o usuário atual para atualizar o estado
        const { data: { user } } = await this.supabaseService.getClient().auth.getUser();
        if (user) {
          await this.authService.loadUser(user.id);
        }
      }

      return {
        data: {
          condominio,
          usuarioAtualizado
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Erro ao criar condomínio e associar usuário')
      };
    }
  }
}

