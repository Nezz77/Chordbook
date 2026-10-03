'use client';
import {useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {BookOpen,Maximize,Minimize,Minus,Plus,Save} from 'lucide-react';
import {type Song,NOTES,keyName,soundingKey,pitch} from '../lib/music';

export function PlayView({song,children,onRead,onTranspose,onCapo,onSave,dirty,saving,writable}:{song:Song;children:ReactNode;onRead:()=>void;onTranspose:(amount:number)=>void;onCapo:(capo:number)=>void;onSave:()=>void;dirty:boolean;saving:boolean;writable:boolean}){
 const sheet=useRef<HTMLDivElement>(null);
 const [small,setSmall]=useState(false);
 const [fullscreen,setFullscreen]=useState(false);
 const [fullscreenError,setFullscreenError]=useState('');
 useLayoutEffect(()=>{
  const element=sheet.current;if(!element)return;
  let frame=0;
  function fit(){
   if(!element||!element.clientWidth||!element.clientHeight)return;
   const bounds=element.getBoundingClientRect();
   const fits=()=>element.scrollWidth<=element.clientWidth+1&&Array.from(element.children).every(child=>Array.from(child.getClientRects()).every(r=>r.right<=bounds.right+1&&r.bottom<=bounds.bottom+1));
   let bestSize=0,bestColumns=1;
   // Measure actual wrapping in each layout, including transposed chord widths.
   for(let columns=1;columns<=Math.min(6,Math.max(1,Math.floor(bounds.width/230)));columns++){
    element.style.columnCount=String(columns);
    let low=1,high=28;
    for(let step=0;step<9;step++){
     const size=(low+high)/2;element.style.fontSize=size+'px';
     if(fits())low=size;else high=size;
    }
    const size=Math.floor(low*4)/4;
    if(size>bestSize){bestSize=size;bestColumns=columns;}
   }
   element.style.columnCount=String(bestColumns);
   element.style.fontSize=bestSize+'px';
   element.dataset.columns=String(bestColumns);
   setSmall(bestSize<12);
  }
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(fit)};
  fit();const observer=new ResizeObserver(schedule);observer.observe(element);
  document.fonts.ready.then(schedule);
  return()=>{observer.disconnect();cancelAnimationFrame(frame)};
 },[song.content,song.transpose,song.key,song.id]);
 useLayoutEffect(()=>{
  const update=()=>setFullscreen(!!document.fullscreenElement);
  update();document.addEventListener('fullscreenchange',update);return()=>document.removeEventListener('fullscreenchange',update);
 },[]);
 async function toggleFullscreen(){try{setFullscreenError('');if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{setFullscreenError('Full screen is unavailable here. The song still fits this window.')}}
 return <section className="play-view" aria-label="Whole song playing view">
  <div className="play-toolbar"><div className="play-title"><h1>{song.title}</h1><p>{song.artist||'Sinhala collection'}</p><span className="play-capo-summary">{song.capo?'Capo '+song.capo:'No capo'} · Chord key {keyName(song)||'—'} · Sounds in {soundingKey(song)||'—'}</span></div><div className="play-actions"><div className="play-key"><button aria-label="Transpose down" disabled={!song.key} onClick={()=>onTranspose(song.transpose-1)}><Minus size={16}/></button><label><span className="sr-only">Playing key</span><select aria-label="Playing key" disabled={!song.key} value={song.key?String(pitch(keyName(song).replace(/m$/,''))):''} onChange={e=>onTranspose(Number(e.target.value)-pitch(song.key.replace(/m$/,'')))}>{!song.key&&<option value="">No key</option>}{NOTES.map((n,i)=><option key={n} value={i}>{n}{song.key.endsWith('m')?'m':''}</option>)}</select></label><button aria-label="Transpose up" disabled={!song.key} onClick={()=>onTranspose(song.transpose+1)}><Plus size={16}/></button></div><label className="capo-control">Capo<select aria-label="Capo fret" value={song.capo||0} onChange={e=>onCapo(Number(e.target.value))}>{Array.from({length:13},(_,i)=><option key={i} value={i}>{i?'Fret '+i:'None'}</option>)}</select></label>{dirty&&<button className="icon-button" aria-label="Save setup" title="Save setup" disabled={!writable||saving} onClick={onSave}><Save size={17}/></button>}<button className="icon-button" aria-label={fullscreen?'Exit full screen':'Full screen'} title={fullscreen?'Exit full screen':'Full screen'} onClick={toggleFullscreen}>{fullscreen?<Minimize size={18}/>:<Maximize size={18}/>}</button><button className="secondary" aria-label="Reading view" title="Reading view" onClick={onRead}><BookOpen size={16}/><span>Reading view</span></button></div></div>
  <div className="play-paper"><div className="play-columns" ref={sheet}>{children}</div></div>
  <div className="play-footer" role="status"><span>{fullscreenError||(small?'For larger text, turn your phone sideways or use a larger screen.':'Whole song · Read down each column, then across.')}</span><span>Auto fit</span></div>
 </section>
}
