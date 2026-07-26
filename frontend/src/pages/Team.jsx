import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  listMembers,
  inviteMember,
  revokeInvitation,
  updateMemberRole,
  removeMember
} from '../api/members';
import BottomSheet from '../components/BottomSheet';
import './Team.css';

const ROLE_LABELS = {
  owner: 'Proprietario',
  admin: 'Admin',
  technician: 'Tecnico',
  viewer: 'Solo lettura'
};

const ASSIGNABLE_ROLES = ['admin', 'technician', 'viewer'];

export default function Team() {
  const { role: myRole } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  const canManage = myRole === 'owner' || myRole === 'admin';

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setError('');
    try {
      setData(await listMembers());
    } catch (err) {
      setError(err.message || 'Impossibile caricare il team');
    }
  }

  async function handleInviteDone() {
    setInviteOpen(false);
    load();
  }

  async function handleRevoke(id) {
    await revokeInvitation(id);
    load();
  }

  async function handleRoleChange(memberId, role) {
    await updateMemberRole(memberId, role);
    load();
  }

  async function handleRemove(memberId) {
    if (!window.confirm('Rimuovere questa persona dal team?')) return;
    await removeMember(memberId);
    load();
  }

  return (
    <div className="team-page">
      <button type="button" className="team-back" onClick={() => navigate('/profilo')}>
        ← Profilo
      </button>
      <h1>Team</h1>

      {error && <p className="team-error">{error}</p>}

      {data && (
        <>
          <section className="team-section">
            <h2>Membri</h2>
            <div className="team-list">
              {data.members.map((m) => (
                <div key={m.id} className="team-row">
                  <div className="team-row-info">
                    <span className="team-row-name">{m.user?.name || m.user?.email || 'Utente'}</span>
                    <span className="team-row-email">{m.user?.email}</span>
                  </div>
                  {canManage && m.role !== 'owner' ? (
                    <div className="team-row-actions">
                      <select value={m.role} onChange={(e) => handleRoleChange(m.id, e.target.value)}>
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                      <button type="button" className="team-remove" onClick={() => handleRemove(m.id)}>
                        Rimuovi
                      </button>
                    </div>
                  ) : (
                    <span className="team-role-badge">{ROLE_LABELS[m.role]}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {data.invitations.length > 0 && (
            <section className="team-section">
              <h2>Inviti in attesa</h2>
              <div className="team-list">
                {data.invitations.map((i) => (
                  <div key={i.id} className="team-row">
                    <div className="team-row-info">
                      <span className="team-row-name">{i.email}</span>
                      <span className="team-row-email">{ROLE_LABELS[i.role]}</span>
                    </div>
                    {canManage && (
                      <button type="button" className="team-remove" onClick={() => handleRevoke(i.id)}>
                        Revoca
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {canManage && (
            <button type="button" className="team-invite-button" onClick={() => setInviteOpen(true)}>
              + Invita qualcuno
            </button>
          )}
        </>
      )}

      <BottomSheet open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invita qualcuno">
        <InviteForm onDone={handleInviteDone} />
      </BottomSheet>
    </div>
  );
}

function InviteForm({ onDone }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('technician');
  const [inviteUrl, setInviteUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const invitation = await inviteMember({ email, role });
      setInviteUrl(invitation.inviteUrl);
    } catch (err) {
      setError(err.message || 'Impossibile creare il link di invito');
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard non disponibile: l'utente può selezionare il testo a mano */
    }
  }

  if (inviteUrl) {
    return (
      <div className="invite-result">
        <p className="invite-result-hint">
          Invito creato! Condividi questo link con {email} (WhatsApp, SMS, come preferisci —
          scade tra 7 giorni):
        </p>
        <div className="invite-result-url">{inviteUrl}</div>
        <button type="button" className="invite-copy-button" onClick={handleCopy}>
          {copied ? 'Copiato ✓' : 'Copia link'}
        </button>
        <button type="button" className="invite-done-button" onClick={onDone}>
          Fatto
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="invite-form">
      <label className="invite-field">
        <span>Email della persona</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nome@esempio.it"
          autoFocus
          required
        />
      </label>

      <label className="invite-field">
        <span>Ruolo</span>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="technician">Tecnico — può gestire prodotti e quantità</option>
          <option value="admin">Admin — può anche gestire ubicazioni e il team</option>
          <option value="viewer">Solo lettura — può solo consultare</option>
        </select>
      </label>

      {error && <p className="invite-error">{error}</p>}

      <button type="submit" className="invite-submit" disabled={busy}>
        {busy ? 'Attendi…' : 'Crea link di invito'}
      </button>
    </form>
  );
}
