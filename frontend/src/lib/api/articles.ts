import { apiFetch } from './client';

export async function listArticles(){
  return apiFetch('/articles');
}

export async function createArticle(data:{ title:string; body:string; publish?:boolean; coverMediaId?:string; language?:string; }){
  return apiFetch('/admin/articles',{ method:'POST', json:{ title:data.title, body:data.body, status: data.publish?'PUBLISHED':'DRAFT', language: data.language||'it', coverMediaId: data.coverMediaId||null } });
}
