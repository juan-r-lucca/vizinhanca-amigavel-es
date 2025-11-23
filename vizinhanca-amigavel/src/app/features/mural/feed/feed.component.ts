import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AvisoService } from '../../../core/services/aviso.service';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { Aviso } from '../../../core/models/aviso.model';
import { LoadingSpinnerComponent, ErrorMessageComponent, EmptyStateComponent } from '../../../shared/components';
import { CriarAvisoModalComponent } from '../criar-aviso-modal/criar-aviso-modal.component';
import { DetalhesAvisoModalComponent } from '../detalhes-aviso-modal/detalhes-aviso-modal.component';

/**
 * Componente de Feed do Mural
 */
@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    CriarAvisoModalComponent,
    DetalhesAvisoModalComponent
  ],
  template: `
    <div class="feed-container" [class.sidebar-collapsed]="sidebarService.collapsed()">
      <div class="header">
        <h1>Mural da Comunidade</h1>
        <button class="btn btn-primary" (click)="criarAviso()">
          <i class="bi bi-plus-circle"></i> Novo Aviso
        </button>
      </div>

      <app-loading-spinner 
        *ngIf="loading()" 
        message="Carregando avisos...">
      </app-loading-spinner>

      <app-error-message 
        *ngIf="error() && !loading()" 
        [error]="error()">
      </app-error-message>

      <div class="avisos-list" *ngIf="!loading() && !error()">
        <app-empty-state 
          *ngIf="avisos().length === 0"
          icon="bi-clipboard"
          title="Nenhum aviso ainda"
          message="Seja o primeiro a compartilhar algo com a comunidade!">
        </app-empty-state>

        <article 
          *ngFor="let aviso of avisos(); let i = index" 
          class="post"
          [class.featured]="i === 0"
          (click)="verDetalhesAviso(aviso.id)">
          <div class="post-header">
            <div class="post-author">
              <div class="author-avatar" *ngIf="aviso.usuario?.foto_url">
                <img [src]="aviso.usuario!.foto_url!" [alt]="aviso.usuario!.nome">
              </div>
              <div class="author-avatar-placeholder" *ngIf="!aviso.usuario?.foto_url">
                <i class="bi bi-person-circle"></i>
              </div>
              <div class="author-info">
                <div class="author-name">{{ aviso.usuario?.nome || 'Usuário' }}</div>
                <div class="post-meta">
                  <span class="post-date">{{ formatDate(aviso.data_criacao) }}</span>
                  <span class="post-badges">
                    <span class="badge tipo" [class]="'tipo-' + aviso.tipo">
                      <i [class]="getTipoIcon(aviso.tipo)"></i>
                      {{ getTipoLabel(aviso.tipo) }}
                    </span>
                    <span class="badge prioridade" [class]="'prioridade-' + aviso.prioridade">
                      <i [class]="getPrioridadeIcon(aviso.prioridade)"></i>
                      {{ getPrioridadeLabel(aviso.prioridade) }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="post-content">
            <h3 class="post-title">{{ aviso.titulo }}</h3>
            <p class="post-text">{{ aviso.conteudo }}</p>
          </div>

          <div class="post-actions">
            <button 
              type="button"
              class="action-btn"
              (click)="$event.stopPropagation()">
              <i class="bi bi-hand-thumbs-up"></i>
              <span>{{ aviso.likes || 0 }}</span>
            </button>
            <button 
              type="button"
              class="action-btn"
              (click)="$event.stopPropagation()">
              <i class="bi bi-chat-dots"></i>
              <span>{{ aviso.comentarios || 0 }}</span>
            </button>
          </div>
        </article>
      </div>

      <app-criar-aviso-modal
        *ngIf="mostrarModal()"
        (avisoCriado)="onAvisoCriado()"
        (fechado)="fecharModal()">
      </app-criar-aviso-modal>

      <app-detalhes-aviso-modal
        *ngIf="avisoSelecionadoId()"
        [avisoId]="avisoSelecionadoId()!"
        (fechado)="fecharDetalhesModal()"
        (avisoExcluido)="onAvisoExcluido($event)">
      </app-detalhes-aviso-modal>
    </div>
  `,
  styles: [`
    .feed-container {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--spacing-xl) var(--spacing-md);
      transition: max-width var(--transition-base);
    }

    .feed-container.sidebar-collapsed {
      max-width: 1200px;
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

    .avisos-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .avisos-list .post.featured {
      margin-bottom: var(--spacing-xl);
    }

    .post {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-top: none;
      padding: var(--spacing-lg);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .post:first-child {
      border-top: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    }

    .post:last-child {
      border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
    }

    .post:only-child {
      border-radius: var(--border-radius-lg);
    }

    .post:hover {
      background: var(--bg-tertiary);
    }

    .post.featured {
      padding: var(--spacing-xl);
      margin-bottom: var(--spacing-lg);
      border: 2px solid var(--accent-primary);
      border-radius: var(--border-radius-lg) !important;
      box-shadow: var(--shadow-md);
      background: var(--bg-card);
      position: relative;
    }

    .post.featured::before {
      content: 'Mais Recente';
      position: absolute;
      top: var(--spacing-md);
      right: var(--spacing-md);
      background: var(--accent-primary);
      color: #ffffff;
      padding: 0.25rem 0.75rem;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .post.featured:hover {
      background: var(--bg-card);
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .post.featured .post-header {
      margin-bottom: var(--spacing-lg);
    }

    .post.featured .author-avatar,
    .post.featured .author-avatar-placeholder {
      width: 56px;
      height: 56px;
    }

    .post.featured .author-avatar-placeholder {
      font-size: 44px;
    }

    .post.featured .author-name {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
    }

    .post-header {
      margin-bottom: var(--spacing-md);
    }

    .post-author {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .author-avatar,
    .author-avatar-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      flex-shrink: 0;
      overflow: hidden;
    }

    .author-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .author-avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-tertiary);
      color: var(--text-muted);
      font-size: 32px;
    }

    .author-info {
      flex: 1;
      min-width: 0;
    }

    .author-name {
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-base);
      color: var(--text-primary);
      margin-bottom: 0.25rem;
      line-height: 1.4;
    }

    .post-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .post-date {
      color: var(--text-muted);
      font-size: var(--font-size-xs);
    }

    .post-badges {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      flex-wrap: wrap;
    }

    .badge {
      padding: 0.125rem 0.375rem;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      display: inline-flex;
      align-items: center;
      gap: 0.125rem;
      line-height: 1.4;
    }

    .badge i {
      font-size: 0.75rem;
    }

    .badge.tipo-alerta {
      background: rgba(240, 40, 73, 0.1);
      color: var(--accent-danger);
    }

    .badge.tipo-recado {
      background: rgba(24, 119, 242, 0.1);
      color: var(--accent-primary);
    }

    .badge.tipo-evento {
      background: rgba(66, 183, 42, 0.1);
      color: var(--accent-secondary);
    }

    .badge.prioridade-alta {
      background: rgba(240, 40, 73, 0.1);
      color: var(--accent-danger);
    }

    .badge.prioridade-media {
      background: rgba(247, 185, 40, 0.1);
      color: var(--accent-warning);
    }

    .badge.prioridade-baixa {
      background: rgba(66, 183, 42, 0.1);
      color: var(--accent-secondary);
    }

    .post-content {
      margin-bottom: var(--spacing-md);
    }

    .post-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
      line-height: 1.4;
    }

    .post.featured .post-title {
      font-size: var(--font-size-xxl);
      font-weight: var(--font-weight-bold);
      margin: 0 0 var(--spacing-md) 0;
      line-height: 1.3;
    }

    .post-text {
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .post.featured .post-text {
      font-size: var(--font-size-lg);
      line-height: 1.7;
    }

    .post-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color);
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      border-radius: var(--border-radius-sm);
      transition: all var(--transition-fast);
    }

    .action-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .action-btn i {
      font-size: var(--font-size-base);
    }
  `]
})
export class FeedComponent implements OnInit {
  private avisoService = inject(AvisoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  sidebarService = inject(SidebarService);

  avisos = signal<Aviso[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  mostrarModal = signal(false);
  avisoSelecionadoId = signal<number | null>(null);

  criarAviso() {
    this.mostrarModal.set(true);
  }

  fecharModal() {
    this.mostrarModal.set(false);
  }

  async onAvisoCriado() {
    // Recarrega a lista de avisos após criar um novo
    await this.loadAvisos();
  }

  verDetalhesAviso(avisoId: number) {
    this.avisoSelecionadoId.set(avisoId);
  }

  fecharDetalhesModal() {
    this.avisoSelecionadoId.set(null);
  }

  onAvisoExcluido(avisoId: number) {
    this.avisos.update(avisos => avisos.filter(aviso => aviso.id !== avisoId));
    this.avisoSelecionadoId.set(null);
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadAvisos();
    } else {
      this.loading.set(false);
    }
  }

  async loadAvisos() {
    this.loading.set(true);
    this.error.set(null);

    const currentUser = this.authService.currentUser();
    
    // Se não houver condomínio, redireciona para a tela de comunidade pendente
    if (!currentUser?.id_condominio) {
      this.loading.set(false);
      this.router.navigate(['/sem-comunidade']);
      return;
    }

    const response = await this.avisoService.findByCondominio(currentUser.id_condominio);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar avisos');
    } else if (response.data) {
      this.avisos.set(response.data);
    }

    this.loading.set(false);
  }

  formatDate(date?: string): string {
    if (!date) return '';
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return postDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  getTipoLabel(tipo: string): string {
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'alerta': 'bi-exclamation-triangle',
      'recado': 'bi-chat-dots',
      'evento': 'bi-calendar-event'
    };
    return icons[tipo] || 'bi-info-circle';
  }

  getPrioridadeLabel(prioridade: string): string {
    return prioridade.charAt(0).toUpperCase() + prioridade.slice(1);
  }

  getPrioridadeIcon(prioridade: string): string {
    const icons: Record<string, string> = {
      'baixa': 'bi-circle-fill',
      'media': 'bi-dash-circle-fill',
      'alta': 'bi-exclamation-circle-fill'
    };
    return icons[prioridade] || 'bi-circle';
  }
}

