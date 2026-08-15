import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Chat from './pages/Chat';
import './styles.css';

function AppInner() {
  const { token } = useAuth();
  return token ? <Chat /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
