import { Component, inject, signal, input, output, effect, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisoService } from '../../../core/services/aviso.service';
import { ComentarioService } from '../../../core/services/comentario.service';
import { AuthService } from '../../../core/services/auth.service';
import { Aviso } from '../../../core/models/aviso.model';
import { Comentario } from '../../../core/models/comentario.model';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Modal para exibir detalhes completos de um aviso
 */
@Component({
  selector: 'app-detalhes-aviso-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="modal-overlay" (click)="fechar()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Detalhes do Aviso</h2>
          <button class="btn-close" (click)="fechar()" [disabled]="loading()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <app-loading-spinner 
            *ngIf="loading()" 
            message="Carregando aviso...">
          </app-loading-spinner>

          <app-error-message 
            *ngIf="error() && !loading()" 
            [error]="error()" 
            title="Erro ao carregar aviso">
          </app-error-message>

          <div *ngIf="!loading() && !error() && aviso()" class="aviso-detalhes">
            <div class="aviso-header">
              <h3>{{ aviso()!.titulo }}</h3>
              <div class="aviso-meta">
                <span class="tipo" [class]="'tipo-' + aviso()!.tipo">
                  <i [class]="getTipoIcon(aviso()!.tipo)"></i>
                  {{ getTipoLabel(aviso()!.tipo) }}
                </span>
                <span class="prioridade" [class]="'prioridade-' + aviso()!.prioridade">
                  <i [class]="getPrioridadeIcon(aviso()!.prioridade)"></i>
                  {{ getPrioridadeLabel(aviso()!.prioridade) }}
                </span>
              </div>
            </div>

            <div class="aviso-conteudo">
              <p>{{ aviso()!.conteudo }}</p>
            </div>

            <div class="aviso-info">
              <div class="info-row">
                <span class="info-label">
                  <i class="bi bi-person"></i> Autor:
                </span>
                <span class="info-value">
                  {{ aviso()!.usuario?.nome || 'Desconhecido' }}
                </span>
              </div>

              <div class="info-row">
                <span class="info-label">
                  <i class="bi bi-calendar"></i> Data de publicação:
                </span>
                <span class="info-value">
                  {{ formatDate(aviso()!.data_criacao) }}
                </span>
              </div>

              <div class="info-row" *ngIf="aviso()!.data_atualizacao && aviso()!.data_atualizacao !== aviso()!.data_criacao">
                <span class="info-label">
                  <i class="bi bi-pencil"></i> Última atualização:
                </span>
                <span class="info-value">
                  {{ formatDate(aviso()!.data_atualizacao) }}
                </span>
              </div>
            </div>

            <div class="aviso-actions">
              <button
                type="button"
                class="btn-action"
                [class.active]="usuarioCurtiu()"
                (click)="toggleLike()"
                [disabled]="curtindo() || !authService.currentUser()">
                <i class="bi" [class.bi-hand-thumbs-up-fill]="usuarioCurtiu()" [class.bi-hand-thumbs-up]="!usuarioCurtiu()"></i>
                <span>{{ aviso()!.likes || 0 }}</span>
              </button>
              <button
                type="button"
                class="btn-action"
                (click)="toggleComentarios()"
                [class.active]="mostrarComentarios()">
                <i class="bi bi-chat-dots"></i>
                <span>{{ mostrarComentarios() ? comentarios().length : (aviso()!.comentarios || 0) }}</span>
              </button>
            </div>

            <div class="comentarios-section" *ngIf="mostrarComentarios()">
              <div class="comentarios-header">
                <h4>Comentários ({{ comentarios().length }})</h4>
              </div>

              <div class="comentarios-list" *ngIf="!comentariosLoading()">
                <div *ngIf="comentarios().length === 0" class="empty-comentarios">
                  <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                </div>

                <div
                  *ngFor="let comentario of comentarios()"
                  class="comentario-item">
                  <div class="comentario-avatar" *ngIf="comentario.usuario?.foto_url">
                    <img [src]="comentario.usuario!.foto_url!" [alt]="comentario.usuario!.nome">
                  </div>
                  <div class="comentario-avatar-placeholder" *ngIf="!comentario.usuario?.foto_url">
                    <i class="bi bi-person-circle"></i>
                  </div>
                  <div class="comentario-content">
                    <div class="comentario-header">
                      <span class="comentario-autor">{{ comentario.usuario?.nome || 'Usuário' }}</span>
                      <span class="comentario-data">{{ formatDate(comentario.data_criacao) }}</span>
                    </div>
                    <p class="comentario-texto">{{ comentario.conteudo }}</p>
                  </div>
                </div>
              </div>

              <app-loading-spinner
                *ngIf="comentariosLoading()"
                size="small"
                message="Carregando comentários...">
              </app-loading-spinner>

              <form
                class="comentar-form"
                (ngSubmit)="adicionarComentario()"
                #comentarioForm="ngForm"
                *ngIf="authService.currentUser()">
                <div class="form-group">
                  <textarea
                    [(ngModel)]="novoComentario"
                    name="comentario"
                    class="form-control"
                    placeholder="Escreva um comentário..."
                    rows="3"
                    required
                    minlength="1"
                    [disabled]="comentando()"></textarea>
                </div>
                <button
                  type="submit"
                  class="btn btn-primary btn-sm"
                  [disabled]="comentando() || !comentarioForm.valid || !novoComentario.trim()">
                  <app-loading-spinner
                    *ngIf="comentando()"
                    size="small">
                  </app-loading-spinner>
                  <span *ngIf="!comentando()">
                    <i class="bi bi-send"></i> Comentar
                  </span>
                  <span *ngIf="comentando()">Comentando...</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="modal-footer" *ngIf="!loading() && !error() && aviso()">
          <button
            type="button"
            class="btn btn-danger"
            *ngIf="podeExcluir()"
            (click)="excluirAviso()"
            [disabled]="excluindo()">
            <app-loading-spinner
              *ngIf="excluindo()"
              size="small">
            </app-loading-spinner>
            <span *ngIf="!excluindo()">
              <i class="bi bi-trash"></i> Excluir aviso
            </span>
            <span *ngIf="excluindo()">Excluindo...</span>
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            (click)="fechar()">
            Fechar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--spacing-md);
    }

    .modal-content {
      background: var(--bg-card);
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      width: 100%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-lg);
    }

    .btn-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: var(--spacing-xs);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all var(--transition-fast);
    }

    .btn-close:hover:not(:disabled) {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .btn-close:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .modal-body {
      padding: var(--spacing-lg);
    }

    .aviso-detalhes {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .aviso-header h3 {
      margin: 0 0 var(--spacing-md) 0;
      color: var(--text-primary);
      font-size: var(--font-size-xl);
      line-height: 1.4;
    }

    .aviso-meta {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .tipo, .prioridade {
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .tipo i, .prioridade i {
      font-size: 0.875rem;
    }

    .tipo-alerta {
      background: rgba(240, 40, 73, 0.1);
      color: var(--accent-danger);
    }

    .tipo-recado {
      background: rgba(24, 119, 242, 0.1);
      color: var(--accent-primary);
    }

    .tipo-evento {
      background: rgba(66, 183, 42, 0.1);
      color: var(--accent-secondary);
    }

    .prioridade-alta {
      background: rgba(240, 40, 73, 0.1);
      color: var(--accent-danger);
    }

    .prioridade-media {
      background: rgba(247, 185, 40, 0.1);
      color: var(--accent-warning);
    }

    .prioridade-baixa {
      background: rgba(66, 183, 42, 0.1);
      color: var(--accent-secondary);
    }

    .aviso-conteudo {
      padding: var(--spacing-md) 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }

    .aviso-conteudo p {
      margin: 0;
      color: var(--text-secondary);
      line-height: 1.8;
      font-size: var(--font-size-base);
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .aviso-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) 0;
    }

    .info-label {
      color: var(--text-muted);
      font-size: var(--font-size-sm);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      min-width: 150px;
    }

    .info-label i {
      font-size: var(--font-size-base);
    }

    .info-value {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      font-weight: 500;
    }

    .aviso-actions {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md) 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }

    .btn-action {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      background: none;
      border: none;
      border-radius: var(--border-radius-sm);
      color: var(--text-secondary);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-action:hover:not(:disabled) {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .btn-action.active {
      color: var(--accent-primary);
    }

    .btn-action.active i {
      color: var(--accent-primary);
    }

    .btn-action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-action i {
      font-size: var(--font-size-lg);
    }

    .comentarios-section {
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--border-color);
    }

    .comentarios-header {
      margin-bottom: var(--spacing-md);
    }

    .comentarios-header h4 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
    }

    .comentarios-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      max-height: 400px;
      overflow-y: auto;
      padding-right: var(--spacing-xs);
    }

    .empty-comentarios {
      padding: var(--spacing-lg);
      text-align: center;
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }

    .comentario-item {
      display: flex;
      gap: var(--spacing-md);
    }

    .comentario-avatar,
    .comentario-avatar-placeholder {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .comentario-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .comentario-avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-tertiary);
      color: var(--text-muted);
      font-size: 24px;
    }

    .comentario-content {
      flex: 1;
      background: var(--bg-tertiary);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--border-radius);
    }

    .comentario-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-xs);
    }

    .comentario-autor {
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      font-size: var(--font-size-sm);
    }

    .comentario-data {
      color: var(--text-muted);
      font-size: var(--font-size-xs);
    }

    .comentario-texto {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-base);
      line-height: 1.5;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .comentar-form {
      margin-top: var(--spacing-md);
    }

    .comentar-form .form-group {
      margin-bottom: var(--spacing-sm);
    }

    .comentar-form textarea {
      resize: vertical;
      min-height: 80px;
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-base);
      box-sizing: border-box;
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      transition: all var(--transition-fast);
      font-family: inherit;
    }

    .comentar-form textarea:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px rgba(24, 119, 242, 0.1);
    }

    .comentar-form textarea::placeholder {
      color: var(--text-muted);
    }

    .comentar-form textarea:disabled {
      background: var(--bg-tertiary);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-sm {
      padding: var(--spacing-xs) var(--spacing-md);
      font-size: var(--font-size-sm);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      padding: var(--spacing-lg);
      border-top: 1px solid var(--border-color);
    }

    .btn {
      padding: var(--spacing-sm) var(--spacing-lg);
      border: none;
      border-radius: 6px;
      font-size: var(--font-size-base);
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      transition: all var(--transition-fast);
      min-width: 100px;
    }

    .btn-primary {
      background: var(--accent-primary);
      color: #ffffff;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--accent-primary-hover);
    }

    .btn-primary:disabled {
      background: var(--bg-tertiary);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
    }

    .btn-secondary:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    .btn-danger {
      background: rgba(240, 40, 73, 0.12);
      color: var(--accent-danger);
      margin-right: auto;
    }

    .btn-danger:hover:not(:disabled) {
      background: rgba(240, 40, 73, 0.2);
      color: var(--accent-danger);
    }

    .btn-danger:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class DetalhesAvisoModalComponent {
  avisoService = inject(AvisoService);
  comentarioService = inject(ComentarioService);
  authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  // Input: ID do aviso a ser exibido
  avisoId = input.required<number>();
  // Evento emitido quando o modal é fechado
  fechado = output<void>();
  avisoExcluido = output<number>();

  aviso = signal<Aviso | null>(null);
  comentarios = signal<Comentario[]>([]);
  loading = signal(false);
  comentariosLoading = signal(false);
  comentando = signal(false);
  curtindo = signal(false);
  error = signal<string | null>(null);
  usuarioCurtiu = signal(false);
  mostrarComentarios = signal(false);
  novoComentario = '';
  excluindo = signal(false);

  constructor() {
    // Carrega o aviso quando o ID muda
    effect(() => {
      const id = this.avisoId();
      if (id) {
        this.loadAviso(id);
        this.checkUserLiked(id);
      }
    });
  }

  async loadAviso(id: number) {
    this.loading.set(true);
    this.error.set(null);
    this.aviso.set(null);

    const response = await this.avisoService.findById(id);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar aviso');
    } else if (response.data) {
      this.aviso.set(response.data);
    }

    this.loading.set(false);
  }

  async checkUserLiked(avisoId: number) {
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      return;
    }

    const hasLiked = await this.avisoService.hasUserLiked(avisoId, currentUser.id);
    this.usuarioCurtiu.set(hasLiked);
  }

  async toggleLike() {
    const avisoValue = this.aviso();
    const currentUser = this.authService.currentUser();

    if (!avisoValue || !currentUser || this.curtindo()) {
      return;
    }

    this.curtindo.set(true);
    this.error.set(null);

    const response = await this.avisoService.toggleLike(avisoValue.id, currentUser.id);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao curtir aviso');
      this.curtindo.set(false);
      return;
    }

    if (response.data) {
      this.aviso.set(response.data);
      this.usuarioCurtiu.set(!this.usuarioCurtiu());
    }

    this.curtindo.set(false);
  }

  toggleComentarios() {
    this.mostrarComentarios.set(!this.mostrarComentarios());
    
    if (this.mostrarComentarios() && this.comentarios().length === 0) {
      this.loadComentarios();
    }
  }

  async loadComentarios() {
    const avisoValue = this.aviso();
    if (!avisoValue) {
      return;
    }

    this.comentariosLoading.set(true);
    this.error.set(null);

    const response = await this.comentarioService.findByAviso(avisoValue.id);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao carregar comentários');
    } else if (response.data) {
      this.comentarios.set(response.data);
    }

    this.comentariosLoading.set(false);
  }

  async adicionarComentario() {
    const avisoValue = this.aviso();
    const currentUser = this.authService.currentUser();

    if (!avisoValue || !currentUser || !this.novoComentario.trim() || this.comentando()) {
      return;
    }

    this.comentando.set(true);
    this.error.set(null);

    const comentarioData = {
      conteudo: this.novoComentario.trim(),
      id_aviso: avisoValue.id,
      id_usuario: currentUser.id
    };

    const response = await this.comentarioService.create(comentarioData);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao adicionar comentário');
      this.comentando.set(false);
      return;
    }

    // Recarrega comentários e aviso atualizado
    await Promise.all([
      this.loadComentarios(),
      this.loadAviso(avisoValue.id)
    ]);

    this.novoComentario = '';
    this.comentando.set(false);
  }

  podeExcluir(): boolean {
    const avisoValue = this.aviso();
    const currentUser = this.authService.currentUser();

    if (!avisoValue || !currentUser) {
      return false;
    }

    return avisoValue.id_usuario === currentUser.id || avisoValue.usuario?.id === currentUser.id;
  }

  async excluirAviso() {
    const avisoValue = this.aviso();

    if (!avisoValue || this.excluindo()) {
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      const confirmed = window.confirm('Tem certeza de que deseja excluir este aviso? Esta ação não pode ser desfeita.');
      if (!confirmed) {
        return;
      }
    }

    this.excluindo.set(true);
    this.error.set(null);

    const response = await this.avisoService.delete(avisoValue.id);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao excluir aviso');
      this.excluindo.set(false);
      return;
    }

    this.avisoExcluido.emit(avisoValue.id);
    this.excluindo.set(false);
    this.fechar();
  }

  fechar() {
    this.fechado.emit();
  }

  formatDate(date?: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTipoLabel(tipo: string): string {
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      'alerta': 'bi-exclamation-triangle',
      'recado': 'bi-chat-dots',
      'evento': 'bi-calendar-event'
    };
    return icons[tipo] || 'bi-info-circle';
  }

  getPrioridadeLabel(prioridade: string): string {
    return prioridade.charAt(0).toUpperCase() + prioridade.slice(1);
  }

  getPrioridadeIcon(prioridade: string): string {
    const icons: Record<string, string> = {
      'baixa': 'bi-circle-fill',
      'media': 'bi-dash-circle-fill',
      'alta': 'bi-exclamation-circle-fill'
    };
    return icons[prioridade] || 'bi-circle';
  }
}

