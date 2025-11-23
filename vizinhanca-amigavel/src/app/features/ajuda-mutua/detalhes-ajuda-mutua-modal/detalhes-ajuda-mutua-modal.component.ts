import { Component, inject, signal, input, output, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AjudaMutuaService } from '../../../core/services/ajuda-mutua.service';
import { AuthService } from '../../../core/services/auth.service';
import { AjudaMutua } from '../../../core/models/ajuda-mutua.model';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Modal para visualizar e gerenciar detalhes de uma ajuda mútua
 */
@Component({
  selector: 'app-detalhes-ajuda-mutua-modal',
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
          <h2>Detalhes da Solicitação</h2>
          <button class="btn-close" (click)="fechar()" [disabled]="loading() || atualizando()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <app-loading-spinner 
            *ngIf="loading()" 
            message="Carregando solicitação...">
          </app-loading-spinner>

          <app-error-message 
            *ngIf="error() && !loading()" 
            [error]="error()">
          </app-error-message>

          <div *ngIf="!loading() && !error() && ajudaMutua()" class="ajuda-details">
            <div class="detail-section">
              <div class="badges">
                <div class="badge" [class]="'badge-' + ajudaMutua()!.tipo">
                  <i [class]="getTipoIcon(ajudaMutua()!.tipo)"></i>
                  {{ getTipoLabel(ajudaMutua()!.tipo) }}
                </div>
                <div class="badge" [class]="'badge-status-' + ajudaMutua()!.status">
                  <i [class]="getStatusIcon(ajudaMutua()!.status)"></i>
                  {{ getStatusLabel(ajudaMutua()!.status) }}
                </div>
              </div>
            </div>

            <div class="detail-section">
              <label>Título</label>
              <h3>{{ ajudaMutua()!.titulo }}</h3>
            </div>

            <div class="detail-section">
              <label>Descrição</label>
              <p>{{ ajudaMutua()!.descricao }}</p>
            </div>

            <div class="detail-section">
              <label>Solicitado por</label>
              <p>{{ ajudaMutua()!.usuario?.nome || 'Desconhecido' }}</p>
            </div>

            <div class="detail-section">
              <label>Data de Criação</label>
              <p>{{ formatDate(ajudaMutua()!.data_criacao) }}</p>
            </div>

            <div class="actions" *ngIf="podeFechar()">
              <button
                class="btn btn-secondary"
                (click)="fecharSolicitacao()"
                [disabled]="atualizando()">
                <app-loading-spinner 
                  *ngIf="atualizando()" 
                  size="small">
                </app-loading-spinner>
                <span *ngIf="!atualizando()">
                  <i class="bi bi-x-circle"></i>
                  Fechar Solicitação
                </span>
                <span *ngIf="atualizando()">Fechando...</span>
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

    .ajuda-details {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .detail-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .badges {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .badge-oferta {
      background: rgba(66, 183, 42, 0.1);
      color: var(--accent-secondary);
    }

    .badge-pedido {
      background: rgba(52, 152, 219, 0.1);
      color: var(--accent-primary);
    }

    .badge-status-aberto {
      background: rgba(247, 185, 40, 0.1);
      color: var(--accent-warning);
    }

    .badge-status-fechado {
      background: rgba(149, 165, 166, 0.1);
      color: var(--text-muted);
    }

    .detail-section label {
      font-weight: 600;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-section h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-lg);
    }

    .detail-section p {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-base);
      line-height: 1.6;
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
export class DetalhesAjudaMutuaModalComponent implements OnInit {
  ajudaMutuaId = input.required<number>();
  ajudaMutuaAtualizada = output<void>();
  fechado = output<void>();

  private ajudaMutuaService = inject(AjudaMutuaService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  ajudaMutua = signal<AjudaMutua | null>(null);
  loading = signal(true);
  atualizando = signal(false);
  error = signal<string | null>(null);

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadAjudaMutua();
    } else {
      this.loading.set(false);
    }
  }

  async loadAjudaMutua() {
    this.loading.set(true);
    this.error.set(null);

    const response = await this.ajudaMutuaService.findById(this.ajudaMutuaId());

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar solicitação');
    } else if (response.data) {
      this.ajudaMutua.set(response.data);
    }

    this.loading.set(false);
  }

  podeFechar(): boolean {
    const ajuda = this.ajudaMutua();
    const currentUser = this.authService.currentUser();
    
    if (!ajuda || !currentUser) {
      return false;
    }

    // Pode fechar se:
    // 1. A solicitação está aberta
    // 2. O usuário é o criador da solicitação
    return ajuda.status === 'aberto' && ajuda.id_usuario === currentUser.id;
  }

  async fecharSolicitacao() {
    const ajuda = this.ajudaMutua();
    if (!ajuda) return;

    this.atualizando.set(true);
    this.error.set(null);

    const response = await this.ajudaMutuaService.fechar(ajuda.id);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao fechar solicitação');
      this.atualizando.set(false);
      return;
    }

    if (response.data) {
      this.ajudaMutua.set(response.data);
      this.ajudaMutuaAtualizada.emit();
    }

    this.atualizando.set(false);
  }

  getTipoLabel(tipo: string): string {
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'oferta': 'bi-gift',
      'pedido': 'bi-hand-index'
    };
    return icons[tipo] || 'bi-question-circle';
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'aberto': 'bi-circle',
      'fechado': 'bi-check-circle-fill'
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

