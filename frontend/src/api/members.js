import { apiJson } from './client';

export async function listMembers() {
  const data = await apiJson('/members');
  return data; // { members, invitations }
}

export async function inviteMember({ email, role }) {
  const data = await apiJson('/members/invite', {
    method: 'POST',
    body: JSON.stringify({ email, role })
  });
  return data.invitation;
}

export async function revokeInvitation(id) {
  await apiJson(`/members/invitations/${id}`, { method: 'DELETE' });
}

export async function updateMemberRole(id, role) {
  await apiJson(`/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  });
}

export async function removeMember(id) {
  await apiJson(`/members/${id}`, { method: 'DELETE' });
}
