import { Layout } from '../components/Layout';

export default function CategoriesPage() {
  return (
    <Layout>
      <div>
        <h1 className="page-title">Categorias</h1>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
          <p>Página de categorias em desenvolvimento...</p>
          <p>Aqui você poderá:</p>
          <ul>
            <li>Criar categorias personalizadas</li>
            <li>Definir cores e ícones</li>
            <li>Organizar receitas e despesas</li>
            <li>Gerenciar categorias existentes</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
