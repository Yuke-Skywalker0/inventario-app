import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, workspace, logout } = useAuth();

  return (
    <div className="profile">
      <h1>Profilo</h1>

      <div className="profile-card">
        <div className="profile-row">
          <span>Nome</span>
          <strong>{user?.name || '—'}</strong>
        </div>
        <div className="profile-row">
          <span>Email</span>
          <strong>{user?.email}</strong>
        </div>
        <div className="profile-row">
          <span>Spazio</span>
          <strong>{workspace?.name}</strong>
        </div>
      </div>

      <button type="button" className="profile-logout" onClick={logout}>
        Esci
      </button>
    </div>
  );
}
