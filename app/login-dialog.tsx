'use client';
import {useEffect,useRef,useState} from 'react';
import {LockKeyhole,Loader2,X} from 'lucide-react';
import {songbookRequest} from '../lib/client-api';

export function LoginDialog({onClose,onLogin}:{onClose:()=>void;onLogin:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  const [username,setUsername]=useState('');const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>dialog?.close()},[]);
  async function submit(event:React.FormEvent){
    event.preventDefault();setBusy(true);setError('');
    try{
      const response=await songbookRequest('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Could not log in. Please try again.');
      setPassword('');onLogin();
    }catch(error){setError(error instanceof Error?error.message:'Could not log in. Please try again.')}finally{setBusy(false)}
  }
  return <dialog ref={ref} className="modal login-modal" onCancel={event=>{event.preventDefault();onClose()}}>
    <div className="modal-title"><h2>Log in to edit</h2><button className="icon-button" aria-label="Close login" onClick={onClose}><X size={20}/></button></div>
    <form onSubmit={submit}>
      <p className="login-description">Everyone can view and play. Log in to change the shared songbook.</p>
      <label className="full-label">Username<input name="username" autoComplete="username" autoFocus required maxLength={160} value={username} onChange={e=>setUsername(e.target.value)}/></label>
      <label className="full-label">Password<input name="password" type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={e=>setPassword(e.target.value)}/></label>
      {error&&<p className="error" role="alert">{error}</p>}
      <div className="modal-actions"><button className="secondary" type="button" onClick={onClose}>Cancel</button><button className="primary" type="submit" disabled={busy}>{busy?<Loader2 className="spin" size={16}/>:<LockKeyhole size={16}/>}Log in</button></div>
    </form>
  </dialog>;
}
