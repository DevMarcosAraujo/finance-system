import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { Transaction, Account, Category } from '../types';
import { Plus, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle, Filter, X } from 'lucide-react';
import './TransactionsPage.css';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5), // HH:MM
    isPaid: true,
    accountId: '',
    categoryId: '',
  });
  const [filters, setFilters] = useState({
    type: '',
    accountId: '',
    categoryId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [transactionsRes, accountsRes, categoriesRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/accounts'),
        api.get('/categories'),
      ]);

      // A API de transações retorna { transactions: [], pagination: {} }
      const transactionsData = transactionsRes.data.transactions || transactionsRes.data;
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      setAccounts(Array.isArray(accountsRes.data) ? accountsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setTransactions([]);
      setAccounts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingTransaction(null);
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      isPaid: true,
      accountId: accounts[0]?.id || '',
      categoryId: '',
    });
    setShowModal(true);
  }

  function openEditModal(transaction: Transaction) {
    setEditingTransaction(transaction);
    const transactionDate = new Date(transaction.date);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      date: transactionDate.toISOString().split('T')[0],
      time: transactionDate.toTimeString().slice(0, 5),
      isPaid: transaction.isPaid,
      accountId: transaction.accountId || '',
      categoryId: transaction.categoryId || '',
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingTransaction(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Combinar data e hora em formato ISO
      const dateTime = new Date(`${formData.date}T${formData.time}:00`);

      const data = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: dateTime.toISOString(),
        isPaid: formData.isPaid,
        accountId: formData.accountId,
        categoryId: formData.categoryId,
      };

      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, data);
      } else {
        await api.post('/transactions', data);
      }

      loadData();
      closeModal();
    } catch (error: any) {
      console.error('Erro ao salvar transação:', error);
      alert(error.response?.data?.error || 'Erro ao salvar transação');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      await api.delete(`/transactions/${id}`);
      loadData();
    } catch (error: any) {
      console.error('Erro ao excluir transação:', error);
      alert(error.response?.data?.error || 'Erro ao excluir transação');
    }
  }

  function getCategoryName(categoryId: string) {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Sem categoria';
  }

  function getCategoryColor(categoryId: string) {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || '#667eea';
  }

  function getAccountName(accountId: string) {
    const account = accounts.find((a) => a.id === accountId);
    return account?.name || 'Sem conta';
  }

  function clearFilters() {
    setFilters({
      type: '',
      accountId: '',
      categoryId: '',
      startDate: '',
      endDate: '',
    });
  }

  const filteredTransactions = transactions.filter((t) => {
    if (filters.type && t.type !== filters.type) return false;
    if (filters.accountId && t.accountId !== filters.accountId) return false;
    if (filters.categoryId && t.categoryId !== filters.categoryId) return false;
    if (filters.startDate && new Date(t.date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(t.date) > new Date(filters.endDate)) return false;
    return true;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  if (loading) {
    return (
      <Layout>
        <div>Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="transactions-page">
        <div className="page-header">
          <h1 className="page-title">Transações</h1>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={20} />
              Filtros
            </button>
            <button className="btn-primary" onClick={openCreateModal}>
              <Plus size={20} />
              Nova Transação
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Tipo</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="income">Receitas</option>
                  <option value="expense">Despesas</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Conta</label>
                <select
                  value={filters.accountId}
                  onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
                >
                  <option value="">Todas</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Categoria</label>
                <select
                  value={filters.categoryId}
                  onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                >
                  <option value="">Todas</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Data Início</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              <div className="filter-group">
                <label>Data Fim</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>

              <div className="filter-actions">
                <button className="btn-secondary" onClick={clearFilters}>
                  <X size={18} />
                  Limpar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="summary-row">
          <div className="summary-item income">
            <ArrowUpCircle size={24} />
            <div>
              <span className="summary-label">Receitas</span>
              <span className="summary-value">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}
              </span>
            </div>
          </div>
          <div className="summary-item expense">
            <ArrowDownCircle size={24} />
            <div>
              <span className="summary-label">Despesas</span>
              <span className="summary-value">
                R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 1})}
              </span>git
            </div>
          </div>
          <div className={`summary-item balance ${balance >= 0 ? 'positive' : 'negative'}`}>
            <div className="balance-icon">=</div>
            <div>
              <span className="summary-label">Saldo</span>
              <span className="summary-value">
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma transação encontrada.</p>
            <p>
              {filters.type || filters.accountId || filters.categoryId || filters.startDate || filters.endDate
                ? 'Tente ajustar os filtros ou adicione novas transações.'
                : 'Comece adicionando suas receitas e despesas.'}
            </p>
          </div>
        ) : (
          <div className="transactions-list">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`transaction-item ${transaction.type}`}
                style={{ borderLeftColor: getCategoryColor(transaction.categoryId || '') }}
              >
                <div className="transaction-main">
                  <div className="transaction-icon" style={{ backgroundColor: getCategoryColor(transaction.categoryId || '') }}>
                    {transaction.type === 'income' ? (
                      <ArrowUpCircle size={20} />
                    ) : (
                      <ArrowDownCircle size={20} />
                    )}
                  </div>
                  <div className="transaction-details">
                    <h3>{transaction.description}</h3>
                    <div className="transaction-meta">
                      <span className="category-badge" style={{ backgroundColor: getCategoryColor(transaction.categoryId || '') }}>
                        {getCategoryName(transaction.categoryId || '')}
                      </span>
                      <span className="account-badge">{getAccountName(transaction.accountId || '')}</span>
                      <span className="date-badge">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(transaction.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!transaction.isPaid && <span className="unpaid-badge">Não Pago</span>}
                    </div>
                  </div>
                </div>
                <div className="transaction-right">
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'} R${' '}
                    {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="transaction-actions">
                    <button className="btn-icon" onClick={() => openEditModal(transaction)} title="Editar">
                      <Pencil size={18} />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDelete(transaction.id)}
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Descrição</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Almoço no restaurante, Salário, etc."
                    required
                  />
                </div>

                <div className="form-row">
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

                  <div className="form-group">
                    <label>Valor</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Conta</label>
                    <select
                      value={formData.accountId}
                      onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                      required
                    >
                      <option value="">Selecione uma conta</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.bank ? `${account.bank} - ${account.name}` : account.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Categoria</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      <option value="">Sem categoria</option>
                      {categories
                        .filter((c) => c.type === formData.type)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}{category.company ? ` - ${category.company}` : ''}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Data</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Hora</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.isPaid}
                        onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                      />
                      <span>Pago</span>
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingTransaction ? 'Salvar' : 'Criar'}
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
