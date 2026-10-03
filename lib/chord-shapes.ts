import positions from './chord-shapes.json';
import {pitch} from './music';
export type ChordShape={frets:number[];fingers:number[];baseFret:number;barres:number[]};
const shapes:Record<string,ChordShape>=positions;
const roots=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
export function chordShape(name:string):ChordShape|undefined{
 const match=name.match(/^([A-G][#b]?)(.*)$/);if(!match)return;
 const root=roots[pitch(match[1])];let suffix=match[2];
 const aliases:Record<string,string>={'':'major',m:'minor',min:'minor',maj:'major',M:'major',M7:'maj7',min7:'m7','+':'aug','o':'dim','o7':'dim7','ø7':'m7b5',sus:'sus4'};
 suffix=aliases[suffix]||suffix;
 if(shapes[root+':'+suffix])return shapes[root+':'+suffix];
 // Slash bass spellings can be enharmonic (e.g. C#/G# and Db/Ab).
 if(suffix.includes('/')){const [quality,bass]=suffix.split('/');for(const [key,shape] of Object.entries(shapes)){const [r,s]=key.split(':');const [q,b]=s.split('/');if(r===root&&q===quality&&b&&pitch(b)===pitch(bass))return shape;}}
}
