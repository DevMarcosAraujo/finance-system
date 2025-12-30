# 📦 Guia de Instalação - Finance System

Siga estes passos para configurar e executar o projeto.

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js** (versão 18 ou superior)
   - Verifique: `node --version`
   - Download: https://nodejs.org/

2. **PostgreSQL** (versão 14 ou superior)
   - Verifique: `psql --version`
   - Download: https://www.postgresql.org/download/

3. **Git** (opcional, para controle de versão)
   - Verifique: `git --version`

---

## 🚀 Passo 1: Instalar Dependências

No diretório raiz do projeto, execute:

```bash
npm install
```

Isso instalará todas as dependências do backend e frontend automaticamente.

---

## 🗄️ Passo 2: Configurar PostgreSQL

### 2.1 Criar o Banco de Dados

Abra o terminal do PostgreSQL:

```bash
psql -U postgres
```

Crie o banco de dados:

```sql
CREATE DATABASE finance_db;
```

Saia do terminal PostgreSQL:

```sql
\q
```

### 2.2 Verificar a conexão

Teste se consegue conectar ao banco:

```bash
psql -U postgres -d finance_db
```

Se conectar com sucesso, está tudo certo!

---

## 🔧 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Backend

Navegue até a pasta do backend:

```bash
cd backend
```

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database - Ajuste se necessário
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/finance_db?schema=public"

# Server
PORT=3000
NODE_ENV=development

# JWT - MUDE esta chave para algo único e seguro!
JWT_SECRET=minha_chave_super_secreta_123456
JWT_EXPIRES_IN=7d
```

**IMPORTANTE:** Substitua:
- `SUA_SENHA` pela senha do seu PostgreSQL
- `JWT_SECRET` por uma chave secreta única

### 3.2 Frontend

Navegue até a pasta do frontend:

```bash
cd ../frontend
```

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

O arquivo `.env` deve conter:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🗃️ Passo 4: Executar Migrations do Prisma

Volte para a pasta do backend:

```bash
cd ../backend
```

Gere o Prisma Client:

```bash
npm run prisma:generate
```

Execute as migrations para criar as tabelas:

```bash
npm run prisma:migrate
```

Quando solicitado, dê um nome para a migration (ex: "initial").

### (Opcional) Abrir o Prisma Studio

Para visualizar os dados do banco:

```bash
npm run prisma:studio
```

Isso abrirá uma interface web em `http://localhost:5555`.

---

## ▶️ Passo 5: Executar o Projeto

Volte para a pasta raiz:

```bash
cd ..
```

Execute o projeto completo (backend + frontend):

```bash
npm run dev
```

Ou execute separadamente:

**Backend:**
```bash
npm run dev:backend
```

**Frontend:**
```bash
npm run dev:frontend
```

---

## 🌐 Acessar o Sistema

Após iniciar, acesse:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api

---

## 📝 Testando o Sistema

1. Acesse http://localhost:5173
2. Clique em "Cadastre-se"
3. Crie uma conta com:
   - Nome
   - Email
   - Senha (mínimo 6 caracteres)
4. Você será redirecionado para o Dashboard!

---

## 🐛 Problemas Comuns

### Erro: "Cannot find module"

Certifique-se de ter executado `npm install` na raiz do projeto.

### Erro: "Database connection failed"

Verifique:
- PostgreSQL está rodando: `sudo service postgresql status`
- A senha no arquivo `.env` está correta
- O banco `finance_db` foi criado

### Erro: "Port 3000 already in use"

Outra aplicação está usando a porta 3000. Você pode:
- Parar a outra aplicação
- Ou mudar a porta no arquivo `backend/.env`:
  ```env
  PORT=3001
  ```

### Erro: "Prisma Client is not generated"

Execute:
```bash
cd backend
npm run prisma:generate
```

---

## 🔄 Resetar o Banco de Dados

Se precisar limpar todos os dados:

```bash
cd backend
npx prisma migrate reset
```

**ATENÇÃO:** Isso apagará TODOS os dados!

---

## 📚 Próximos Passos

Agora que o sistema está funcionando, você pode:

1. **Explorar as páginas**: Dashboard, Transações, Categorias, etc.
2. **Adicionar funcionalidades**: As páginas têm placeholders para você implementar
3. **Customizar**: Mudar cores, adicionar recursos, integrar APIs

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas, verifique:

1. Todas as dependências estão instaladas
2. PostgreSQL está rodando
3. Variáveis de ambiente estão configuradas
4. Migrations foram executadas

Boa sorte com seu sistema financeiro! 🚀
