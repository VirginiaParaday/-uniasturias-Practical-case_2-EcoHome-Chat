import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { connectSocket } from './socket';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import Chat from './pages/Chat';
import './styles.css';

function AppShell({ page, onNavigate, children }) {
  const { user, token, logout, setProductsCount } = useAuth();
  const count = user?.productsCount ?? 0;

  useEffect(() => {
    const socket = connectSocket(token);

    function onProductCreated(payload) {
      if (payload?.userId === user?.id && typeof payload.productsCount === 'number') {
        setProductsCount(payload.productsCount);
      }
    }

    socket.on('product-created', onProductCreated);
    return () => {
      socket.off('product-created', onProductCreated);
    };
  }, [token, user?.id, setProductsCount]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h2>EcoHome Store</h2>
          <p className="app-header-sub">Catálogo + chat interno · mismo backend JWT</p>
        </div>

        <nav className="app-nav">
          <button
            className={page === 'catalog' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => onNavigate('catalog')}
          >
            Catálogo
          </button>
          <button
            className={page === 'chat' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => onNavigate('chat')}
          >
            Chat
          </button>
        </nav>

        <div className="chat-user">
          <span className="user-badge" title="Productos creados por este usuario">
            {user?.username} ({count})
          </span>
          <em className="user-role">{user?.role}</em>
          <button onClick={logout} className="logout-btn">Cerrar sesión</button>
        </div>
      </header>
      <div className="app-body">{children}</div>
    </div>
  );
}

function AppInner() {
  const { token } = useAuth();
  const [page, setPage] = useState('catalog');

  if (!token) return <Login />;

  return (
    <AppShell page={page} onNavigate={setPage}>
      {page === 'catalog' ? <Catalog /> : <Chat />}
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
