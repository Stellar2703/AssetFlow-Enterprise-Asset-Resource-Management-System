const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export function getStoredToken() {
  return localStorage.getItem('token') || '';
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function clearStoredToken() {
  localStorage.removeItem('token');
}

export async function fetchApi(endpoint, options = {}, token = '') {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }
  return response.json();
}
