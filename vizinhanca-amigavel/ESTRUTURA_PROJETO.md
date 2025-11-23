# Estrutura do Projeto Vizinhança Amigável

## 📋 Visão Geral

Este documento descreve a estrutura modular e reutilizável do projeto Vizinhança Amigável, uma rede social privada para comunidades locais.

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular baseada em:
- **Angular Standalone Components** (sem módulos tradicionais)
- **Feature-Sliced Architecture** para organização de funcionalidades
- **BaseCrudService** como serviço genérico para operações CRUD
- **Componentes Reutilizáveis** na pasta `shared`

## 📁 Estrutura de Diretórios

```
src/app/
├── core/                          # Funcionalidades core do sistema
│   ├── models/                    # Modelos/Interfaces TypeScript
│   │   ├── usuario.model.ts
│   │   ├── condominio.model.ts
│   │   ├── aviso.model.ts
│   │   ├── encomenda.model.ts
│   │   ├── ajuda-mutua.model.ts
│   │   ├── grupo.model.ts
│   │   ├── mensagem.model.ts
│   │   ├── localizacao-mapa.model.ts
│   │   ├── item-achado-perdido.model.ts
│   │   └── index.ts               # Barrel export
│   ├── services/                  # Serviços de negócio
│   │   ├── base-crud.service.ts   # Serviço genérico CRUD
│   │   ├── auth.service.ts        # Autenticação
│   │   ├── usuario.service.ts
│   │   ├── condominio.service.ts
│   │   ├── aviso.service.ts
│   │   ├── encomenda.service.ts
│   │   ├── ajuda-mutua.service.ts
│   │   ├── grupo.service.ts
│   │   ├── mensagem.service.ts
│   │   ├── localizacao-mapa.service.ts
│   │   └── item-achado-perdido.service.ts
│   ├── guards/                    # Guards de rota
│   │   ├── auth.guard.ts         # Requer autenticação
│   │   └── verification.guard.ts # Requer verificação
│   ├── interfaces/                # Interfaces genéricas
│   │   └── crud.interface.ts
│   └── examples/                  # Exemplos de uso
│       └── crud-examples.ts
│
├── shared/                        # Componentes reutilizáveis
│   └── components/
│       ├── loading-spinner/
│       ├── error-message/
│       ├── card/
│       ├── empty-state/
│       └── index.ts
│
├── features/                      # Features do aplicativo
│   ├── auth/                      # Autenticação
│   │   ├── login/
│   │   ├── signup/
│   │   └── verification/
│   ├── mural/                     # Mural da comunidade
│   │   └── feed/
│   ├── grupos/                    # Grupos de interesse
│   │   └── lista/
│   ├── mensagens/                 # Mensagens diretas
│   │   └── lista-conversas/
│   ├── achados-perdidos/         # Itens achados/perdidos
│   │   └── lista/
│   ├── encomendas/                # Encomendas
│   │   ├── lista/
│   │   ├── criar-encomenda-modal/
│   │   └── detalhes-encomenda-modal/
│   ├── ajuda-mutua/               # Ajuda Mútua
│   │   ├── lista/
│   │   ├── criar-ajuda-mutua-modal/
│   │   └── detalhes-ajuda-mutua-modal/
│   ├── mapa/                      # Mapa colaborativo
│   │   └── mapa-colaborativo/
│   └── perfil/                    # Perfil do usuário
│       └── meu-perfil/
│
├── app.routes.ts                  # Rotas da aplicação
├── app.ts                         # Componente raiz
└── supabase.service.ts            # Serviço Supabase
```

## 🔧 Componentes Principais

### 1. BaseCrudService

Serviço genérico que fornece operações CRUD para qualquer tabela do Supabase:

```typescript
// Exemplo de uso
const response = await this.crudService.findAll<Usuario>('usuario', {
  filters: [
    { column: 'verificado', operator: 'eq', value: true }
  ],
  orderBy: [{ column: 'nome', ascending: true }],
  pagination: { page: 1, pageSize: 10 }
});
```

### 2. Serviços Específicos

Cada feature tem seu próprio serviço que estende o BaseCrudService:

- **UsuarioService**: Gerencia usuários
- **AvisoService**: Gerencia posts do mural
- **GrupoService**: Gerencia grupos de interesse
- **MensagemService**: Gerencia mensagens diretas
- **ItemAchadoPerdidoService**: Gerencia itens achados/perdidos
- **EncomendaService**: Gerencia encomendas
- **AjudaMutuaService**: Gerencia ofertas e pedidos de ajuda mútua
- E outros...

### 3. Componentes Reutilizáveis

Componentes disponíveis em `shared/components`:

