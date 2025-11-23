import { Component, inject, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemAchadoPerdidoService } from '../../../core/services/item-achado-perdido.service';
import { AuthService } from '../../../core/services/auth.service';
import { ItemAchadoPerdido } from '../../../core/models/item-achado-perdido.model';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Modal para exibir detalhes completos de um item achado/perdido
 */
@Component({
  selector: 'app-detalhes-item-modal',
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
          <h2>Detalhes do Item</h2>
          <button class="btn-close" (click)="fechar()" [disabled]="loading() || resolvendo()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <app-loading-spinner 
            *ngIf="loading()" 
            message="Carregando item...">
          </app-loading-spinner>

          <app-error-message 
            *ngIf="error() && !loading()" 
            [error]="error()" 
            title="Erro ao carregar item">
          </app-error-message>

          <div *ngIf="!loading() && !error() && item()" class="item-detalhes">
            <div class="item-header">
              <div class="item-badge" [class]="'badge-' + item()!.tipo">
                <i [class]="getTipoIcon(item()!.tipo)"></i>
                {{ getTipoLabel(item()!.tipo) }}
              </div>
              <h3>{{ item()!.titulo }}</h3>
            </div>

            <div class="item-foto" *ngIf="item()!.foto_url">
              <img [src]="item()!.foto_url" [alt]="item()!.titulo" (error)="onImageError($event)">
            </div>

            <div class="item-descricao">
              <h4>
                <i class="bi bi-info-circle"></i> Descrição
              </h4>
              <p>{{ item()!.descricao }}</p>
            </div>

            <div class="item-info">
              <div class="info-row">
                <span class="info-label">
                  <i class="bi bi-person"></i> Reportado por:
                </span>
                <span class="info-value">
                  {{ item()!.usuario?.nome || 'Desconhecido' }}
                </span>
              </div>

              <div class="info-row">
                <span class="info-label">
                  <i class="bi bi-calendar"></i> Data do reporte:
                </span>
                <span class="info-value">
                  {{ formatDate(item()!.data_criacao) }}
                </span>
              </div>

              <div class="info-row">
                <span class="info-label">
                  <i class="bi bi-check-circle"></i> Status:
                </span>
                <span class="info-value" [class.resolvido]="item()!.resolvido" [class.pendente]="!item()!.resolvido">
                  <i class="bi" [class.bi-check-circle-fill]="item()!.resolvido" [class.bi-clock]="!item()!.resolvido"></i>
                  {{ item()!.resolvido ? 'Resolvido' : 'Pendente' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer" *ngIf="!loading() && !error() && item()">
          <button
            type="button"
            class="btn btn-secondary"
            (click)="fechar()"
            [disabled]="resolvendo()">
            Fechar
          </button>
          <button
            *ngIf="podeMarcarComoResolvido() && !item()!.resolvido"
            type="button"
            class="btn btn-primary"
            (click)="marcarComoResolvido()"
            [disabled]="resolvendo()">
            <app-loading-spinner 
              *ngIf="resolvendo()" 
              size="small">
            </app-loading-spinner>
            <span *ngIf="!resolvendo()">
              <i class="bi bi-check-circle"></i> Marcar como Resolvido
            </span>
            <span *ngIf="resolvendo()">Marcando...</span>
          </button>
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
      max-width: 700px;
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

    .item-detalhes {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .item-header {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .item-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      align-self: flex-start;
    }

    .item-badge i {
      font-size: 0.875rem;
    }

    .badge-achado {
      background: rgba(66, 183, 42, 0.1);
      color: var(--accent-secondary);
    }

    .badge-perdido {
      background: rgba(247, 185, 40, 0.1);
      color: var(--accent-warning);
    }

    .item-header h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-xl);
      line-height: 1.4;
    }

    .item-foto {
      width: 100%;
      max-height: 400px;
      border-radius: 8px;
      overflow: hidden;
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .item-foto img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      max-height: 400px;
    }

    .item-descricao {
      padding: var(--spacing-md) 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }

    .item-descricao h4 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--text-primary);
      font-size: var(--font-size-base);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .item-descricao p {
      margin: 0;
      color: var(--text-secondary);
      line-height: 1.8;
      font-size: var(--font-size-base);
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: var(--bg-tertiary);
      border-radius: 6px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) 0;
    }

    .info-label {
      color: var(--text-muted);
      font-size: var(--font-size-sm);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      min-width: 150px;
    }

    .info-label i {
      font-size: var(--font-size-base);
    }

    .info-value {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .info-value.resolvido {
      color: var(--accent-secondary);
    }

    .info-value.pendente {
      color: var(--accent-warning);
    }

    .info-value i {
      font-size: var(--font-size-base);
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-lg);
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
export class DetalhesItemModalComponent {
  private itemService = inject(ItemAchadoPerdidoService);
  private authService = inject(AuthService);

  // Input: ID do item a ser exibido
  itemId = input.required<number>();
  // Evento emitido quando o item é marcado como resolvido
  itemResolvido = output<void>();
  // Evento emitido quando o modal é fechado
  fechado = output<void>();

  item = signal<ItemAchadoPerdido | null>(null);
  loading = signal(false);
  resolvendo = signal(false);
  error = signal<string | null>(null);

  constructor() {
    // Carrega o item quando o ID muda
    effect(() => {
      const id = this.itemId();
      if (id) {
        this.loadItem(id);
      }
    });
  }

  async loadItem(id: number) {
    this.loading.set(true);
    this.error.set(null);
    this.item.set(null);

    const response = await this.itemService.findById(id);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar item');
    } else if (response.data) {
      this.item.set(response.data);
    }

    this.loading.set(false);
  }

  podeMarcarComoResolvido(): boolean {
    const currentUser = this.authService.currentUser();
    const itemValue = this.item();
    
    if (!currentUser || !itemValue) {
      return false;
    }

    // Apenas o dono do item pode marcar como resolvido
    return currentUser.id === itemValue.id_usuario;
  }

  async marcarComoResolvido() {
    const itemValue = this.item();
    if (!itemValue || itemValue.resolvido) {
      return;
    }

    this.resolvendo.set(true);
    this.error.set(null);

    const response = await this.itemService.marcarComoResolvido(itemValue.id);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao marcar item como resolvido');
      this.resolvendo.set(false);
      return;
    }

    if (response.data) {
      this.item.set(response.data);
      this.itemResolvido.emit();
    }

    this.resolvendo.set(false);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  fechar() {
    if (!this.loading() && !this.resolvendo()) {
      this.fechado.emit();
    }
  }

  formatDate(date?: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTipoLabel(tipo: string): string {
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'achado': 'bi-check-circle',
      'perdido': 'bi-search'
    };
    return icons[tipo] || 'bi-question-circle';
  }
}

