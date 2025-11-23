/**
 * Interface genérica para operações CRUD
 */
export interface CrudResponse<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

/**
 * Interface para opções de paginação
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
}

/**
 * Interface para opções de filtro
 */
export interface FilterOptions {
  column: string;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'is' | 'in' | 'contains' | 'containedBy' | 'rangeGt' | 'rangeGte' | 'rangeLt' | 'rangeLte' | 'rangeAdjacent' | 'overlaps' | 'textSearch' | 'match';
  value: any;
}

/**
 * Interface para ordenação
 */
export interface OrderOptions {
  column: string;
  ascending?: boolean;
}

/**
 * Interface para opções de busca
 */
export interface QueryOptions {
  select?: string;
  filters?: FilterOptions[];
  orderBy?: OrderOptions[];
  pagination?: PaginationOptions;
  count?: boolean | 'exact' | 'planned' | 'estimated';
}