- **LoadingSpinnerComponent**: Indicador de carregamento
- **ErrorMessageComponent**: Exibição de erros
- **CardComponent**: Card genérico
- **EmptyStateComponent**: Estado vazio

### 4. Guards

- **authGuard**: Protege rotas que requerem autenticação
- **verificationGuard**: Protege rotas que requerem verificação

## 🗄️ Setup do Banco de Dados

**IMPORTANTE**: Antes de rodar a aplicação, você precisa criar as tabelas no Supabase.

1. Acesse o SQL Editor do Supabase
2. Execute o script `database/schema.sql`
3. Verifique se todas as tabelas foram criadas
4. (Opcional) Execute `database/test-data.sql` para dados de teste

Para mais detalhes, veja `database/README.md`.

## 🚀 Como Usar

### Criando um Novo Serviço

```typescript
import { Injectable, inject } from '@angular/core';
import { BaseCrudService } from '../services/base-crud.service';
import { MeuModelo } from '../models/meu-modelo.model';

@Injectable({ providedIn: 'root' })
export class MeuServico {
  private crudService = inject(BaseCrudService);

  async findAll(): Promise<CrudResponse<MeuModelo[]>> {
    return this.crudService.findAll<MeuModelo>('minha_tabela');
  }
}
```

### Criando um Novo Componente

```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeuServico } from '../../../core/services/meu-servico.service';
import { LoadingSpinnerComponent, ErrorMessageComponent } from '../../../shared/components';

@Component({
  selector: 'app-meu-componente',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <app-loading-spinner *ngIf="loading()" />
    <app-error-message *ngIf="error()" [error]="error()" />
    <!-- Seu conteúdo aqui -->
  `
})
export class MeuComponente {
  private meuServico = inject(MeuServico);
  
  loading = signal(true);
  error = signal<string | null>(null);
  data = signal<MeuModelo[]>([]);

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    const response = await this.meuServico.findAll();
    
    if (response.error) {
      this.error.set(response.error.message);
    } else if (response.data) {
      this.data.set(response.data);
    }
    
    this.loading.set(false);
  }
}
```

## 📊 Modelos de Dados

Todos os modelos estão em `core/models/` e seguem o padrão:

```typescript
export interface MeuModelo {
  id: number | string;
  // campos...
}

export interface MeuModeloCreate {
  // campos necessários para criação
}

export interface MeuModeloUpdate {
  // campos opcionais para atualização
}
```

## 🔐 Autenticação

O `AuthService` gerencia:
- Login/Logout
- Registro de novos usuários
- Estado da sessão
- Verificação de usuário

```typescript
// Injetar o serviço
private authService = inject(AuthService);

// Verificar autenticação
if (this.authService.isAuthenticated()) {
  // usuário autenticado
}

// Obter usuário atual
const user = this.authService.currentUser();
```

## 🛣️ Rotas

As rotas estão configuradas em `app.routes.ts`:

- `/auth/login` - Login
- `/auth/signup` - Cadastro
- `/auth/verification` - Verificação (requer auth)
- `/mural` - Feed do mural (requer verificação)
- `/grupos` - Grupos (requer verificação)
- `/mensagens` - Mensagens (requer verificação)
- `/achados-perdidos` - Achados e Perdidos (requer verificação)
- `/encomendas` - Encomendas (requer verificação)
- `/ajuda-mutua` - Ajuda Mútua (requer verificação)
- `/mapa` - Mapa colaborativo (requer verificação)
- `/perfil` - Perfil do usuário (requer verificação)

## 📝 Próximos Passos

1. **Implementar funcionalidades de verificação**:
   - Upload de comprovante
   - Sistema de convites
   - Envio de código postal

2. **Adicionar mais componentes**:
   - Criar post
   - Criar grupo
   - Chat de mensagens
   - Formulários de criação

3. **Integrar mapa**:
   - Adicionar biblioteca de mapas (Leaflet ou Google Maps)
   - Renderizar pontos no mapa
   - Adicionar novos pontos

4. **Melhorias de UX**:
   - Loading states
   - Animações
   - Notificações
   - Filtros e busca

5. **Realtime**:
   - Atualizações em tempo real do feed
   - Notificações push
   - Chat em tempo real

## 🔄 Padrões e Convenções

1. **Standalone Components**: Todos os componentes são standalone
2. **Signals**: Use signals para estado reativo
3. **Injection**: Use `inject()` ao invés de construtor
4. **Error Handling**: Sempre trate erros e exiba mensagens ao usuário
5. **Loading States**: Sempre mostre estados de carregamento
6. **TypeScript**: Use tipagem forte em todos os lugares

## 📚 Recursos

- [Documentação Angular](https://angular.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [BaseCrudService README](./core/README.md)

