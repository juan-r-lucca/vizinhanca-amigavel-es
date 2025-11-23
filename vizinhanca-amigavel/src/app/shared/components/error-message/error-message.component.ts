import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de Mensagem de Erro Reutilizável
 */
@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-message" *ngIf="error">
      <div class="error-icon">
        <i class="bi bi-exclamation-triangle"></i>
      </div>
      <div class="error-content">
        <h3 *ngIf="title">{{ title }}</h3>
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .error-message {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background-color: rgba(231, 76, 60, 0.1);
      border: 1px solid rgba(231, 76, 60, 0.3);
      border-radius: 8px;
      color: var(--accent-danger);
      margin: 1rem 0;
    }

    .error-icon {
      font-size: 1.5rem;
      display: flex;
      align-items: center;
    }

    .error-content {
      flex: 1;
    }

    .error-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
    }

    .error-content p {
      margin: 0;
      font-size: 0.9rem;
    }
  `]
})
export class ErrorMessageComponent {
  @Input() error?: string | Error | null;
  @Input() title?: string;

  get errorMessage(): string {
    if (!this.error) return '';
    if (typeof this.error === 'string') return this.error;
    if (this.error instanceof Error) return this.error.message;
    return 'Ocorreu um erro desconhecido';
  }
}

