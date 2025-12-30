import { Layout } from '../components/Layout';

export default function AccountsPage() {
  return (
    <Layout>
      <div>
        <h1 className="page-title">Contas</h1>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
          <p>Página de contas em desenvolvimento...</p>
          <p>Aqui você poderá:</p>
          <ul>
            <li>Adicionar contas bancárias</li>
            <li>Gerenciar cartões de crédito</li>
            <li>Controlar dinheiro em espécie</li>
            <li>Ver saldo de cada conta</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
