import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../models/usuario.model';
import { CrudResponse } from '../interfaces/crud.interface';
import { SupabaseService } from '../../supabase.service';

/**
 * Serviço de Usuário
 * Gerencia operações relacionadas a usuários
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private crudService = inject(BaseCrudService);
  private supabaseService = inject(SupabaseService);

  /**
   * Busca todos os usuários
   */
  async findAll(options?: any): Promise<CrudResponse<Usuario[]>> {
    return this.crudService.findAll<Usuario>('usuario', {
      ...options,
      select: options?.select || '*, condominio:condominio(*)'
    });
  }

  /**
   * Busca usuário por ID
   */
  async findById(id: string, includeRelations: boolean = true): Promise<CrudResponse<Usuario>> {
    const select = includeRelations 
      ? '*, condominio:condominio(*)' 
      : '*';
    return this.crudService.findById<Usuario>('usuario', id, select);
  }

  /**
   * Cria um novo usuário
   */
  async create(data: UsuarioCreate): Promise<CrudResponse<Usuario>> {
    return this.crudService.create<Usuario>('usuario', data);
  }

  /**
   * Cria um novo usuário com ID específico (para integração com auth.users)
   * Usa função SQL para evitar problemas de recursão nas políticas RLS
   */
  async createWithId(id: string, data: UsuarioCreate): Promise<CrudResponse<Usuario>> {
    try {
      // Tenta usar a função SQL primeiro (mais seguro)
      const { data: functionResult, error: functionError } = await this.supabaseService.getClient()
        .rpc('create_usuario_profile', {
          p_id: id,
          p_nome: data.nome,
          p_email: data.email,
          p_perfil: data.perfil || 'morador',
          p_verificado: data.verificado || false
        });

      if (!functionError && functionResult && functionResult.length > 0) {
        const result = functionResult[0];
        // A função retorna com prefixo usuario_ para evitar ambiguidade
        return {
          data: {
            id: result.usuario_id || result.id,
            nome: result.usuario_nome || result.nome,
            email: result.usuario_email || result.email,
            perfil: (result.usuario_perfil || result.perfil) as 'morador' | 'sindico' | 'portaria',
            verificado: result.usuario_verificado !== undefined ? result.usuario_verificado : result.verificado,
            telefone: data.telefone,
            unidade: data.unidade,
            id_condominio: data.id_condominio
          } as Usuario,
          error: null
        };
      }

      // Se a função não existir ou não for encontrada, tenta inserção direta (fallback)
      if (functionError && (
        functionError.message?.includes('function') || 
        functionError.message?.includes('does not exist') ||
        functionError.message?.includes('Could not find') ||
        functionError.code === 'PGRST202'
      )) {
        console.warn('Função create_usuario_profile não encontrada. Execute o script fix-usuario-rls-completo.sql no Supabase e aguarde alguns segundos para o cache atualizar. Tentando inserção direta como fallback...');
        
        // Tenta inserção direta como fallback
        const directInsertResult = await this.crudService.create<Usuario>('usuario', { ...data, id } as any);
        
        // Se a inserção direta também falhar com recursão, retorna erro mais claro
        if (directInsertResult.error && directInsertResult.error.message?.includes('infinite recursion')) {
          return {
            data: null,
            error: new Error(
              'Erro de recursão infinita nas políticas RLS. ' +
              'Execute o script fix-usuario-rls-completo.sql no Supabase para corrigir as políticas RLS. ' +
              'A função SQL também não foi encontrada - verifique se o script foi executado completamente.'
            )
          };
        }
        
        return directInsertResult;
      }

      // Se houver outro erro na função, retorna o erro
      if (functionError) {
        return {
          data: null,
          error: new Error(functionError.message || 'Erro ao criar usuário via função')
        };
      }

      // Fallback para inserção direta se não houver resultado
      return this.crudService.create<Usuario>('usuario', { ...data, id } as any);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Erro ao criar usuário')
      };
    }
  }

  /**
   * Atualiza um usuário
   */
  async update(id: string, data: UsuarioUpdate): Promise<CrudResponse<Usuario>> {
    return this.crudService.update<Usuario>('usuario', id, {
      ...data,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Deleta um usuário
   */
  async delete(id: string): Promise<CrudResponse<Usuario>> {
    return this.crudService.delete<Usuario>('usuario', id);
  }

  /**
   * Busca usuários por condomínio
   */
  async findByCondominio(idCondominio: number): Promise<CrudResponse<Usuario[]>> {
    return this.crudService.findAll<Usuario>('usuario', {
      filters: [
        { column: 'id_condominio', operator: 'eq', value: idCondominio }
      ],
      select: 'id, nome, email, unidade, foto_url, perfil, verificado'
    });
  }

  /**
   * Busca usuários verificados
   */
  async findVerified(): Promise<CrudResponse<Usuario[]>> {
    return this.crudService.findAll<Usuario>('usuario', {
      filters: [
        { column: 'verificado', operator: 'eq', value: true }
      ]
    });
  }

  /**
   * Atualiza foto de perfil
   */
  async updateFotoPerfil(id: string, fotoUrl: string): Promise<CrudResponse<Usuario>> {
    return this.update(id, { foto_url: fotoUrl });
  }

  /**
   * Obtém usuário atual da sessão
   */
  async getCurrentUser(): Promise<CrudResponse<Usuario | null>> {
    try {
      const { data: { user } } = await this.supabaseService.getClient().auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }

      return this.findById(user.id);
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Erro ao obter usuário atual')
      };
    }
  }
}

