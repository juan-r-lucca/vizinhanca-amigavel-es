import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components';

@Component({
  selector: 'app-sem-comunidade',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="empty-container">
      <div class="empty-card" *ngIf="carregado">
        <div class="illustration">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <i class="bi bi-buildings"></i>
        </div>

        <h1>Você ainda não está em nenhuma comunidade</h1>
        <p>
          Peça ao síndico do seu condomínio para compartilhar o link de convite.
          Assim que você receber, basta acessar o link para entrar automaticamente.
        </p>

        <div class="actions">
          <button type="button" class="btn btn-primary" (click)="irParaPerfil()">
            Ver meu perfil
          </button>
          <button type="button" class="btn btn-secondary" (click)="atualizar()">
            Atualizar status
          </button>
          <button
            type="button"
            class="btn btn-outline"
            *ngIf="ehSindico()"
            (click)="irParaCriacaoCondominio()">
            Criar comunidade agora
          </button>
        </div>
      </div>

      <app-loading-spinner
        *ngIf="!carregado"
        message="Carregando seus dados..."
      ></app-loading-spinner>
    </div>
  `,
  styles: [`
    .empty-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      background: linear-gradient(145deg, #f2f7ff 0%, #ffffff 100%);
    }

    .empty-card {
      max-width: 520px;
      text-align: center;
      background: #ffffff;
      padding: clamp(2.5rem, 4vw, 3.5rem);
      border-radius: 28px;
      box-shadow: 0 32px 60px rgba(13, 71, 161, 0.18);
      border: 1px solid rgba(13, 71, 161, 0.08);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .illustration {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto;
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(25, 118, 210, 0.12);
    }

    .circle-1 {
      width: 120px;
      height: 120px;
      top: 0;
      left: 0;
    }

    .circle-2 {
      width: 88px;
      height: 88px;
      top: 16px;
      left: 16px;
      background: rgba(99, 164, 255, 0.18);
    }

    .illustration i {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.8rem;
      color: #0d47a1;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.8rem, 3vw, 2.3rem);
      color: #0d47a1;
      font-weight: 700;
    }

    p {
      margin: 0;
      color: #5873a8;
      line-height: 1.65;
      font-size: 1rem;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      justify-content: center;
    }

    .btn {
      border: none;
      border-radius: 16px;
      padding: 0.85rem 1.8rem;
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
      box-shadow: 0 16px 32px rgba(25, 118, 210, 0.28);
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 20px 40px rgba(25, 118, 210, 0.32);
    }

    .btn-secondary {
      background: rgba(13, 71, 161, 0.08);
      color: #0d47a1;
    }

    .btn-secondary:hover {
      background: rgba(13, 71, 161, 0.16);
    }

    .btn-outline {
      background: transparent;
      border: 2px solid rgba(25, 118, 210, 0.4);
      color: #0d47a1;
    }

    .btn-outline:hover {
      background: rgba(25, 118, 210, 0.1);
      border-color: rgba(25, 118, 210, 0.6);
    }
  `]
})
export class SemComunidadeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  carregado = false;

  async ngOnInit(): Promise<void> {
    await this.verificarStatus();
  }

  async verificarStatus(): Promise<void> {
    const currentUser = this.authService.currentUser();
    if (currentUser?.id_condominio) {
      this.router.navigate(['/mural']);
      return;
    }

    this.carregado = true;
  }

  async atualizar(): Promise<void> {
    this.carregado = false;
    await this.verificarStatus();
  }

  irParaPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  ehSindico(): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.perfil === 'sindico';
  }

  irParaCriacaoCondominio(): void {
    this.router.navigate(['/condominio/criar']);
  }
}


