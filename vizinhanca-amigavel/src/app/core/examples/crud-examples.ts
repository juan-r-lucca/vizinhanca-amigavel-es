/**
 * Exemplos de uso do BaseCrudService
 * 
 * Este arquivo contém exemplos práticos de como usar o BaseCrudService
 * para realizar operações CRUD em tabelas do Supabase.
 */

import { BaseCrudService } from '../services/base-crud.service';

// Interface de exemplo para um modelo User
interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  created_at: string;
}

// Interface de exemplo para um modelo Product
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

/**
 * Exemplos de uso do BaseCrudService
 */
export class CrudExamples {
  constructor(private crudService: BaseCrudService) {}

  /**
   * EXEMPLO 1: Buscar todos os registros
   */
  async example1_FindAll() {
    // Buscar todos os usuários
    const response = await this.crudService.findAll<User>('users');

    if (response.error) {
      console.error('Erro ao buscar usuários:', response.error);
      return;
    }

    console.log('Usuários encontrados:', response.data);
  }

  /**
   * EXEMPLO 2: Buscar com filtros
   */
  async example2_FindWithFilters() {
    // Buscar apenas usuários ativos
    const response = await this.crudService.findAll<User>('users', {
      filters: [
        { column: 'active', operator: 'eq', value: true }
      ]
    });

    if (response.error) {
      console.error('Erro:', response.error);
      return;
    }

    console.log('Usuários ativos:', response.data);
  }

  /**
   * EXEMPLO 3: Buscar com múltiplos filtros e ordenação
   */
  async example3_FindWithMultipleFilters() {
    // Buscar produtos com preço maior que 100, ordenados por nome
    const response = await this.crudService.findAll<Product>('products', {
      filters: [
        { column: 'price', operator: 'gt', value: 100 },
        { column: 'stock', operator: 'gt', value: 0 }
      ],
      orderBy: [
        { column: 'name', ascending: true }
      ]
    });

    if (response.error) {
      console.error('Erro:', response.error);
      return;
    }

    console.log('Produtos encontrados:', response.data);
  }

  /**
   * EXEMPLO 4: Buscar com paginação
   */
  async example4_FindWithPagination() {
    // Buscar usuários com paginação (página 1, 10 itens por página)
    const response = await this.crudService.findAll<User>('users', {
      pagination: {
        page: 1,
        pageSize: 10
      },
      orderBy: [
        { column: 'created_at', ascending: false }
      ]
    });

    if (response.error) {
      console.error('Erro:', response.error);
      return;
    }

    console.log('Usuários (página 1):', response.data);
    console.log('Total de registros:', response.count);
  }

  /**
   * EXEMPLO 5: Buscar por ID
   */
  async example5_FindById() {
    // Buscar um usuário específico
    const response = await this.crudService.findById<User>('users', '123');

    if (response.error) {
      console.error('Erro:', response.error);
      return;
    }

    console.log('Usuário encontrado:', response.data);
  }

  /**
   * EXEMPLO 6: Criar um novo registro
   */
  async example6_Create() {
    // Criar um novo usuário
    const newUser = {
      name: 'João Silva',
      email: 'joao@example.com',
      active: true
    };

    const response = await this.crudService.create<User>('users', newUser);

    if (response.error) {
      console.error('Erro ao criar usuário:', response.error);
      return;
    }

    console.log('Usuário criado:', response.data);
  }

  /**
   * EXEMPLO 7: Criar múltiplos registros
   */
  async example7_CreateMany() {
    // Criar múltiplos produtos
    const newProducts = [
      { name: 'Produto 1', price: 99.99, category: 'Eletrônicos', stock: 10 },
      { name: 'Produto 2', price: 149.99, category: 'Roupas', stock: 5 },
      { name: 'Produto 3', price: 79.99, category: 'Livros', stock: 20 }
    ];

    const response = await this.crudService.createMany<Product>('products', newProducts);

    if (response.error) {
      console.error('Erro ao criar produtos:', response.error);
      return;
    }

    console.log('Produtos criados:', response.data);
  }

  /**
   * EXEMPLO 8: Atualizar um registro
   */
  async example8_Update() {
    // Atualizar um usuário
    const updates = {
      name: 'João Silva Atualizado',
      active: false
    };

    const response = await this.crudService.update<User>('users', '123', updates);

    if (response.error) {
      console.error('Erro ao atualizar usuário:', response.error);
      return;
    }

    console.log('Usuário atualizado:', response.data);
  }

  /**
   * EXEMPLO 9: Atualizar múltiplos registros
   */
  async example9_UpdateMany() {
    // Atualizar todos os produtos de uma categoria
    const filters = [
      { column: 'category', operator: 'eq' as const, value: 'Eletrônicos' }
    ];

    const updates = {
      price: 0.9 // Aplicar desconto de 10%
    };

    const response = await this.crudService.updateMany<Product>(
      'products',
      filters,
      updates
    );

    if (response.error) {
      console.error('Erro ao atualizar produtos:', response.error);
      return;
    }

    console.log('Produtos atualizados:', response.data);
  }

  /**
   * EXEMPLO 10: Deletar um registro
   */
  async example10_Delete() {
    // Deletar um usuário
    const response = await this.crudService.delete<User>('users', '123');

    if (response.error) {
      console.error('Erro ao deletar usuário:', response.error);
      return;
    }

    console.log('Usuário deletado:', response.data);
  }

  /**
   * EXEMPLO 11: Deletar múltiplos registros
   */
  async example11_DeleteMany() {
    // Deletar todos os produtos sem estoque
    const filters = [
      { column: 'stock', operator: 'eq' as const, value: 0 }
    ];

    const response = await this.crudService.deleteMany<Product>('products', filters);

    if (response.error) {
      console.error('Erro ao deletar produtos:', response.error);
      return;
    }

    console.log('Produtos deletados:', response.data);
  }

  /**
   * EXEMPLO 12: Buscar com filtros avançados
   */
  async example12_AdvancedFilters() {
    // Buscar produtos com preço entre 50 e 200, ordenados por preço
    const response = await this.crudService.findAll<Product>('products', {
      filters: [
        { column: 'price', operator: 'gte' as const, value: 50 },
        { column: 'price', operator: 'lte' as const, value: 200 }
      ],
      orderBy: [
        { column: 'price', ascending: true }
      ],
      select: 'id, name, price, category'
    });

    if (response.error) {
      console.error('Erro:', response.error);
      return;
    }

    console.log('Produtos encontrados:', response.data);
  }

  /**
   * EXEMPLO 13: Buscar com busca de texto
   */
  async example13_TextSearch() {
    // Buscar produtos cujo nome contenha "notebook"
    const response = await this.crudService.findAll<Product>('products', {
      filters: [
        { column: 'name', operator: 'ilike', value: '%notebook%' }
      ]
    });

    if (response.error) {
      console.error('Erro:', response.error);
      return;
    }

    console.log('Produtos encontrados:', response.data);
  }

  /**
   * EXEMPLO 14: Buscar com contagem
   */
  async example14_Count() {
    // Buscar usuários ativos com contagem total
    const response = await this.crudService.findAll<User>('users', {
      filters: [
        { column: 'active', operator: 'eq', value: true }
      ],
      count: 'exact'
    });

    if (response.error) {
      console.error('Erro:', response.error);
      return;
    }

    console.log('Usuários ativos:', response.data);
    console.log('Total de usuários ativos:', response.count);
  }
}

