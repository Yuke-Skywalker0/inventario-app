const User = require('../models/User');
const Member = require('../models/Member');
const Workspace = require('../models/Workspace');

// Risolve workspace attivo + ruolo per un utente, in un solo posto
// (Sezione 56: niente duplicati) — usata da requireWorkspace (middleware),
// da /api/me e dal login/register, che prima avevano ciascuno una propria
// logica leggermente diversa: il disallineamento è esattamente il motivo
// per cui gli utenti creati prima della Fase 10 (senza defaultWorkspaceId
// valorizzato) risultavano con ruolo vuoto in alcuni punti dell'app e
// funzionanti in altri.
//
// Auto-riparazione: se l'utente non ha ancora un defaultWorkspaceId
// valido (utenti creati prima della Fase 10, o casi limite), lo si
// deduce dalla prima appartenenza trovata e lo si salva — succede una
// volta sola, dopodiché l'utente resta "sanato" in modo permanente.
async function resolveActiveWorkspace(userId) {
  const user = await User.findById(userId);
  if (!user) return { user: null, workspace: null, role: null };

  let member = user.defaultWorkspaceId
    ? await Member.findOne({ workspaceId: user.defaultWorkspaceId, userId })
    : null;

  if (!member) {
    member = await Member.findOne({ userId }).sort({ createdAt: 1 });
    if (member) {
      user.defaultWorkspaceId = member.workspaceId;
      await user.save();
    }
  }

  if (!member) {
    return { user, workspace: null, role: null };
  }

  const workspace = await Workspace.findById(member.workspaceId);
  return { user, workspace, role: member.role };
}

module.exports = { resolveActiveWorkspace };
