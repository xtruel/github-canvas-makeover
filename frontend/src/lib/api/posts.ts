import { apiFetch } from './client';

export interface CommunityPost {
  id:string;
  title:string;
  type:'TEXT'|'IMAGE'|'VIDEO';
  body?:string|null;
  mediaId?:string|null;
  createdAt:string;
}

export async function listPosts(cursor?:string, limit=20){
  const q = new URLSearchParams();
  if(cursor) q.append('cursor', cursor);
  if(limit) q.append('limit', String(limit));
  return apiFetch(`/posts?${q.toString()}`);
}

export async function createPost(data:{ type:'TEXT'|'IMAGE'|'VIDEO'; title:string; body?:string; mediaId?:string; }){
  return apiFetch('/posts',{ method:'POST', json:data });
}
