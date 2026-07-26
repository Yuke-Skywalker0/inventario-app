import { apiJson } from './client';

export async function previewInvitation(token) {
  return apiJson(`/invitations/${token}`);
}

export async function acceptInvitation(token) {
  return apiJson(`/invitations/${token}/accept`, { method: 'POST' });
}
