export const API_BASE = (import.meta as any).env?.VITE_API_BASE || (window as any).__API_BASE__ || 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message:string,status:number,data:unknown){
    super(message);
    this.status=status;
    this.data=data;
  }
}

export async function apiFetch(path:string, opts: { json?: unknown; method?: string; headers?: Record<string, string>; } = {}) {
  const { json, method='GET', headers } = opts;
  const res = await fetch(API_BASE + path, {
    method,
    credentials:'include',
    headers: { ...(json? {'Content-Type':'application/json'}:{}), ...headers },
    body: json? JSON.stringify(json): undefined
  });
  const text = await res.text();
  const data: unknown = text? (()=>{ try { return JSON.parse(text);} catch { return text;} })(): null;
  if(!res.ok) throw new ApiError((data as any)?.error||(data as any)?.message||'Errore richiesta', res.status, data);
  return data;
}