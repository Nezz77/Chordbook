export type Song = { id:string; title:string; artist:string; language:'English'|'Sinhala'; key:string; content:string; source:string; transpose:number; favorite:boolean; capo?:number; updatedAt?:number };
export const NOTES=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const SHARP=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLAT=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const VALUES:Record<string,number>={C:0,'B#':0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,Fb:4,'E#':5,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11,Cb:11};
export const CHORD=/^([A-G](?:#|b)?)(?:(?:maj|min|dim|aug|sus|add|m|M|ø|o|\+|-)?\d*(?:\([^\s\]]+\))?(?:sus[24]|add\d+)?(?:[#b]\d+)*)(?:\/[A-G](?:#|b)?)?$/;
export function pitch(note:string){return VALUES[note.replace(/[♯]/g,'#').replace(/[♭]/g,'b')];}
export function transposeChord(chord:string,amount:number,flats=false){
 const n=((amount%12)+12)%12;if(n===0)return chord;
 return chord.replace(/^([A-G][#b]?)|\/([A-G][#b]?)$/g,(match,a,b)=>{const root=a||b;const value=pitch(root);return value===undefined?match:(b?'/':'')+(flats?FLAT:SHARP)[(value+n)%12]});
}
export function keyName(song:Song){return song.key?transposeChord(song.key,song.transpose,/b/.test(song.key)||['F','Bb','Eb','Ab','Db'].includes(NOTES[((pitch(song.key.replace(/m$/,''))||0)+song.transpose+120)%12])):'';}
export function chordFor(song:Song,chord:string){return transposeChord(chord,song.transpose,/b/.test(keyName(song))||keyName(song)==='F');}
export type Segment={chord?:string;text:string};
export type Line={type:'section'|'line'|'space';label?:string;segments?:Segment[]};
export function parseSheet(content:string):Line[]{
 return content.replace(/\r/g,'').split('\n').map(line=>{
 if(!line.trim())return {type:'space'};
 const section=line.match(/^\s*\{(?:comment|c|start_of_chorus|soc):?\s*(.*?)\}\s*$/i);
 if(section)return {type:'section',label:section[1]||'Chorus'};
 if(/^\s*\{.*\}\s*$/.test(line))return {type:'space'};
 const bracketSection=line.match(/^\s*\[([^\]]+)\]\s*$/);
 if(bracketSection&&!CHORD.test(bracketSection[1]))return {type:'section',label:bracketSection[1]};
 const segments:Segment[]=[];const re=/\[([^\]]+)\]/g;let last=0;let chord:string|undefined;let m;
 while((m=re.exec(line))){if(!CHORD.test(m[1]))continue;if(m.index>last||chord)segments.push({chord,text:line.slice(last,m.index)});chord=m[1];last=re.lastIndex;}
 segments.push({chord,text:line.slice(last)});return {type:'line',segments};
 });
}
export function uniqueChords(song:Song){return [...new Set(parseSheet(song.content).flatMap(l=>l.segments?.filter(s=>s.chord).map(s=>chordFor(song,s.chord!))||[]))];}
export const FAMILIAR=new Set(['G','Em','D','C','F','B7','B','Bm','Gm','Fm','Dm7','Dm','Em7','Am','Am7','A','E']);
export function easyTranspose(song:Song){return Array.from({length:12},(_,i)=>i).sort((a,b)=>{const cost=(t:number)=>uniqueChords({...song,transpose:t}).filter(c=>!FAMILIAR.has(c)).length;return cost(a)-cost(b)||Math.min(a,12-a)-Math.min(b,12-b)})[0];}
export function normalizeSheet(input:string){
 const lines=input.replace(/\r/g,'').replace(/\t/g,'    ').split('\n');const out:string[]=[];
 for(let i=0;i<lines.length;i++){
 const line=lines[i];const tokens=[...line.matchAll(/\S+/g)];
 const chordLine=tokens.length>0&&tokens.some(t=>CHORD.test(t[0]))&&tokens.every(t=>CHORD.test(t[0])||/^[|:\-./\[\]]+$/.test(t[0]));
 if(chordLine){
 const chords=tokens.filter(t=>CHORD.test(t[0]));const next=lines[i+1];
 const nextIsChord=next&&next.trim().split(/\s+/).every(t=>CHORD.test(t)||/^[|:\-./]+$/.test(t));
 if(next?.trim()&&!nextIsChord&&!/^[{[]/.test(next.trim())){let result=next;for(const ch of [...chords].reverse()){const at=ch.index!;if(result.length<at)result=result.padEnd(at,' ');result=result.slice(0,at)+'['+ch[0]+']'+result.slice(at);}out.push(result);i++;}
 else out.push(line.replace(/\S+/g,t=>CHORD.test(t)?'['+t+']':t));
 }else out.push(line);
 }
 return out.join('\n');
}
export function safeSource(url:string){try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}

export function soundingKey(song:Song){return keyName({...song,transpose:song.transpose+(song.capo||0)})}
