import { Injectable, inject } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../supabase.service';

export interface UploadResponse {
  data: { url: string } | null;
  error: { message: string } | null;
}

/**
 * Serviço para upload de arquivos no Supabase Storage
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private supabaseService = inject(SupabaseService);

  private get client(): SupabaseClient {
    return this.supabaseService.getClient();
  }

  /**
   * Faz upload de uma imagem para o bucket especificado
   * 
   * @param bucket - Nome do bucket (ex: 'achados-perdidos', 'avatars')
   * @param file - Arquivo de imagem a ser enviado
   * @param folder - Pasta opcional dentro do bucket (ex: 'items', 'users')
   * @returns URL pública da imagem ou erro
   */
  async uploadImage(
    bucket: string,
    file: File,
    folder?: string
  ): Promise<UploadResponse> {
    try {
      // Valida o tipo de arquivo
      if (!file.type.startsWith('image/')) {
        return {
          data: null,
          error: { message: 'O arquivo deve ser uma imagem' }
        };
      }

      // Valida o tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return {
          data: null,
          error: { message: 'A imagem deve ter no máximo 5MB' }
        };
      }

      // Gera um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Faz o upload
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // Mensagem mais clara para erro de bucket não encontrado
        if (error.message?.includes('Bucket not found') || 
            error.message?.includes('not found') ||
            error.message?.toLowerCase().includes('bucket')) {
          return {
            data: null,
            error: { 
              message: `Bucket '${bucket}' não encontrado. Execute o script SQL em database/storage-buckets.sql no Supabase para criar os buckets necessários.` 
            }
          };
        }
        
        return {
          data: null,
          error: { message: error.message || 'Erro ao fazer upload da imagem' }
        };
      }

      // Obtém a URL pública
      const { data: urlData } = this.client.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        data: { url: urlData.publicUrl },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message || 'Erro inesperado ao fazer upload' }
      };
    }
  }

  /**
   * Remove uma imagem do storage
   * 
   * @param bucket - Nome do bucket
   * @param filePath - Caminho do arquivo no bucket
   */
  async deleteImage(bucket: string, filePath: string): Promise<{ error: { message: string } | null }> {
    try {
      const { error } = await this.client.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        return { error: { message: error.message || 'Erro ao deletar imagem' } };
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Erro inesperado ao deletar imagem' } };
    }
  }

  /**
   * Converte um arquivo File em base64 (para preview)
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}

