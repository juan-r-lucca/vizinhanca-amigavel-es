import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ItemAchadoPerdidoService } from '../../../core/services/item-achado-perdido.service';
import { AuthService } from '../../../core/services/auth.service';
import { ItemAchadoPerdido } from '../../../core/models/item-achado-perdido.model';
import { LoadingSpinnerComponent, ErrorMessageComponent, CardComponent, EmptyStateComponent } from '../../../shared/components';
import { ReportarItemModalComponent } from '../reportar-item-modal/reportar-item-modal.component';
import { DetalhesItemModalComponent } from '../detalhes-item-modal/detalhes-item-modal.component';

/**
 * Componente de Lista de Itens Achados/Perdidos
 */
@Component({
  selector: 'app-lista-achados-perdidos',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    CardComponent,
    EmptyStateComponent,
    ReportarItemModalComponent,
    DetalhesItemModalComponent
  ],
  template: `
    <div class="achados-perdidos-container">
      <div class="header">
        <h1>Achados e Perdidos</h1>
        <button class="btn btn-primary" (click)="reportarItem()">
          <i class="bi bi-plus-circle"></i> Reportar Item
        </button>
      </div>

      <app-loading-spinner 
        *ngIf="loading()" 
        message="Carregando itens...">
      </app-loading-spinner>

      <app-error-message 
        *ngIf="error() && !loading()" 
        [error]="error()">
      </app-error-message>

      <div class="items-list" *ngIf="!loading() && !error()">
        <app-empty-state 
          *ngIf="itens().length === 0"
          icon="bi-search"
          title="Nenhum item reportado"
          message="Seja o primeiro a reportar um item achado ou perdido!">
        </app-empty-state>

        <app-card 
          *ngFor="let item of itens()" 
          [title]="item.titulo"
          [clickable]="true"
          (cardClick)="verDetalhesItem(item.id)"
          class="item-card">
          <div class="item-badge" [class]="'badge-' + item.tipo">
            <i [class]="getTipoIcon(item.tipo)"></i>
            {{ getTipoLabel(item.tipo) }}
          </div>
          <p>{{ item.descricao }}</p>
          <div class="item-footer">
            <span>Por: {{ item.usuario?.nome || 'Desconhecido' }}</span>
            <span *ngIf="item.resolvido" class="resolvido">
              <i class="bi bi-check-circle"></i> Resolvido
            </span>
          </div>
        </app-card>
      </div>

      <app-reportar-item-modal
        *ngIf="mostrarModal()"
        (itemCriado)="onItemCriado()"
        (fechado)="fecharModal()">
      </app-reportar-item-modal>

      <app-detalhes-item-modal
        *ngIf="itemSelecionadoId()"
        [itemId]="itemSelecionadoId()!"
        (itemResolvido)="onItemResolvido()"
        (fechado)="fecharDetalhesModal()">
      </app-detalhes-item-modal>
    </div>
  `,
  styles: [`
    .achados-perdidos-container {
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

    .items-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .item-card {
      margin-bottom: 0;
      position: relative;
    }

    .item-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--spacing-sm);
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

    .item-footer {
      display: flex;
      justify-content: space-between;
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);

      i {
        margin-right: var(--spacing-xs);
      }
    }

    .resolvido {
      color: var(--accent-secondary);
      font-weight: 500;
    }
  `]
})
export class ListaComponent implements OnInit {
  private itemService = inject(ItemAchadoPerdidoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  itens = signal<ItemAchadoPerdido[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  mostrarModal = signal(false);
  itemSelecionadoId = signal<number | null>(null);

  reportarItem() {
    this.mostrarModal.set(true);
  }

  fecharModal() {
    this.mostrarModal.set(false);
  }

  async onItemCriado() {
    // Recarrega a lista de itens após criar um novo
    await this.loadItens();
  }

  verDetalhesItem(itemId: number) {
    this.itemSelecionadoId.set(itemId);
  }

  fecharDetalhesModal() {
    this.itemSelecionadoId.set(null);
  }

  async onItemResolvido() {
    // Recarrega a lista de itens após marcar como resolvido
    // (o item resolvido não aparecerá mais na lista, pois só mostramos não resolvidos)
    await this.loadItens();
    this.fecharDetalhesModal();
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadItens();
    } else {
      this.loading.set(false);
    }
  }

  async loadItens() {
    this.loading.set(true);
    this.error.set(null);

    const currentUser = this.authService.currentUser();
    
    // Se não houver condomínio, mostra lista vazia (condomínio não é obrigatório)
    if (!currentUser?.id_condominio) {
      this.itens.set([]);
      this.loading.set(false);
      return;
    }

    const response = await this.itemService.findNaoResolvidos(currentUser.id_condominio);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar itens');
    } else if (response.data) {
      this.itens.set(response.data);
    }

    this.loading.set(false);
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

