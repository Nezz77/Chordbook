'use client';

import {useId,useState} from 'react';
import {ArrowRight,Guitar} from 'lucide-react';
import {NOTES,keyName,pitch,soundingKey,type Song} from '../lib/music';
import {findCapoFret} from '../lib/capo';
import {GlassSelect} from './glass-select';

const keyOptions=NOTES.flatMap(note=>[
  {value:note,label:note,detail:'Major'},
  {value:note+'m',label:note+'m',detail:'Minor'},
]);

function optionKey(key:string){
  const root=pitch(key.replace(/m$/,''));
  return root===undefined?'':NOTES[root]+(key.endsWith('m')?'m':'');
}

export function CapoFinder({song}:{song:Song}){
  const headingId=useId();
  const [original,setOriginal]=useState(()=>optionKey(soundingKey(song)));
  const [shape,setShape]=useState(()=>optionKey(keyName(song))||'C');
  const [result,setResult]=useState<number|null>(null);
  const minor=original.endsWith('m');
  const shapeOptions=NOTES.map(note=>({value:note+(minor?'m':''),label:note+(minor?'m':''),detail:minor?'Minor shapes':'Major shapes'}));

  function changeOriginal(value:string){
    setOriginal(value);
    setShape(current=>current.replace(/m$/,'')+(value.endsWith('m')?'m':''));
    setResult(null);
  }

  return <section className="capo-finder" aria-labelledby={headingId}>
    <div className="capo-finder-heading"><span className="capo-finder-icon"><Guitar size={17}/></span><div><span className="capo-finder-eyebrow">FIND YOUR POSITION</span><h3 id={headingId}>Capo fret finder</h3></div></div>
    <p className="capo-finder-intro">The key you hear. The shapes you love.</p>
    <div className="capo-finder-fields">
      <label>Original key <span>(sounds in)</span><GlassSelect label="Original key (sounds in)" value={original} onChange={changeOriginal} options={original?keyOptions:[{value:'',label:'Choose a key'},...keyOptions]} caption="Original key"/></label>
      <label>Chord shapes to play<GlassSelect label="Chord shapes to play" value={shape} onChange={value=>{setShape(value);setResult(null)}} options={shapeOptions}/></label>
    </div>
    <button type="button" className="primary capo-find-button" disabled={!original} onClick={()=>setResult(findCapoFret(original,shape))}>Find capo fret<ArrowRight size={15}/></button>
    <div className="capo-finder-feedback" role="status" aria-live="polite" aria-atomic="true">
      {result===null?<p className="capo-finder-hint">{original?`${minor?'Minor':'Major'} keys use ${minor?'minor':'major'} shapes. Choose your shapes, then find your fret.`:'Choose the key you want the song to sound in.'}</p>:<div className="capo-result" key={`${original}-${shape}-${result}`}>
        <div className="capo-result-summary"><span className="capo-result-number" aria-hidden="true">{String(result).padStart(2,'0')}</span><div><strong>{result===0?'No capo needed':`Capo on fret ${result}`}</strong><span>Play {shape} shapes to sound in {original}.</span></div></div>
        {result>7&&<p className="capo-high-fret">Try another shape if you prefer a lower fret.</p>}
      </div>}
    </div>
  </section>;
}
