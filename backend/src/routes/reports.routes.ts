import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// GET /api/reports/summary - Resumo financeiro
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = { userId: req.userId! };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const [income, expense, transactionsCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'income', isPaid: true },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'expense', isPaid: true },
        _sum: { amount: true },
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalIncome = Number(income._sum.amount || 0);
    const totalExpense = Number(expense._sum.amount || 0);
    const balance = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      balance,
      transactionsCount,
    });
  } catch (error) {
    console.error('Erro ao gerar resumo:', error);
    res.status(500).json({ error: 'Erro ao gerar resumo' });
  }
});

// GET /api/reports/by-category - Gastos por categoria
router.get('/by-category', async (req, res) => {
  try {
    const { type = 'expense', startDate, endDate } = req.query;

    const where: any = {
      userId: req.userId!,
      type: type as string,
      isPaid: true,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const transactions = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const categoriesData = await Promise.all(
      transactions.map(async (item: any) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true, color: true, icon: true },
        });

        return {
          categoryId: item.categoryId,
          categoryName: category?.name || 'Sem categoria',
          color: category?.color,
          icon: category?.icon,
          total: Number(item._sum.amount || 0),
          count: item._count.id,
        };
      })
    );

    // Ordenar por total decrescente
    categoriesData.sort((a, b) => b.total - a.total);

    res.json(categoriesData);
  } catch (error) {
    console.error('Erro ao gerar relatório por categoria:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

// GET /api/reports/monthly - Relatório mensal
router.get('/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId!,
        isPaid: true,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        amount: true,
        type: true,
      },
    });

    // Agrupar por mês
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
      balance: 0,
    }));

    transactions.forEach((t: any) => {
      const month = t.date.getMonth();
      const amount = Number(t.amount);

      if (t.type === 'income') {
        monthlyData[month].income += amount;
      } else {
        monthlyData[month].expense += amount;
      }
    });

    monthlyData.forEach((data) => {
      data.balance = data.income - data.expense;
    });

    res.json({ year: targetYear, data: monthlyData });
  } catch (error) {
    console.error('Erro ao gerar relatório mensal:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
});

export default router;
