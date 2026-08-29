import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onSuccess }) {
  const { login, signup, error } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const ok = mode === 'login'
      ? await login(username, password)
      : await signup({ username, email, password });
    setLoading(false);
    if (ok) onSuccess?.();
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>EcoHome Store</h1>
        <p className="subtitle">Catálogo y chat · JWT unificado (web y móvil)</p>

        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Ingresar
          </button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={mode === 'login' ? 'arturo' : 'tu_usuario'}
              required
              autoFocus
            />
          </label>

          {mode === 'signup' && (
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </label>
          )}

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
            {loading ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        <div className="hint-box">
          <strong>Usuarios de prueba (tras el seed):</strong>
          <ul>
            <li>admin / Admin123!</li>
            <li>cliente / Cliente123!</li>
            <li>arturo / Arturo123! <em>(catálogo de demo)</em></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
