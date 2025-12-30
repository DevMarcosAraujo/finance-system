import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// Schema de validação
const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Tipo deve ser income ou expense' }),
  }),
  color: z.string().optional(),
  icon: z.string().optional(),
});

// GET /api/categories - Listar categorias do usuário
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;

    const where: any = { userId: req.userId! };
    if (type && (type === 'income' || type === 'expense')) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// POST /api/categories - Criar categoria
router.post('/', async (req, res) => {
  try {
    const data = categorySchema.parse(req.body);

    // Verificar se categoria já existe
    const existing = await prisma.category.findUnique({
      where: {
        userId_name_type: {
          userId: req.userId!,
          name: data.name,
          type: data.type,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Categoria já existe' });
    }

    const category = await prisma.category.create({
      data: {
        ...data,
        userId: req.userId!,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

// PUT /api/categories/:id - Atualizar categoria
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = categorySchema.partial().parse(req.body);

    // Verificar se a categoria pertence ao usuário
    const existing = await prisma.category.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    res.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// DELETE /api/categories/:id - Deletar categoria
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a categoria pertence ao usuário
    const existing = await prisma.category.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Verificar se há transações usando esta categoria
    const transactionsCount = await prisma.transaction.count({
      where: { categoryId: id },
    });

    if (transactionsCount > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar categoria com transações associadas',
      });
    }

    await prisma.category.delete({ where: { id } });

    res.json({ message: 'Categoria deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ error: 'Erro ao deletar categoria' });
  }
});

export default router;
