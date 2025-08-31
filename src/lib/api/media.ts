import { apiFetch, API_BASE } from './client';

export async function uploadMedia(file: File){
  const presignPaths = ['/media/presign','/admin/media/presign'];
  let presign:any;
  let lastErr:any;

  for(const p of presignPaths){
    try {
      presign = await apiFetch(p,{ method:'POST', json:{ filename:file.name, mimeType:file.type, type: file.type.startsWith('video')? 'VIDEO':'IMAGE' } });
      break;
    } catch(e:any){
      lastErr=e;
    }
  }

  if(!presign) throw lastErr;
  await fetch(API_BASE + presign.uploadUrl,{ method:'PUT', body:file });
  const dims = file.type.startsWith('image')? await readImageDimensions(file).catch(()=>null): null;
  const asset = await apiFetch((presign.uploadUrl.startsWith('/uploads')? (presign.uploadUrl.includes('/admin/')? '/admin':'') : '') + `/media/${presign.assetId}/finalize`, { method:'POST', json:{ width:dims?.width, height:dims?.height } });
  return asset;
}

async function readImageDimensions(file: File){
  return new Promise<{width:number;height:number}>((resolve,reject)=>{
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload=()=>{
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };
    img.onerror=reject;
    img.src=url;
  });
}

export { API_BASE } from './client';