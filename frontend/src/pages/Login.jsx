import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onSuccess }) {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) onSuccess?.();
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>EcoHome Store</h1>
        <p className="subtitle">Chat interno corporativo</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ventas1"
              required
              autoFocus
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="hint-box">
          <strong>Usuarios de prueba (tras ejecutar el seed):</strong>
          <ul>
            <li>ventas1 / Ventas123!</li>
            <li>logistica1 / Logistica123!</li>
            <li>soporte1 / Soporte123!</li>
            <li>admin / Admin123!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
