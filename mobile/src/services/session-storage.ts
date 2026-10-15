import * as SecureStore from 'expo-secure-store';
import { parseAdminSession, type AdminSession } from './admin-session';
import { apiBase } from '@/api/config';

const key = () => 'leaders-admin-' + apiBase().replace(/[^a-zA-Z0-9._-]/g, '_');
export async function readSession() {
    const value = await SecureStore.getItemAsync(key());
    if (!value) return null;
    try { return parseAdminSession(JSON.parse(value)); } catch { return null; }
}
export const saveSession = (session: AdminSession) => SecureStore.setItemAsync(key(), JSON.stringify(session));
export const clearSession = () => SecureStore.deleteItemAsync(key());
