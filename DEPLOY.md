# 🚀 Guia Completo de Deploy - Finance System

Este guia vai te ensinar a colocar seu sistema no ar **gratuitamente**!

---

## 📋 Pré-requisitos

Você vai precisar criar contas (todas gratuitas):
1. ✅ [GitHub](https://github.com) - Para hospedar o código
2. ✅ [Neon](https://neon.tech) - Para o banco de dados PostgreSQL
3. ✅ [Render](https://render.com) - Para o backend (API)
4. ✅ [Vercel](https://vercel.com) - Para o frontend (interface)

---

## 🗄️ PARTE 1: Banco de Dados (Neon)

### 1.1 Criar conta no Neon
1. Acesse: https://neon.tech
2. Clique em **"Sign Up"**
3. Entre com sua conta do GitHub
4. Confirme o email

### 1.2 Criar banco de dados
1. No dashboard do Neon, clique em **"Create Project"**
2. Configure:
   - **Project name:** `finance-system-db`
   - **Region:** Escolha o mais próximo (ex: US East)
   - **PostgreSQL version:** 16 (mais recente)
3. Clique em **"Create Project"**

### 1.3 Copiar string de conexão
1. Na página do projeto, clique na aba **"Dashboard"**
2. Copie a **"Connection String"** que aparece
3. Ela será algo como:
   ```
   postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **GUARDE ISSO!** Você vai usar no Render.

---

## 🔙 PARTE 2: Backend (Render)

### 2.1 Subir código para o GitHub

**No terminal do VS Code, execute:**

```bash
# Adicionar todos os arquivos
git add .

# Criar commit
git commit -m "Initial commit - Finance System"

# Criar branch main
git branch -M main
```

Agora vá no GitHub:
1. Acesse: https://github.com/new
2. Crie um repositório:
   - **Repository name:** `finance-system`
   - **Public** ou **Private** (sua escolha)
   - **NÃO marque** "Initialize with README"
3. Clique em **"Create repository"**

Copie a URL que aparecer (algo como `https://github.com/seu-usuario/finance-system.git`)

**Volte ao terminal e execute:**

```bash
# Adicionar repositório remoto (SUBSTITUA pela SUA URL)
git remote add origin https://github.com/SEU-USUARIO/finance-system.git

# Enviar código
git push -u origin main
```

### 2.2 Deploy no Render

1. Acesse: https://render.com
2. Clique em **"Sign Up"**
3. Entre com sua conta do GitHub
4. No dashboard, clique em **"New +"** → **"Web Service"**
5. Clique em **"Connect Repository"** e selecione `finance-system`
6. Configure:
   - **Name:** `finance-system-api`
   - **Region:** Oregon (mais próximo)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command:**
     ```bash
     npx prisma migrate deploy && npm start
     ```
   - **Plan:** Free

7. **IMPORTANTE - Variáveis de Ambiente:**
   Clique em **"Advanced"** → **"Add Environment Variable"**

   Adicione estas variáveis:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |
   | `DATABASE_URL` | Cole a string do Neon aqui |
   | `JWT_SECRET` | `seu_segredo_aqui_mude_isso_123` |
   | `JWT_EXPIRES_IN` | `7d` |

8. Clique em **"Create Web Service"**

9. **Aguarde 5-10 minutos** enquanto o deploy acontece

10. Quando terminar, você verá uma URL tipo:
    ```
    https://finance-system-api.onrender.com
    ```
    **COPIE ESSA URL!** Você vai usar no frontend.

---

## 🎨 PARTE 3: Frontend (Vercel)

### 3.1 Atualizar variável de ambiente do frontend

**No VS Code, edite o arquivo:** `frontend/.env`

Substitua por:
```env
VITE_API_URL=https://finance-system-api.onrender.com/api
```

**IMPORTANTE:** Substitua `finance-system-api.onrender.com` pela URL que o Render te deu!

**Salve e faça commit:**

```bash
git add frontend/.env
git commit -m "Update API URL for production"
git push
```

### 3.2 Deploy no Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Entre com sua conta do GitHub
4. No dashboard, clique em **"Add New"** → **"Project"**
5. Selecione o repositório `finance-system`
6. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

7. **Environment Variables:**
   Adicione:
   ```
   VITE_API_URL = https://finance-system-api.onrender.com/api
   ```
   (Substitua pela sua URL do Render)

8. Clique em **"Deploy"**

9. Aguarde 2-3 minutos

10. Quando terminar, você terá uma URL tipo:
    ```
    https://finance-system-xyz.vercel.app
    ```

---

## 🎉 Pronto! Sistema no Ar!

Seu sistema está online em:
- **Frontend:** https://seu-projeto.vercel.app
- **Backend API:** https://seu-projeto.onrender.com

---

## ⚠️ Importante - CORS

Você precisa atualizar o CORS do backend para aceitar requisições do Vercel.

**Edite o arquivo:** `backend/src/index.ts`

Encontre esta linha:
```typescript
app.use(cors());
```

Substitua por:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://seu-projeto.vercel.app'  // Coloque sua URL do Vercel aqui
  ],
  credentials: true
}));
```

**Faça commit e push:**
```bash
git add .
git commit -m "Update CORS for production"
git push
```

O Render vai fazer deploy automático!

---

## 🔄 Fazer Atualizações Futuras

Sempre que você fizer mudanças no código:

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

**O deploy é automático!**
- Render vai atualizar o backend
- Vercel vai atualizar o frontend

---

## 🐛 Problemas Comuns

### Backend não inicia no Render
- Verifique se a `DATABASE_URL` está correta
- Veja os logs no painel do Render

### Frontend não conecta ao backend
- Verifique se a `VITE_API_URL` está correta
- Certifique-se que o CORS está configurado

### Banco de dados não conecta
- Certifique-se que a connection string do Neon tem `?sslmode=require` no final

---

## 💰 Custos (Plano Free)

| Serviço | Custo | Limitações |
|---------|-------|------------|
| Neon (DB) | **R$ 0,00** | 500MB de dados |
| Render (Backend) | **R$ 0,00** | "Dorme" após 15 min sem uso |
| Vercel (Frontend) | **R$ 0,00** | Largura de banda limitada |

**Total: R$ 0,00/mês** para começar! 🎉

---

## 📞 Suporte

Se tiver problemas:
1. Veja os logs no painel de cada serviço
2. Verifique se todas as variáveis de ambiente estão corretas
3. Teste a API diretamente: `https://sua-api.onrender.com/health`

---

Boa sorte com seu sistema no ar! 🚀
