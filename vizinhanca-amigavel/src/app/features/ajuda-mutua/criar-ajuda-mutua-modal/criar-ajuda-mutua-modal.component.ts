import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AjudaMutuaService } from '../../../core/services/ajuda-mutua.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Modal para criar nova ajuda mútua
 */
@Component({
  selector: 'app-criar-ajuda-mutua-modal',
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
          <h2>Nova Solicitação de Ajuda Mútua</h2>
          <button class="btn-close" (click)="fechar()" [disabled]="loading()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <app-error-message 
            *ngIf="error()" 
            [error]="error()" 
            title="Erro ao criar solicitação">
          </app-error-message>

          <form (ngSubmit)="onSubmit()" #ajudaForm="ngForm">
            <div class="form-group">
              <label for="tipo">Tipo *</label>
              <select
                id="tipo"
                name="tipo"
                [(ngModel)]="tipo"
                required
                [disabled]="loading()"
                class="form-control">
                <option value="">Selecione o tipo</option>
                <option value="oferta">Oferta (Estou oferecendo algo)</option>
                <option value="pedido">Pedido (Preciso de algo)</option>
              </select>
              <small class="form-hint">Escolha se você está oferecendo algo ou precisando de algo</small>
            </div>

            <div class="form-group">
              <label for="titulo">Título *</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                [(ngModel)]="titulo"
                required
                minlength="5"
                maxlength="255"
                [disabled]="loading()"
                class="form-control"
                placeholder="Ex: Ofereço ajuda com jardinagem, Preciso de ajuda para mudança...">
              <small class="form-hint">Mínimo de 5 caracteres. Seja claro e objetivo.</small>
            </div>

            <div class="form-group">
              <label for="descricao">Descrição *</label>
              <textarea
                id="descricao"
                name="descricao"
                [(ngModel)]="descricao"
                required
                minlength="10"
                [disabled]="loading()"
                class="form-control"
                rows="6"
                [placeholder]="getPlaceholder()"></textarea>
              <small class="form-hint">Mínimo de 10 caracteres. Descreva detalhadamente o que você oferece ou precisa.</small>
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
                [disabled]="loading() || !ajudaForm.valid">
                <app-loading-spinner 
                  *ngIf="loading()" 
                  size="small">
                </app-loading-spinner>
                <span *ngIf="!loading()">Criar Solicitação</span>
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
      max-width: 600px;
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

    select.form-control {
      cursor: pointer;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 120px;
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
export class CriarAjudaMutuaModalComponent {
  private ajudaMutuaService = inject(AjudaMutuaService);
  private authService = inject(AuthService);

  ajudaMutuaCriada = output<void>();
  fechado = output<void>();

  tipo: 'oferta' | 'pedido' | '' = '';
  titulo = '';
  descricao = '';
  loading = signal(false);
  error = signal<string | null>(null);

  getPlaceholder(): string {
    if (this.tipo === 'oferta') {
      return 'Descreva o que você está oferecendo: serviços, objetos, ajuda, etc. Inclua detalhes como disponibilidade, condições, etc.';
    } else if (this.tipo === 'pedido') {
      return 'Descreva o que você precisa: ajuda com algo, empréstimo de objetos, serviços, etc. Inclua detalhes sobre quando e como você precisa.';
    }
    return 'Descreva detalhadamente sua solicitação...';
  }

  async onSubmit() {
    if (!this.titulo.trim() || !this.descricao.trim() || !this.tipo) {
      return;
    }

    const currentUser = this.authService.currentUser();
    
    if (!currentUser?.id_condominio) {
      this.error.set('Você precisa estar associado a um condomínio para criar solicitações.');
      return;
    }

    if (!currentUser.verificado) {
      this.error.set('Você precisa estar verificado para criar solicitações.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const ajudaData = {
      titulo: this.titulo.trim(),
      descricao: this.descricao.trim(),
      tipo: this.tipo as 'oferta' | 'pedido',
      id_usuario: currentUser.id,
      id_condominio: currentUser.id_condominio,
      status: 'aberto' as const
    };

    const response = await this.ajudaMutuaService.create(ajudaData);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao criar solicitação');
      this.loading.set(false);
      return;
    }

    // Limpa o formulário
    this.titulo = '';
    this.descricao = '';
    this.tipo = '';
    this.loading.set(false);
    
    // Emite evento de sucesso e fecha o modal
    this.ajudaMutuaCriada.emit();
    this.fechar();
  }

  fechar() {
    if (!this.loading()) {
      this.fechado.emit();
    }
  }
}

