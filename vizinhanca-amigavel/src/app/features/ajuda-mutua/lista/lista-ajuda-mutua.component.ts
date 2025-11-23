import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AjudaMutuaService } from '../../../core/services/ajuda-mutua.service';
import { AuthService } from '../../../core/services/auth.service';
import { AjudaMutua } from '../../../core/models/ajuda-mutua.model';
import { LoadingSpinnerComponent, ErrorMessageComponent, CardComponent, EmptyStateComponent } from '../../../shared/components';
import { CriarAjudaMutuaModalComponent } from '../criar-ajuda-mutua-modal/criar-ajuda-mutua-modal.component';
import { DetalhesAjudaMutuaModalComponent } from '../detalhes-ajuda-mutua-modal/detalhes-ajuda-mutua-modal.component';

/**
 * Componente de Lista de Ajuda Mútua
 */
@Component({
  selector: 'app-lista-ajuda-mutua',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    CardComponent,
    EmptyStateComponent,
    CriarAjudaMutuaModalComponent,
    DetalhesAjudaMutuaModalComponent
  ],
  template: `
    <div class="ajuda-mutua-container">
      <div class="header">
        <h1>Ajuda Mútua</h1>
        <button class="btn btn-primary" (click)="criarAjudaMutua()">
          <i class="bi bi-plus-circle"></i> Nova Solicitação
        </button>
      </div>

      <div class="filters" *ngIf="!loading() && !error()">
        <button 
          class="filter-btn" 
          [class.active]="filtroTipo() === 'todos'"
          (click)="filtrarPorTipo('todos')">
          Todas
        </button>
        <button 
          class="filter-btn" 
          [class.active]="filtroTipo() === 'oferta'"
          (click)="filtrarPorTipo('oferta')">
          Ofertas
        </button>
        <button 
          class="filter-btn" 
          [class.active]="filtroTipo() === 'pedido'"
          (click)="filtrarPorTipo('pedido')">
          Pedidos
        </button>
        <button 
          class="filter-btn" 
          [class.active]="filtroStatus() === 'aberto'"
          (click)="filtrarPorStatus('aberto')">
          Abertas
        </button>
        <button 
          class="filter-btn" 
          [class.active]="filtroStatus() === 'fechado'"
          (click)="filtrarPorStatus('fechado')">
          Fechadas
        </button>
      </div>

      <app-loading-spinner 
        *ngIf="loading()" 
        message="Carregando solicitações...">
      </app-loading-spinner>

      <app-error-message 
        *ngIf="error() && !loading()" 
        [error]="error()">
      </app-error-message>

      <div class="ajuda-mutua-list" *ngIf="!loading() && !error()">
        <app-empty-state 
          *ngIf="ajudasMutuas().length === 0"
          icon="bi-handshake"
          title="Nenhuma solicitação encontrada"
          [message]="getEmptyMessage()">
        </app-empty-state>

        <app-card 
          *ngFor="let ajuda of ajudasMutuasFiltradas()" 
          [title]="ajuda.titulo"
          [clickable]="true"
          (cardClick)="verDetalhesAjudaMutua(ajuda.id)"
          class="ajuda-card">
          <div class="ajuda-badges">
            <div class="ajuda-badge" [class]="'badge-' + ajuda.tipo">
              <i [class]="getTipoIcon(ajuda.tipo)"></i>
              {{ getTipoLabel(ajuda.tipo) }}
            </div>
            <div class="ajuda-badge" [class]="'badge-status-' + ajuda.status">
              <i [class]="getStatusIcon(ajuda.status)"></i>
              {{ getStatusLabel(ajuda.status) }}
            </div>
          </div>
          <p class="descricao">{{ ajuda.descricao }}</p>
          <div class="ajuda-footer">
            <span>Por: {{ ajuda.usuario?.nome || 'Desconhecido' }}</span>
            <span *ngIf="ajuda.data_criacao" class="data">
              {{ formatDate(ajuda.data_criacao) }}
            </span>
          </div>
        </app-card>
      </div>

      <app-criar-ajuda-mutua-modal
        *ngIf="mostrarModal()"
        (ajudaMutuaCriada)="onAjudaMutuaCriada()"
        (fechado)="fecharModal()">
      </app-criar-ajuda-mutua-modal>

      <app-detalhes-ajuda-mutua-modal
        *ngIf="ajudaSelecionadaId()"
        [ajudaMutuaId]="ajudaSelecionadaId()!"
        (ajudaMutuaAtualizada)="onAjudaMutuaAtualizada()"
        (fechado)="fecharDetalhesModal()">
      </app-detalhes-ajuda-mutua-modal>
    </div>
  `,
  styles: [`
    .ajuda-mutua-container {
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

    .ajuda-mutua-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .ajuda-card {
      margin-bottom: 0;
      position: relative;
    }

    .ajuda-badges {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .ajuda-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .ajuda-badge i {
      font-size: 0.875rem;
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

    .descricao {
      margin: var(--spacing-sm) 0;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .ajuda-footer {
      display: flex;
      justify-content: space-between;
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .data {
      color: var(--text-muted);
    }
  `]
})
export class ListaAjudaMutuaComponent implements OnInit {
  private ajudaMutuaService = inject(AjudaMutuaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  ajudasMutuas = signal<AjudaMutua[]>([]);
  ajudasMutuasFiltradas = signal<AjudaMutua[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  mostrarModal = signal(false);
  ajudaSelecionadaId = signal<number | null>(null);
  filtroTipo = signal<'todos' | 'oferta' | 'pedido'>('todos');
  filtroStatus = signal<'todos' | 'aberto' | 'fechado'>('todos');

  criarAjudaMutua() {
    this.mostrarModal.set(true);
  }

  fecharModal() {
    this.mostrarModal.set(false);
  }

  async onAjudaMutuaCriada() {
    await this.loadAjudasMutuas();
  }

  verDetalhesAjudaMutua(ajudaId: number) {
    this.ajudaSelecionadaId.set(ajudaId);
  }

  fecharDetalhesModal() {
    this.ajudaSelecionadaId.set(null);
  }

  async onAjudaMutuaAtualizada() {
    await this.loadAjudasMutuas();
    this.fecharDetalhesModal();
  }

  filtrarPorTipo(tipo: 'todos' | 'oferta' | 'pedido') {
    this.filtroTipo.set(tipo);
    this.aplicarFiltros();
  }

  filtrarPorStatus(status: 'todos' | 'aberto' | 'fechado') {
    this.filtroStatus.set(status);
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtradas = [...this.ajudasMutuas()];
    
    // Filtro por tipo
    if (this.filtroTipo() !== 'todos') {
      filtradas = filtradas.filter(a => a.tipo === this.filtroTipo());
    }
    
    // Filtro por status
    if (this.filtroStatus() !== 'todos') {
      filtradas = filtradas.filter(a => a.status === this.filtroStatus());
    }
    
    this.ajudasMutuasFiltradas.set(filtradas);
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadAjudasMutuas();
    } else {
      this.loading.set(false);
    }
  }

  async loadAjudasMutuas() {
    this.loading.set(true);
    this.error.set(null);

    const currentUser = this.authService.currentUser();
    
    if (!currentUser?.id_condominio) {
      this.ajudasMutuas.set([]);
      this.ajudasMutuasFiltradas.set([]);
      this.loading.set(false);
      return;
    }

    const response = await this.ajudaMutuaService.findByCondominio(currentUser.id_condominio);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar solicitações');
    } else if (response.data) {
      this.ajudasMutuas.set(response.data);
      this.aplicarFiltros();
    }

    this.loading.set(false);
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
      year: 'numeric'
    });
  }

  getEmptyMessage(): string {
    return 'Ainda não há ofertas ou pedidos de ajuda mútua no condomínio.';
  }
}

