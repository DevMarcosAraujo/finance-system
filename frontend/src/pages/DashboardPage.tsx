import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { Summary } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Receipt } from 'lucide-react';
import './DashboardPage.css';

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      const response = await api.get('/reports/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div>Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <h1 className="page-title">Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card stat-income">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Receitas</div>
              <div className="stat-value">
                R$ {summary?.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="stat-card stat-expense">
            <div className="stat-icon">
              <TrendingDown size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Despesas</div>
              <div className="stat-value">
                R$ {summary?.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="stat-card stat-balance">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Saldo</div>
              <div className="stat-value">
                R$ {summary?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="stat-card stat-count">
            <div className="stat-icon">
              <Receipt size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Transações</div>
              <div className="stat-value">{summary?.transactionsCount || 0}</div>
            </div>
          </div>
        </div>

        <div className="welcome-message">
          <h2>Bem-vindo ao Finance System!</h2>
          <p>Comece adicionando suas primeiras transações para visualizar relatórios completos.</p>
        </div>
      </div>
    </Layout>
  );
}
