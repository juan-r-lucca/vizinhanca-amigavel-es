import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../supabase.service';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../models/usuario.model';
import { CrudResponse } from '../interfaces/crud.interface';

/**
 * Serviço de Autenticação
 * Gerencia autenticação e sessão do usuário
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Estado do usuário atual
  currentUser = signal<Usuario | null>(null);
  isAuthenticated = signal<boolean>(false);
  isVerified = signal<boolean>(false);
  isLoading = signal<boolean>(false); // Inicia como false para não bloquear bootstrap

  constructor() {
    // No servidor, não inicializa
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return;
    }

    // Inicializa imediatamente como não autenticado para não bloquear
    this.isLoading.set(false);
    this.isAuthenticated.set(false);
    this.isVerified.set(false);

    // No browser, inicializa de forma completamente assíncrona
    // Usa setTimeout com delay maior para garantir que o bootstrap termine primeiro
    setTimeout(() => {
      this.init().catch(() => {
        // Ignora erros silenciosamente
        this.isAuthenticated.set(false);
        this.isVerified.set(false);
      });
    }, 500);
  }

  /**
   * Inicializa o serviço verificando sessão atual
   */
  private async init(): Promise<void> {
    // Não marca como loading para não bloquear guards
    try {
      // Timeout aumentado para dar mais tempo à conexão
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao verificar sessão')), 5000)
      );
      
      let sessionResult: any;
      try {
        const sessionPromise = this.supabaseService.getClient().auth.getSession();
        sessionResult = await Promise.race([sessionPromise, timeoutPromise]);
      } catch (error) {
        // Silenciosamente ignora timeout - não é crítico
        sessionResult = { data: { session: null } };
      }
      
      const session = sessionResult?.data?.session;
      
      if (session?.user) {
        try {
          await this.loadUser(session.user.id);
        } catch (userError) {
          // Ignora erros ao carregar usuário - não é crítico na inicialização
          this.isAuthenticated.set(false);
          this.isVerified.set(false);
        }
      } else {
        this.isAuthenticated.set(false);
        this.isVerified.set(false);
      }
    } catch (error) {
      // Qualquer erro é ignorado - não bloqueia a aplicação
      this.isAuthenticated.set(false);
      this.isVerified.set(false);
    }

    // Observa mudanças na autenticação (apenas no browser)
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.supabaseService.getClient().auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await this.loadUser(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            this.currentUser.set(null);
            this.isAuthenticated.set(false);
            this.isVerified.set(false);
            if (isPlatformBrowser(this.platformId)) {
              this.router.navigate(['/auth/login']);
            }
          }
        });
      } catch (error) {
        // Ignora erros no listener
      }
    }
  }

  /**
   * Carrega dados do usuário
   * Método público para permitir recarregar dados do usuário após atualizações
   */
  async loadUser(userId: string): Promise<void> {
    try {
      // Primeiro tenta buscar sem relações para ser mais rápido
      let response = await this.usuarioService.findById(userId, false);

      // Se falhar, tenta novamente com relações
      if (response.error || !response.data) {
        console.warn('Primeira tentativa falhou, tentando com relações:', response.error?.message);
        response = await this.usuarioService.findById(userId, true);
      }

      if (response.error) {
        console.error('Erro ao buscar usuário:', response.error);
        throw response.error;
      }

      if (!response.data) {
        console.warn('Usuário não encontrado no banco de dados:', userId);
        throw new Error('Usuário não encontrado');
      }

      this.currentUser.set(response.data);
      this.isAuthenticated.set(true);
      this.isVerified.set(response.data.verificado || false);
    } catch (error) {
      console.error('Erro no loadUser:', error);
      throw error;
    }
  }

  /**
   * Registra um novo usuário
   */
  async signUp(
    email: string,
    password: string,
    nome: string,
    perfil: 'morador' | 'sindico'
  ): Promise<{ error: Error | null }> {
    try {
      const { data, error } = await this.supabaseService.getClient().auth.signUp({
        email,
        password
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Cria registro do usuário com o ID do auth.users
        const usuarioResponse = await this.usuarioService.createWithId(
          data.user.id,
          {
            nome,
            email,
            verificado: false,
            perfil
          }
        );

        if (usuarioResponse.error) {
          return { error: usuarioResponse.error };
        }

        // Se a função retornou os dados do usuário, usa-os diretamente
        // Isso evita buscar novamente e problemas com RLS
        if (usuarioResponse.data) {
          this.currentUser.set({
            ...usuarioResponse.data,
            perfil: usuarioResponse.data.perfil ?? perfil
          });
          this.isAuthenticated.set(true);
          this.isVerified.set(usuarioResponse.data.verificado || false);
        } else {
          // Fallback: tenta buscar se não tiver os dados
          await this.loadUser(data.user.id);
        }
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Erro ao registrar usuário')
      };
    }
  }

  /**
   * Faz login
   */
  async signIn(email: string, password: string): Promise<{ error: Error | null }> {
    try {
      // Cria uma promise com timeout para evitar que fique pendente infinitamente
      const loginPromise = this.supabaseService.getClient().auth.signInWithPassword({
        email,
        password
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Tempo limite excedido ao fazer login')), 10000)
      );

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]);

      if (error) {
        return { error };
      }

      if (data?.user) {
        // Carrega o usuário com timeout também
        try {
          const loadUserPromise = this.loadUser(data.user.id);
          const loadUserTimeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Tempo limite excedido ao carregar dados do usuário')), 5000)
          );
          
          await Promise.race([loadUserPromise, loadUserTimeout]);
        } catch (loadError) {
          // Se falhar ao carregar o usuário, ainda considera o login bem-sucedido
          // e tenta usar dados básicos do auth
          console.warn('Erro ao carregar dados completos do usuário:', loadError);
          this.isAuthenticated.set(true);
          this.isVerified.set(false);
          
          // Tenta criar um usuário básico com os dados do auth
          if (data.user.email) {
            this.currentUser.set({
              id: data.user.id,
              nome: data.user.email.split('@')[0] || 'Usuário',
              email: data.user.email,
              perfil: 'morador',
              verificado: false
            } as Usuario);
          }
        }
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Erro ao fazer login')
      };
    }
  }

  /**
   * Faz logout
   */
  async signOut(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      await this.supabaseService.getClient().auth.signOut();
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
      this.isVerified.set(false);
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Envia email de recuperação de senha
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabaseService.getClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Erro ao enviar email de recuperação')
      };
    }
  }

  /**
   * Atualiza senha
   */
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.supabaseService.getClient().auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Erro ao atualizar senha')
      };
    }
  }
}

