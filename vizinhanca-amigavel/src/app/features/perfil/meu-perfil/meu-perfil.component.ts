import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';
import { LoadingSpinnerComponent, ErrorMessageComponent, CardComponent } from '../../../shared/components';
import { Router } from '@angular/router';

/**
 * Componente de Perfil do Usuário
 */
@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    CardComponent
  ],
  template: `
    <div class="perfil-container">
      <h1>Meu Perfil</h1>

      <app-loading-spinner 
        *ngIf="loading()" 
        message="Carregando perfil...">
      </app-loading-spinner>

      <app-error-message 
        *ngIf="error() && !loading()" 
        [error]="error()">
      </app-error-message>

      <app-card 
        *ngIf="usuario() && !loading()" 
        [title]="usuario()!.nome">
        <div class="perfil-info">
          <div class="info-item">
            <strong>E-mail:</strong>
            <span>{{ usuario()!.email }}</span>
          </div>
          <div class="info-item" *ngIf="usuario()!.telefone">
            <strong>Telefone:</strong>
            <span>{{ usuario()!.telefone }}</span>
          </div>
          <div class="info-item" *ngIf="usuario()!.unidade">
            <strong>Unidade:</strong>
            <span>{{ usuario()!.unidade }}</span>
          </div>
          <div class="info-item">
            <strong>Perfil:</strong>
            <span>{{ usuario()!.perfil }}</span>
          </div>
          <div class="info-item">
            <strong>Verificado:</strong>
            <span [class.verificado]="usuario()!.verificado">
              {{ usuario()!.verificado ? 'Sim' : 'Não' }}
            </span>
          </div>
          <div class="info-item" *ngIf="usuario()!.bio">
            <strong>Bio:</strong>
            <p>{{ usuario()!.bio }}</p>
          </div>
        </div>

        <div class="perfil-actions">
          <button class="btn btn-primary" (click)="editarPerfil()">Editar Perfil</button>
          <button class="btn btn-secondary" (click)="logout()">Sair</button>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .perfil-container {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--spacing-xl) var(--spacing-md);
    }

    h1 {
      margin: 0 0 var(--spacing-xl) 0;
      color: var(--text-primary);
    }

    .perfil-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .info-item strong {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .info-item span {
      color: var(--text-primary);
      font-size: var(--font-size-base);
    }

    .info-item p {
      margin: 0;
      color: var(--text-primary);
      line-height: 1.6;
    }

    .verificado {
      color: var(--accent-secondary);
      font-weight: 500;
    }

    .perfil-actions {
      display: flex;
      gap: var(--spacing-md);
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-xl);
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class MeuPerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  usuario = signal<Usuario | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadPerfil();
    } else {
      this.loading.set(false);
    }
  }

  async loadPerfil() {
    this.loading.set(true);
    this.error.set(null);

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.error.set('Usuário não autenticado');
      this.loading.set(false);
      return;
    }

    this.usuario.set(currentUser);
    this.loading.set(false);
  }

  editarPerfil() {
    // TODO: Implementar edição de perfil
    alert('Funcionalidade de edição será implementada em breve');
  }

  async logout() {
    await this.authService.signOut();
  }
}

