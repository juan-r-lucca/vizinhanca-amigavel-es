import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MensagemService } from '../../../core/services/mensagem.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Conversa } from '../../../core/models/mensagem.model';
import { Usuario } from '../../../core/models/usuario.model';
import { LoadingSpinnerComponent, ErrorMessageComponent, CardComponent, EmptyStateComponent } from '../../../shared/components';

/**
 * Componente de Lista de Conversas
 */
@Component({
  selector: 'app-lista-conversas',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    CardComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="conversas-container">
      <h1>Mensagens</h1>

      <app-loading-spinner 
        *ngIf="loading()" 
        message="Carregando conversas...">
      </app-loading-spinner>

      <app-error-message 
        *ngIf="error() && !loading()" 
        [error]="error()">
      </app-error-message>

      <div class="conversas-list" *ngIf="!loading() && !error()">
        <!-- Lista de conversas existentes -->
        <div *ngIf="conversas().length > 0">
          <h2 class="section-title">Conversas</h2>
          <app-card 
            *ngFor="let conversa of conversas()" 
            [title]="conversa.usuario.nome"
            [clickable]="true"
            (cardClick)="abrirConversa(conversa.usuario.id)"
            class="conversa-card">
            <div class="conversa-header" *ngIf="conversa.usuario.foto_url">
              <img [src]="conversa.usuario.foto_url" [alt]="conversa.usuario.nome" class="avatar">
            </div>
            <p class="last-message" *ngIf="conversa.ultima_mensagem">
              {{ conversa.ultima_mensagem.conteudo }}
            </p>
            <div class="conversa-footer">
              <span class="badge" *ngIf="conversa.nao_lidas_count && conversa.nao_lidas_count > 0">
                {{ conversa.nao_lidas_count }} não lidas
              </span>
            </div>
          </app-card>
        </div>

        <!-- Lista de vizinhos quando não há conversas -->
        <div *ngIf="conversas().length === 0">
          <app-empty-state 
            *ngIf="loadingVizinhos()"
            icon="bi-people"
            title="Carregando vizinhos..."
            message="Buscando vizinhos do seu condomínio">
          </app-empty-state>

          <div *ngIf="!loadingVizinhos()">
            <h2 class="section-title">Vizinhos</h2>
            
            <app-empty-state 
              *ngIf="vizinhos().length === 0"
              icon="bi-people"
              title="Nenhum vizinho encontrado"
              message="Você ainda não tem vizinhos no mesmo condomínio. Quando outros moradores se registrarem, eles aparecerão aqui.">
            </app-empty-state>

            <app-card 
              *ngFor="let vizinho of vizinhos()" 
              [title]="vizinho.nome"
              [clickable]="true"
              (cardClick)="iniciarConversa(vizinho.id)"
              class="vizinho-card">
              <div class="vizinho-info">
                <div class="avatar-container" *ngIf="vizinho.foto_url">
                  <img [src]="vizinho.foto_url" [alt]="vizinho.nome" class="avatar">
                </div>
                <div class="avatar-placeholder" *ngIf="!vizinho.foto_url">
                  <i class="bi bi-person-circle"></i>
                </div>
                <div class="vizinho-details">
                  <p class="unidade" *ngIf="vizinho.unidade">
                    <i class="bi bi-house"></i> {{ vizinho.unidade }}
                  </p>
                  <p class="perfil" *ngIf="vizinho.perfil">
                    <i class="bi bi-person-badge"></i> {{ getPerfilLabel(vizinho.perfil) }}
                  </p>
                </div>
              </div>
              <div class="vizinho-actions">
                <button class="btn btn-primary" (click)="iniciarConversa(vizinho.id); $event.stopPropagation()">
                  <i class="bi bi-chat-dots"></i> Iniciar Conversa
                </button>
              </div>
            </app-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .conversas-container {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--spacing-xl) var(--spacing-md);
    }

    h1 {
      margin: 0 0 var(--spacing-xl) 0;
      color: var(--text-primary);
    }

    .conversas-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .conversa-card {
      margin-bottom: 0;
    }

    .last-message {
      margin: var(--spacing-sm) 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .conversa-footer {
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color);
    }

    .badge {
      background: var(--accent-danger);
      color: white;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: 12px;
      font-size: var(--font-size-sm);
      font-weight: 500;
    }

    .section-title {
      margin: var(--spacing-lg) 0 var(--spacing-md) 0;
      color: var(--text-primary);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
    }

    .conversa-header {
      margin-bottom: var(--spacing-sm);
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-tertiary);
      color: var(--text-muted);
      font-size: 2rem;
    }

    .vizinho-card {
      margin-bottom: 0;
    }

    .vizinho-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .avatar-container {
      flex-shrink: 0;
    }

    .vizinho-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .unidade, .perfil {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .unidade i, .perfil i {
      color: var(--text-muted);
    }

    .vizinho-actions {
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color);
    }

    .btn {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
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
    }

    .btn-primary {
      background: var(--accent-primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--accent-primary-hover);
    }
  `]
})
export class ListaConversasComponent implements OnInit {
  private mensagemService = inject(MensagemService);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  conversas = signal<Conversa[]>([]);
  vizinhos = signal<Usuario[]>([]);
  loading = signal(true);
  loadingVizinhos = signal(false);
  error = signal<string | null>(null);

  abrirConversa(usuarioId: string) {
    // TODO: Navegar para página de conversa ou abrir modal
    alert(`Abrindo conversa com usuário ID: ${usuarioId}\n\nEsta funcionalidade será implementada em breve.`);
    // Futuramente: this.router.navigate(['/mensagens', usuarioId]);
  }

  async iniciarConversa(usuarioId: string) {
    // TODO: Implementar modal de conversa ou navegação
    alert(`Iniciando conversa com usuário ID: ${usuarioId}\n\nEsta funcionalidade será implementada em breve.`);
    // Futuramente: this.router.navigate(['/mensagens', usuarioId]);
  }

  getPerfilLabel(perfil: string): string {
    const labels: Record<string, string> = {
      'morador': 'Morador',
      'sindico': 'Síndico',
      'portaria': 'Portaria'
    };
    return labels[perfil] || perfil;
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadConversas();
    } else {
      this.loading.set(false);
    }
  }

  async loadConversas() {
    this.loading.set(true);
    this.error.set(null);

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.error.set('Usuário não autenticado');
      this.loading.set(false);
      return;
    }

    const response = await this.mensagemService.findConversas(currentUser.id);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar conversas');
    } else if (response.data) {
      this.conversas.set(response.data);
    }

    this.loading.set(false);

    // Se não há conversas, carrega os vizinhos
    if (!response.error && (!response.data || response.data.length === 0)) {
      await this.loadVizinhos();
    }
  }

  async loadVizinhos() {
    const currentUser = this.authService.currentUser();
    if (!currentUser || !currentUser.id_condominio) {
      return;
    }

    this.loadingVizinhos.set(true);

    const response = await this.usuarioService.findVizinhos(currentUser.id, currentUser.id_condominio);

    if (!response.error && response.data) {
      this.vizinhos.set(response.data);
    }

    this.loadingVizinhos.set(false);
  }
}

