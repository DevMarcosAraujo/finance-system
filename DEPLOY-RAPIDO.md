# ⚡ Deploy Rápido - Checklist

## ✅ Checklist Completo

### 1️⃣ Banco de Dados (5 min)
- [ ] Criar conta no [Neon.tech](https://neon.tech)
- [ ] Criar projeto PostgreSQL
- [ ] Copiar connection string

### 2️⃣ GitHub (2 min)
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/finance-system.git
git push -u origin main
```

### 3️⃣ Backend - Render (10 min)
- [ ] Criar conta no [Render.com](https://render.com)
- [ ] Conectar repositório GitHub
- [ ] Configurar Web Service:
  - Root: `backend`
  - Build: `npm install && npx prisma generate && npm run build`
  - Start: `npx prisma migrate deploy && npm start`
- [ ] Adicionar variáveis:
  - `DATABASE_URL` = string do Neon
  - `JWT_SECRET` = qualquer texto secreto
  - `NODE_ENV` = production
- [ ] Deploy!
- [ ] Copiar URL: `https://xxxx.onrender.com`

### 4️⃣ Frontend - Vercel (5 min)
- [ ] Editar `frontend/.env`:
  ```
  VITE_API_URL=https://sua-api.onrender.com/api
  ```
- [ ] Commit e push:
  ```bash
  git add frontend/.env
  git commit -m "Add production API URL"
  git push
  ```
- [ ] Criar conta no [Vercel.com](https://vercel.com)
- [ ] Importar repositório
- [ ] Configurar:
  - Root: `frontend`
  - Framework: Vite
  - Env: `VITE_API_URL` = URL do Render
- [ ] Deploy!

### 5️⃣ Configurar CORS
Edite `backend/src/index.ts` e adicione sua URL do Vercel:
```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'https://seu-projeto.vercel.app'],
  credentials: true
}));
```

Commit e push:
```bash
git add .
git commit -m "Configure CORS"
git push
```

---

## 🎉 Pronto!

Acesse: `https://seu-projeto.vercel.app`

**Total de tempo:** ~25 minutos
**Custo:** R$ 0,00

---

## 🆘 Erro? Verifique:

1. **Backend não inicia:**
   - DATABASE_URL está correto?
   - Veja os logs no Render

2. **Frontend não conecta:**
   - VITE_API_URL está correto?
   - CORS configurado?

3. **Teste a API:**
   ```
   https://sua-api.onrender.com/health
   ```
   Deve retornar: `{"status":"ok"}`

---

Veja o guia completo em [DEPLOY.md](DEPLOY.md)
