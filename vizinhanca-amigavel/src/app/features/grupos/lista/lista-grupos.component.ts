import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { GrupoService } from '../../../core/services/grupo.service';
import { AuthService } from '../../../core/services/auth.service';
import { Grupo } from '../../../core/models/grupo.model';
import { LoadingSpinnerComponent, ErrorMessageComponent, CardComponent, EmptyStateComponent } from '../../../shared/components';
import { CriarGrupoModalComponent } from '../criar-grupo-modal/criar-grupo-modal.component';
import { DetalhesGrupoModalComponent } from '../detalhes-grupo-modal/detalhes-grupo-modal.component';

/**
 * Componente de Lista de Grupos
 */
@Component({
  selector: 'app-lista-grupos',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    CardComponent,
    EmptyStateComponent,
    CriarGrupoModalComponent,
    DetalhesGrupoModalComponent
  ],
  template: `
    <div class="grupos-container">
      <div class="header">
        <h1>Grupos de Interesse</h1>
        <button class="btn btn-primary" (click)="criarGrupo()">
          <i class="bi bi-plus-circle"></i> Criar Grupo
        </button>
      </div>

      <app-loading-spinner 
        *ngIf="loading()" 
        message="Carregando grupos...">
      </app-loading-spinner>

      <app-error-message 
        *ngIf="error() && !loading()" 
        [error]="error()">
      </app-error-message>

      <div class="grupos-list" *ngIf="!loading() && !error()">
        <app-empty-state 
          *ngIf="grupos().length === 0"
          icon="bi-people"
          title="Nenhum grupo ainda"
          message="Crie o primeiro grupo de interesse da sua comunidade!">
        </app-empty-state>

        <app-card 
          *ngFor="let grupo of grupos()" 
          [title]="grupo.nome"
          [clickable]="true"
          (cardClick)="verDetalhesGrupo(grupo.id)">
          <p *ngIf="grupo.descricao">{{ grupo.descricao }}</p>
          <div class="grupo-footer">
            <span>Criado por: {{ grupo.criador?.nome || 'Desconhecido' }}</span>
            <span *ngIf="grupo.membros_count">
              <i class="bi bi-people"></i> {{ grupo.membros_count }} membros
            </span>
          </div>
        </app-card>
      </div>

      <app-criar-grupo-modal
        *ngIf="mostrarModal()"
        (grupoCriado)="onGrupoCriado()"
        (fechado)="fecharModal()">
      </app-criar-grupo-modal>

      <app-detalhes-grupo-modal
        *ngIf="grupoSelecionadoId()"
        [grupoId]="grupoSelecionadoId()!"
        (fechado)="fecharDetalhesModal()">
      </app-detalhes-grupo-modal>
    </div>
  `,
  styles: [`
    .grupos-container {
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

    .grupos-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .grupo-footer {
      display: flex;
      justify-content: space-between;
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
  `]
})
export class ListaGruposComponent implements OnInit {
  private grupoService = inject(GrupoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  grupos = signal<Grupo[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  mostrarModal = signal(false);
  grupoSelecionadoId = signal<number | null>(null);

  criarGrupo() {
    this.mostrarModal.set(true);
  }

  fecharModal() {
    this.mostrarModal.set(false);
  }

  async onGrupoCriado() {
    // Recarrega a lista de grupos após criar um novo
    await this.loadGrupos();
  }

  verDetalhesGrupo(grupoId: number) {
    this.grupoSelecionadoId.set(grupoId);
  }

  fecharDetalhesModal() {
    this.grupoSelecionadoId.set(null);
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadGrupos();
    } else {
      this.loading.set(false);
    }
  }

  async loadGrupos() {
    this.loading.set(true);
    this.error.set(null);

    const currentUser = this.authService.currentUser();
    
    // Se não houver condomínio, mostra lista vazia (condomínio não é obrigatório)
    if (!currentUser?.id_condominio) {
      this.grupos.set([]);
      this.loading.set(false);
      return;
    }

    const response = await this.grupoService.findByCondominio(currentUser.id_condominio);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar grupos');
    } else if (response.data) {
      this.grupos.set(response.data);
    }

    this.loading.set(false);
  }
}

