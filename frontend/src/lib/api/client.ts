export const API_BASE = (import.meta as any).env?.VITE_API_BASE || (window as any).__API_BASE__ || 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message:string,status:number,data:any){
    super(message);
    this.status=status;
    this.data=data;
  }
}

export async function apiFetch(path:string, opts: { json?: any; method?: string; headers?: any; } = {}) {
  const { json, method='GET', headers } = opts;
  const res = await fetch(API_BASE + path, {
    method,
    credentials:'include',
    headers: { ...(json? {'Content-Type':'application/json'}:{}), ...headers },
    body: json? JSON.stringify(json): undefined
  });
  const text = await res.text();
  let data:any = text? (()=>{ try { return JSON.parse(text);} catch { return text;} })(): null;
  if(!res.ok) throw new ApiError(data?.error||data?.message||'Errore richiesta', res.status, data);
  return data;
}