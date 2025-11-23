import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent, ErrorMessageComponent, CardComponent } from '../../../shared/components';

/**
 * Componente de Verificação de Endereço
 */
@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorMessageComponent, CardComponent],
  template: `
    <div class="verification-container">
      <app-card title="Verificação de Endereço">
        <div class="verification-content">
          <p>Para utilizar o aplicativo, você precisa verificar seu endereço.</p>
          <p>Escolha um método de verificação:</p>

          <div class="methods">
            <div class="method-card">
              <i class="bi bi-file-earmark-text"></i>
              <h3>Comprovante Digital</h3>
              <p>Envie um comprovante de residência (conta de água, luz, etc.)</p>
              <button class="btn btn-secondary" (click)="selectMethod('comprovante')">
                Selecionar
              </button>
            </div>

            <div class="method-card">
              <i class="bi bi-envelope"></i>
              <h3>Convite de Vizinho</h3>
              <p>Receba um convite de um vizinho já verificado</p>
              <button class="btn btn-secondary" (click)="selectMethod('convite')">
                Selecionar
              </button>
            </div>

            <div class="method-card">
              <i class="bi bi-mailbox"></i>
              <h3>Código Postal</h3>
              <p>Receba uma carta com código único em seu endereço</p>
              <button class="btn btn-secondary" (click)="selectMethod('codigo_postal')">
                Selecionar
              </button>
            </div>
          </div>

          <app-loading-spinner 
            *ngIf="loading()" 
            message="Processando...">
          </app-loading-spinner>

          <app-error-message 
            *ngIf="error()" 
            [error]="error()">
          </app-error-message>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .verification-container {
      max-width: 900px;
      margin: var(--spacing-xl) auto;
      padding: 0 var(--spacing-md);
    }

    .verification-content {
      padding: var(--spacing-md) 0;
    }

    .verification-content > p {
      margin-bottom: var(--spacing-md);
      color: var(--text-secondary);
    }

    .methods {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-lg);
      margin-top: var(--spacing-xl);
    }

    .method-card {
      padding: var(--spacing-lg);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      text-align: center;
      transition: border-color var(--transition-base);
      background: var(--bg-card);
    }

    .method-card:hover {
      border-color: var(--accent-primary);
    }

    .method-card i {
      font-size: 2.5rem;
      color: var(--accent-primary);
      margin-bottom: var(--spacing-md);
      display: block;
    }

    .method-card h3 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--font-size-lg);
      color: var(--text-primary);
    }

    .method-card p {
      margin: 0 0 var(--spacing-md) 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .btn {
      padding: var(--spacing-sm) var(--spacing-lg);
      border: none;
      border-radius: 6px;
      font-size: var(--font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover {
      background: var(--bg-tertiary);
      border-color: var(--border-color-hover);
    }
  `]
})
export class VerificationComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  selectMethod(method: 'comprovante' | 'convite' | 'codigo_postal') {
    // TODO: Implementar lógica de verificação
    this.error.set('Funcionalidade de verificação será implementada em breve');
    
    // Por enquanto, apenas informa
    alert(`Método selecionado: ${method}. Esta funcionalidade será implementada em breve.`);
  }
}

