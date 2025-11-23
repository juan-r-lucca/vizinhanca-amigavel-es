# Módulo CRUD para Supabase

Este módulo fornece uma solução genérica e reutilizável para realizar operações CRUD (Create, Read, Update, Delete) em qualquer tabela do Supabase, com suporte a filtros, ordenação, paginação e contagem.

## 📋 Índice

- [Instalação](#instalação)
- [Estrutura do Módulo](#estrutura-do-módulo)
- [Guia de Uso](#guia-de-uso)
- [API Reference](#api-reference)
- [Exemplos](#exemplos)
- [Tipos e Interfaces](#tipos-e-interfaces)
- [Melhores Práticas](#melhores-práticas)

## 🚀 Instalação

O módulo já está configurado no projeto. Certifique-se de que as seguintes dependências estão instaladas:

```bash
npm install @supabase/supabase-js
```

## 📁 Estrutura do Módulo

```
src/app/core/
├── interfaces/
│   └── crud.interface.ts      # Interfaces e tipos TypeScript
├── services/
│   └── base-crud.service.ts   # Serviço genérico de CRUD
├── examples/
│   └── crud-examples.ts        # Exemplos de uso
└── README.md                   # Esta documentação
```

## 🎯 Guia de Uso

### 1. Injetar o Serviço

```typescript
import { Component, inject } from '@angular/core';
import { BaseCrudService } from './core/services/base-crud.service';

@Component({
  selector: 'app-example',
  standalone: true,
  template: `...`
})
export class ExampleComponent {
  private crudService = inject(BaseCrudService);

  async loadData() {
    // Usar o serviço aqui
  }
}
```

### 2. Definir Interfaces TypeScript

Para ter tipagem completa, defina interfaces para seus modelos:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  created_at: string;
}
```

### 3. Operações Básicas

#### Buscar Todos os Registros

```typescript
const response = await this.crudService.findAll<User>('users');

if (response.error) {
  console.error('Erro:', response.error);
  return;
}

console.log('Usuários:', response.data);
```

#### Buscar por ID

```typescript
const response = await this.crudService.findById<User>('users', '123');

if (response.data) {
  console.log('Usuário:', response.data);
}
```

#### Criar Registro

```typescript
const newUser = {
  name: 'João Silva',
  email: 'joao@example.com',
  active: true
};

const response = await this.crudService.create<User>('users', newUser);

if (response.data) {
  console.log('Usuário criado:', response.data);
}
```

#### Atualizar Registro

```typescript
const updates = {
  name: 'João Silva Atualizado'
};

const response = await this.crudService.update<User>('users', '123', updates);
```

#### Deletar Registro

```typescript
const response = await this.crudService.delete<User>('users', '123');
```

## 🔍 Filtros

### Operadores Disponíveis

- `eq` - Igual a
- `neq` - Diferente de
- `gt` - Maior que
- `gte` - Maior ou igual a
- `lt` - Menor que
- `lte` - Menor ou igual a
- `like` - Busca case-sensitive
- `ilike` - Busca case-insensitive
- `is` - É nulo/não nulo
- `in` - Está em uma lista
- `contains` - Contém (para arrays)
- `textSearch` - Busca de texto completo

### Exemplos de Filtros

```typescript
// Filtro simples
const response = await this.crudService.findAll<User>('users', {
  filters: [
    { column: 'active', operator: 'eq', value: true }
  ]
});

// Múltiplos filtros (AND)
const response = await this.crudService.findAll<Product>('products', {
  filters: [
    { column: 'price', operator: 'gt', value: 100 },
    { column: 'stock', operator: 'gt', value: 0 }
  ]
});

// Busca de texto
const response = await this.crudService.findAll<Product>('products', {
  filters: [
    { column: 'name', operator: 'ilike', value: '%notebook%' }
  ]
});
```

## 📄 Ordenação

```typescript
const response = await this.crudService.findAll<User>('users', {
  orderBy: [
    { column: 'created_at', ascending: false }, // Mais recentes primeiro
    { column: 'name', ascending: true }        // Depois por nome
  ]
});
```

## 📊 Paginação

### Opção 1: Por Página

```typescript
const response = await this.crudService.findAll<User>('users', {
  pagination: {
    page: 1,
    pageSize: 10
  }
});
```

### Opção 2: Por Offset/Limit

```typescript
const response = await this.crudService.findAll<User>('users', {
  pagination: {
    offset: 0,
    limit: 10
  }
});
```

### Com Contagem

```typescript
const response = await this.crudService.findAll<User>('users', {
  pagination: {
    page: 1,
    pageSize: 10
  },
  count: 'exact'
});

console.log('Total de registros:', response.count);
```

## 🔄 Operações em Lote

### Criar Múltiplos Registros

```typescript
const users = [
  { name: 'João', email: 'joao@example.com' },
  { name: 'Maria', email: 'maria@example.com' }
];

const response = await this.crudService.createMany<User>('users', users);
```

### Atualizar Múltiplos Registros

```typescript
const filters = [
  { column: 'active', operator: 'eq', value: false }
];

const updates = {
  active: true
};

const response = await this.crudService.updateMany<User>('users', filters, updates);
```

### Deletar Múltiplos Registros

```typescript
const filters = [
  { column: 'active', operator: 'eq', value: false }
];

const response = await this.crudService.deleteMany<User>('users', filters);
```

## 📚 API Reference

### BaseCrudService

#### `findAll<T>(tableName: string, options?: QueryOptions): Promise<CrudResponse<T[]>>`

Busca todos os registros de uma tabela.

**Parâmetros:**
- `tableName`: Nome da tabela no Supabase
- `options`: Opções de consulta (filtros, ordenação, paginação)

**Retorna:** Promise com array de dados e possíveis erros

#### `findById<T>(tableName: string, id: string | number, select?: string): Promise<CrudResponse<T>>`

Busca um registro por ID.

**Parâmetros:**
- `tableName`: Nome da tabela
- `id`: ID do registro
- `select`: Colunas a serem selecionadas (opcional)

**Retorna:** Promise com o dado e possíveis erros

#### `create<T>(tableName: string, data: Partial<T>, select?: string): Promise<CrudResponse<T>>`

Cria um novo registro.

**Parâmetros:**
- `tableName`: Nome da tabela
- `data`: Dados do novo registro
- `select`: Colunas a serem retornadas (opcional)

**Retorna:** Promise com o dado criado e possíveis erros

#### `createMany<T>(tableName: string, data: Partial<T>[], select?: string): Promise<CrudResponse<T[]>>`

Cria múltiplos registros.

**Parâmetros:**
- `tableName`: Nome da tabela
- `data`: Array de dados
- `select`: Colunas a serem retornadas (opcional)

**Retorna:** Promise com os dados criados e possíveis erros

#### `update<T>(tableName: string, id: string | number, data: Partial<T>, select?: string): Promise<CrudResponse<T>>`

Atualiza um registro por ID.

**Parâmetros:**
- `tableName`: Nome da tabela
- `id`: ID do registro
- `data`: Dados a serem atualizados
- `select`: Colunas a serem retornadas (opcional)

**Retorna:** Promise com o dado atualizado e possíveis erros

#### `updateMany<T>(tableName: string, filters: FilterOptions[], data: Partial<T>, select?: string): Promise<CrudResponse<T[]>>`

Atualiza múltiplos registros baseado em filtros.

**Parâmetros:**
- `tableName`: Nome da tabela
- `filters`: Filtros para identificar os registros
- `data`: Dados a serem atualizados
- `select`: Colunas a serem retornadas (opcional)

**Retorna:** Promise com os dados atualizados e possíveis erros

#### `delete<T>(tableName: string, id: string | number): Promise<CrudResponse<T>>`

Deleta um registro por ID.

**Parâmetros:**
- `tableName`: Nome da tabela
- `id`: ID do registro

**Retorna:** Promise com o dado deletado e possíveis erros

#### `deleteMany<T>(tableName: string, filters: FilterOptions[]): Promise<CrudResponse<T[]>>`

Deleta múltiplos registros baseado em filtros.

**Parâmetros:**
- `tableName`: Nome da tabela
- `filters`: Filtros para identificar os registros

**Retorna:** Promise com os dados deletados e possíveis erros

## 📝 Exemplos Completos

Veja o arquivo `examples/crud-examples.ts` para exemplos detalhados de todas as funcionalidades.

## 🎨 Tipos e Interfaces

### CrudResponse<T>

```typescript
interface CrudResponse<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}
```

### QueryOptions

```typescript
interface QueryOptions {
  select?: string;
  filters?: FilterOptions[];
  orderBy?: OrderOptions[];
  pagination?: PaginationOptions;
  count?: boolean | 'exact' | 'planned' | 'estimated';
}
```

### FilterOptions

```typescript
interface FilterOptions {
  column: string;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'is' | 'in' | 'contains' | 'containedBy' | 'rangeGt' | 'rangeGte' | 'rangeLt' | 'rangeLte' | 'rangeAdjacent' | 'overlaps' | 'textSearch' | 'match';
  value: any;
}
```

### OrderOptions

```typescript
interface OrderOptions {
  column: string;
  ascending?: boolean;
}
```

### PaginationOptions

```typescript
interface PaginationOptions {
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
}
```

## ✅ Melhores Práticas

1. **Sempre verifique erros**: Sempre verifique `response.error` antes de usar `response.data`

2. **Use TypeScript**: Defina interfaces para seus modelos para ter tipagem completa

3. **Tratamento de erros**: Implemente tratamento de erros adequado em seus componentes

4. **Paginação**: Use paginação para grandes volumes de dados

5. **Seleção de colunas**: Use `select` para buscar apenas as colunas necessárias

6. **Validação**: Valide dados antes de criar ou atualizar registros

### Exemplo de Tratamento de Erros

```typescript
async loadUsers() {
  try {
    const response = await this.crudService.findAll<User>('users');
    
    if (response.error) {
      // Tratar erro específico
      this.handleError(response.error);
      return;
    }
    
    if (response.data) {
      this.users = response.data;
    }
  } catch (error) {
    // Tratar erros inesperados
    console.error('Erro inesperado:', error);
  }
}

private handleError(error: Error) {
  // Implementar lógica de tratamento de erro
  // Por exemplo: mostrar notificação, log, etc.
  console.error('Erro ao carregar usuários:', error.message);
}
```

## 🔧 Configuração

O serviço usa automaticamente as credenciais configuradas em `src/enviroments/enviroments.ts` através do `SupabaseService`.

Certifique-se de que as variáveis estão configuradas corretamente:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://seu-projeto.supabase.co',
  supabaseKey: 'sua-chave-anon'
};
```

## 📖 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Angular Documentation](https://angular.io/docs)

## 🐛 Troubleshooting

### Erro: "relation does not exist"
- Verifique se o nome da tabela está correto
- Certifique-se de que a tabela existe no seu projeto Supabase

### Erro: "new row violates row-level security policy"
- Verifique as políticas RLS (Row Level Security) no Supabase
- Certifique-se de que o usuário tem permissão para a operação

### Erro: "column does not exist"
- Verifique se os nomes das colunas estão corretos
- Certifique-se de que as colunas existem na tabela

## 📄 Licença

Este módulo faz parte do projeto vizinhanca-amigavel.

