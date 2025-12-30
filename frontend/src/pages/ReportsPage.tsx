import { Layout } from '../components/Layout';

export default function ReportsPage() {
  return (
    <Layout>
      <div>
        <h1 className="page-title">Relatórios</h1>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
          <p>Página de relatórios em desenvolvimento...</p>
          <p>Aqui você terá:</p>
          <ul>
            <li>Gráficos de receitas e despesas</li>
            <li>Análise por categoria</li>
            <li>Evolução mensal</li>
            <li>Exportação de dados</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
