import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de Estado Vazio Reutilizável
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="icon">
        <i [class]="'bi ' + (icon || 'bi-inbox')"></i>
      </div>
      <h3>{{ title || 'Nenhum item encontrado' }}</h3>
      <p *ngIf="message">{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-secondary);
    }

    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: var(--text-muted);
      display: flex;
      justify-content: center;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-secondary);
      font-size: 1.2rem;
      font-weight: 500;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon?: string;
  @Input() title?: string;
  @Input() message?: string;
}

