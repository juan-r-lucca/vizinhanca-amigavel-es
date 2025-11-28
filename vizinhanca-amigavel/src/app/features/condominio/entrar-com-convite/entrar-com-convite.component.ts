import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent, ErrorMessageComponent, CardComponent } from '../../../shared/components';
import { CondominioService } from '../../../core/services/condominio.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-entrar-com-convite',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent, CardComponent],
  template: `
    <div class="invite-container">
      <app-card title="Entrar com Link de Convite">
        <div class="invite-content">
          <p class="description">
            Cole o link de convite que você recebeu do síndico do seu condomínio para entrar na comunidade.
          </p>

          <app-loading-spinner
            *ngIf="loading()"
            message="Processando convite...">
          </app-loading-spinner>

          <app-error-message
            *ngIf="error() && !loading()"
            [error]="error()">
          </app-error-message>

          <form *ngIf="!loading()" (ngSubmit)="processarConvite()" class="invite-form">
            <div class="form-group">
              <label for="link">Link de Convite</label>
              <input
                type="text"
                id="link"
                name="link"
                [(ngModel)]="linkConvite"
                placeholder="https://exemplo.com/convite/123"
                required
                [disabled]="processando()"
                class="link-input">
              <small class="hint">
                Cole aqui o link completo que você recebeu
              </small>
            </div>

            <div class="actions">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="processando() || !linkConvite.trim()">
                <app-loading-spinner *ngIf="processando()" size="small"></app-loading-spinner>
                <span *ngIf="!processando()">
                  <i class="bi bi-box-arrow-in-right"></i> Entrar na Comunidade
                </span>
                <span *ngIf="processando()">Processando...</span>
              </button>
              <button
                type="button"
                class="btn btn-secondary"
                (click)="cancelar()"
                [disabled]="processando()">
                Cancelar
              </button>
            </div>
          </form>

          <div *ngIf="sucesso()" class="success-message">
            <i class="bi bi-check-circle"></i>
            <p>Convite processado com sucesso! Redirecionando...</p>
          </div>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .invite-container {
      max-width: 600px;
      margin: var(--spacing-xl) auto;
      padding: 0 var(--spacing-md);
    }

    .invite-content {
      padding: var(--spacing-md) 0;
    }

    .description {
      margin: 0 0 var(--spacing-lg) 0;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .invite-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .form-group label {
      font-weight: 600;
      color: var(--text-primary);
    }

    .link-input {
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      font-size: var(--font-size-base);
      color: var(--text-primary);
      transition: border-color var(--transition-fast);
    }

    .link-input:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
    }

    .link-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .hint {
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }

    .actions {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .btn {
      border: none;
      border-radius: 8px;
      padding: var(--spacing-sm) var(--spacing-lg);
      font-size: var(--font-size-base);
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      transition: all var(--transition-fast);
      min-width: 160px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--accent-primary);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--accent-primary-hover);
    }

    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--bg-tertiary);
    }

    .success-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: rgba(46, 125, 50, 0.1);
      border-radius: 8px;
      color: #2e7d32;
    }

    .success-message i {
      font-size: 3rem;
    }

    .success-message p {
      margin: 0;
      font-weight: 500;
    }
  `]
})
export class EntrarComConviteComponent {
  private condominioService = inject(CondominioService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);

  linkConvite = '';
  loading = signal(false);
  processando = signal(false);
  error = signal<string | null>(null);
  sucesso = signal(false);

  async processarConvite(): Promise<void> {
    if (!this.linkConvite.trim()) {
      this.error.set('Por favor, cole o link de convite');
      return;
    }

    this.processando.set(true);
    this.error.set(null);

    try {
      // Extrai o ID do condomínio do link
      const condominioId = this.extrairIdDoLink(this.linkConvite);

      if (!condominioId) {
        this.error.set('Link de convite inválido. Verifique se copiou o link completo.');
        this.processando.set(false);
        return;
      }

      // Verifica se o condomínio existe
      const condominioResponse = await this.condominioService.findById(condominioId);
      
      if (condominioResponse.error || !condominioResponse.data) {
        this.error.set('Condomínio não encontrado. Verifique se o link está correto.');
        this.processando.set(false);
        return;
      }

      // Aceita o convite
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        this.error.set('Você precisa estar autenticado para aceitar um convite.');
        this.processando.set(false);
        return;
      }

      const updateResponse = await this.usuarioService.update(currentUser.id, {
        id_condominio: condominioId
      });

      if (updateResponse.error) {
        this.error.set(updateResponse.error.message || 'Erro ao aceitar o convite. Tente novamente.');
        this.processando.set(false);
        return;
      }

      // Atualiza o usuário no AuthService
      await this.authService.loadUser(currentUser.id);

      this.sucesso.set(true);

      // Redireciona após 1.5 segundos
      setTimeout(() => {
        this.router.navigate(['/mural']);
      }, 1500);

    } catch (error) {
      console.error('Erro ao processar convite:', error);
      this.error.set('Erro inesperado ao processar o convite. Tente novamente.');
      this.processando.set(false);
    }
  }

  private extrairIdDoLink(link: string): number | null {
    try {
      // Tenta extrair o ID de diferentes formatos de link
      // Formato esperado: /convite/123 ou /convite/:id
      const match = link.match(/\/convite\/(\d+)/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }

      // Se não encontrou, tenta pegar o último número do link
      const numbers = link.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const lastNumber = parseInt(numbers[numbers.length - 1], 10);
        if (!isNaN(lastNumber)) {
          return lastNumber;
        }
      }

      return null;
    } catch (error) {
      console.error('Erro ao extrair ID do link:', error);
      return null;
    }
  }

  cancelar(): void {
    this.router.navigate(['/sem-comunidade']);
  }
}

