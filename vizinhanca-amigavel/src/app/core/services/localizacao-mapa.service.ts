import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { LocalizacaoMapa, LocalizacaoMapaCreate, LocalizacaoMapaUpdate } from '../models/localizacao-mapa.model';
import { CrudResponse } from '../interfaces/crud.interface';

/**
 * Serviço de Localizações no Mapa
 * Gerencia operações relacionadas ao mapa colaborativo
 */
@Injectable({
  providedIn: 'root'
})
export class LocalizacaoMapaService {
  private crudService = inject(BaseCrudService);

  /**
   * Busca todas as localizações
   */
  async findAll(options?: any): Promise<CrudResponse<LocalizacaoMapa[]>> {
    return this.crudService.findAll<LocalizacaoMapa>('localizacao_mapa', {
      ...options,
      select: options?.select || '*, usuario:usuario(id, nome)',
      orderBy: options?.orderBy || [{ column: 'votos', ascending: false }, { column: 'data_criacao', ascending: false }]
    });
  }

  /**
   * Busca localização por ID
   */
  async findById(id: number): Promise<CrudResponse<LocalizacaoMapa>> {
    return this.crudService.findById<LocalizacaoMapa>('localizacao_mapa', id, '*, usuario:usuario(id, nome)');
  }

  /**
   * Cria uma nova localização
   */
  async create(data: LocalizacaoMapaCreate): Promise<CrudResponse<LocalizacaoMapa>> {
    const localizacaoData = {
      ...data,
      votos: 0
    };
    return this.crudService.create<LocalizacaoMapa>('localizacao_mapa', localizacaoData);
  }

  /**
   * Atualiza uma localização
   */
  async update(id: number, data: LocalizacaoMapaUpdate): Promise<CrudResponse<LocalizacaoMapa>> {
    return this.crudService.update<LocalizacaoMapa>('localizacao_mapa', id, data);
  }

  /**
   * Deleta uma localização
   */
  async delete(id: number): Promise<CrudResponse<LocalizacaoMapa>> {
    return this.crudService.delete<LocalizacaoMapa>('localizacao_mapa', id);
  }

  /**
   * Busca localizações por condomínio
   */
  async findByCondominio(idCondominio: number): Promise<CrudResponse<LocalizacaoMapa[]>> {
    return this.findAll({
      filters: [
        { column: 'id_condominio', operator: 'eq', value: idCondominio }
      ]
    });
  }

  /**
   * Busca por tipo
   */
  async findByTipo(tipo: 'ponto_interesse' | 'problema', idCondominio: number): Promise<CrudResponse<LocalizacaoMapa[]>> {
    return this.findAll({
      filters: [
        { column: 'tipo', operator: 'eq', value: tipo },
        { column: 'id_condominio', operator: 'eq', value: idCondominio }
      ]
    });
  }

  /**
   * Incrementa votos de uma localização
   */
  async incrementVotos(id: number): Promise<CrudResponse<LocalizacaoMapa>> {
    const response = await this.findById(id);
    if (response.error || !response.data) {
      return response;
    }

    const currentVotos = response.data.votos || 0;
    return this.update(id, { votos: currentVotos + 1 });
  }

  /**
   * Busca localizações próximas a uma coordenada
   */
  async findProximas(latitude: number, longitude: number, raioKm: number = 1): Promise<CrudResponse<LocalizacaoMapa[]>> {
    // Este método requer cálculo de distância no banco
    // Por enquanto, retorna todas e filtra no frontend
    // Em produção, use PostGIS ou função customizada
    return this.findAll();
  }
}

