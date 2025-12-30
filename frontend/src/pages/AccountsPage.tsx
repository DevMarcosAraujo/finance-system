import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { BankLogo } from '../components/BankLogo';
import api from '../lib/api';
import { Account } from '../types';
import { Plus, Pencil, Trash2, CreditCard, Wallet, PiggyBank } from 'lucide-react';
import './AccountsPage.css';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    bank: '',
    balance: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingAccount(null);
    setFormData({ name: '', type: 'checking', bank: '', balance: '' });
    setShowModal(true);
  }

  function openEditModal(account: Account) {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      bank: account.bank || '',
      balance: account.balance.toString(),
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingAccount(null);
    setFormData({ name: '', type: 'checking', bank: '', balance: '' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        balance: parseFloat(formData.balance),
      };

      if (editingAccount) {
        await api.put(`/accounts/${editingAccount.id}`, data);
      } else {
        await api.post('/accounts', data);
      }

      loadAccounts();
      closeModal();
    } catch (error: any) {
      console.error('Erro ao salvar conta:', error);
      alert(error.response?.data?.error || 'Erro ao salvar conta');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;

    try {
      await api.delete(`/accounts/${id}`);
      loadAccounts();
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      alert(error.response?.data?.error || 'Erro ao excluir conta');
    }
  }

  function getAccountIcon(type: string) {
    switch (type) {
      case 'credit_card':
        return <CreditCard size={24} />;
      case 'savings':
        return <PiggyBank size={24} />;
      default:
        return <Wallet size={24} />;
    }
  }

  function getAccountTypeLabel(type: string) {
    switch (type) {
      case 'checking':
        return 'Conta Corrente';
      case 'savings':
        return 'Poupança';
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'cash':
        return 'Dinheiro';
      default:
        return type;
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
      <div className="accounts-page">
        <div className="page-header">
          <h1 className="page-title">Contas</h1>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={20} />
            Nova Conta
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma conta cadastrada ainda.</p>
            <p>Comece adicionando suas contas bancárias, cartões ou dinheiro.</p>
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map((account) => (
              <div key={account.id} className="account-card">
                <div className="account-header">
                  <div className="account-icon">
                    {account.bank ? <BankLogo bank={account.bank} size={48} /> : getAccountIcon(account.type)}
                  </div>
                  <div className="account-info">
                    <h3>{account.name}</h3>
                    <span className="account-type">
                      {account.bank || getAccountTypeLabel(account.type)}
                    </span>
                  </div>
                </div>
                <div className="account-balance">
                  R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="account-actions">
                  <button
                    className="btn-icon"
                    onClick={() => openEditModal(account)}
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDelete(account.id)}
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingAccount ? 'Editar Conta' : 'Nova Conta'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nome da Conta</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Nubank, Itaú, Dinheiro..."
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
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Poupança</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="cash">Dinheiro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Banco (Opcional)</label>
                  <select
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  >
                    <option value="">Selecione um banco</option>
                    <option value="Banco do Brasil">Banco do Brasil</option>
                    <option value="Caixa">Caixa Econômica Federal</option>
                    <option value="Bradesco">Bradesco</option>
                    <option value="Itaú">Itaú</option>
                    <option value="Santander">Santander</option>
                    <option value="Nubank">Nubank</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Saldo Inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingAccount ? 'Salvar' : 'Criar'}
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
