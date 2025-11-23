import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MensagemService } from '../../../core/services/mensagem.service';
import { AuthService } from '../../../core/services/auth.service';
import { Conversa } from '../../../core/models/mensagem.model';
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
        <app-empty-state 
          *ngIf="conversas().length === 0"
          icon="bi-chat-dots"
          title="Nenhuma conversa ainda"
          message="Inicie uma conversa com um vizinho!">
        </app-empty-state>

        <app-card 
          *ngFor="let conversa of conversas()" 
          [title]="conversa.usuario.nome"
          [clickable]="true"
          (cardClick)="abrirConversa(conversa.usuario.id)"
          class="conversa-card">
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
      color: var(--text-primary);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: 12px;
      font-size: var(--font-size-sm);
      font-weight: 500;
    }
  `]
})
export class ListaConversasComponent implements OnInit {
  private mensagemService = inject(MensagemService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  conversas = signal<Conversa[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  abrirConversa(usuarioId: string) {
    // TODO: Navegar para página de conversa ou abrir modal
    alert(`Abrindo conversa com usuário ID: ${usuarioId}\n\nEsta funcionalidade será implementada em breve.`);
    // Futuramente: this.router.navigate(['/mensagens', usuarioId]);
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
  }
}

