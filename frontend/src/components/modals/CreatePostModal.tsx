import { useState } from 'react';
import { createPost } from '@/lib/api/posts';
import { uploadMedia } from '@/lib/api/media';
import { ApiError } from '@/lib/api/client';

interface Props {
  open:boolean;
  onClose:()=>void;
  onCreated:()=>void;
}

export function CreatePostModal({ open, onClose, onCreated }: Props){
  const [tab,setTab]=useState<'TEXT'|'MEDIA'>('TEXT');
  const [title,setTitle]=useState('');
  const [body,setBody]=useState('');
  const [file,setFile]=useState<File|null>(null);
  const [mediaId,setMediaId]=useState<string|null>(null);
  const [preview,setPreview]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState<string|null>(null);

  if(!open) return null;

  const reset=()=>{
    setTitle('');
    setBody('');
    setFile(null);
    setMediaId(null);
    setPreview(null);
    setTab('TEXT');
    setErr(null);
  };

  async function doUpload(){
    if(!file) return;
    setLoading(true);
    setErr(null);
    try{
      const asset = await uploadMedia(file);
      setMediaId(asset.id);
      setPreview(asset.originalUrl);
    }catch(e:any){
      setErr(e.message);
    }finally{
      setLoading(false);
    }
  }

  async function submit(){
    setLoading(true);
    setErr(null);
    try{
      if(tab==='TEXT'){ await createPost({ type:'TEXT', title, body }); }
      else {
        if(!mediaId) throw new Error('Carica prima il file');
        const type = file!.type.startsWith('video')? 'VIDEO':'IMAGE';
        await createPost({ type, title, mediaId });
      }
      onCreated();
      reset();
      onClose();
    } catch(e:any){
      if(e instanceof ApiError && e.status===401) setErr('Devi effettuare login (dev-login).');
      else setErr(e.message||'Errore');
    } finally{
      setLoading(false);
    }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"> <div className="w-full max-w-2xl rounded-lg border border-border bg-background shadow-glow"> <div className="p-4 border-b border-border flex justify-between items-center"><h2 className="text-lg font-semibold text-roma-gold">Crea Post</h2><button onClick={()=>{ onClose(); }} disabled={loading} className="text-muted-foreground hover:text-foreground">✕</button></div> <div className="px-4 pt-4 flex gap-4 border-b border-border"> <button className={`pb-2 text-sm ${tab==='TEXT'?'text-roma-gold border-b-2 border-roma-gold':'text-muted-foreground'}`} onClick={()=>setTab('TEXT')}>Testo</button> <button className={`pb-2 text-sm ${tab==='MEDIA'?'text-roma-gold border-b-2 border-roma-gold':'text-muted-foreground'}`} onClick={()=>setTab('MEDIA')}>Immagine & Video</button> </div> <div className="p-4 space-y-4"> <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Titolo</label><input value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} className="w-full rounded border border-border bg-muted p-2 text-sm" placeholder="Titolo..." /></div> {tab==='TEXT' && <div className="space-y-1"><label className="text-xs uppercase text-muted-foreground">Testo</label><textarea value={body} onChange={e=>setBody(e.target.value)} className="w-full rounded border border-border bg-muted p-2 text-sm h-40" placeholder="Scrivi..." /></div>} {tab==='MEDIA' && <div className="space-y-3"> <input type="file" accept="image/*,video/*" onChange={e=>{ const f=e.target.files?.[0]||null; setFile(f); setMediaId(null); setPreview(f?URL.createObjectURL(f):null); }} /> {file && !mediaId && <button onClick={doUpload} disabled={loading} className="text-xs px-3 py-1 rounded bg-roma-gold text-black">{loading?'Upload...':'Carica File'}</button>} {preview && <div className="mt-2"> {file?.type.startsWith('video')? <video src={preview} className="max-h-48" controls /> : <img src={preview} className="max-h-48" /> } <p className="text-xs text-muted-foreground mt-1">{mediaId? 'Media pronto (ID '+mediaId+')':'Anteprima locale'}</p> </div>} </div>} {err && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{err}</p>} </div> <div className="p-3 border-t border-border flex justify-end gap-2"> <button onClick={()=>{ reset(); onClose(); }} className="text-sm px-4 py-1 rounded border border-border hover:bg-muted" disabled={loading}>Annulla</button> <button onClick={submit} disabled={loading || !title || (tab==='TEXT' && !body) || (tab==='MEDIA' && !mediaId)} className="text-sm px-4 py-1 rounded bg-roma-gold text-black font-medium disabled:opacity-50">{loading?'Salvataggio...':'Pubblica'}</button> </div> </div> </div>; }