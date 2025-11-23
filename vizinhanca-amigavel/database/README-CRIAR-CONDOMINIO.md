# Como Criar um Condomínio e Associar o Usuário

Existem duas formas de criar um condomínio e associar você (usuário atual) a ele:

## Opção 1: Via Script SQL (Recomendado)

Esta é a forma mais rápida e direta. O script SQL detecta automaticamente o usuário atual e faz a associação.

### Passos:

1. **Faça login na aplicação** (importante: você precisa estar autenticado)

2. **Acesse o Supabase Dashboard**:
   - Vá para: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto
   - Vá para **SQL Editor**

3. **Execute o script**:
   - Abra o arquivo `database/create-condominio-and-associate-user.sql`
   - Copie o conteúdo do script
   - Cole no SQL Editor do Supabase
   - Clique em **Run** (ou pressione Ctrl+Enter)

4. **Verifique se funcionou**:
   - O script vai mostrar mensagens de sucesso
   - Você pode verificar executando a query de verificação no final do script

### O script faz:
- ✅ Detecta automaticamente seu usuário (via `auth.uid()`)
- ✅ Cria um condomínio chamado "Minha Comunidade"
- ✅ Associa você ao condomínio criado
- ✅ Marca você como verificado

### Personalizar o condomínio:

Se quiser criar um condomínio com dados específicos, use a versão alternativa no script (está comentada no final do arquivo SQL). Basta editar os valores antes de executar.

---

## Opção 2: Via Código TypeScript (Programática)

Se preferir fazer via código da aplicação, você pode usar o método `createAndAssociate` do `CondominioService`.

### Exemplo de uso no console do navegador:

1. **Abra o DevTools** (F12)
2. **Vá para a aba Console**
3. **Execute o seguinte código**:

```typescript
// Obter o serviço do Angular
const injector = (window as any).ng?.getInjector?.();
if (!injector) {
  console.error('Angular não encontrado. Certifique-se de estar na aplicação Angular.');
} else {
  const condominioService = injector.get('CondominioService');
  
  condominioService.createAndAssociate({
    nome: 'Minha Comunidade',
    endereco: 'Rua Exemplo, 123',
    cep: '12345-678',
    cidade: 'São Paulo',
    estado: 'SP'
  }).then(result => {
    if (result.error) {
      console.error('Erro:', result.error.message);
    } else {
      console.log('✅ Condomínio criado com sucesso!');
      console.log('Condomínio:', result.data?.condominio);
      console.log('Usuário atualizado:', result.data?.usuarioAtualizado);
      // Recarregue a página para ver as mudanças
      window.location.reload();
    }
  });
}
```

### Ou crie um componente/script temporário:

Você pode criar um componente temporário ou adicionar um botão de teste em algum lugar da aplicação:

```typescript
import { Component, inject } from '@angular/core';
import { CondominioService } from '../../../core/services/condominio.service';

@Component({
  selector: 'app-test-condominio',
  template: `
    <button (click)="criarCondominio()">Criar Condomínio de Teste</button>
  `
})
export class TestCondominioComponent {
  private condominioService = inject(CondominioService);

  async criarCondominio() {
    const response = await this.condominioService.createAndAssociate({
      nome: 'Minha Comunidade',
      endereco: 'Rua Exemplo, 123',
      cep: '12345-678',
      cidade: 'São Paulo',
      estado: 'SP'
    });

    if (response.error) {
      alert('Erro: ' + response.error.message);
    } else {
      alert('Condomínio criado com sucesso!');
      window.location.reload();
    }
  }
}
```

---

## Verificar se deu certo

Após criar o condomínio, você pode verificar se tudo está correto de duas formas:

### 1. Via SQL:

```sql
SELECT 
  u.id,
  u.nome,
  u.email,
  u.id_condominio,
  u.verificado,
  c.nome as nome_condominio,
  c.endereco
FROM usuario u
LEFT JOIN condominio c ON u.id_condominio = c.id
WHERE u.id = auth.uid();
```

### 2. Via aplicação:

- Faça logout e login novamente
- Verifique se você pode ver grupos, avisos, etc. (estes recursos requerem um condomínio)
- Vá para a página de perfil e verifique se o condomínio aparece

---

## Troubleshooting

### Erro: "Nenhum usuário autenticado"
- Certifique-se de estar logado na aplicação antes de executar o script SQL
- Para scripts SQL, você precisa ter uma sessão ativa no Supabase

### Erro: "Usuário não encontrado na tabela usuario"
- Registre-se primeiro na aplicação
- O script SQL só funciona se você já tiver um registro na tabela `usuario`

### Erro de permissão RLS
- Verifique se as políticas RLS estão configuradas corretamente
- O script usa `auth.uid()` que deve funcionar mesmo com RLS ativado

### O condomínio foi criado mas o usuário não foi associado
- Verifique se há erros no console
- Tente executar manualmente: `UPDATE usuario SET id_condominio = <ID_DO_CONDOMINIO> WHERE id = auth.uid();`

---

## Próximos Passos

Após criar e associar o condomínio:

1. ✅ Você poderá criar grupos
2. ✅ Você poderá criar avisos no mural
3. ✅ Você poderá usar todos os recursos da aplicação que requerem um condomínio
4. ✅ Outros usuários podem se associar ao mesmo condomínio (se você compartilhar o ID)

