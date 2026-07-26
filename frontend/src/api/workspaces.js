import { apiJson } from './client';

export async function listMyWorkspaces() {
  const data = await apiJson('/workspaces/mine');
  return data.workspaces;
}

export async function switchWorkspace(workspaceId) {
  await apiJson('/workspaces/switch', {
    method: 'POST',
    body: JSON.stringify({ workspaceId })
  });
}
