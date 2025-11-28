import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AgendaService } from '../../../core/services/agenda.service';
import { AuthService } from '../../../core/services/auth.service';
import { Agenda } from '../../../core/models/agenda.model';
import { LoadingSpinnerComponent, ErrorMessageComponent, CardComponent, EmptyStateComponent } from '../../../shared/components';
import { CriarAgendamentoModalComponent } from '../criar-agendamento-modal/criar-agendamento-modal.component';
import { DetalhesAgendamentoModalComponent } from '../detalhes-agendamento-modal/detalhes-agendamento-modal.component';

/**
 * Componente de Lista de Agendamentos
 */
@Component({
  selector: 'app-lista-agenda',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    CardComponent,
    EmptyStateComponent,
    CriarAgendamentoModalComponent,
    DetalhesAgendamentoModalComponent
  ],
  template: `
    <div class="agenda-container">
      <div class="header">
        <h1>Agenda</h1>
        <button class="btn btn-primary" (click)="criarAgendamento()">
          <i class="bi bi-plus-circle"></i> Novo Agendamento
        </button>
      </div>

      <div class="filters" *ngIf="!loading() && !error()">
        <button 
          class="filter-btn" 
          [class.active]="filtroTipo() === 'todos'"
          (click)="filtrarPorTipo('todos')">
          Todos
        </button>
        <button 
          class="filter-btn" 
          [class.active]="filtroTipo() === 'evento'"
          (click)="filtrarPorTipo('evento')">
          Eventos
        </button>
        <button 
          class="filter-btn" 
          [class.active]="filtroTipo() === 'quadra'"
          (click)="filtrarPorTipo('quadra')">
          Quadras
        </button>
        <button 
          class="filter-btn" 
          [class.active]="filtroTipo() === 'item'"
          (click)="filtrarPorTipo('item')">
          Itens
        </button>
      </div>

      <app-loading-spinner 
        *ngIf="loading()" 
        message="Carregando agendamentos...">
      </app-loading-spinner>

      <app-error-message 
        *ngIf="error() && !loading()" 
        [error]="error()">
      </app-error-message>

      <div class="agenda-list" *ngIf="!loading() && !error()">
        <app-empty-state 
          *ngIf="agendamentosFiltrados().length === 0"
          icon="bi-calendar"
          title="Nenhum agendamento encontrado"
          [message]="getEmptyMessage()">
        </app-empty-state>

        <app-card 
          *ngFor="let agendamento of agendamentosFiltrados()" 
          [title]="agendamento.titulo"
          [clickable]="true"
          (cardClick)="verDetalhesAgendamento(agendamento.id)"
          class="agendamento-card">
          <div class="agendamento-badge" [class]="'badge-' + agendamento.tipo">
            <i [class]="getTipoIcon(agendamento.tipo)"></i>
            {{ getTipoLabel(agendamento.tipo) }}
          </div>
          <div class="agendamento-info">
            <p><strong>Recurso:</strong> {{ agendamento.nome_recurso }}</p>
            <p *ngIf="agendamento.descricao">
              <strong>Descrição:</strong> {{ agendamento.descricao }}
            </p>
            <p><strong>Morador:</strong> {{ agendamento.usuario?.nome || 'Desconhecido' }}</p>
            <p *ngIf="agendamento.usuario?.unidade">
              <strong>Unidade:</strong> {{ agendamento.usuario?.unidade }}
            </p>
            <p>
              <strong>Início:</strong> {{ formatDateTime(agendamento.data_inicio) }}
            </p>
            <p>
              <strong>Fim:</strong> {{ formatDateTime(agendamento.data_fim) }}
            </p>
            <p *ngIf="isPassado(agendamento.data_fim)" class="agendamento-passado">
              <i class="bi bi-clock-history"></i> Evento já ocorreu
            </p>
            <p *ngIf="isHoje(agendamento.data_inicio, agendamento.data_fim)" class="agendamento-hoje">
              <i class="bi bi-calendar-check"></i> Evento hoje
            </p>
          </div>
        </app-card>
      </div>

      <app-criar-agendamento-modal
        *ngIf="mostrarModal()"
        (agendamentoCriado)="onAgendamentoCriado()"
        (fechado)="fecharModal()">
      </app-criar-agendamento-modal>

      <app-detalhes-agendamento-modal
        *ngIf="agendamentoSelecionadoId()"
        [agendamentoId]="agendamentoSelecionadoId()!"
        (agendamentoAtualizado)="onAgendamentoAtualizado()"
        (fechado)="fecharDetalhesModal()">
      </app-detalhes-agendamento-modal>
    </div>
  `,
  styles: [`
    .agenda-container {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--spacing-xl) var(--spacing-md);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
    }

    h1 {
      margin: 0;
      color: var(--text-primary);
    }

    .filters {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-secondary);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: var(--font-size-sm);
    }

    .filter-btn:hover {
      background: var(--bg-tertiary);
      border-color: var(--accent-primary);
    }

    .filter-btn.active {
      background: var(--accent-primary);
      color: white;
      border-color: var(--accent-primary);
    }

    .agenda-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .agendamento-card {
      margin-bottom: 0;
      position: relative;
    }

    .agendamento-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--spacing-sm);
    }

    .agendamento-badge i {
      font-size: 0.875rem;
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

    .agendamento-info {
      margin-top: var(--spacing-md);
    }

    .agendamento-info p {
      margin: var(--spacing-xs) 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .agendamento-info strong {
      color: var(--text-primary);
    }

    .agendamento-passado {
      color: var(--text-secondary);
      opacity: 0.7;
      font-style: italic;
    }

    .agendamento-hoje {
      color: var(--accent-secondary);
      font-weight: var(--font-weight-medium);
    }
  `]
})
export class ListaAgendaComponent implements OnInit {
  private agendaService = inject(AgendaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  agendamentos = signal<Agenda[]>([]);
  agendamentosFiltrados = signal<Agenda[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  mostrarModal = signal(false);
  agendamentoSelecionadoId = signal<number | null>(null);
  filtroTipo = signal<'todos' | 'evento' | 'quadra' | 'item'>('todos');

  criarAgendamento() {
    this.mostrarModal.set(true);
  }

  fecharModal() {
    this.mostrarModal.set(false);
  }

  async onAgendamentoCriado() {
    await this.loadAgendamentos();
  }

  verDetalhesAgendamento(agendamentoId: number) {
    this.agendamentoSelecionadoId.set(agendamentoId);
  }

  fecharDetalhesModal() {
    this.agendamentoSelecionadoId.set(null);
  }

  async onAgendamentoAtualizado() {
    await this.loadAgendamentos();
    this.fecharDetalhesModal();
  }

  filtrarPorTipo(tipo: 'todos' | 'evento' | 'quadra' | 'item') {
    this.filtroTipo.set(tipo);
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    const todos = this.agendamentos();
    const filtro = this.filtroTipo();
    
    if (filtro === 'todos') {
      this.agendamentosFiltrados.set(todos);
    } else {
      this.agendamentosFiltrados.set(todos.filter(a => a.tipo === filtro));
    }
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadAgendamentos();
    } else {
      this.loading.set(false);
    }
  }

  async loadAgendamentos() {
    this.loading.set(true);
    this.error.set(null);

    const currentUser = this.authService.currentUser();
    
    if (!currentUser?.id_condominio) {
      this.agendamentos.set([]);
      this.agendamentosFiltrados.set([]);
      this.loading.set(false);
      return;
    }

    const response = await this.agendaService.findByCondominio(currentUser.id_condominio);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar agendamentos');
    } else if (response.data) {
      this.agendamentos.set(response.data);
      this.aplicarFiltro();
    }

    this.loading.set(false);
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

  getEmptyMessage(): string {
    const filtro = this.filtroTipo();
    if (filtro === 'evento') {
      return 'Não há eventos agendados no momento.';
    } else if (filtro === 'quadra') {
      return 'Não há quadras agendadas no momento.';
    } else if (filtro === 'item') {
      return 'Não há itens agendados no momento.';
    }
    return 'Ainda não há agendamentos registrados no condomínio.';
  }
}

