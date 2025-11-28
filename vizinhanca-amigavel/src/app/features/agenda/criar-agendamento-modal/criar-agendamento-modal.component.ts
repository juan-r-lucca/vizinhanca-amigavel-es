import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../../core/services/agenda.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Modal para criar novo agendamento
 */
@Component({
  selector: 'app-criar-agendamento-modal',
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
          <h2>Novo Agendamento</h2>
          <button class="btn-close" (click)="fechar()" [disabled]="loading()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <app-error-message 
            *ngIf="error()" 
            [error]="error()" 
            title="Erro ao criar agendamento">
          </app-error-message>

          <form (ngSubmit)="onSubmit()" #agendamentoForm="ngForm">
            <div class="form-group">
              <label for="titulo">Título *</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                [(ngModel)]="titulo"
                required
                minlength="3"
                [disabled]="loading()"
                class="form-control"
                placeholder="Ex: Festa de Aniversário, Jogo de Futebol...">
            </div>

            <div class="form-group">
              <label for="tipo">Tipo *</label>
              <select
                id="tipo"
                name="tipo"
                [(ngModel)]="tipo"
                required
                [disabled]="loading()"
                class="form-control">
                <option value="">Selecione o tipo</option>
                <option value="evento">Evento</option>
                <option value="quadra">Quadra</option>
                <option value="item">Item</option>
              </select>
            </div>

            <div class="form-group">
              <label for="nome_recurso">Nome do Recurso *</label>
              <input
                type="text"
                id="nome_recurso"
                name="nome_recurso"
                [(ngModel)]="nomeRecurso"
                required
                minlength="2"
                [disabled]="loading()"
                class="form-control"
                [placeholder]="getRecursoPlaceholder()">
            </div>

            <div class="form-group">
              <label for="descricao">Descrição</label>
              <textarea
                id="descricao"
                name="descricao"
                [(ngModel)]="descricao"
                [disabled]="loading()"
                class="form-control"
                rows="3"
                placeholder="Informações adicionais sobre o agendamento (opcional)">
              </textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="data_inicio">Data e Hora de Início *</label>
                <input
                  type="datetime-local"
                  id="data_inicio"
                  name="data_inicio"
                  [(ngModel)]="dataInicio"
                  required
                  [disabled]="loading()"
                  class="form-control"
                  [min]="getMinDateTime()">
              </div>

              <div class="form-group">
                <label for="data_fim">Data e Hora de Fim *</label>
                <input
                  type="datetime-local"
                  id="data_fim"
                  name="data_fim"
                  [(ngModel)]="dataFim"
                  required
                  [disabled]="loading()"
                  class="form-control"
                  [min]="dataInicio || getMinDateTime()">
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="fechar()"
                [disabled]="loading()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="loading() || !agendamentoForm.valid || !validarDatas()">
                <app-loading-spinner 
                  *ngIf="loading()" 
                  size="small">
                </app-loading-spinner>
                <span *ngIf="!loading()">Criar Agendamento</span>
                <span *ngIf="loading()">Criando...</span>
              </button>
            </div>
          </form>
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
      max-width: 600px;
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

    .form-group {
      margin-bottom: var(--spacing-md);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    label {
      display: block;
      margin-bottom: var(--spacing-sm);
      color: var(--text-secondary);
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: var(--font-size-base);
      box-sizing: border-box;
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      transition: all var(--transition-fast);
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }

    .form-control:disabled {
      background: var(--bg-tertiary);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md);
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-lg);
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
      color: white;
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

    .btn-secondary:hover:not(:disabled) {
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class CriarAgendamentoModalComponent {
  private agendaService = inject(AgendaService);
  private authService = inject(AuthService);

  agendamentoCriado = output<void>();
  fechado = output<void>();

  titulo = '';
  descricao = '';
  tipo: 'evento' | 'quadra' | 'item' | '' = '';
  nomeRecurso = '';
  dataInicio = '';
  dataFim = '';
  loading = signal(false);
  error = signal<string | null>(null);

  getRecursoPlaceholder(): string {
    switch (this.tipo) {
      case 'evento':
        return 'Ex: Salão de Festas, Área de Lazer...';
      case 'quadra':
        return 'Ex: Quadra de Futebol, Quadra Poliesportiva...';
      case 'item':
        return 'Ex: Churrasqueira, Sala de Jogos...';
      default:
        return 'Nome do recurso a ser agendado';
    }
  }

  getMinDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  validarDatas(): boolean {
    if (!this.dataInicio || !this.dataFim) {
      return false;
    }
    return new Date(this.dataFim) > new Date(this.dataInicio);
  }

  async onSubmit() {
    if (!this.validarDatas()) {
      this.error.set('A data de fim deve ser posterior à data de início.');
      return;
    }

    const currentUser = this.authService.currentUser();
    
    if (!currentUser?.id_condominio) {
      this.error.set('Você precisa estar associado a um condomínio para criar agendamentos.');
      return;
    }

    if (!currentUser.verificado) {
      this.error.set('Você precisa estar verificado para criar agendamentos.');
      return;
    }

    // Verificar conflitos
    this.loading.set(true);
    this.error.set(null);

    const conflitosResponse = await this.agendaService.verificarConflitos(
      currentUser.id_condominio,
      this.nomeRecurso.trim(),
      this.dataInicio,
      this.dataFim
    );

    if (conflitosResponse.error) {
      this.error.set(conflitosResponse.error.message || 'Erro ao verificar disponibilidade.');
      this.loading.set(false);
      return;
    }

    if (conflitosResponse.data && conflitosResponse.data.length > 0) {
      this.error.set(`Este recurso já está agendado no período selecionado. Por favor, escolha outro horário.`);
      this.loading.set(false);
      return;
    }

    const agendamentoData = {
      titulo: this.titulo.trim(),
      descricao: this.descricao.trim() || undefined,
      tipo: this.tipo as 'evento' | 'quadra' | 'item',
      nome_recurso: this.nomeRecurso.trim(),
      data_inicio: new Date(this.dataInicio).toISOString(),
      data_fim: new Date(this.dataFim).toISOString(),
      id_usuario: currentUser.id,
      id_condominio: currentUser.id_condominio
    };

    const response = await this.agendaService.create(agendamentoData);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao criar agendamento');
      this.loading.set(false);
      return;
    }

    // Limpa o formulário
    this.titulo = '';
    this.descricao = '';
    this.tipo = '';
    this.nomeRecurso = '';
    this.dataInicio = '';
    this.dataFim = '';
    this.loading.set(false);
    
    // Emite evento de sucesso e fecha o modal
    this.agendamentoCriado.emit();
    this.fechar();
  }

  fechar() {
    if (!this.loading()) {
      this.fechado.emit();
    }
  }
}

