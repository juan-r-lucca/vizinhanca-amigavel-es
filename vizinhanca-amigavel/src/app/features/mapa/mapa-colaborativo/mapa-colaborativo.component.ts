import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LocalizacaoMapaService } from '../../../core/services/localizacao-mapa.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

/**
 * Componente de Mapa Colaborativo
 */
@Component({
  selector: 'app-mapa-colaborativo',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="mapa-container">
      <h1>Mapa Colaborativo</h1>

      <app-loading-spinner 
        *ngIf="loading()" 
        message="Carregando mapa...">
      </app-loading-spinner>

      <app-error-message 
        *ngIf="error() && !loading()" 
        [error]="error()">
      </app-error-message>

      <div class="mapa-placeholder" *ngIf="!loading() && !error()">
        <p>Mapa será implementado com integração de biblioteca de mapas (ex: Leaflet ou Google Maps)</p>
        <p>Por enquanto, este é um placeholder.</p>
      </div>
    </div>
  `,
  styles: [`
    .mapa-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    h1 {
      margin: 0 0 2rem 0;
      color: #333;
    }

    .mapa-placeholder {
      background: #f5f5f5;
      border: 2px dashed #ddd;
      border-radius: 8px;
      padding: 4rem 2rem;
      text-align: center;
      color: #666;
    }

    .mapa-placeholder p {
      margin: 0.5rem 0;
    }
  `]
})
export class MapaColaborativoComponent implements OnInit {
  private localizacaoService = inject(LocalizacaoMapaService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  loading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // TODO: Implementar carregamento de localizações e renderização do mapa
    }
    this.loading.set(false);
  }
}

