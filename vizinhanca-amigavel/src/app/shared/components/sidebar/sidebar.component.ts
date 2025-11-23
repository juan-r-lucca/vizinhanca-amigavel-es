import { Component, effect, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs/operators';
import { CondominioService } from '../../../core/services/condominio.service';
import { SidebarService } from '../../../core/services/sidebar.service';

interface MenuItem {
  label: string;
  path: string;
  icon: string; // Bootstrap Icons class name
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <div class="sidebar-header">
        <h2 class="sidebar-title" *ngIf="!collapsed()">{{ condominioNome() }}</h2>
        <button class="toggle-btn" (click)="toggleCollapse()" [attr.aria-label]="collapsed() ? 'Expandir sidebar' : 'Recolher sidebar'">
          <i [class]="collapsed() ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <ul class="menu-list">
          <li *ngFor="let item of menuItems" class="menu-item">
            <a 
              [routerLink]="item.path" 
              routerLinkActive="active"
              [routerLinkActiveOptions]="{exact: false}"
              class="menu-link"
              [title]="item.label">
              <i [class]="'bi ' + item.icon + ' menu-icon'"></i>
              <span class="menu-label" *ngIf="!collapsed()">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer" *ngIf="currentUser()">
        <div class="user-info" *ngIf="!collapsed()">
          <div class="user-avatar" *ngIf="currentUser()!.foto_url">
            <img [src]="currentUser()!.foto_url" [alt]="currentUser()!.nome">
          </div>
          <div class="user-avatar-placeholder" *ngIf="!currentUser()!.foto_url">
            <i class="bi bi-person-circle"></i>
          </div>
          <div class="user-details">
            <div class="user-name">{{ currentUser()!.nome }}</div>
            <div class="user-email">{{ currentUser()!.email }}</div>
          </div>
        </div>
        <button 
          type="button" 
          class="logout-btn" 
          (click)="logout()" 
          [title]="collapsed() ? 'Sair' : ''">
          <i class="bi bi-box-arrow-right"></i>
          <span *ngIf="!collapsed()">Sair</span>
        </button>
        <div 
          class="logout-error" 
          *ngIf="logoutError() && !collapsed()">
          {{ logoutError() }}
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      width: var(--sidebar-width);
      background: #1976d2;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      transition: width var(--transition-base);
      z-index: 1000;
      box-shadow: var(--shadow-sm);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar.collapsed {
      width: var(--sidebar-width-collapsed);
    }

    .sidebar-header {
      padding: var(--spacing-lg) var(--spacing-md);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 70px;
      background: rgba(0, 0, 0, 0.1);
    }

    .sidebar-title {
      margin: 0;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      letter-spacing: -0.01em;
      text-transform: none;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.9);
      width: 36px;
      height: 36px;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .toggle-btn .icon {
      font-size: 1.2rem;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }

    .menu-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .menu-item {
      margin: 0.25rem 0;
    }

    .menu-link {
      display: flex;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-lg);
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all var(--transition-fast);
      border-left: 3px solid transparent;
      gap: var(--spacing-md);
      border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
    }

    .menu-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border-left-color: #ffffff;
    }

    .menu-link.active {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      border-left-color: #ffffff;
      font-weight: var(--font-weight-semibold);
    }

    .menu-icon {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .menu-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar.collapsed .menu-link {
      justify-content: center;
      padding: 1rem;
    }

    .sidebar-footer {
      padding: var(--spacing-md);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-sm);
      border-radius: var(--border-radius-sm);
      background: rgba(255, 255, 255, 0.1);
      transition: all var(--transition-fast);
    }

    .user-info:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .user-avatar,
    .user-avatar-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      flex-shrink: 0;
      overflow: hidden;
    }

    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .user-avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      font-size: 32px;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
      color: #ffffff;
      margin-bottom: 0.125rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.4;
    }

    .user-email {
      font-size: var(--font-size-xs);
      color: rgba(255, 255, 255, 0.7);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.4;
    }

    .logout-btn {
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.9);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      transition: all var(--transition-fast);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .logout-btn:hover {
      background: rgba(240, 40, 73, 0.2);
      border-color: #f02849;
      color: #ffffff;
    }

    .logout-btn:active {
      transform: scale(0.98);
    }

    .logout-btn i {
      font-size: var(--font-size-base);
    }

    .sidebar.collapsed .logout-btn {
      padding: 0.75rem;
    }

    .sidebar.collapsed .logout-btn span:not(.icon) {
      display: none;
    }

    .logout-error {
      margin-top: var(--spacing-sm);
      color: var(--accent-danger);
      font-size: var(--font-size-xs);
      text-align: center;
    }

    /* Scrollbar styling */
    .sidebar-nav::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        width: 70px;
      }

      .sidebar:not(.collapsed) {
        width: 280px;
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
      }
    }

    @media (max-width: 480px) {
      .sidebar {
        width: 70px;
      }

      .sidebar:not(.collapsed) {
        width: 100%;
        max-width: 280px;
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
      }
    }
  `]
})
export class SidebarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private condominioService = inject(CondominioService);
  private sidebarService = inject(SidebarService);
  private platformId = inject(PLATFORM_ID);

  collapsed = this.sidebarService.collapsed;
  currentUser = this.authService.currentUser;
  condominioNome = signal('Vizinhança Amigável');
  private lastCondominioId?: number;
  logoutError = signal<string | null>(null);

  menuItems: MenuItem[] = [
    { label: 'Mural', path: '/mural', icon: 'bi-clipboard' },
    { label: 'Grupos', path: '/grupos', icon: 'bi-people' },
    { label: 'Mensagens', path: '/mensagens', icon: 'bi-chat-dots' },
    { label: 'Achados e Perdidos', path: '/achados-perdidos', icon: 'bi-search' },
    { label: 'Encomendas', path: '/encomendas', icon: 'bi-box' },
    { label: 'Ajuda Mútua', path: '/ajuda-mutua', icon: 'bi-heart' },
    { label: 'Mapa', path: '/mapa', icon: 'bi-geo-alt' },
    { label: 'Meu Perfil', path: '/perfil', icon: 'bi-person' }
  ];

  constructor() {
    // Load collapsed state from localStorage
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved === 'true') {
        this.sidebarService.setCollapsed(true);
      }

      // Listen to route changes to auto-collapse on mobile
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          if (window.innerWidth <= 768) {
            this.sidebarService.setCollapsed(true);
          }
        });
    }

    // Atualiza o nome do condomínio quando o usuário mudar
    effect(() => {
      const user = this.currentUser();

      if (!user) {
        this.condominioNome.set('Vizinhança Amigável');
        this.lastCondominioId = undefined;
        return;
      }

      if (user.condominio?.nome) {
        this.condominioNome.set(user.condominio.nome);
        this.lastCondominioId = user.condominio.id;
        return;
      }

      if (user.id_condominio && user.id_condominio !== this.lastCondominioId) {
        this.lastCondominioId = user.id_condominio;
        this.fetchCondominioName(user.id_condominio);
      } else if (!user.id_condominio) {
        this.condominioNome.set('Vizinhança Amigável');
        this.lastCondominioId = undefined;
      }
    });
  }

  toggleCollapse(): void {
    const newValue = !this.collapsed();
    this.sidebarService.setCollapsed(newValue);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('sidebar-collapsed', String(newValue));
    }
  }

  async logout(): Promise<void> {
    try {
      this.logoutError.set(null);
      await this.authService.signOut();
    } catch (error) {
      console.error('Erro ao sair:', error);
      this.logoutError.set(error instanceof Error ? error.message : 'Não foi possível finalizar a sessão. Tente novamente.');
    }
  }

  private async fetchCondominioName(id: number): Promise<void> {
    try {
      const response = await this.condominioService.findById(id);
      if (response.data?.nome) {
        this.condominioNome.set(response.data.nome);
      } else {
        this.condominioNome.set('Vizinhança Amigável');
      }
    } catch (error) {
      this.condominioNome.set('Vizinhança Amigável');
      console.error('Erro ao carregar condomínio:', error);
    }
  }
}
