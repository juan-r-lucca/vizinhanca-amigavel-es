import { Component, inject, signal, input, output, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AgendaService } from '../../../core/services/agenda.service';
import { AuthService } from '../../../core/services/auth.service';
import { Agenda } from '../../../core/models/agenda.model';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Modal para visualizar e gerenciar detalhes de um agendamento
 */
@Component({
  selector: 'app-detalhes-agendamento-modal',
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
          <h2>Detalhes do Agendamento</h2>
          <button class="btn-close" (click)="fechar()" [disabled]="loading() || deletando()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <app-loading-spinner 
            *ngIf="loading()" 
            message="Carregando agendamento...">
          </app-loading-spinner>

          <app-error-message 
            *ngIf="error() && !loading()" 
            [error]="error()">
          </app-error-message>

          <div *ngIf="!loading() && !error() && agendamento()" class="agendamento-details">
            <div class="detail-section">
              <label>Título</label>
              <p>{{ agendamento()!.titulo }}</p>
            </div>

            <div class="detail-section" *ngIf="agendamento()!.descricao">
              <label>Descrição</label>
              <p>{{ agendamento()!.descricao }}</p>
            </div>

            <div class="detail-section">
              <label>Tipo</label>
              <div class="tipo-badge" [class]="'badge-' + agendamento()!.tipo">
                <i [class]="getTipoIcon(agendamento()!.tipo)"></i>
                {{ getTipoLabel(agendamento()!.tipo) }}
              </div>
            </div>

            <div class="detail-section">
              <label>Recurso</label>
              <p>{{ agendamento()!.nome_recurso }}</p>
            </div>

            <div class="detail-section">
              <label>Morador</label>
              <p>{{ agendamento()!.usuario?.nome || 'Desconhecido' }}</p>
              <p *ngIf="agendamento()!.usuario?.unidade" class="unidade">
                Unidade: {{ agendamento()!.usuario?.unidade }}
              </p>
            </div>

            <div class="detail-section">
              <label>Data e Hora de Início</label>
              <p>{{ formatDateTime(agendamento()!.data_inicio) }}</p>
            </div>

            <div class="detail-section">
              <label>Data e Hora de Fim</label>
              <p>{{ formatDateTime(agendamento()!.data_fim) }}</p>
            </div>

            <div class="detail-section" *ngIf="isPassado(agendamento()!.data_fim)">
              <div class="status-info passado">
                <i class="bi bi-clock-history"></i>
                <span>Este evento já ocorreu</span>
              </div>
            </div>

            <div class="detail-section" *ngIf="isHoje(agendamento()!.data_inicio, agendamento()!.data_fim)">
              <div class="status-info hoje">
                <i class="bi bi-calendar-check"></i>
                <span>Evento acontecendo hoje</span>
              </div>
            </div>

            <div class="actions" *ngIf="podeDeletar()">
              <button
                class="btn btn-danger"
                (click)="deletarAgendamento()"
                [disabled]="deletando()">
                <app-loading-spinner 
                  *ngIf="deletando()" 
                  size="small">
                </app-loading-spinner>
                <span *ngIf="!deletando()">
                  <i class="bi bi-trash"></i>
                  Excluir Agendamento
                </span>
                <span *ngIf="deletando()">Excluindo...</span>
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

    .agendamento-details {
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

    .tipo-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      width: fit-content;
    }

    .badge-evento {
      background: rgba(25, 118, 210, 0.1);
      color: #1976d2;
    }

    .badge-quadra {
      background: rgba(66, 183, 42, 0.1);
      color: var(--accent-secondary);
    }

    .badge-item {
      background: rgba(247, 185, 40, 0.1);
      color: var(--accent-warning);
    }

    .status-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .status-info.passado {
      background: rgba(0, 0, 0, 0.05);
      color: var(--text-secondary);
    }

    .status-info.hoje {
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

    .btn-danger {
      background: var(--accent-danger, #dc3545);
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: var(--accent-danger-hover, #c82333);
    }

    .btn-danger:disabled {
      background: var(--bg-tertiary);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }
  `]
})
export class DetalhesAgendamentoModalComponent implements OnInit {
  agendamentoId = input.required<number>();
  agendamentoAtualizado = output<void>();
  fechado = output<void>();

  private agendaService = inject(AgendaService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  agendamento = signal<Agenda | null>(null);
  loading = signal(true);
  deletando = signal(false);
  error = signal<string | null>(null);

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadAgendamento();
    } else {
      this.loading.set(false);
    }
  }

  async loadAgendamento() {
    this.loading.set(true);
    this.error.set(null);

    const response = await this.agendaService.findById(this.agendamentoId());

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar agendamento');
    } else if (response.data) {
      this.agendamento.set(response.data);
    }

    this.loading.set(false);
  }

  podeDeletar(): boolean {
    const agendamento = this.agendamento();
    const currentUser = this.authService.currentUser();
    
    if (!agendamento || !currentUser) {
      return false;
    }

    // Pode deletar se for o dono do agendamento
    return agendamento.id_usuario === currentUser.id;
  }

  async deletarAgendamento() {
    const agendamento = this.agendamento();
    if (!agendamento) return;

    if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
      return;
    }

    this.deletando.set(true);
    this.error.set(null);

    const response = await this.agendaService.delete(agendamento.id);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao excluir agendamento');
      this.deletando.set(false);
      return;
    }

    this.deletando.set(false);
    this.agendamentoAtualizado.emit();
    this.fechar();
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'evento': 'Evento',
      'quadra': 'Quadra',
      'item': 'Item'
    };
    return labels[tipo] || tipo;
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'evento': 'bi-calendar-event',
      'quadra': 'bi-trophy',
      'item': 'bi-box'
    };
    return icons[tipo] || 'bi-question-circle';
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isPassado(dataFim: string): boolean {
    return new Date(dataFim) < new Date();
  }

  isHoje(dataInicio: string, dataFim: string): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicio = new Date(dataInicio);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(dataFim);
    fim.setHours(0, 0, 0, 0);
    
    return inicio <= hoje && fim >= hoje;
  }

  fechar() {
    if (!this.loading() && !this.deletando()) {
      this.fechado.emit();
    }
  }
}

