import { useState } from 'react';
import { uploadMedia } from '@/lib/api/media';
import { ApiError } from '@/lib/api/client';

export function UploadMediaModal({ open, onClose }: { open:boolean; onClose:()=>void }){
  const [file,setFile]=useState<File|null>(null);
  const [asset,setAsset]=useState<any>(null);
  const [err,setErr]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);

  if(!open) return null;

  async function go(){
    if(!file) return;
    setLoading(true);
    setErr(null);
    try{
      const a = await uploadMedia(file);
      setAsset(a);
    }catch(e:any){
      setErr(e.message);
    }finally{
      setLoading(false);
    }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-md rounded-lg border border-border bg-background shadow-glow"> <div className="p-4 border-b border-border flex justify-between items-center"><h2 className="text-lg font-semibold text-roma-gold">Upload Media</h2><button onClick={onClose} className="text-muted-foreground hover:text-foreground" disabled={loading}>✕</button></div> <div className="p-4 space-y-4"> <input type="file" accept="image/*,video/*" onChange={e=>{ setFile(e.target.files?.[0]||null); setAsset(null); }} /> {file && <p className="text-xs">{file.name} {(file.size/1024).toFixed(1)} KB</p>} <button onClick={go} disabled={!file||loading} className="w-full rounded bg-roma-gold text-black py-2 text-sm font-medium disabled:opacity-50">{loading?'Caricamento...':'Carica'}</button> {asset && <div className="text-xs break-all"><p>ID: {asset.id}</p><a href={asset.originalUrl} className="underline text-roma-gold" target="_blank">Apri</a></div>} {err && <p className="text-xs text-red-500">{err}</p>} </div> <div className="p-3 border-t border-border flex justify-end"><button onClick={onClose} className="text-sm px-4 py-1 rounded border border-border hover:bg-muted" disabled={loading}>Chiudi</button></div> </div></div>; }