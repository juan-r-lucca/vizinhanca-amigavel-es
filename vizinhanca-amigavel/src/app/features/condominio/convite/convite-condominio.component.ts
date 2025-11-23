import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';
import { CondominioService } from '../../../core/services/condominio.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { Condominio } from '../../../core/models/condominio.model';

@Component({
  selector: 'app-convite-condominio',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="invite-container">
      <div class="invite-card">
        <app-loading-spinner
          *ngIf="loading()"
          message="Verificando convite..."
        ></app-loading-spinner>

        <app-error-message
          *ngIf="error() && !loading()"
          [error]="error()"
        ></app-error-message>

        <ng-container *ngIf="!loading() && !error() && condominio()">
          <div class="invite-header">
            <div class="badge">Convite de condomínio</div>
            <h1>{{ condominio()!.nome }}</h1>
            <p class="address">
              {{ condominio()!.endereco }}<br>
              CEP {{ condominio()!.cep }}
              <span *ngIf="condominio()!.cidade"> - {{ condominio()!.cidade }}</span>
              <span *ngIf="condominio()!.estado">/{{ condominio()!.estado }}</span>
            </p>
          </div>

          <div *ngIf="jaParticipa()" class="message info">
            Você já faz parte desta comunidade. Aproveite para acessar o mural e ver as novidades!
          </div>

          <div *ngIf="participaOutro()" class="message warning">
            Você já participa de outro condomínio. Ao aceitar, seu perfil será transferido para esta nova comunidade.
          </div>

          <div class="actions">
            <button
              type="button"
              class="btn btn-primary"
              (click)="aceitarConvite()"
              [disabled]="processando() || jaParticipa()">
              <app-loading-spinner *ngIf="processando()" size="small"></app-loading-spinner>
              <span *ngIf="!processando()">
                {{ jaParticipa() ? 'Já participante' : 'Entrar na comunidade' }}
              </span>
            </button>
            <button type="button" class="btn btn-secondary" (click)="irParaMural()">
              Voltar para o mural
            </button>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .invite-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      background: linear-gradient(135deg, #e3f2fd 0%, #f5f9ff 100%);
    }

    .invite-card {
      width: 100%;
      max-width: 640px;
      background: #ffffff;
      border-radius: 20px;
      padding: clamp(2rem, 4vw, 3rem);
      box-shadow: 0 28px 52px rgba(13, 71, 161, 0.16);
      border: 1px solid rgba(13, 71, 161, 0.1);
    }

    .invite-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.3rem 0.85rem;
      border-radius: 999px;
      background: rgba(25, 118, 210, 0.12);
      color: #0d47a1;
      font-size: 0.8rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 600;
      margin: 0 auto;
    }

    h1 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 2.6rem);
      color: #0d47a1;
      font-weight: 700;
    }

    .address {
      margin: 0;
      color: #5873a8;
      line-height: 1.6;
    }

    .message {
      border-radius: 16px;
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .message.info {
      background: rgba(66, 183, 42, 0.12);
      color: #2e7d32;
    }

    .message.warning {
      background: rgba(247, 185, 40, 0.15);
      color: #b36a00;
    }

    .actions {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn {
      border: none;
      border-radius: 14px;
      padding: 0.85rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      min-width: 180px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1976d2, #63a4ff);
      color: #ffffff;
      box-shadow: 0 18px 28px rgba(25, 118, 210, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 22px 36px rgba(25, 118, 210, 0.36);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-secondary {
      background: rgba(13, 71, 161, 0.08);
      color: #0d47a1;
    }

    .btn-secondary:hover {
      background: rgba(13, 71, 161, 0.16);
    }
  `]
})
export class ConviteCondominioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private condominioService = inject(CondominioService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(true);
  processando = signal(false);
  error = signal<string | null>(null);
  condominio = signal<Condominio | null>(null);

  jaParticipa = signal(false);
  participaOutro = signal(false);

  private condominioId: number | null = null;

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!idParam || Number.isNaN(id)) {
      this.error.set('Convite inválido. Verifique o link recebido.');
      this.loading.set(false);
      return;
    }

    this.condominioId = id;

    await this.carregarInformacoes();
  }

  private async carregarInformacoes(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const response = await this.condominioService.findById(this.condominioId!);

      if (response.error || !response.data) {
        this.error.set(response.error?.message || 'Convite não encontrado ou condomínio indisponível.');
        return;
      }

      this.condominio.set(response.data);

      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        this.error.set('Você precisa estar autenticado para aceitar este convite.');
        return;
      }

      if (currentUser.id_condominio === this.condominioId) {
        this.jaParticipa.set(true);
      } else if (currentUser.id_condominio && currentUser.id_condominio !== this.condominioId) {
        this.participaOutro.set(true);
      }
    } catch (error) {
      console.error('Erro ao carregar convite de condomínio', error);
      this.error.set('Erro inesperado ao carregar o convite. Tente novamente mais tarde.');
    } finally {
      this.loading.set(false);
    }
  }

  async aceitarConvite(): Promise<void> {
    const currentUser = this.authService.currentUser();
    if (!currentUser || !this.condominioId || this.jaParticipa() || this.processando()) {
      return;
    }

    this.processando.set(true);
    this.error.set(null);

    try {
      const response = await this.usuarioService.update(currentUser.id, {
        id_condominio: this.condominioId
      });

      if (response.error) {
        this.error.set(response.error.message || 'Não foi possível aceitar o convite.');
        this.processando.set(false);
        return;
      }

      await this.authService.loadUser(currentUser.id);

      this.router.navigate(['/mural']);
    } catch (error) {
      console.error('Erro ao aceitar convite', error);
      this.error.set(error instanceof Error ? error.message : 'Erro inesperado ao aceitar convite.');
    } finally {
      this.processando.set(false);
    }
  }

  irParaMural(): void {
    this.router.navigate(['/mural']);
  }
}


