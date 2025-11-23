import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="layout-container">
      <app-sidebar *ngIf="authService.isAuthenticated()"></app-sidebar>
      <main 
        class="main-content" 
        [class.with-sidebar]="authService.isAuthenticated()"
        [class.sidebar-collapsed]="sidebarService.collapsed()">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      margin-left: 0;
      transition: margin-left var(--transition-base);
      min-height: 100vh;
      background: var(--bg-primary);
      padding: var(--spacing-xl);
    }

    .main-content.with-sidebar {
      margin-left: var(--sidebar-width);
    }

    .main-content.with-sidebar.sidebar-collapsed {
      margin-left: var(--sidebar-width-collapsed);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .main-content.with-sidebar {
        margin-left: var(--sidebar-width-collapsed);
      }
    }

    @media (max-width: 480px) {
      .main-content.with-sidebar {
        margin-left: 0;
      }
    }
  `]
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  sidebarService = inject(SidebarService);
}
