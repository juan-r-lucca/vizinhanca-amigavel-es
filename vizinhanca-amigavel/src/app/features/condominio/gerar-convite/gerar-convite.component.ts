import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent, ErrorMessageComponent, CardComponent } from '../../../shared/components';
import { AuthService } from '../../../core/services/auth.service';
import { CondominioService } from '../../../core/services/condominio.service';
import { Condominio } from '../../../core/models/condominio.model';

@Component({
  selector: 'app-gerar-convite',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorMessageComponent, CardComponent],
  template: `
    <div class="invite-container">
      <app-card title="Gerar Convite de Condomínio">
        <div class="invite-content">
          <app-loading-spinner
            *ngIf="loading()"
            message="Carregando informações do condomínio...">
          </app-loading-spinner>

          <app-error-message
            *ngIf="error() && !loading()"
            [error]="error()">
          </app-error-message>

          <ng-container *ngIf="!loading() && !error() && condominio()">
            <p class="description">
              Compartilhe o link abaixo com os moradores que já possuem conta para convidá-los a participar da sua comunidade.
            </p>

            <div class="condominio-info">
              <h3>{{ condominio()!.nome }}</h3>
              <p class="address">
                {{ condominio()!.endereco }}<br>
                CEP {{ condominio()!.cep }}
                <span *ngIf="condominio()!.cidade"> - {{ condominio()!.cidade }}</span>
                <span *ngIf="condominio()!.estado">/{{ condominio()!.estado }}</span>
              </p>
            </div>

            <div class="share-block">
              <label>Link de convite</label>
              <div class="share-input">
                <input 
                  type="text" 
                  [value]="conviteLink()" 
                  readonly
                  #linkInput
                  (click)="linkInput.select()">
                <button 
                  type="button" 
                  class="btn btn-primary" 
                  (click)="copiarLink()" 
                  [disabled]="copiando()">
                  <i class="bi" [class.bi-clipboard]="!copiando()" [class.bi-check-circle]="copiando()"></i>
                  <span *ngIf="!copiando()">Copiar link</span>
                  <span *ngIf="copiando()">Copiado!</span>
                </button>
              </div>
              <small>Moradores com conta ativa podem acessar o link para entrar na sua comunidade.</small>
            </div>

            <div class="instructions">
              <h4>Como compartilhar:</h4>
              <ul>
                <li>Copie o link acima e envie por WhatsApp, email ou mensagem</li>
                <li>O link pode ser compartilhado quantas vezes quiser</li>
                <li>Qualquer morador com conta pode usar o link para entrar na comunidade</li>
              </ul>
            </div>

            <div class="actions">
              <button type="button" class="btn btn-secondary" (click)="irParaMural()">
                Voltar para o mural
              </button>
            </div>
          </ng-container>

          <div *ngIf="!loading() && !error() && !condominio()" class="no-condominio">
            <p>Você não está associado a nenhum condomínio.</p>
            <button type="button" class="btn btn-primary" (click)="irParaCriarCondominio()">
              Criar condomínio
            </button>
          </div>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .invite-container {
      max-width: 700px;
      margin: var(--spacing-xl) auto;
      padding: 0 var(--spacing-md);
    }

    .invite-content {
      padding: var(--spacing-md) 0;
    }

    .description {
      margin: 0 0 var(--spacing-lg) 0;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .condominio-info {
      background: linear-gradient(135deg, rgba(25, 118, 210, 0.12), rgba(227, 242, 253, 0.65));
      border-radius: 12px;
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
      color: var(--accent-primary);
    }

    .condominio-info h3 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--font-size-lg);
      color: var(--accent-primary);
    }

    .address {
      margin: 0;
      color: rgba(13, 71, 161, 0.85);
      font-size: var(--font-size-sm);
      line-height: 1.6;
    }

    .share-block {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-xl);
    }

    .share-block label {
      font-weight: 600;
      color: var(--text-primary);
    }

    .share-input {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .share-input input {
      flex: 1;
      min-width: 240px;
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: var(--font-size-base);
      cursor: text;
    }

    .share-input input:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
    }

    .share-block small {
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }

    .instructions {
      background: var(--bg-secondary);
      border-radius: 8px;
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .instructions h4 {
      margin: 0 0 var(--spacing-md) 0;
      font-size: var(--font-size-base);
      color: var(--text-primary);
    }

    .instructions ul {
      margin: 0;
      padding-left: var(--spacing-lg);
      color: var(--text-secondary);
    }

    .instructions li {
      margin-bottom: var(--spacing-xs);
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .btn {
      border: none;
      border-radius: 8px;
      padding: var(--spacing-sm) var(--spacing-lg);
      font-size: var(--font-size-base);
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      transition: all var(--transition-fast);
      min-width: 160px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--accent-primary);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--accent-primary-hover);
    }

    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--bg-tertiary);
    }

    .no-condominio {
      text-align: center;
      padding: var(--spacing-xl);
    }

    .no-condominio p {
      margin: 0 0 var(--spacing-lg) 0;
      color: var(--text-secondary);
    }
  `]
})
export class GerarConviteComponent implements OnInit {
  private authService = inject(AuthService);
  private condominioService = inject(CondominioService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  loading = signal(true);
  error = signal<string | null>(null);
  condominio = signal<Condominio | null>(null);
  copiando = signal(false);

  conviteLink = computed(() => {
    const cond = this.condominio();
    if (!cond || !isPlatformBrowser(this.platformId)) {
      return '';
    }
    return `${window.location.origin}/convite/${cond.id}`;
  });

  async ngOnInit(): Promise<void> {
    await this.carregarCondominio();
  }

  private async carregarCondominio(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        this.error.set('Você precisa estar autenticado para gerar convites.');
        this.loading.set(false);
        return;
      }

      if (!currentUser.id_condominio) {
        this.loading.set(false);
        return;
      }

      const response = await this.condominioService.findById(currentUser.id_condominio);
      
      if (response.error || !response.data) {
        this.error.set(response.error?.message || 'Não foi possível carregar os dados do condomínio.');
        this.loading.set(false);
        return;
      }

      this.condominio.set(response.data);
    } catch (error) {
      console.error('Erro ao carregar condomínio:', error);
      this.error.set('Erro inesperado ao carregar os dados. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  async copiarLink(): Promise<void> {
    const link = this.conviteLink();
    if (!link) {
      return;
    }

    try {
      if (isPlatformBrowser(this.platformId) && navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        this.copiando.set(true);
        setTimeout(() => {
          this.copiando.set(false);
        }, 2000);
      } else {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.copiando.set(true);
        setTimeout(() => {
          this.copiando.set(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  }

  irParaMural(): void {
    this.router.navigate(['/mural']);
  }

  irParaCriarCondominio(): void {
    this.router.navigate(['/condominio/criar']);
  }
}

