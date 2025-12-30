import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { Category } from '../types';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import './CategoriesPage.css';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    company: '',
    color: '#667eea',
  });

  const colorOptions = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe',
    '#43e97b', '#fa709a', '#feca57', '#ff6348',
    '#ee5a6f', '#c471ed', '#12c2e9', '#f5af19'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingCategory(null);
    setFormData({ name: '', type: 'expense', company: '', color: '#667eea' });
    setShowModal(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      company: category.company || '',
      color: category.color || '#667eea',
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', type: 'expense', company: '', color: '#667eea' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }

      loadCategories();
      closeModal();
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      alert(error.response?.data?.error || 'Erro ao salvar categoria');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      alert(error.response?.data?.error || 'Erro ao excluir categoria');
    }
  }

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  if (loading) {
    return (
      <Layout>
        <div>Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="categories-page">
        <div className="page-header">
          <h1 className="page-title">Categorias</h1>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={20} />
            Nova Categoria
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma categoria cadastrada ainda.</p>
            <p>Crie categorias para organizar suas receitas e despesas.</p>
          </div>
        ) : (
          <div className="categories-sections">
            {expenseCategories.length > 0 && (
              <div className="category-section">
                <h2>Despesas</h2>
                <div className="categories-grid">
                  {expenseCategories.map((category) => (
                    <div
                      key={category.id}
                      className="category-card"
                      style={{ borderLeftColor: category.color }}
                    >
                      <div className="category-header">
                        <div
                          className="category-icon"
                          style={{ backgroundColor: category.color }}
                        >
                          <Tag size={20} />
                        </div>
                        <div className="category-info">
                          <h3>{category.name}</h3>
                          {category.company && (
                            <span className="category-company">{category.company}</span>
                          )}
                        </div>
                      </div>
                      <div className="category-actions">
                        <button
                          className="btn-icon"
                          onClick={() => openEditModal(category)}
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDelete(category.id)}
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {incomeCategories.length > 0 && (
              <div className="category-section">
                <h2>Receitas</h2>
                <div className="categories-grid">
                  {incomeCategories.map((category) => (
                    <div
                      key={category.id}
                      className="category-card"
                      style={{ borderLeftColor: category.color }}
                    >
                      <div className="category-header">
                        <div
                          className="category-icon"
                          style={{ backgroundColor: category.color }}
                        >
                          <Tag size={20} />
                        </div>
                        <div className="category-info">
                          <h3>{category.name}</h3>
                          {category.company && (
                            <span className="category-company">{category.company}</span>
                          )}
                        </div>
                      </div>
                      <div className="category-actions">
                        <button
                          className="btn-icon"
                          onClick={() => openEditModal(category)}
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDelete(category.id)}
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nome da Categoria</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Alimentação, Salário, Transporte..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </div>

                {formData.type === 'income' && (
                  <div className="form-group">
                    <label>Empresa (Opcional - para Salário)</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Ex: Google, Microsoft, Freelancer..."
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Cor</label>
                  <div className="color-picker">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${formData.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingCategory ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
