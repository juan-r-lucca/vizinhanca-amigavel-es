import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncomendaService } from '../../../core/services/encomenda.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Modal para criar nova encomenda
 */
@Component({
  selector: 'app-criar-encomenda-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="modal-overlay" (click)="fechar()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Nova Encomenda</h2>
          <button class="btn-close" (click)="fechar()" [disabled]="loading()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <app-error-message 
            *ngIf="error()" 
            [error]="error()" 
            title="Erro ao criar encomenda">
          </app-error-message>

          <form (ngSubmit)="onSubmit()" #encomendaForm="ngForm">
            <div class="form-group">
              <label for="descricao">Descrição da Encomenda *</label>
              <textarea
                id="descricao"
                name="descricao"
                [(ngModel)]="descricao"
                required
                minlength="5"
                [disabled]="loading()"
                class="form-control"
                rows="4"
                placeholder="Descreva a encomenda recebida (ex: Pacote da Amazon, Encomenda dos Correios...)">
              </textarea>
              <small class="form-hint">Mínimo de 5 caracteres. Seja descritivo para facilitar a identificação.</small>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="fechar()"
                [disabled]="loading()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="loading() || !encomendaForm.valid">
                <app-loading-spinner 
                  *ngIf="loading()" 
                  size="small">
                </app-loading-spinner>
                <span *ngIf="!loading()">Criar Encomenda</span>
                <span *ngIf="loading()">Criando...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--spacing-md);
    }

    .modal-content {
      background: var(--bg-card);
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-lg);
    }

    .btn-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: var(--spacing-xs);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all var(--transition-fast);
    }

    .btn-close:hover:not(:disabled) {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .btn-close:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .modal-body {
      padding: var(--spacing-lg);
    }

    .form-group {
      margin-bottom: var(--spacing-md);
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
      font-family: inherit;
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

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .form-hint {
      display: block;
      margin-top: var(--spacing-xs);
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md);
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--border-color);
    }

    .btn {
      padding: var(--spacing-sm) var(--spacing-lg);
      border: none;
      border-radius: 6px;
      font-size: var(--font-size-base);
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      transition: all var(--transition-fast);
      min-width: 100px;
    }

    .btn-primary {
      background: var(--accent-primary);
      color: white;
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

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class CriarEncomendaModalComponent {
  private encomendaService = inject(EncomendaService);
  private authService = inject(AuthService);

  encomendaCriada = output<void>();
  fechado = output<void>();

  descricao = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit() {
    if (!this.descricao.trim()) {
      return;
    }

    const currentUser = this.authService.currentUser();
    
    if (!currentUser?.id_condominio) {
      this.error.set('Você precisa estar associado a um condomínio para criar encomendas.');
      return;
    }

    if (!currentUser.verificado) {
      this.error.set('Você precisa estar verificado para criar encomendas.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const encomendaData = {
      descricao: this.descricao.trim(),
      id_usuario: currentUser.id,
      id_condominio: currentUser.id_condominio,
      status: 'aguardando' as const
    };

    const response = await this.encomendaService.create(encomendaData);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao criar encomenda');
      this.loading.set(false);
      return;
    }

    // Limpa o formulário
    this.descricao = '';
    this.loading.set(false);
    
    // Emite evento de sucesso e fecha o modal
    this.encomendaCriada.emit();
    this.fechar();
  }

  fechar() {
    if (!this.loading()) {
      this.fechado.emit();
    }
  }
}

