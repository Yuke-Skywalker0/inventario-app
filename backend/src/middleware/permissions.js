// Gerarchia semplice invece di permessi granulari (Sezione 9 permette
// entrambi gli approcci; per l'MVP i ruoli bastano e sono più facili da
// capire per chi userà l'app). Ogni ruolo include automaticamente le
// capacità di quelli sotto di lui.
const ROLE_ORDER = ['viewer', 'technician', 'admin', 'owner'];

function requireMinRole(minRole) {
  const minIndex = ROLE_ORDER.indexOf(minRole);
  if (minIndex === -1) {
    throw new Error(`Ruolo sconosciuto: ${minRole}`);
  }

  return (req, res, next) => {
    const roleIndex = ROLE_ORDER.indexOf(req.memberRole);
    if (roleIndex < minIndex) {
      return res.status(403).json({ error: 'Non hai i permessi per questa azione' });
    }
    next();
  };
}

module.exports = { requireMinRole, ROLE_ORDER };
