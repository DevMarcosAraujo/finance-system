import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { Prisma } from '@prisma/client';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// Schema de validação
const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Tipo deve ser income ou expense' }),
  }),
  date: z.string().optional(),
  isPaid: z.boolean().optional(),
  notes: z.string().optional(),
  accountId: z.string().uuid('ID da conta inválido'),
  categoryId: z.string().uuid('ID da categoria inválido'),
});

// GET /api/transactions - Listar transações
router.get('/', async (req, res) => {
  try {
    const { type, accountId, categoryId, startDate, endDate, page = '1', limit = '50' } = req.query;

    const where: any = { userId: req.userId! };

    if (type && (type === 'income' || type === 'expense')) {
      where.type = type;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: { select: { name: true, type: true } },
          category: { select: { name: true, color: true, icon: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// GET /api/transactions/:id - Buscar transação por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.userId! },
      include: {
        account: true,
        category: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({ error: 'Erro ao buscar transação' });
  }
});

// POST /api/transactions - Criar transação
router.post('/', async (req, res) => {
  try {
    const data = transactionSchema.parse(req.body);

    // Verificar se conta e categoria pertencem ao usuário
    const [account, category] = await Promise.all([
      prisma.account.findFirst({
        where: { id: data.accountId, userId: req.userId! },
      }),
      prisma.category.findFirst({
        where: { id: data.categoryId, userId: req.userId! },
      }),
    ]);

    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    if (category.type !== data.type) {
      return res.status(400).json({
        error: 'Tipo da categoria não corresponde ao tipo da transação',
      });
    }

    // Criar transação e atualizar saldo da conta
    const transaction = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          date: data.date ? new Date(data.date) : new Date(),
          userId: req.userId!,
        },
        include: {
          account: true,
          category: true,
        },
      });

      // Atualizar saldo da conta se a transação está paga
      if (data.isPaid !== false) {
        const balanceChange = data.type === 'income' ? data.amount : -data.amount;
        await tx.account.update({
          where: { id: data.accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }

      return newTransaction;
    });

    res.status(201).json(transaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// PUT /api/transactions/:id - Atualizar transação
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = transactionSchema.partial().parse(req.body);

    // Buscar transação existente
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    // Atualizar transação e recalcular saldo se necessário
    const transaction = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Se o valor ou tipo mudou, ajustar saldo
      if ((data.amount !== undefined || data.type !== undefined) && existing.isPaid) {
        const oldAmount = existing.type === 'income' ? -Number(existing.amount) : Number(existing.amount);
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: oldAmount } },
        });

        const newAmount = (data.type || existing.type) === 'income'
          ? (data.amount || Number(existing.amount))
          : -(data.amount || Number(existing.amount));
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: newAmount } },
        });
      }

      return await tx.transaction.update({
        where: { id },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        },
        include: {
          account: true,
          category: true,
        },
      });
    });

    res.json(transaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
});

// DELETE /api/transactions/:id - Deletar transação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Reverter saldo se a transação estava paga
      if (existing.isPaid) {
        const balanceChange = existing.type === 'income' ? -Number(existing.amount) : Number(existing.amount);
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: balanceChange } },
        });
      }

      await tx.transaction.delete({ where: { id } });
    });

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
});

export default router;
