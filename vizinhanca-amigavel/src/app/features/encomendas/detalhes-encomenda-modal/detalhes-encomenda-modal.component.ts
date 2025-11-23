import { Component, inject, signal, input, output, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { EncomendaService } from '../../../core/services/encomenda.service';
import { AuthService } from '../../../core/services/auth.service';
import { Encomenda } from '../../../core/models/encomenda.model';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Modal para visualizar e gerenciar detalhes de uma encomenda
 */
@Component({
  selector: 'app-detalhes-encomenda-modal',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="modal-overlay" (click)="fechar()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Detalhes da Encomenda</h2>
          <button class="btn-close" (click)="fechar()" [disabled]="loading() || atualizando()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <app-loading-spinner 
            *ngIf="loading()" 
            message="Carregando encomenda...">
          </app-loading-spinner>

          <app-error-message 
            *ngIf="error() && !loading()" 
            [error]="error()">
          </app-error-message>

          <div *ngIf="!loading() && !error() && encomenda()" class="encomenda-details">
            <div class="detail-section">
              <label>Descrição</label>
              <p>{{ encomenda()!.descricao }}</p>
            </div>

            <div class="detail-section">
              <label>Status</label>
              <div class="status-badge" [class]="'badge-' + encomenda()!.status">
                <i [class]="getStatusIcon(encomenda()!.status)"></i>
                {{ getStatusLabel(encomenda()!.status) }}
              </div>
            </div>

            <div class="detail-section">
              <label>Morador</label>
              <p>{{ encomenda()!.usuario?.nome || 'Desconhecido' }}</p>
              <p *ngIf="encomenda()!.usuario?.unidade" class="unidade">
                Unidade: {{ encomenda()!.usuario?.unidade }}
              </p>
            </div>

            <div class="detail-section">
              <label>Data de Recebimento</label>
              <p>{{ formatDate(encomenda()!.data_criacao) }}</p>
            </div>

            <div class="detail-section" *ngIf="encomenda()!.data_retirada">
              <label>Data de Retirada</label>
              <p>{{ formatDate(encomenda()!.data_retirada) }}</p>
            </div>

            <div class="actions" *ngIf="podeMarcarComoRetirada()">
              <button
                class="btn btn-primary"
                (click)="marcarComoRetirada()"
                [disabled]="atualizando()">
                <app-loading-spinner 
                  *ngIf="atualizando()" 
                  size="small">
                </app-loading-spinner>
                <span *ngIf="!atualizando()">
                  <i class="bi bi-check-circle"></i>
                  Marcar como Retirada
                </span>
                <span *ngIf="atualizando()">Atualizando...</span>
              </button>
            </div>
          </div>
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

    .encomenda-details {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .detail-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .detail-section label {
      font-weight: 600;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-section p {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-base);
    }

    .unidade {
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      width: fit-content;
    }

    .badge-aguardando {
      background: rgba(247, 185, 40, 0.1);
      color: var(--accent-warning);
    }

    .badge-retirada {
      background: rgba(66, 183, 42, 0.1);
      color: var(--accent-secondary);
    }

    .actions {
      margin-top: var(--spacing-md);
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
      width: 100%;
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
  `]
})
export class DetalhesEncomendaModalComponent implements OnInit {
  encomendaId = input.required<number>();
  encomendaAtualizada = output<void>();
  fechado = output<void>();

  private encomendaService = inject(EncomendaService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  encomenda = signal<Encomenda | null>(null);
  loading = signal(true);
  atualizando = signal(false);
  error = signal<string | null>(null);

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadEncomenda();
    } else {
      this.loading.set(false);
    }
  }

  async loadEncomenda() {
    this.loading.set(true);
    this.error.set(null);

    const response = await this.encomendaService.findById(this.encomendaId());

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar encomenda');
    } else if (response.data) {
      this.encomenda.set(response.data);
    }

    this.loading.set(false);
  }

  podeMarcarComoRetirada(): boolean {
    const encomenda = this.encomenda();
    const currentUser = this.authService.currentUser();
    
    if (!encomenda || !currentUser) {
      return false;
    }

    // Pode marcar como retirada se:
    // 1. A encomenda está aguardando retirada
    // 2. O usuário é o dono da encomenda ou é síndico/portaria
    return encomenda.status === 'aguardando' && 
           (encomenda.id_usuario === currentUser.id || 
            currentUser.perfil === 'sindico' || 
            currentUser.perfil === 'portaria');
  }

  async marcarComoRetirada() {
    const encomenda = this.encomenda();
    if (!encomenda) return;

    this.atualizando.set(true);
    this.error.set(null);

    const response = await this.encomendaService.marcarComoRetirada(encomenda.id);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao marcar encomenda como retirada');
      this.atualizando.set(false);
      return;
    }

    if (response.data) {
      this.encomenda.set(response.data);
      this.encomendaAtualizada.emit();
    }

    this.atualizando.set(false);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'aguardando': 'Aguardando Retirada',
      'retirada': 'Retirada'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'aguardando': 'bi-clock',
      'retirada': 'bi-check-circle'
    };
    return icons[status] || 'bi-question-circle';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  fechar() {
    if (!this.loading() && !this.atualizando()) {
      this.fechado.emit();
    }
  }
}

