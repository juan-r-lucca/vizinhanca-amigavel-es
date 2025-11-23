# 🚨 Instruções Rápidas - Corrigir Erro de Recursão

## Problema Atual
Você está recebendo dois erros:
1. **PGRST202**: Função não encontrada no cache do PostgREST
2. **42P17**: Recursão infinita nas políticas RLS

## ✅ Solução Rápida

### Passo 1: Executar Script SQL Completo

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Abra o arquivo `database/fix-usuario-rls-completo.sql`
5. **Copie TODO o conteúdo** do arquivo
6. Cole no SQL Editor do Supabase
7. Clique em **Run** (ou `Ctrl+Enter`)
8. **AGUARDE 15-20 SEGUNDOS** ⏰

### Passo 2: Verificar se Funcionou

1. Role até o final do resultado do script
2. Você deve ver 3 seções de resultados:
   - Políticas criadas (deve mostrar 3 políticas)
   - Função criada (deve mostrar a função `create_usuario_profile`)
   - Permissões da função (deve mostrar `authenticated` e `anon`)

### Passo 3: Testar

1. Aguarde mais 10 segundos
2. Tente criar uma conta novamente
3. Deve funcionar agora! ✅

## ⚠️ Se Ainda Não Funcionar

### Verificar se a função existe:
Execute no SQL Editor:
```sql
SELECT proname FROM pg_proc WHERE proname = 'create_usuario_profile';
```
- Se retornar vazio, execute o script novamente
- Se retornar a função, aguarde mais tempo e tente novamente

### Verificar se as políticas foram criadas:
Execute no SQL Editor:
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'usuario';
```
- Deve retornar: `users_read_same_condominio`, `users_insert_own`, `users_update_own`

## 📝 Notas Importantes

- O script `fix-usuario-rls-completo.sql` é a versão **COMPLETA** que corrige tanto a recursão quanto cria a função
- Use este script, não o `fix-usuario-rls.sql` antigo
- Sempre aguarde 15-20 segundos após executar scripts SQL no Supabase
- O PostgREST precisa atualizar o schema cache antes de encontrar novas funções

