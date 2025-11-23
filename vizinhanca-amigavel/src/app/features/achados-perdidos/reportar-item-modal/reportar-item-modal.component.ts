import { Component, inject, signal, output, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemAchadoPerdidoService } from '../../../core/services/item-achado-perdido.service';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Modal para reportar item achado ou perdido
 */
@Component({
  selector: 'app-reportar-item-modal',
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
          <h2>Reportar Item</h2>
          <button class="btn-close" (click)="fechar()" [disabled]="loading()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <app-error-message 
            *ngIf="error()" 
            [error]="error()" 
            title="Erro ao reportar item">
          </app-error-message>

          <form (ngSubmit)="onSubmit()" #itemForm="ngForm">
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
                <option value="achado">Achado</option>
                <option value="perdido">Perdido</option>
              </select>
              <small class="form-hint">Selecione se você encontrou algo ou perdeu algo</small>
            </div>

            <div class="form-group">
              <label for="titulo">Título *</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                [(ngModel)]="titulo"
                required
                minlength="3"
                maxlength="255"
                [disabled]="loading()"
                class="form-control"
                placeholder="Ex: Chave encontrada, Carteira perdida...">
              <small class="form-hint">Mínimo de 3 caracteres</small>
            </div>

            <div class="form-group">
              <label for="descricao">Descrição *</label>
              <textarea
                id="descricao"
                name="descricao"
                [(ngModel)]="descricao"
                required
                minlength="10"
                [disabled]="loading()"
                class="form-control"
                rows="6"
                placeholder="Descreva o item em detalhes: cor, tamanho, características especiais, onde foi encontrado/perdido..."></textarea>
              <small class="form-hint">Mínimo de 10 caracteres. Seja o mais detalhado possível.</small>
            </div>

            <div class="form-group">
              <label for="foto">Foto do Item (Opcional)</label>
              
              <!-- Preview da imagem -->
              <div class="image-preview-container" *ngIf="imagePreview()">
                <img [src]="imagePreview()" alt="Preview" class="image-preview">
                <button 
                  type="button" 
                  class="btn-remove-image"
                  (click)="removeImage()"
                  [disabled]="loading()"
                  title="Remover imagem">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>

              <!-- Botões de ação -->
              <div class="image-upload-actions" *ngIf="!imagePreview()">
                <button
                  type="button"
                  class="btn btn-outline"
                  (click)="fileInput.click()"
                  [disabled]="loading()">
                  <i class="bi bi-upload"></i>
                  Anexar Foto
                </button>
                <button
                  type="button"
                  class="btn btn-outline"
                  (click)="takePhoto()"
                  [disabled]="loading()">
                  <i class="bi bi-camera"></i>
                  Tirar Foto
                </button>
              </div>

              <!-- Input de arquivo oculto -->
              <input
                #fileInput
                type="file"
                id="foto"
                name="foto"
                accept="image/*"
                (change)="onFileSelected($event)"
                [disabled]="loading()"
                style="display: none;">

              <!-- Input de URL manual (alternativa) -->
              <div class="url-input-container" *ngIf="!imagePreview()">
                <small class="form-hint">ou</small>
                <input
                  type="url"
                  id="foto_url"
                  name="foto_url"
                  [(ngModel)]="foto_url"
                  [disabled]="loading()"
                  class="form-control"
                  placeholder="Cole aqui o link de uma foto (opcional)">
              </div>

              <small class="form-hint">Máximo 5MB. Formatos: JPG, PNG, GIF</small>
            </div>

            <!-- Modal de Câmera -->
            <div class="camera-modal-overlay" *ngIf="showCamera()" (click)="closeCamera()">
              <div class="camera-modal-content" (click)="$event.stopPropagation()">
                <div class="camera-header">
                  <h3>Tirar Foto</h3>
                  <button type="button" class="btn-close" (click)="closeCamera()">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
                <div class="camera-body">
                  <video #cameraVideo autoplay playsinline class="camera-preview"></video>
                  <canvas #cameraCanvas style="display: none;"></canvas>
                </div>
                <div class="camera-footer">
                  <button type="button" class="btn btn-secondary" (click)="closeCamera()">
                    Cancelar
                  </button>
                  <button type="button" class="btn btn-primary" (click)="capturePhoto()">
                    <i class="bi bi-camera-fill"></i>
                    Capturar
                  </button>
                </div>
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
                [disabled]="loading() || !itemForm.valid">
                <app-loading-spinner 
                  *ngIf="loading()" 
                  size="small">
                </app-loading-spinner>
                <span *ngIf="!loading()">Reportar Item</span>
                <span *ngIf="loading()">Reportando...</span>
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

    .form-control::placeholder {
      color: var(--text-muted);
    }

    .form-control:disabled {
      background: var(--bg-tertiary);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.6;
    }

    select.form-control {
      cursor: pointer;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 120px;
    }

    .form-hint {
      display: block;
      margin-top: var(--spacing-xs);
      color: var(--text-muted);
      font-size: var(--font-size-sm);
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

    .image-preview-container {
      position: relative;
      margin-bottom: var(--spacing-sm);
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    .image-preview {
      width: 100%;
      max-height: 300px;
      object-fit: contain;
      display: block;
      background: var(--bg-secondary);
    }

    .btn-remove-image {
      position: absolute;
      top: var(--spacing-xs);
      right: var(--spacing-xs);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-remove-image:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.1);
    }

    .btn-remove-image:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .image-upload-actions {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
    }

    .btn-outline {
      flex: 1;
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: 6px;
      font-size: var(--font-size-base);
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      transition: all var(--transition-fast);
    }

    .btn-outline:hover:not(:disabled) {
      background: var(--bg-secondary);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    .btn-outline:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .url-input-container {
      margin-top: var(--spacing-sm);
    }

    .url-input-container .form-hint {
      display: block;
      text-align: center;
      margin-bottom: var(--spacing-xs);
    }

    .camera-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: var(--spacing-md);
    }

    .camera-modal-content {
      background: var(--bg-card);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .camera-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
    }

    .camera-header h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-lg);
    }

    .camera-body {
      position: relative;
      width: 100%;
      padding: var(--spacing-md);
      display: flex;
      justify-content: center;
      align-items: center;
      background: #000;
    }

    .camera-preview {
      width: 100%;
      max-width: 100%;
      max-height: 60vh;
      object-fit: contain;
    }

    .camera-footer {
      display: flex;
      justify-content: space-between;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class ReportarItemModalComponent implements OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cameraVideo') cameraVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('cameraCanvas') cameraCanvas!: ElementRef<HTMLCanvasElement>;

  private itemService = inject(ItemAchadoPerdidoService);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);

  // Evento emitido quando o item é criado com sucesso
  itemCriado = output<void>();
  // Evento emitido quando o modal é fechado
  fechado = output<void>();

  titulo = '';
  descricao = '';
  tipo: 'achado' | 'perdido' | '' = '';
  foto_url = '';
  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);
  uploadingImage = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  showCamera = signal(false);
  private cameraStream: MediaStream | null = null;

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      return;
    }

    // Valida o tipo de arquivo
    if (!file.type.startsWith('image/')) {
      this.error.set('Por favor, selecione uma imagem válida (JPG, PNG, GIF)');
      return;
    }

    // Valida o tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.error.set('A imagem deve ter no máximo 5MB');
      return;
    }

    this.selectedFile = file;
    this.error.set(null);

    // Cria preview da imagem
    try {
      const base64 = await this.storageService.fileToBase64(file);
      this.imagePreview.set(base64);
      // Limpa a URL manual quando uma imagem é selecionada
      this.foto_url = '';
    } catch (error) {
      this.error.set('Erro ao processar a imagem');
      this.selectedFile = null;
    }
  }

  async takePhoto() {
    try {
      // Verifica se a câmera está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.error.set('Câmera não disponível neste dispositivo');
        return;
      }

      this.showCamera.set(true);
      this.error.set(null);

      // Aguarda o Angular atualizar a view para acessar o elemento de vídeo
      setTimeout(async () => {
        try {
          // Solicita acesso à câmera
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment', // Câmera traseira por padrão
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          });

          this.cameraStream = stream;

          if (this.cameraVideo?.nativeElement) {
            this.cameraVideo.nativeElement.srcObject = stream;
            await this.cameraVideo.nativeElement.play();
          }
        } catch (error: any) {
          this.error.set(error.message || 'Erro ao acessar a câmera. Verifique as permissões.');
          this.showCamera.set(false);
        }
      }, 100);
    } catch (error: any) {
      this.error.set(error.message || 'Erro ao acessar a câmera. Verifique as permissões.');
      this.showCamera.set(false);
    }
  }

  capturePhoto() {
    if (!this.cameraVideo?.nativeElement || !this.cameraCanvas?.nativeElement) {
      return;
    }

    const video = this.cameraVideo.nativeElement;
    const canvas = this.cameraCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    // Define o tamanho do canvas igual ao vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenha o frame atual do vídeo no canvas
    ctx.drawImage(video, 0, 0);

    // Converte canvas para blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Para o stream da câmera
        this.stopCamera();
        
        // Cria um File a partir do blob
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        this.selectedFile = file;
        
        // Cria preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview.set(e.target?.result as string);
          this.foto_url = ''; // Limpa a URL manual
        };
        reader.readAsDataURL(file);
      }
    }, 'image/jpeg', 0.9);
  }

  closeCamera() {
    this.stopCamera();
    this.showCamera.set(false);
  }

  private stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    if (this.cameraVideo?.nativeElement) {
      this.cameraVideo.nativeElement.srcObject = null;
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview.set(null);
    this.foto_url = '';
    
    // Limpa o input de arquivo
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  async onSubmit() {
    if (!this.titulo || !this.descricao || !this.tipo) {
      return;
    }

    const currentUser = this.authService.currentUser();
    
    if (!currentUser?.id_condominio) {
      this.error.set('Você precisa estar associado a um condomínio para reportar itens.');
      return;
    }

    if (!currentUser.verificado) {
      this.error.set('Você precisa estar verificado para reportar itens.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    let fotoUrl = this.foto_url.trim() || undefined;

    // Se houver um arquivo selecionado, faz upload primeiro
    if (this.selectedFile) {
      this.uploadingImage.set(true);
      const uploadResult = await this.storageService.uploadImage(
        'achados-perdidos',
        this.selectedFile,
        'items'
      );

      if (uploadResult.error) {
        this.error.set(uploadResult.error.message || 'Erro ao fazer upload da imagem');
        this.loading.set(false);
        this.uploadingImage.set(false);
        return;
      }

      fotoUrl = uploadResult.data?.url;
      this.uploadingImage.set(false);
    }

    const itemData = {
      titulo: this.titulo.trim(),
      descricao: this.descricao.trim(),
      tipo: this.tipo as 'achado' | 'perdido',
      foto_url: fotoUrl,
      id_usuario: currentUser.id,
      id_condominio: currentUser.id_condominio,
      resolvido: false
    };

    const response = await this.itemService.create(itemData);

    if (response.error) {
      this.error.set(response.error.message || 'Erro ao reportar item');
      this.loading.set(false);
      return;
    }

    // Limpa o formulário
    this.titulo = '';
    this.descricao = '';
    this.tipo = '';
    this.foto_url = '';
    this.selectedFile = null;
    this.imagePreview.set(null);
    this.loading.set(false);
    
    // Emite evento de sucesso e fecha o modal
    this.itemCriado.emit();
    this.fechar();
  }

  fechar() {
    if (!this.loading()) {
      this.stopCamera();
      this.fechado.emit();
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}

