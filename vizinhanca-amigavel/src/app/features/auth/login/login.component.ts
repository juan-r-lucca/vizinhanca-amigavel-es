import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Componente de Login
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="login-page">
      <div class="login-illustration">
        <div class="illustration-content">
          <span class="badge">Comunidade conectada</span>
          <h1>Vizinhança Amigável</h1>
          <p>
            Fortaleça os laços com seus vizinhos, compartilhe novidades e mantenha o seu condomínio sempre em harmonia.
          </p>
        </div>
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
      </div>

      <div class="login-form-area">
        <div class="login-card">
          <div class="brand-header">
            <span class="brand-icon">VA</span>
            <div>
              <h2>Bem-vindo de volta</h2>
              <p>Acesse sua conta para continuar</p>
            </div>
          </div>

          <app-error-message 
            *ngIf="error()" 
            [error]="error()" 
            title="Erro ao fazer login">
          </app-error-message>

          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="form-group">
              <label for="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                [(ngModel)]="email"
                required
                [disabled]="loading()"
                class="form-control"
                placeholder="voce@condominio.com">
            </div>

            <div class="form-group">
              <label for="password">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="password"
                required
                [disabled]="loading()"
                class="form-control"
                placeholder="Digite sua senha">
            </div>

            <button
              type="submit"
              [disabled]="loading() || !loginForm.valid"
              class="btn btn-primary">
              <app-loading-spinner 
                *ngIf="loading()" 
                size="small">
              </app-loading-spinner>
              <span *ngIf="!loading()">Entrar</span>
            </button>
          </form>

          <div class="links">
            <a routerLink="/auth/forgot-password">Esqueceu a senha?</a>
            <a routerLink="/auth/signup">Não tem conta? Cadastre-se</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      flex-direction: row;
      min-height: 100vh;
      background: linear-gradient(135deg, #0d47a1 0%, #1976d2 55%, #63a4ff 100%);
      color: #fff;
    }

    .login-illustration {
      flex: 1.1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem 3rem;
      overflow: hidden;
    }

    .illustration-content {
      max-width: 420px;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .illustration-content h1 {
      font-size: clamp(2.5rem, 4vw, 3.4rem);
      line-height: 1.1;
      margin: 0;
      color: #e3f2fd;
      font-weight: 700;
    }

    .illustration-content p {
      font-size: 1rem;
      line-height: 1.6;
      color: #e8f1ff;
      margin: 0;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(227, 242, 253, 0.2);
      padding: 0.35rem 0.9rem;
      border-radius: 999px;
      border: 1px solid rgba(227, 242, 253, 0.6);
      color: #e3f2fd;
      font-weight: 600;
    }

    .shape {
      position: absolute;
      border-radius: 999px;
      background: rgba(227, 242, 253, 0.12);
      filter: blur(0);
    }

    .shape-1 {
      width: 380px;
      height: 380px;
      top: -60px;
      right: -120px;
      background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.35), rgba(13, 71, 161, 0));
    }

    .shape-2 {
      width: 280px;
      height: 280px;
      bottom: -90px;
      left: -40px;
      background: radial-gradient(circle at center, rgba(227, 242, 253, 0.22), rgba(13, 71, 161, 0));
    }

    .login-form-area {
      flex: 0.9;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem 3rem;
      backdrop-filter: blur(12px);
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      padding: 3rem;
      border-radius: 24px;
      box-shadow: 0 30px 60px rgba(13, 71, 161, 0.35);
      border: none;
      color: #0d47a1;
    }

    .brand-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .brand-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #1976d2, #63a4ff);
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .brand-header h2 {
      margin: 0;
      font-size: 1.75rem;
      color: #0d47a1;
    }

    .brand-header p {
      margin: 0.2rem 0 0;
      color: #5c6bc0;
      font-size: 0.95rem;
    }

    app-error-message {
      margin-bottom: 1.25rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-size: 0.95rem;
      color: #1565c0;
      font-weight: 600;
    }

    .form-control {
      width: 100%;
      padding: 0.85rem 1rem;
      border: 1px solid rgba(21, 101, 192, 0.35);
      border-radius: 12px;
      font-size: 1rem;
      background-color: #f8fbff;
      color: #0d47a1;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      width: 100%;
    }

    .form-control::placeholder {
      color: rgba(13, 71, 161, 0.45);
    }

    .form-control:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 10px 25px rgba(25, 118, 210, 0.25);
      transform: translateY(-1px);
    }

    .form-control:disabled {
      background: rgba(236, 245, 255, 0.7);
      color: rgba(13, 71, 161, 0.5);
      cursor: not-allowed;
    }

    .btn {
      margin-top: 0.5rem;
      width: 100%;
      padding: 0.9rem;
      border: none;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1976d2, #63a4ff);
      color: #ffffff;
      box-shadow: 0 18px 30px rgba(25, 118, 210, 0.35);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 22px 38px rgba(25, 118, 210, 0.4);
    }

    .btn-primary:disabled {
      background: rgba(99, 164, 255, 0.45);
      color: rgba(255, 255, 255, 0.75);
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    .links {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      text-align: center;
    }

    .links a {
      color: #1976d2;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }

    .links a:hover {
      color: #0d47a1;
      text-decoration: underline;
    }

    @media (max-width: 1024px) {
      .login-page {
        flex-direction: column;
      }

      .login-illustration {
        flex: none;
        width: 100%;
        min-height: 320px;
        text-align: center;
      }

      .login-form-area {
        flex: none;
        width: 100%;
        padding: 3rem 2rem 4rem;
        background: linear-gradient(180deg, rgba(13, 71, 161, 0) 0%, rgba(13, 71, 161, 0.15) 100%);
      }

      .login-card {
        padding: 2.5rem 2rem 2.75rem;
        border-radius: 20px;
      }
    }

    @media (max-width: 600px) {
      .illustration-content {
        padding: 0 1.5rem;
      }

      .login-card {
        padding: 2rem 1.75rem 2.5rem;
      }

      .brand-header {
        flex-direction: column;
        text-align: center;
      }

      .brand-icon {
        width: 3.2rem;
        height: 3.2rem;
      }

      form {
        gap: 1rem;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit() {
    // Garante que só executa no browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!this.email || !this.password) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await this.authService.signIn(this.email, this.password);

      if (result.error) {
        this.error.set(result.error.message || 'Erro ao fazer login');
        return;
      }

      // Redireciona para o mural (verificação não é mais obrigatória)
      this.router.navigate(['/mural']);
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      this.error.set(error instanceof Error ? error.message : 'Erro inesperado ao fazer login');
    } finally {
      // Sempre desativa o loading, mesmo se houver erro
      this.loading.set(false);
    }
  }
}

