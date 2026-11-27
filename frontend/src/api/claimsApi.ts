import { Claim, CreateClaimRequest } from '../types/claim';

const BASE_URL = '/api/claims';

export async function fetchClaims(status?: string): Promise<Claim[]> {
  const url = status ? `${BASE_URL}?status=${encodeURIComponent(status)}` : BASE_URL;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch claims: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchClaimById(id: number): Promise<Claim> {
  const response = await fetch(`${BASE_URL}/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Claim #${id} not found.`);
    }
    throw new Error(`Failed to fetch claim #${id}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function createClaim(data: CreateClaimRequest): Promise<Claim> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Failed to create claim: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function deleteClaim(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Claim #${id} not found.`);
    }
    throw new Error(`Failed to delete claim #${id}: ${response.status} ${response.statusText}`);
  }
}
