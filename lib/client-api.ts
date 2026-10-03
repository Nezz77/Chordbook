// Bound connection waits so a stalled request cannot leave the editor locked.
export async function songbookRequest(url:string,options:RequestInit={},timeoutMs=15000){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{return await fetch(url,{...options,signal:controller.signal});}
 catch(error){if(controller.signal.aborted)throw new Error('The connection is taking too long. Please try again. Your text is still in the editor.');throw error;}
 finally{clearTimeout(timer);}
}
