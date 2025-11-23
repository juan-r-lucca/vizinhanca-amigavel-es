import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';

/**
 * Componente Card Reutilizável
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet],
  template: `
    <div class="card" [class.clickable]="clickable" (click)="onClick()">
      <div class="card-header" *ngIf="title || headerTemplate">
        <ng-container *ngIf="title; else headerTemplate">
          <h3>{{ title }}</h3>
        </ng-container>
        <ng-template #headerTemplate>
          <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
        </ng-template>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div class="card-footer" *ngIf="footerTemplate">
        <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--bg-card);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-md);
      transition: all var(--transition-base);
    }

    .card:hover {
      box-shadow: var(--shadow-md);
      border-color: var(--border-color-hover);
    }

    .card.clickable {
      cursor: pointer;
    }

    .card.clickable:hover {
      transform: translateY(-2px);
    }

    .card-header {
      margin-bottom: var(--spacing-md);
      padding-bottom: var(--spacing-sm);
      border-bottom: 1px solid var(--border-color);
    }

    .card-header h3 {
      margin: 0;
      font-size: var(--font-size-lg);
      color: var(--text-primary);
      font-weight: 600;
    }

    .card-body {
      color: var(--text-secondary);
    }

    .card-footer {
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class CardComponent {
  @Input() title?: string;
  @Input() clickable = false;
  @Input() headerTemplate?: any;
  @Input() footerTemplate?: any;
  @Output() cardClick = new EventEmitter<void>();

  onClick() {
    if (this.clickable) {
      this.cardClick.emit();
    }
  }
}

