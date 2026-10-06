'use client';

import {useEffect,type CSSProperties} from 'react';
import {Guitar} from 'lucide-react';

export function LoadingScreen({leaving=false}:{leaving?:boolean}){
  return <div className={`boot-loader ${leaving?'is-leaving':''}`}>
    <div className="boot-ambient" aria-hidden="true"/>
    <div className="boot-brand"><Guitar size={22}/><span>chordbook<span>.</span></span></div>
    <div className="boot-center">
      <div className="boot-instrument" aria-hidden="true">
        <div className="boot-string-bed">{Array.from({length:6},(_,i)=><span className="boot-string" style={{'--string':i} as CSSProperties} key={i}><i/></span>)}</div>
        <span className="boot-fret fret-one"/><span className="boot-fret fret-two"/>
        <span className="boot-note note-one"/><span className="boot-note note-two"/><span className="boot-note note-three"/>
        <span className="boot-instrument-caption">E &nbsp; A &nbsp; D &nbsp; G &nbsp; B &nbsp; E</span>
      </div>
      <span className="boot-eyebrow">YOUR OWN LITTLE MUSIC ROOM</span>
      <h1>Find your rhythm<span>.</span></h1>
      <p>Your songs. Your key. Your moment.</p>
      <div className="boot-progress" aria-hidden="true"><span/></div>
      <div className="boot-status" role="status">{leaving?'Opening the room…':'Loading your songbook…'}</div>
    </div>
    <div className="boot-footer"><span>MADE FOR THE MOMENTS YOU PLAY</span><span>Futuretech | NH</span></div>
  </div>;
}

export function BootLoader({loading,onComplete}:{loading:boolean;onComplete:()=>void}){
  useEffect(()=>{
    if(loading)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer=window.setTimeout(onComplete,reduced?0:480);
    return()=>window.clearTimeout(timer);
  },[loading,onComplete]);
  return <LoadingScreen leaving={!loading}/>;
}
