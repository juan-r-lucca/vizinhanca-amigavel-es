# Solução para Erro de Recursão Infinita nas Políticas RLS

## 🔴 Problema

Ao tentar criar uma conta, o erro é retornado:
```json
{
    "code": "42P17",
    "message": "infinite recursion detected in policy for relation \"usuario\""
}
```

## 🔍 Causa

O problema está na política RLS `users_read_same_condominio` que verifica se o usuário existe na própria tabela `usuario` para obter o `id_condominio`. Isso causa recursão infinita porque:

1. Ao tentar inserir um usuário, a política de INSERT verifica se pode ler da tabela `usuario`
2. A política de SELECT tenta verificar se o usuário existe na tabela `usuario`
3. Isso dispara novamente a mesma política de SELECT, criando um loop infinito

**Política problemática:**
```sql
CREATE POLICY "users_read_same_condominio" ON usuario
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      id_condominio = (
        SELECT id_condominio FROM usuario WHERE id = auth.uid()  -- ← Recursão aqui!
      ) OR
      id = auth.uid()
    )
  );
```

## ✅ Solução

Criamos uma função SQL com `SECURITY DEFINER` que pode inserir o usuário sem passar pelas políticas RLS. Esta função executa com privilégios elevados, permitindo contornar a recursão.

### Passo 1: Executar o Script SQL no Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Abra o arquivo `database/fix-usuario-rls.sql`
5. Copie e cole o conteúdo no SQL Editor
6. Clique em **Run** ou pressione `Ctrl+Enter`
7. **AGUARDE 5-10 SEGUNDOS** para o PostgREST atualizar o schema cache

Este script irá:
- Remover a política problemática
- Remover a função antiga se existir
- Criar uma função `create_usuario_profile` que pode inserir usuários sem passar pelas políticas RLS
- Criar uma nova política mais simples que não causa recursão
- Forçar atualização do schema cache do PostgREST

**⚠️ IMPORTANTE:** Após executar o script, aguarde alguns segundos antes de tentar criar uma conta. O PostgREST precisa atualizar o schema cache para encontrar a nova função.

### Passo 2: O Código Já Foi Atualizado

O código TypeScript já foi modificado para usar a função SQL automaticamente. O método `createWithId` agora:
1. Tenta usar a função `create_usuario_profile` primeiro (mais seguro)
2. Se a função não existir, usa inserção direta como fallback

### Passo 3: Testar

Após executar o script SQL:
1. Tente criar uma nova conta novamente
2. O erro de recursão não deve mais ocorrer

## 📋 Arquivos Modificados

1. **`database/fix-usuario-rls.sql`** - Script SQL para corrigir o problema
2. **`src/app/core/services/usuario.service.ts`** - Código atualizado para usar a função SQL

## 🔧 Como Funciona a Solução

A função `create_usuario_profile` usa `SECURITY DEFINER`, o que significa que ela executa com os privilégios do criador da função (geralmente um administrador), não com os privilégios do usuário que a chama. Isso permite:

1. Contornar as políticas RLS durante a inserção
2. Evitar a recursão infinita
3. Manter a segurança, pois a função valida que o `id` corresponde ao `auth.uid()`

## ⚠️ Importante

- A função SQL **deve ser executada** no Supabase antes de tentar criar contas
- Se a função não existir, o código tentará usar inserção direta (fallback), mas isso ainda pode falhar se houver outras políticas RLS problemáticas
- Após executar o script, todas as novas contas serão criadas usando a função SQL

## 🐛 Troubleshooting

### Erro "Could not find the function" (PGRST202)

Este erro indica que o PostgREST não encontrou a função no schema cache. Siga estes passos:

1. **Verifique se a função foi criada:**
   - Execute o script `database/verificar-funcao.sql` no SQL Editor
   - Se a função não aparecer, execute novamente o `fix-usuario-rls.sql`

2. **Aguarde o cache atualizar:**
   - O PostgREST atualiza o schema cache automaticamente, mas pode levar alguns segundos
   - Aguarde 5-10 segundos após executar o script SQL
   - Tente novamente criar uma conta

3. **Forçar atualização do cache:**
   - O script já inclui `NOTIFY pgrst, 'reload schema';` que força a atualização
   - Se ainda não funcionar, você pode tentar reiniciar o projeto Supabase (não recomendado em produção)

4. **Verificar se a função está no schema correto:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'create_usuario_profile';
   ```
   - Deve retornar uma linha com `pronamespace` correspondente ao schema `public`

### Erro persiste após executar o script

1. Verifique se a função foi criada corretamente usando `database/verificar-funcao.sql`

2. Verifique se as permissões estão corretas:
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.routine_privileges 
   WHERE routine_name = 'create_usuario_profile';
   ```

3. Tente executar o script novamente, garantindo que não há erros

### Fallback para inserção direta

Se a função não for encontrada, o código automaticamente tenta inserção direta. No entanto:
- Isso ainda pode falhar se houver políticas RLS problemáticas
- O ideal é sempre usar a função SQL para evitar recursão

### Erro de permissão

- Verifique se a função tem `GRANT EXECUTE` para `authenticated` e `anon`
- Execute novamente as linhas de `GRANT` do script SQL

