import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Componente de Cadastro
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="signup-container">
      <div class="signup-card">
        <h2>Cadastro</h2>
        
        <app-error-message 
          *ngIf="error()" 
          [error]="error()" 
          title="Erro ao cadastrar">
        </app-error-message>

        <form (ngSubmit)="onSubmit()" #signupForm="ngForm">
          <div class="form-group perfil-group">
            <label>Como você quer participar?</label>
            <div class="perfil-options">
              <label class="perfil-option">
                <input
                  type="radio"
                  name="perfil"
                  value="morador"
                  [(ngModel)]="perfil"
                  required
                  [disabled]="loading()">
                <div class="perfil-card">
                  <div class="perfil-title">Sou morador</div>
                  <p>Vou entrar em um condomínio existente.</p>
                </div>
              </label>
              <label class="perfil-option">
                <input
                  type="radio"
                  name="perfil"
                  value="sindico"
                  [(ngModel)]="perfil"
                  required
                  [disabled]="loading()">
                <div class="perfil-card">
                  <div class="perfil-title">Sou síndico</div>
                  <p>Vou criar uma nova comunidade e convidar moradores.</p>
                </div>
              </label>
            </div>
            <div class="form-hint">Você pode alterar isso depois nas configurações de perfil.</div>
          </div>

          <div class="form-group">
            <label for="nome">Nome</label>
            <input
              type="text"
              id="nome"
              name="nome"
              [(ngModel)]="nome"
              required
              [disabled]="loading()"
              class="form-control">
          </div>

          <div class="form-group">
            <label for="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              [disabled]="loading()"
              class="form-control">
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              minlength="6"
              [disabled]="loading()"
              class="form-control">
            <small class="form-hint">Mínimo de 6 caracteres</small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              required
              [disabled]="loading()"
              class="form-control">
          </div>

          <button
            type="submit"
            [disabled]="loading() || !signupForm.valid || password !== confirmPassword || !perfil"
            class="btn btn-primary">
            <app-loading-spinner 
              *ngIf="loading()" 
              size="small">
            </app-loading-spinner>
            <span *ngIf="!loading()">Cadastrar</span>
          </button>

          <div *ngIf="password && confirmPassword && password !== confirmPassword" class="error-text">
            As senhas não coincidem
          </div>
        </form>

        <div class="links">
          <a routerLink="/auth/login">Já tem conta? Faça login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: var(--spacing-md);
      background: var(--bg-primary);
    }

    .signup-card {
      background: var(--bg-card);
      padding: var(--spacing-xl);
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      margin: 0 0 var(--spacing-lg) 0;
      text-align: center;
      color: var(--text-primary);
    }

    .form-group {
      margin-bottom: var(--spacing-md);
    }

    .perfil-group {
      margin-bottom: var(--spacing-lg);
    }

    .perfil-options {
      display: grid;
      gap: var(--spacing-md);
    }

    .perfil-option {
      position: relative;
      display: block;
    }

    .perfil-option input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .perfil-card {
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: var(--spacing-md);
      background: var(--bg-secondary);
      transition: all var(--transition-fast);
    }

    .perfil-title {
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .perfil-card p {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      line-height: 1.5;
    }

    .perfil-option input:checked + .perfil-card {
      border-color: var(--accent-primary);
      background: rgba(24, 119, 242, 0.08);
      box-shadow: 0 10px 18px rgba(24, 119, 242, 0.12);
    }

    .perfil-option input:focus-visible + .perfil-card {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
    }

    @media (min-width: 600px) {
      .perfil-options {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    label {
      display: block;
      margin-bottom: var(--spacing-sm);
      color: var(--text-secondary);
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: var(--font-size-base);
      box-sizing: border-box;
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      transition: all var(--transition-fast);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }

    .form-control::placeholder {
      color: var(--text-muted);
    }

    .form-control:disabled {
      background: var(--bg-tertiary);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .form-hint {
      display: block;
      margin-top: var(--spacing-xs);
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }

    .btn {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .btn-primary {
      background: var(--accent-primary);
      color: var(--text-primary);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--accent-primary-hover);
    }

    .btn-primary:disabled {
      background: var(--bg-tertiary);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .error-text {
      color: var(--accent-danger);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-sm);
    }

    .links {
      margin-top: var(--spacing-lg);
      text-align: center;
    }

    .links a {
      color: var(--accent-primary);
      text-decoration: none;
      font-size: var(--font-size-sm);
    }

    .links a:hover {
      text-decoration: underline;
    }
  `]
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  nome = '';
  email = '';
  password = '';
  confirmPassword = '';
  perfil: '' | 'morador' | 'sindico' = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit() {
    if (!this.nome || !this.email || !this.password || this.password !== this.confirmPassword || !this.perfil) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const result = await this.authService.signUp(this.email, this.password, this.nome, this.perfil);

    if (result.error) {
      this.error.set(result.error.message || 'Erro ao cadastrar');
      this.loading.set(false);
      return;
    }

    if (this.perfil === 'sindico') {
      this.router.navigate(['/condominio/criar']);
    } else {
      this.router.navigate(['/sem-comunidade']);
    }
  }
}

