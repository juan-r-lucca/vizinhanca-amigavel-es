import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';
import { AuthService } from '../../../core/services/auth.service';
import { CondominioService } from '../../../core/services/condominio.service';
import { Condominio } from '../../../core/models/condominio.model';

@Component({
  selector: 'app-condominio-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="onboarding-container">
      <div class="onboarding-card">
        <app-loading-spinner
          *ngIf="loading()"
          message="Verificando sua comunidade..."
        ></app-loading-spinner>

        <app-error-message
          *ngIf="error() && !loading()"
          [error]="error()"
        ></app-error-message>

        <ng-container *ngIf="!loading() && !error()">
          <section *ngIf="condominio(); else createForm" class="condominio-info">
            <h1>Seu condomínio está pronto!</h1>
            <p class="subtitle">
              Compartilhe o link abaixo com os moradores que já possuem conta para convidá-los a participar.
            </p>

            <div class="info-block">
              <h2>{{ condominio()!.nome }}</h2>
              <p class="address">{{ condominio()!.endereco }}</p>
              <p class="address">
                CEP {{ condominio()!.cep }}
                <span *ngIf="condominio()!.cidade"> - {{ condominio()!.cidade }}</span>
                <span *ngIf="condominio()!.estado">/{{ condominio()!.estado }}</span>
              </p>
            </div>

            <div class="share-block">
              <label>Link de convite</label>
              <div class="share-input">
                <input type="text" [value]="conviteLink()" readonly>
                <button type="button" class="btn btn-secondary" (click)="copiarLink()" [disabled]="copiando()">
                  <span *ngIf="!copiando()">Copiar link</span>
                  <span *ngIf="copiando()">Copiado!</span>
                </button>
              </div>
              <small>Moradores com conta ativa podem acessar o link para entrar na sua comunidade.</small>
            </div>

            <div class="actions">
              <button type="button" class="btn btn-primary" (click)="irParaMural()">
                Ir para o mural
              </button>
            </div>
          </section>

          <ng-template #createForm>
            <h1>Vamos criar sua comunidade</h1>
            <p class="subtitle">
              Preencha os dados do condomínio para começar a convidar moradores.
            </p>

            <form class="condominio-form" (ngSubmit)="criarCondominio()" #condominioForm="ngForm">
              <div class="form-group">
                <label for="nome">Nome do condomínio</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  [(ngModel)]="form.nome"
                  required
                  [disabled]="salvando()"
                  placeholder="Ex.: Condomínio Residencial Jardim das Flores">
              </div>

              <div class="form-group">
                <label for="endereco">Endereço</label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  [(ngModel)]="form.endereco"
                  required
                  [disabled]="salvando()"
                  placeholder="Rua, número, bairro">
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label for="cep">CEP</label>
                  <input
                    type="text"
                    id="cep"
                    name="cep"
                    [(ngModel)]="form.cep"
                    required
                    [disabled]="salvando()"
                    placeholder="00000-000">
                </div>

                <div class="form-group">
                  <label for="cidade">Cidade</label>
                  <input
                    type="text"
                    id="cidade"
                    name="cidade"
                    [(ngModel)]="form.cidade"
                    [disabled]="salvando()"
                    placeholder="Cidade">
                </div>

                <div class="form-group">
                  <label for="estado">Estado</label>
                  <input
                    type="text"
                    id="estado"
                    name="estado"
                    [(ngModel)]="form.estado"
                    [disabled]="salvando()"
                    maxlength="2"
                    placeholder="UF">
                </div>
              </div>

              <div class="actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="salvando() || !condominioForm.valid">
                  <app-loading-spinner *ngIf="salvando()" size="small"></app-loading-spinner>
                  <span *ngIf="!salvando()">Criar condomínio</span>
                </button>
                <button type="button" class="btn btn-secondary" (click)="cancelar()">
                  Voltar para o login
                </button>
              </div>
            </form>
          </ng-template>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      background: linear-gradient(135deg, #e3f2fd 0%, #f5f9ff 100%);
    }

    .onboarding-card {
      width: 100%;
      max-width: 720px;
      background: #ffffff;
      border-radius: 24px;
      padding: clamp(2rem, 4vw, 3rem);
      box-shadow: 0 30px 60px rgba(13, 71, 161, 0.18);
      border: 1px solid rgba(13, 71, 161, 0.08);
    }

    h1 {
      margin: 0 0 var(--spacing-md) 0;
      font-size: clamp(2rem, 3vw, 2.6rem);
      color: #0d47a1;
      font-weight: 700;
    }

    .subtitle {
      margin: 0 0 var(--spacing-xl) 0;
      color: #5873a8;
      font-size: 1rem;
      line-height: 1.6;
    }

    .condominio-info .info-block {
      border-radius: 18px;
      padding: var(--spacing-lg);
      background: linear-gradient(135deg, rgba(25, 118, 210, 0.12), rgba(227, 242, 253, 0.65));
      color: #0d47a1;
      margin-bottom: var(--spacing-xl);
    }

    .condominio-info h2 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: 1.6rem;
    }

    .address {
      margin: 0;
      color: rgba(13, 71, 161, 0.85);
      font-size: 0.95rem;
    }

    .share-block {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-xl);
    }

    .share-block label {
      font-weight: 600;
      color: #0d47a1;
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
      border-radius: 12px;
      border: 1px solid rgba(13, 71, 161, 0.25);
      background: rgba(227, 242, 253, 0.5);
      color: #0d47a1;
      font-size: 0.95rem;
    }

    .share-input input:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }

    .share-block small {
      color: #5873a8;
      font-size: 0.85rem;
    }

    .actions {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .actions .btn {
      min-width: 160px;
    }

    .condominio-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .form-group label {
      font-weight: 600;
      color: #0d47a1;
    }

    .form-group input {
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: 12px;
      border: 1px solid rgba(13, 71, 161, 0.28);
      background: #f8fbff;
      font-size: 1rem;
      color: #0d47a1;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
    }

    .form-group input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-grid {
      display: grid;
      gap: var(--spacing-lg);
    }

    @media (min-width: 680px) {
      .form-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
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
    }

    .btn-primary {
      background: linear-gradient(135deg, #1976d2, #63a4ff);
      color: #ffffff;
      box-shadow: 0 18px 30px rgba(25, 118, 210, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 20px 36px rgba(25, 118, 210, 0.35);
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

    .btn-secondary:hover:not(:disabled) {
      background: rgba(13, 71, 161, 0.15);
    }
  `]
})
export class CondominioOnboardingComponent implements OnInit {
  private authService = inject(AuthService);
  private condominioService = inject(CondominioService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  loading = signal(true);
  salvando = signal(false);
  copiando = signal(false);
  error = signal<string | null>(null);
  condominio = signal<Condominio | null>(null);

  form = {
    nome: '',
    endereco: '',
    cep: '',
    cidade: '',
    estado: ''
  };

  conviteLink = computed(() => {
    const cond = this.condominio();
    if (!cond || !isPlatformBrowser(this.platformId)) {
      return '';
    }
    return `${window.location.origin}/convite/${cond.id}`;
  });

  async ngOnInit(): Promise<void> {
    await this.carregarDadosIniciais();
  }

  private async carregarDadosIniciais(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);
      const currentUser = this.authService.currentUser();

      if (!currentUser) {
        this.error.set('Você precisa estar autenticado para continuar.');
        return;
      }

      if (currentUser.id_condominio) {
        const response = await this.condominioService.findById(currentUser.id_condominio);
        if (response.error || !response.data) {
          this.error.set(response.error?.message || 'Não foi possível carregar os dados do condomínio.');
          return;
        }
        this.condominio.set(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do condomínio', error);
      this.error.set('Erro inesperado ao carregar os dados. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  async criarCondominio(): Promise<void> {
    if (this.salvando()) {
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.error.set('Você precisa estar autenticado para criar um condomínio.');
      return;
    }

    this.salvando.set(true);
    this.error.set(null);

    try {
      const response = await this.condominioService.createAndAssociate({
        nome: this.form.nome.trim(),
        endereco: this.form.endereco.trim(),
        cep: this.form.cep.trim(),
        cidade: this.form.cidade.trim(),
        estado: this.form.estado.trim().toUpperCase()
      });

      if (response.error || !response.data) {
        this.error.set(response.error?.message || 'Não foi possível criar o condomínio.');
        this.salvando.set(false);
        return;
      }

      this.condominio.set(response.data.condominio);

      await this.authService.loadUser(currentUser.id);
    } catch (error) {
      console.error('Erro ao criar condomínio', error);
      this.error.set(error instanceof Error ? error.message : 'Erro inesperado ao criar condomínio.');
    } finally {
      this.salvando.set(false);
    }
  }

  async copiarLink(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.copiando()) {
      return;
    }

    const link = this.conviteLink();
    if (!link) {
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = link;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      this.copiando.set(true);
      setTimeout(() => this.copiando.set(false), 1800);
    } catch (error) {
      console.error('Erro ao copiar link', error);
    }
  }

  irParaMural(): void {
    this.router.navigate(['/mural']);
  }

  cancelar(): void {
    this.router.navigate(['/auth/login']);
  }
}


