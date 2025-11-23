import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../enviroments/enviroments';

/**
 * Serviço principal do Supabase
 * 
 * Este serviço fornece acesso ao cliente Supabase e é usado pelo BaseCrudService
 * para realizar operações no banco de dados.
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    // Só inicializa no browser para evitar problemas no SSR
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.supabase = createClient(
          environment.supabaseUrl,
          environment.supabaseKey,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true
            },
            global: {
              fetch: (url, options = {}) => {
                // Adiciona timeout para evitar requisições infinitas
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
                
                return fetch(url, {
                  ...options,
                  signal: controller.signal
                }).finally(() => {
                  clearTimeout(timeoutId);
                });
              }
            }
          }
        );
        console.log('SupabaseService inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar SupabaseService:', error);
        // Não lança erro para não quebrar a aplicação
      }
    }
  }

  /**
   * Obtém o cliente Supabase
   * 
   * @returns Instância do SupabaseClient ou null se não estiver no browser
   */
  getClient(): SupabaseClient {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('SupabaseClient só pode ser usado no browser');
    }
    
    if (!this.supabase) {
      // Tenta inicializar novamente se não foi inicializado
      try {
        this.supabase = createClient(
          environment.supabaseUrl,
          environment.supabaseKey,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true
            }
          }
        );
      } catch (error) {
        console.error('Erro ao inicializar SupabaseClient:', error);
        throw new Error('Não foi possível inicializar o cliente Supabase');
      }
    }
    
    return this.supabase;
  }

  /**
   * Obtém o cliente Supabase diretamente (alias para getClient)
   * 
   * @deprecated Use getClient() ao invés disso
   */
  get client(): SupabaseClient {
    return this.getClient();
  }
}
