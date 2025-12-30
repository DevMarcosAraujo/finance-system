import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// Schema de validação
const accountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['checking', 'savings', 'credit_card', 'cash'], {
    errorMap: () => ({ message: 'Tipo de conta inválido' }),
  }),
  bank: z.string().optional(),
  balance: z.number().optional(),
  currency: z.string().optional(),
});

// GET /api/accounts - Listar contas do usuário
router.get('/', async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId!, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(accounts);
  } catch (error) {
    console.error('Erro ao listar contas:', error);
    res.status(500).json({ error: 'Erro ao buscar contas' });
  }
});

// POST /api/accounts - Criar conta
router.post('/', async (req, res) => {
  try {
    const data = accountSchema.parse(req.body);

    const account = await prisma.account.create({
      data: {
        ...data,
        userId: req.userId!,
      },
    });

    res.status(201).json(account);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao criar conta:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// PUT /api/accounts/:id - Atualizar conta
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = accountSchema.partial().parse(req.body);

    // Verificar se a conta pertence ao usuário
    const existingAccount = await prisma.account.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!existingAccount) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    const account = await prisma.account.update({
      where: { id },
      data,
    });

    res.json(account);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao atualizar conta:', error);
    res.status(500).json({ error: 'Erro ao atualizar conta' });
  }
});

// DELETE /api/accounts/:id - Deletar conta (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a conta pertence ao usuário
    const existingAccount = await prisma.account.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!existingAccount) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    await prisma.account.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Conta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ error: 'Erro ao deletar conta' });
  }
});

export default router;
