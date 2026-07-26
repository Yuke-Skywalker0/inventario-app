const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVITABLE_ROLES = ['admin', 'technician', 'viewer'];

function validateInviteInput(body = {}) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Email non valida' };
  }

  const role = INVITABLE_ROLES.includes(body.role) ? body.role : 'technician';

  return { valid: true, data: { email, role } };
}

module.exports = { validateInviteInput, INVITABLE_ROLES };
