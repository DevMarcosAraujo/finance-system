import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import './ReportsPage.css';

interface CategoryReport {
  category: string;
  categoryName: string;
  total: number;
  color?: string;
}

interface MonthlyReport {
  year: number;
  month: number;
  income: number;
  expense: number;
  balance: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadReports();
  }, [selectedYear, selectedMonth]);

  async function loadReports() {
    try {
      setLoading(true);
      const [categoryResponse, monthlyResponse] = await Promise.all([
        api.get('/reports/by-category', {
          params: { year: selectedYear, month: selectedMonth },
        }),
        api.get('/reports/monthly', {
          params: { year: selectedYear },
        }),
      ]);

      setCategoryReports(categoryResponse.data);
      setMonthlyReports(monthlyResponse.data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalIncome = categoryReports
    .filter((r) => r.total > 0)
    .reduce((sum, r) => sum + r.total, 0);

  const totalExpense = categoryReports
    .filter((r) => r.total < 0)
    .reduce((sum, r) => sum + Math.abs(r.total), 0);

  const balance = totalIncome - totalExpense;

  const incomeByCategory = categoryReports.filter((r) => r.total > 0);
  const expenseByCategory = categoryReports.filter((r) => r.total < 0);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (loading) {
    return (
      <Layout>
        <div>Carregando relatórios...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="reports-page">
        <h1 className="page-title">Relatórios</h1>

        <div className="filters">
          <div className="filter-group">
            <label>Ano</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2023, 2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Mês</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card income-card">
            <div className="summary-icon">
              <TrendingUp size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-label">Receitas do Mês</div>
              <div className="summary-value">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="summary-card expense-card">
            <div className="summary-icon">
              <TrendingDown size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-label">Despesas do Mês</div>
              <div className="summary-value">
                R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className={`summary-card balance-card ${balance >= 0 ? 'positive' : 'negative'}`}>
            <div className="summary-icon">
              <DollarSign size={24} />
            </div>
            <div className="summary-content">
              <div className="summary-label">Saldo do Mês</div>
              <div className="summary-value">
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        <div className="reports-grid">
          {expenseByCategory.length > 0 && (
            <div className="report-card">
              <h2>
                <PieChart size={20} />
                Despesas por Categoria
              </h2>
              <div className="category-list">
                {expenseByCategory.map((item, index) => {
                  const percentage = (Math.abs(item.total) / totalExpense) * 100;
                  return (
                    <div key={index} className="category-item">
                      <div className="category-item-header">
                        <span className="category-name">{item.categoryName || 'Sem categoria'}</span>
                        <span className="category-amount">
                          R$ {Math.abs(item.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill expense-progress"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="category-percentage">{percentage.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {incomeByCategory.length > 0 && (
            <div className="report-card">
              <h2>
                <PieChart size={20} />
                Receitas por Categoria
              </h2>
              <div className="category-list">
                {incomeByCategory.map((item, index) => {
                  const percentage = (item.total / totalIncome) * 100;
                  return (
                    <div key={index} className="category-item">
                      <div className="category-item-header">
                        <span className="category-name">{item.categoryName || 'Sem categoria'}</span>
                        <span className="category-amount">
                          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill income-progress"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="category-percentage">{percentage.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {monthlyReports.length > 0 && (
          <div className="report-card full-width">
            <h2>Evolução Mensal ({selectedYear})</h2>
            <div className="monthly-table">
              <table>
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Receitas</th>
                    <th>Despesas</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyReports.map((report, index) => (
                    <tr key={index}>
                      <td>{months[report.month - 1]}</td>
                      <td className="income-text">
                        R$ {report.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="expense-text">
                        R$ {report.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={report.balance >= 0 ? 'income-text' : 'expense-text'}>
                        R$ {report.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {categoryReports.length === 0 && (
          <div className="empty-state">
            <p>Nenhuma transação encontrada para este período.</p>
            <p>Adicione transações para visualizar os relatórios.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
