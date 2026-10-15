import { parseAdminSession, type AdminSession } from './admin-session';
import { accountApiBase } from './admin-account';
const key = () => 'leaders-admin:' + accountApiBase();
export async function readSession() {
    const value = sessionStorage.getItem(key());
    if (!value) return null;
    try { return parseAdminSession(JSON.parse(value)); } catch { return null; }
}
export async function saveSession(session: AdminSession) { sessionStorage.setItem(key(), JSON.stringify(session)); }
export async function clearSession() { sessionStorage.removeItem(key()); }
