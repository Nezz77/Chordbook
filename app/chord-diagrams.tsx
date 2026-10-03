import {chordShape} from '../lib/chord-shapes';
export function ChordDiagrams({chords,capo=0}:{chords:string[];capo?:number}){
 return <div className="chord-diagrams"><p className="diagram-guide">Standard tuning · E A D G B E<br/>× mute · ○ open · 1–4 fingers{capo>0&&<><br/>Frets shown relative to capo {capo}.</>}</p><div className="chord-diagram-grid">{chords.map(name=>{
  const shape=chordShape(name);
  if(!shape)return <figure className="chord-diagram" key={name}><figcaption>{name}</figcaption><p>Diagram unavailable</p></figure>;
  const {frets,fingers,baseFret,barres}=shape;const rows=Math.max(4,...frets);const h=rows*22+54;
  const description=frets.map((f,i)=>f<0?'mute':f===0?'open':`fret ${f+baseFret-1}, finger ${fingers[i]||'unspecified'}`).join('; ');
  return <figure className="chord-diagram" key={name}><figcaption>{name}</figcaption><svg viewBox={`0 0 126 ${h}`} role="img" aria-label={`${name} guitar chord. Low E to high E: ${description}${capo?`. Relative to capo ${capo}`:''}`}>
   {baseFret>1&&<text x="2" y="46" fontSize="10" fill="#687969">{baseFret}fr</text>}
   {Array.from({length:6},(_,i)=><line key={'s'+i} x1={28+i*17} x2={28+i*17} y1="30" y2={30+rows*22} stroke="#708071" strokeWidth="1"/>)}
   {Array.from({length:rows+1},(_,i)=><line key={'f'+i} x1="28" x2="113" y1={30+i*22} y2={30+i*22} stroke="#526554" strokeWidth={i===0&&baseFret===1?4:1}/>)}
   {barres.map(f=>{const strings=frets.map((v,i)=>v===f?i:-1).filter(i=>i>=0);return strings.length>1?<line key={f} x1={28+Math.min(...strings)*17} x2={28+Math.max(...strings)*17} y1={30+(f-.5)*22} y2={30+(f-.5)*22} stroke="#235f46" strokeWidth="13" strokeLinecap="round"/>:null})}
   {frets.map((f,i)=><g key={i}>{f<=0?<text x={28+i*17} y="20" textAnchor="middle" fontSize="15" fill="#607263">{f<0?'×':'○'}</text>:<><circle cx={28+i*17} cy={30+(f-.5)*22} r="7.5" fill="#235f46"/><text x={28+i*17} y={30+(f-.5)*22+3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">{fingers[i]||''}</text></>}<text x={28+i*17} y={h-7} textAnchor="middle" fontSize="9" fill="#849085">{['E','A','D','G','B','e'][i]}</text></g>)}
  </svg></figure>
 })}</div><a className="diagram-credit" href="https://github.com/tombatossals/chords-db" target="_blank" rel="noreferrer">Chord position reference</a></div>
}
