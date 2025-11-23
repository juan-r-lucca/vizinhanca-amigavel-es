# Setup do Banco de Dados - Vizinhança Amigável

## 📋 Pré-requisitos

1. Ter um projeto criado no Supabase
2. Ter as credenciais do projeto (URL e anon key) configuradas no arquivo `src/enviroments/enviroments.ts`

## 🚀 Como Configurar o Banco de Dados

### Passo 1: Acessar o SQL Editor do Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Executar o Script SQL

1. Abra o arquivo `database/schema.sql` deste projeto
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** ou pressione `Ctrl+Enter` (Windows/Linux) ou `Cmd+Enter` (Mac)

### Passo 3: Verificar as Tabelas

1. No menu lateral, clique em **Table Editor**
2. Você deve ver todas as tabelas criadas:
   - `condominio`
   - `usuario`
   - `aviso`
   - `encomenda`
   - `ajuda_mutua`
   - `grupo`
   - `grupo_membro`
   - `mensagem`
   - `localizacao_mapa`
   - `item_achado_perdido`

### Passo 4: Configurar Storage Buckets (Opcional)

Para upload de imagens, você precisará criar os seguintes buckets no Supabase:

1. Vá em **Storage** no menu lateral
2. Crie os seguintes buckets:

   **Bucket: `avatars`**
   - Público: ✅ Sim
   - Política: Permitir leitura pública

   **Bucket: `posts`**
   - Público: ✅ Sim
   - Política: Permitir leitura pública

   **Bucket: `verificacao`**
   - Público: ❌ Não
   - Política: Apenas o próprio usuário pode fazer upload

   **Bucket: `achados-perdidos`**
   - Público: ✅ Sim
   - Política: Permitir leitura pública

## 🔐 Segurança (RLS)

O script já configura Row Level Security (RLS) em todas as tabelas. As políticas garantem que:

- Usuários só veem dados do mesmo condomínio
- Apenas usuários verificados podem criar conteúdo
- Usuários só podem editar/deletar seus próprios registros
- Mensagens são privadas entre usuários

## 📝 Notas Importantes

1. **ID do Usuário**: A tabela `usuario` usa o UUID do `auth.users` do Supabase como chave primária. Isso significa que quando um usuário se registra via Supabase Auth, o mesmo ID deve ser usado na tabela `usuario`.

2. **Verificação**: Por padrão, todos os usuários começam com `verificado = false`. Você precisará implementar a lógica de verificação conforme descrito no documento do projeto.

3. **Condomínio**: Usuários precisam estar associados a um `condominio`. Crie pelo menos um condomínio de teste antes de testar o cadastro de usuários.

## 🧪 Dados de Teste

Para testar a aplicação, você pode:

1. Criar um condomínio manualmente via SQL Editor ou Table Editor
2. Registrar um usuário via aplicação (isso criará o registro em `auth.users`)
3. Atualizar manualmente o registro em `usuario` para associá-lo ao condomínio e marcar como verificado

### Exemplo de inserção de condomínio:

```sql
INSERT INTO condominio (nome, endereco, cep, cidade, estado) 
VALUES ('Condomínio Teste', 'Rua Teste, 123', '12345-678', 'São Paulo', 'SP');
```

### Exemplo de atualização de usuário (após registro):

```sql
-- Substitua 'USER_ID_HERE' pelo UUID do usuário em auth.users
UPDATE usuario 
SET id_condominio = 1, verificado = true 
WHERE id = 'USER_ID_HERE';
```

## ✅ Checklist de Verificação

Após executar o script, verifique:

- [ ] Todas as 10 tabelas foram criadas
- [ ] Todos os índices foram criados
- [ ] RLS está ativado em todas as tabelas
- [ ] Políticas RLS foram criadas
- [ ] Triggers de `updated_at` foram criados (opcional)
- [ ] Storage buckets foram criados (se necessário)

## 🐛 Troubleshooting

### Erro: "relation does not exist"
- Certifique-se de executar o script completo em ordem
- Verifique se está no schema correto (`public`)

### Erro: "permission denied"
- Verifique se tem permissões de administrador no projeto Supabase
- Certifique-se de estar usando a conta correta

### Erro ao inserir usuário
- Verifique se o ID usado corresponde ao UUID em `auth.users`
- Certifique-se de que o usuário foi criado primeiro no Supabase Auth

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

