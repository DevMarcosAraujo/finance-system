import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { Account, Category } from '../types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  PieChart as PieChartIcon,
  BarChart3,
  Upload,
  Calendar,
  Plus
} from 'lucide-react';
import './DashboardPage.css';

interface CategoryReport {
  category: string;
  categoryName: string;
  total: number;
  color?: string;
}

interface MonthlyData {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  // Dados do dashboard
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  // Upload de arquivo
  const [uploadingFile, setUploadingFile] = useState(false);

  // Formulário rápido
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quickForm, setQuickForm] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    accountId: '',
    categoryId: '',
  });

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    loadDashboardData();
    loadFormData();
  }, [selectedYear, selectedMonth, viewMode]);

  async function loadDashboardData() {
    try {
      setLoading(true);

      const params = viewMode === 'monthly'
        ? { year: selectedYear, month: selectedMonth }
        : { year: selectedYear };

      const [summaryRes, categoryRes, monthlyRes] = await Promise.all([
        api.get('/reports/summary', { params }),
        api.get('/reports/by-category', { params }),
        api.get('/reports/monthly', { params: { year: selectedYear } }),
      ]);

      setTotalIncome(summaryRes.data.totalIncome || 0);
      setTotalExpense(summaryRes.data.totalExpense || 0);
      setTransactionsCount(summaryRes.data.transactionsCount || 0);
      setCategoryReports(Array.isArray(categoryRes.data) ? categoryRes.data : []);
      setMonthlyData(Array.isArray(monthlyRes.data.data) ? monthlyRes.data.data : []);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadFormData() {
    try {
      const [accountsRes, categoriesRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/categories'),
      ]);
      setAccounts(Array.isArray(accountsRes.data) ? accountsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);

      // Definir conta padrão
      const defaultAccount = accountsRes.data[0];
      if (defaultAccount) {
        setQuickForm(prev => ({ ...prev, accountId: defaultAccount.id }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
    }
  }

  async function handleQuickSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = {
        description: quickForm.description,
        amount: parseFloat(quickForm.amount),
        type: quickForm.type,
        date: new Date().toISOString(),
        isPaid: true,
        accountId: quickForm.accountId,
        categoryId: quickForm.categoryId || undefined,
      };

      await api.post('/transactions', data);

      // Limpar formulário
      setQuickForm({
        description: '',
        amount: '',
        type: 'expense',
        accountId: accounts[0]?.id || '',
        categoryId: '',
      });

      // Recarregar dashboard
      loadDashboardData();
      alert('Transação adicionada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar transação:', error);
      alert(error.response?.data?.error || 'Erro ao adicionar transação');
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);

      await api.post('/transactions/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Planilha importada com sucesso!');
      loadDashboardData();
    } catch (error: any) {
      console.error('Erro ao importar planilha:', error);
      alert(error.response?.data?.error || 'Erro ao importar planilha');
    } finally {
      setUploadingFile(false);
      event.target.value = '';
    }
  }

  const balance = totalIncome - totalExpense;
  const expenseCategories = categoryReports.filter(c => c.total < 0);
  const incomeCategories = categoryReports.filter(c => c.total > 0);

  // Calcular maior valor para escala do gráfico
  const maxExpense = expenseCategories.length > 0
    ? Math.max(...expenseCategories.map(c => Math.abs(c.total)))
    : 100;

  if (loading) {
    return (
      <Layout>
        <div>Carregando dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1 className="page-title">Dashboard</h1>

          <div className="dashboard-controls">
            <div className="view-mode-selector">
              <button
                className={viewMode === 'monthly' ? 'active' : ''}
                onClick={() => setViewMode('monthly')}
              >
                <Calendar size={18} />
                Mensal
              </button>
              <button
                className={viewMode === 'yearly' ? 'active' : ''}
                onClick={() => setViewMode('yearly')}
              >
                <BarChart3 size={18} />
                Anual
              </button>
            </div>

            <label className="upload-btn">
              <Upload size={18} />
              {uploadingFile ? 'Importando...' : 'Importar Excel'}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={uploadingFile}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div className="quick-transaction-form">
          <h2>Adicionar Transação Rápida</h2>
          <form onSubmit={handleQuickSubmit}>
            <div className="quick-form-grid">
              <div className="form-group">
                <label>Tipo</label>
                <div className="type-selector">
                  <button
                    type="button"
                    className={quickForm.type === 'expense' ? 'active expense' : 'expense'}
                    onClick={() => setQuickForm({ ...quickForm, type: 'expense', categoryId: '' })}
                  >
                    <TrendingDown size={18} />
                    Despesa
                  </button>
                  <button
                    type="button"
                    className={quickForm.type === 'income' ? 'active income' : 'income'}
                    onClick={() => setQuickForm({ ...quickForm, type: 'income', categoryId: '' })}
                  >
                    <TrendingUp size={18} />
                    Receita
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={quickForm.description}
                  onChange={(e) => setQuickForm({ ...quickForm, description: e.target.value })}
                  placeholder="Ex: Almoço, Salário..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={quickForm.amount}
                  onChange={(e) => setQuickForm({ ...quickForm, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Conta</label>
                <select
                  value={quickForm.accountId}
                  onChange={(e) => setQuickForm({ ...quickForm, accountId: e.target.value })}
                  required
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bank ? `${account.bank} - ${account.name}` : account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Categoria (Opcional)</label>
                <select
                  value={quickForm.categoryId}
                  onChange={(e) => setQuickForm({ ...quickForm, categoryId: e.target.value })}
                >
                  <option value="">Sem categoria</option>
                  {categories
                    .filter((c) => c.type === quickForm.type)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}{category.company ? ` - ${category.company}` : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <button type="submit" className="btn-primary quick-submit">
                  <Plus size={18} />
                  Adicionar
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>Ano</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {viewMode === 'monthly' && (
            <div className="filter-group">
              <label>Mês</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-income">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">
                {viewMode === 'monthly' ? 'Receitas do Mês' : 'Receitas do Ano'}
              </div>
              <div className="stat-value">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="stat-card stat-expense">
            <div className="stat-icon">
              <TrendingDown size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">
                {viewMode === 'monthly' ? 'Despesas do Mês' : 'Despesas do Ano'}
              </div>
              <div className="stat-value">
                R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className={`stat-card stat-balance ${balance >= 0 ? 'positive' : 'negative'}`}>
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Saldo</div>
              <div className="stat-value">
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="stat-card stat-count">
            <div className="stat-icon">
              <Receipt size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Transações</div>
              <div className="stat-value">{transactionsCount}</div>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          {expenseCategories.length > 0 && (
            <div className="chart-card">
              <h2>
                <PieChartIcon size={20} />
                Despesas por Categoria
              </h2>
              <div className="bar-chart">
                {expenseCategories.map((cat, index) => {
                  const percentage = (Math.abs(cat.total) / maxExpense) * 100;
                  return (
                    <div key={index} className="bar-item">
                      <div className="bar-label">{cat.categoryName || 'Sem categoria'}</div>
                      <div className="bar-container">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: cat.color || '#fa709a'
                          }}
                        />
                      </div>
                      <div className="bar-value">
                        R$ {Math.abs(cat.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {incomeCategories.length > 0 && (
            <div className="chart-card">
              <h2>
                <TrendingUp size={20} />
                Receitas por Categoria
              </h2>
              <div className="category-list">
                {incomeCategories.map((cat, index) => (
                  <div key={index} className="category-item">
                    <div
                      className="category-color"
                      style={{ backgroundColor: cat.color || '#43e97b' }}
                    />
                    <span className="category-name">{cat.categoryName || 'Sem categoria'}</span>
                    <span className="category-value">
                      R$ {cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {monthlyData.length > 0 && (
          <div className="chart-card full-width">
            <h2>
              <BarChart3 size={20} />
              Evolução Mensal - {selectedYear}
            </h2>
            <div className="monthly-chart">
              {monthlyData.map((data, index) => {
                const maxValue = Math.max(
                  ...monthlyData.map(d => Math.max(d.income, d.expense))
                );
                const incomeHeight = (data.income / maxValue) * 100;
                const expenseHeight = (data.expense / maxValue) * 100;

                return (
                  <div key={index} className="month-bar">
                    <div className="bar-group">
                      <div
                        className="bar income-bar"
                        style={{ height: `${incomeHeight}%` }}
                        title={`Receita: R$ ${data.income.toFixed(2)}`}
                      />
                      <div
                        className="bar expense-bar"
                        style={{ height: `${expenseHeight}%` }}
                        title={`Despesa: R$ ${data.expense.toFixed(2)}`}
                      />
                    </div>
                    <div className="month-label">{months[data.month - 1].slice(0, 3)}</div>
                  </div>
                );
              })}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color income-color" />
                <span>Receitas</span>
              </div>
              <div className="legend-item">
                <div className="legend-color expense-color" />
                <span>Despesas</span>
              </div>
            </div>
          </div>
        )}

        {categoryReports.length === 0 && (
          <div className="empty-state">
            <h2>Bem-vindo ao Finance System!</h2>
            <p>Comece adicionando suas transações ou importe uma planilha Excel para visualizar análises completas.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
