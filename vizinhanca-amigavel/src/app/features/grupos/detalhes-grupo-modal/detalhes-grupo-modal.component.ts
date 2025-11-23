import { Component, inject, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrupoService } from '../../../core/services/grupo.service';
import { AuthService } from '../../../core/services/auth.service';
import { Grupo, GrupoMembro } from '../../../core/models/grupo.model';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Modal para exibir detalhes completos de um grupo
 */
@Component({
  selector: 'app-detalhes-grupo-modal',
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
          <h2>Detalhes do Grupo</h2>
          <button class="btn-close" (click)="fechar()" [disabled]="loading() || membrosLoading()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <app-loading-spinner 
            *ngIf="loading()" 
            message="Carregando grupo...">
          </app-loading-spinner>

          <app-error-message 
            *ngIf="error() && !loading()" 
            [error]="error()" 
            title="Erro ao carregar grupo">
          </app-error-message>

          <div *ngIf="!loading() && !error() && grupo()" class="grupo-detalhes">
            <div class="grupo-header">
              <h3>{{ grupo()!.nome }}</h3>
              <div class="grupo-info">
                <div class="info-row">
                  <span class="info-label">
                    <i class="bi bi-person"></i> Criado por:
                  </span>
                  <span class="info-value">
                    {{ grupo()!.criador?.nome || 'Desconhecido' }}
                  </span>
                </div>

                <div class="info-row">
                  <span class="info-label">
                    <i class="bi bi-calendar"></i> Data de criação:
                  </span>
                  <span class="info-value">
                    {{ formatDate(grupo()!.data_criacao) }}
                  </span>
                </div>

                <div class="info-row" *ngIf="grupo()!.membros_count !== undefined">
                  <span class="info-label">
                    <i class="bi bi-people"></i> Total de membros:
                  </span>
                  <span class="info-value">
                    {{ grupo()!.membros_count || 0 }}
                  </span>
                </div>
              </div>
            </div>

            <div class="grupo-descricao" *ngIf="grupo()!.descricao">
              <h4>
                <i class="bi bi-info-circle"></i> Sobre o grupo
              </h4>
              <p>{{ grupo()!.descricao }}</p>
            </div>

            <div class="grupo-membros">
              <div class="membros-header">
                <h4>
                  <i class="bi bi-people"></i> Membros do grupo
                </h4>
                <app-loading-spinner 
                  *ngIf="membrosLoading()" 
                  size="small"
                  message="Carregando membros...">
                </app-loading-spinner>
              </div>

              <div *ngIf="!membrosLoading() && membros().length === 0" class="empty-membros">
                <p>Este grupo ainda não tem membros.</p>
              </div>

              <div *ngIf="!membrosLoading() && membros().length > 0" class="membros-list">
                <div 
                  *ngFor="let membro of membros()" 
                  class="membro-item">
                  <div class="membro-info">
                    <div class="membro-avatar" *ngIf="membro.usuario?.foto_url">
                      <img [src]="membro.usuario!.foto_url!" [alt]="membro.usuario!.nome || 'Membro'">
                    </div>
                    <div class="membro-avatar-placeholder" *ngIf="!membro.usuario?.foto_url">
                      <i class="bi bi-person-circle"></i>
                    </div>
                    <div class="membro-details">
                      <span class="membro-nome">{{ membro.usuario?.nome || 'Membro' }}</span>
                      <span class="membro-data" *ngIf="membro.data_entrada">
                        Membro desde {{ formatDate(membro.data_entrada) }}
                      </span>
                    </div>
                  </div>
                  <span class="membro-criador" *ngIf="membro.id_usuario === grupo()!.id_criador">
                    <i class="bi bi-star-fill"></i> Criador
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer" *ngIf="!loading() && !error() && grupo()">
          <button
            type="button"
            class="btn btn-secondary"
            (click)="fechar()">
            Fechar
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

    .grupo-detalhes {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .grupo-header h3 {
      margin: 0 0 var(--spacing-md) 0;
      color: var(--text-primary);
      font-size: var(--font-size-xl);
      line-height: 1.4;
    }

    .grupo-info {
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
    }

    .grupo-descricao {
      padding: var(--spacing-md) 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }

    .grupo-descricao h4 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--text-primary);
      font-size: var(--font-size-base);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .grupo-descricao p {
      margin: 0;
      color: var(--text-secondary);
      line-height: 1.8;
      font-size: var(--font-size-base);
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .grupo-membros {
      margin-top: var(--spacing-md);
    }

    .membros-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }

    .membros-header h4 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-base);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .empty-membros {
      padding: var(--spacing-lg);
      text-align: center;
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }

    .membros-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .membro-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--bg-tertiary);
      border-radius: 6px;
      transition: all var(--transition-fast);
    }

    .membro-item:hover {
      background: var(--bg-secondary);
    }

    .membro-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex: 1;
    }

    .membro-avatar,
    .membro-avatar-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }

    .membro-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .membro-avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
      color: var(--text-muted);
      font-size: 24px;
    }

    .membro-details {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .membro-nome {
      color: var(--text-primary);
      font-weight: 500;
      font-size: var(--font-size-base);
    }

    .membro-data {
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }

    .membro-criador {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--accent-warning);
      font-size: var(--font-size-sm);
      font-weight: 500;
    }

    .membro-criador i {
      font-size: var(--font-size-base);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
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

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
    }

    .btn-secondary:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }
  `]
})
export class DetalhesGrupoModalComponent {
  private grupoService = inject(GrupoService);
  private authService = inject(AuthService);

  // Input: ID do grupo a ser exibido
  grupoId = input.required<number>();
  // Evento emitido quando o modal é fechado
  fechado = output<void>();

  grupo = signal<Grupo | null>(null);
  membros = signal<GrupoMembro[]>([]);
  loading = signal(false);
  membrosLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    // Carrega o grupo e membros quando o ID muda
    effect(() => {
      const id = this.grupoId();
      if (id) {
        this.loadGrupo(id);
        this.loadMembros(id);
      }
    });
  }

  async loadGrupo(id: number) {
    this.loading.set(true);
    this.error.set(null);
    this.grupo.set(null);

    const response = await this.grupoService.findById(id);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar grupo');
    } else if (response.data) {
      this.grupo.set(response.data);
    }

    this.loading.set(false);
  }

  async loadMembros(id: number) {
    this.membrosLoading.set(true);

    const response = await this.grupoService.findMembros(id);

    if (!response.error && response.data) {
      this.membros.set(response.data);
    }

    this.membrosLoading.set(false);
  }

  fechar() {
    this.fechado.emit();
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
}

