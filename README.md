# Sistema de Controle Financeiro Pessoal

Sistema completo para gerenciamento de finanças pessoais com integração bancária.

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM

### Frontend
- React
- TypeScript
- Vite

## 📁 Estrutura do Projeto

```
finance-system/
├── backend/          # API REST
└── frontend/         # Interface web
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco de dados no backend (veja backend/README.md)

3. Execute o projeto:
```bash
npm run dev
```

Isso iniciará:
- Backend em http://localhost:3000
- Frontend em http://localhost:5173

## 📋 Funcionalidades

- [ ] Cadastro de transações (receitas/despesas)
- [ ] Categorização de transações
- [ ] Relatórios e gráficos
- [ ] Metas de orçamento
- [ ] Histórico completo
- [ ] Integração com extratos bancários (futuro)
- [ ] Autenticação de usuários
