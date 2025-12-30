import { Layout } from '../components/Layout';

export default function TransactionsPage() {
  return (
    <Layout>
      <div>
        <h1 className="page-title">Transações</h1>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
          <p>Página de transações em desenvolvimento...</p>
          <p>Aqui você poderá:</p>
          <ul>
            <li>Adicionar novas transações (receitas e despesas)</li>
            <li>Visualizar histórico completo</li>
            <li>Filtrar por categoria, conta, período</li>
            <li>Editar e excluir transações</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
