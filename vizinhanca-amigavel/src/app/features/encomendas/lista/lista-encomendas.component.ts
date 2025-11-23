import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { EncomendaService } from '../../../core/services/encomenda.service';
import { AuthService } from '../../../core/services/auth.service';
import { Encomenda } from '../../../core/models/encomenda.model';
import { LoadingSpinnerComponent, ErrorMessageComponent, CardComponent, EmptyStateComponent } from '../../../shared/components';
import { CriarEncomendaModalComponent } from '../criar-encomenda-modal/criar-encomenda-modal.component';
import { DetalhesEncomendaModalComponent } from '../detalhes-encomenda-modal/detalhes-encomenda-modal.component';

/**
 * Componente de Lista de Encomendas
 */
@Component({
  selector: 'app-lista-encomendas',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    CardComponent,
    EmptyStateComponent,
    CriarEncomendaModalComponent,
    DetalhesEncomendaModalComponent
  ],
  template: `
    <div class="encomendas-container">
      <div class="header">
        <h1>Encomendas</h1>
        <button class="btn btn-primary" (click)="criarEncomenda()">
          <i class="bi bi-plus-circle"></i> Nova Encomenda
        </button>
      </div>

      <div class="filters" *ngIf="!loading() && !error()">
        <button 
          class="filter-btn" 
          [class.active]="filtroStatus() === 'todos'"
          (click)="filtrarPorStatus('todos')">
          Todas
        </button>
        <button 
          class="filter-btn" 
          [class.active]="filtroStatus() === 'aguardando'"
          (click)="filtrarPorStatus('aguardando')">
          Aguardando
        </button>
        <button 
          class="filter-btn" 
          [class.active]="filtroStatus() === 'retirada'"
          (click)="filtrarPorStatus('retirada')">
          Retiradas
        </button>
      </div>

      <app-loading-spinner 
        *ngIf="loading()" 
        message="Carregando encomendas...">
      </app-loading-spinner>

      <app-error-message 
        *ngIf="error() && !loading()" 
        [error]="error()">
      </app-error-message>

      <div class="encomendas-list" *ngIf="!loading() && !error()">
        <app-empty-state 
          *ngIf="encomendas().length === 0"
          icon="bi-box"
          title="Nenhuma encomenda encontrada"
          [message]="getEmptyMessage()">
        </app-empty-state>

        <app-card 
          *ngFor="let encomenda of encomendasFiltradas()" 
          [title]="encomenda.descricao"
          [clickable]="true"
          (cardClick)="verDetalhesEncomenda(encomenda.id)"
          class="encomenda-card">
          <div class="encomenda-badge" [class]="'badge-' + encomenda.status">
            <i [class]="getStatusIcon(encomenda.status)"></i>
            {{ getStatusLabel(encomenda.status) }}
          </div>
          <div class="encomenda-info">
            <p><strong>Morador:</strong> {{ encomenda.usuario?.nome || 'Desconhecido' }}</p>
            <p *ngIf="encomenda.usuario?.unidade">
              <strong>Unidade:</strong> {{ encomenda.usuario?.unidade }}
            </p>
            <p *ngIf="encomenda.data_criacao">
              <strong>Recebida em:</strong> {{ formatDate(encomenda.data_criacao) }}
            </p>
            <p *ngIf="encomenda.data_retirada">
              <strong>Retirada em:</strong> {{ formatDate(encomenda.data_retirada) }}
            </p>
          </div>
        </app-card>
      </div>

      <app-criar-encomenda-modal
        *ngIf="mostrarModal()"
        (encomendaCriada)="onEncomendaCriada()"
        (fechado)="fecharModal()">
      </app-criar-encomenda-modal>

      <app-detalhes-encomenda-modal
        *ngIf="encomendaSelecionadaId()"
        [encomendaId]="encomendaSelecionadaId()!"
        (encomendaAtualizada)="onEncomendaAtualizada()"
        (fechado)="fecharDetalhesModal()">
      </app-detalhes-encomenda-modal>
    </div>
  `,
  styles: [`
    .encomendas-container {
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

    .encomendas-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .encomenda-card {
      margin-bottom: 0;
      position: relative;
    }

    .encomenda-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--spacing-sm);
    }

    .encomenda-badge i {
      font-size: 0.875rem;
    }

    .badge-aguardando {
      background: rgba(247, 185, 40, 0.1);
      color: var(--accent-warning);
    }

    .badge-retirada {
      background: rgba(66, 183, 42, 0.1);
      color: var(--accent-secondary);
    }

    .encomenda-info {
      margin-top: var(--spacing-md);
    }

    .encomenda-info p {
      margin: var(--spacing-xs) 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .encomenda-info strong {
      color: var(--text-primary);
    }
  `]
})
export class ListaEncomendasComponent implements OnInit {
  private encomendaService = inject(EncomendaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  encomendas = signal<Encomenda[]>([]);
  encomendasFiltradas = signal<Encomenda[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  mostrarModal = signal(false);
  encomendaSelecionadaId = signal<number | null>(null);
  filtroStatus = signal<'todos' | 'aguardando' | 'retirada'>('todos');

  criarEncomenda() {
    this.mostrarModal.set(true);
  }

  fecharModal() {
    this.mostrarModal.set(false);
  }

  async onEncomendaCriada() {
    await this.loadEncomendas();
  }

  verDetalhesEncomenda(encomendaId: number) {
    this.encomendaSelecionadaId.set(encomendaId);
  }

  fecharDetalhesModal() {
    this.encomendaSelecionadaId.set(null);
  }

  async onEncomendaAtualizada() {
    await this.loadEncomendas();
    this.fecharDetalhesModal();
  }

  filtrarPorStatus(status: 'todos' | 'aguardando' | 'retirada') {
    this.filtroStatus.set(status);
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    const todas = this.encomendas();
    const filtro = this.filtroStatus();
    
    if (filtro === 'todos') {
      this.encomendasFiltradas.set(todas);
    } else {
      this.encomendasFiltradas.set(todas.filter(e => e.status === filtro));
    }
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadEncomendas();
    } else {
      this.loading.set(false);
    }
  }

  async loadEncomendas() {
    this.loading.set(true);
    this.error.set(null);

    const currentUser = this.authService.currentUser();
    
    if (!currentUser?.id_condominio) {
      this.encomendas.set([]);
      this.encomendasFiltradas.set([]);
      this.loading.set(false);
      return;
    }

    const response = await this.encomendaService.findByCondominio(currentUser.id_condominio);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar encomendas');
    } else if (response.data) {
      this.encomendas.set(response.data);
      this.aplicarFiltro();
    }

    this.loading.set(false);
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

  getEmptyMessage(): string {
    const filtro = this.filtroStatus();
    if (filtro === 'aguardando') {
      return 'Não há encomendas aguardando retirada no momento.';
    } else if (filtro === 'retirada') {
      return 'Nenhuma encomenda foi retirada ainda.';
    }
    return 'Ainda não há encomendas registradas no condomínio.';
  }
}

